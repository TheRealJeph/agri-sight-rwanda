from django.core import mail
from django.db import IntegrityError, transaction
from django.core.cache import cache
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from .models import AuditLog, User, UserPreference, UserProfile
from .tokens import make_reset_token, make_verification_token

PW = 'Str0ng-Passw0rd!x'
REG = {'full_name': 'Test User', 'email': 'Test@Example.com', 'organization': 'University of Rwanda', 'password': PW,
       'password_confirm': PW, 'accept_terms': True, 'occupation': 'researcher'}


class Base(TestCase):
    def setUp(self):
        cache.clear()  # throttle counters live in the cache
        self.c = APIClient()

    def make_user(self, email='user@example.com', verified=True, password=PW):
        u = User.objects.create_user(username=email, email=email, password=password, email_verified=verified)
        UserProfile.objects.create(user=u, full_name='Existing User', organization='NISR')
        UserPreference.objects.create(user=u)
        return u

    def login(self, email='user@example.com', password=PW):
        return self.c.post('/api/v1/auth/login/', {'email': email, 'password': password}, format='json')


class RegistrationTests(Base):
    def test_register_creates_user_profile_preferences_and_sends_email(self):
        r = self.c.post('/api/v1/auth/register/', REG, format='json')
        self.assertEqual(r.status_code, 201)
        u = User.objects.get(email='test@example.com')                    # email is normalised to lower case
        self.assertTrue(u.profile and u.preferences)
        self.assertFalse(u.email_verified)
        self.assertNotEqual(u.password, PW)                               # hashed
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('/verify-email?token=', mail.outbox[0].body)

    def test_public_registration_can_never_grant_privileges(self):
        r = self.c.post('/api/v1/auth/register/', {**REG, 'is_staff': True, 'is_superuser': True, 'access_level': 'administrator'}, format='json')
        self.assertEqual(r.status_code, 201)
        u = User.objects.get(email='test@example.com')
        self.assertFalse(u.is_staff or u.is_superuser)
        self.assertEqual(u.profile.access_level, 'viewer')

    def test_validation_errors(self):
        for bad, field in [({'password_confirm': 'different'}, 'password_confirm'), ({'accept_terms': False}, 'accept_terms'),
                           ({'password': '12345678', 'password_confirm': '12345678'}, 'non_field_errors'), ({'email': 'nope'}, 'email')]:
            r = self.c.post('/api/v1/auth/register/', {**REG, **bad}, format='json')
            self.assertEqual(r.status_code, 400, bad)
            self.assertTrue(r.json(), bad)
        self.assertEqual(User.objects.count(), 0)

    def test_duplicate_email_rejected_case_insensitively(self):
        self.make_user('dup@example.com')
        r = self.c.post('/api/v1/auth/register/', {**REG, 'email': 'DUP@example.com'}, format='json')
        self.assertEqual(r.status_code, 400)


class LoginLogoutTests(Base):
    def test_cannot_login_until_email_verified(self):
        self.make_user(verified=False)
        r = self.login()
        self.assertEqual(r.status_code, 403)
        self.assertEqual(r.json()['code'], 'email_not_verified')

    def test_login_me_logout_cycle_invalidates_server_session(self):
        self.make_user()
        self.assertEqual(self.c.get('/api/v1/auth/me/').status_code, 403)          # not signed in
        r = self.login()
        self.assertEqual(r.status_code, 200)
        self.assertEqual(self.c.get('/api/v1/auth/me/').json()['email'], 'user@example.com')
        self.assertEqual(self.c.post('/api/v1/auth/logout/').status_code, 200)
        self.assertEqual(self.c.get('/api/v1/auth/me/').status_code, 403)          # session is gone
        self.assertTrue(AuditLog.objects.filter(action='logout', outcome='success').exists())

    def test_wrong_password_and_unknown_email_look_identical(self):
        self.make_user()
        a = self.login(password='wrong-password-123')
        b = self.login(email='nobody@example.com')
        self.assertEqual((a.status_code, a.json()), (b.status_code, b.json()))
        self.assertEqual(a.status_code, 401)

    def test_login_is_rate_limited(self):
        self.make_user()
        codes = [self.login(password='bad-password-123').status_code for _ in range(12)]
        self.assertIn(429, codes)

    def test_csrf_is_enforced_for_signed_in_unsafe_requests(self):
        self.make_user()
        strict = APIClient(enforce_csrf_checks=True)
        strict.get('/api/v1/auth/csrf/')
        token = strict.cookies['csrftoken'].value
        strict.post('/api/v1/auth/login/', {'email': 'user@example.com', 'password': PW}, format='json')
        self.assertEqual(strict.post('/api/v1/auth/logout/').status_code, 403)                     # no token: refused
        self.assertEqual(strict.post('/api/v1/auth/logout/', HTTP_X_CSRFTOKEN=strict.cookies['csrftoken'].value).status_code, 200)
        self.assertTrue(token)


class EmailVerificationTests(Base):
    def test_verify_email_then_login(self):
        u = self.make_user(verified=False)
        r = self.c.post('/api/v1/auth/verify-email/', {'token': make_verification_token(u)}, format='json')
        self.assertEqual(r.status_code, 200)
        u.refresh_from_db()
        self.assertTrue(u.email_verified)
        self.assertEqual(self.login().status_code, 200)

    def test_invalid_and_expired_tokens_rejected(self):
        u = self.make_user(verified=False)
        self.assertEqual(self.c.post('/api/v1/auth/verify-email/', {'token': 'garbage'}, format='json').status_code, 400)
        with override_settings(EMAIL_VERIFICATION_MAX_AGE=-1):
            self.assertEqual(self.c.post('/api/v1/auth/verify-email/', {'token': make_verification_token(u)}, format='json').status_code, 400)

    def test_resend_is_generic_and_only_sends_for_unverified_accounts(self):
        self.make_user('a@example.com', verified=False)
        self.make_user('b@example.com', verified=True)
        ra = self.c.post('/api/v1/auth/resend-verification/', {'email': 'a@example.com'}, format='json')
        rb = self.c.post('/api/v1/auth/resend-verification/', {'email': 'b@example.com'}, format='json')
        rc = self.c.post('/api/v1/auth/resend-verification/', {'email': 'ghost@example.com'}, format='json')
        self.assertEqual(ra.json(), rb.json())
        self.assertEqual(rb.json(), rc.json())
        self.assertEqual(len(mail.outbox), 1)


class PasswordResetTests(Base):
    def test_forgot_password_is_generic_and_does_not_reveal_accounts(self):
        self.make_user()
        a = self.c.post('/api/v1/auth/forgot-password/', {'email': 'user@example.com'}, format='json')
        b = self.c.post('/api/v1/auth/forgot-password/', {'email': 'ghost@example.com'}, format='json')
        self.assertEqual((a.status_code, a.json()), (b.status_code, b.json()))
        self.assertEqual(len(mail.outbox), 1)

    def test_reset_works_once_then_link_is_dead(self):
        u = self.make_user()
        tok = make_reset_token(u)
        new = 'Another-Str0ng-Pass!9'
        ok = self.c.post('/api/v1/auth/reset-password/', {'token': tok, 'password': new, 'password_confirm': new}, format='json')
        self.assertEqual(ok.status_code, 200)
        self.assertEqual(self.login(password=new).status_code, 200)
        again = self.c.post('/api/v1/auth/reset-password/', {'token': tok, 'password': 'Third-Str0ng-Pass!7', 'password_confirm': 'Third-Str0ng-Pass!7'}, format='json')
        self.assertEqual(again.status_code, 400)                         # single use

    def test_expired_invalid_and_weak_password_cases(self):
        u = self.make_user()
        body = {'password': 'Another-Str0ng-Pass!9', 'password_confirm': 'Another-Str0ng-Pass!9'}
        self.assertEqual(self.c.post('/api/v1/auth/reset-password/', {'token': 'x.y', **body}, format='json').status_code, 400)
        with override_settings(PASSWORD_RESET_TIMEOUT=-1):
            self.assertEqual(self.c.post('/api/v1/auth/reset-password/', {'token': make_reset_token(u), **body}, format='json').status_code, 400)
        weak = {'password': '12345678', 'password_confirm': '12345678'}
        self.assertEqual(self.c.post('/api/v1/auth/reset-password/', {'token': make_reset_token(u), **weak}, format='json').status_code, 400)

    def test_reset_log_never_contains_secrets(self):
        u = self.make_user()
        tok = make_reset_token(u)
        self.c.post('/api/v1/auth/reset-password/', {'token': tok, 'password': 'Another-Str0ng-Pass!9', 'password_confirm': 'Another-Str0ng-Pass!9'}, format='json')
        blob = ' '.join(str(a.metadata) + a.action + a.resource for a in AuditLog.objects.all())
        self.assertNotIn('Another-Str0ng', blob)
        self.assertNotIn(tok, blob)


class ProfileSettingsTests(Base):
    def test_profile_and_settings_require_authentication(self):
        for url in ('/api/v1/profile/', '/api/v1/settings/', '/api/v1/auth/me/'):
            self.assertEqual(self.c.get(url).status_code, 403, url)

    def test_profile_update_persists_but_cannot_change_access_level_or_email(self):
        u = self.make_user()
        self.login()
        r = self.c.patch('/api/v1/profile/', {'full_name': 'New Name', 'phone': '+250 788 000 000', 'access_level': 'administrator',
                                              'email': 'evil@example.com'}, format='json')
        self.assertEqual(r.status_code, 200)
        u.refresh_from_db(); u.profile.refresh_from_db()
        self.assertEqual(u.profile.full_name, 'New Name')
        self.assertEqual(u.profile.access_level, 'viewer')
        self.assertEqual(u.email, 'user@example.com')

    def test_settings_validated_and_scoped_to_the_signed_in_user(self):
        self.make_user('a@example.com'); other = self.make_user('b@example.com')
        self.login('a@example.com')
        self.assertEqual(self.c.patch('/api/v1/settings/', {'theme': 'purple'}, format='json').status_code, 400)
        self.assertEqual(self.c.patch('/api/v1/settings/', {'theme': 'dark', 'default_season': 'B'}, format='json').status_code, 200)
        other.preferences.refresh_from_db()
        self.assertEqual(other.preferences.theme, 'system')              # another user's row is untouched

    def test_change_password_needs_current_password(self):
        self.make_user(); self.login()
        bad = self.c.post('/api/v1/auth/change-password/', {'current_password': 'nope-nope-nope', 'new_password': 'Another-Str0ng-Pass!9'}, format='json')
        self.assertEqual(bad.status_code, 400)
        ok = self.c.post('/api/v1/auth/change-password/', {'current_password': PW, 'new_password': 'Another-Str0ng-Pass!9'}, format='json')
        self.assertEqual(ok.status_code, 200)
        self.assertEqual(self.c.get('/api/v1/auth/me/').status_code, 200)   # session survives the change


class ModelRelationshipTests(TestCase):
    def test_dataset_job_quality_and_report_relationships(self):
        from apps.datasets.models import DataImportJob, DataQualityResult, Dataset
        from apps.reports.models import SavedReport
        u = User.objects.create_user('r', 'r@example.com', PW)
        d = Dataset.objects.create(name='SAS', version='2025', source='NISR')
        j = DataImportJob.objects.create(dataset=d, created_by=u)
        DataQualityResult.objects.create(dataset=d, import_job=j, check_name='missing', status='passed')
        SavedReport.objects.create(user=u, title='t', report_type='csv')
        self.assertEqual((d.import_jobs.count(), j.quality_results.count(), u.reports.count()), (1, 1, 1))
        with self.assertRaises(IntegrityError), transaction.atomic():      # unique (name, version)
            Dataset.objects.create(name='SAS', version='2025', source='NISR')
        d.delete()
        self.assertEqual(DataImportJob.objects.count(), 0)                # cascades

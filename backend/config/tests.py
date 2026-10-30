from django.test import TestCase


class PlatformTests(TestCase):
    def test_health_is_public_and_reports_database(self):
        r = self.client.get("/api/v1/health/")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.json()["status"], "ok")
        self.assertEqual(r.json()["database"], "ok")

    def test_openapi_schema_is_served(self):
        r = self.client.get("/api/v1/schema/")
        self.assertEqual(r.status_code, 200)
        self.assertIn(b"Agri-Sight Rwanda API", r.content)

    def test_user_model_uses_email_and_is_not_privileged_by_default(self):
        from apps.accounts.models import User
        u = User.objects.create_user(username="a", email="a@example.com", password="x" * 12)
        self.assertFalse(u.is_staff or u.is_superuser)
        self.assertFalse(u.email_verified)
        with self.assertRaises(Exception):
            User.objects.create_user(username="b", email="a@example.com", password="x" * 12)

from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Custom user: email is unique and is the login identifier. New public accounts are never staff or superusers."""

    email = models.EmailField(unique=True)
    email_verified = models.BooleanField(default=False)

    def __str__(self):
        return self.email


class UserProfile(models.Model):
    class Occupation(models.TextChoices):  # the role a person selects when registering (display only)
        RESEARCHER = 'researcher', 'Researcher / Analyst'
        FARMER = 'farmer', 'Farmer'
        STUDENT = 'student', 'Student'
        OTHER = 'other', 'Other'

    class AccessLevel(models.TextChoices):  # permission level: only an administrator can change it
        VIEWER = 'viewer', 'Viewer'
        ANALYST = 'analyst', 'Analyst'
        ADMINISTRATOR = 'administrator', 'Administrator'

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    full_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=30, blank=True)
    organization = models.CharField(max_length=200, blank=True)
    biography = models.TextField(blank=True, max_length=1000)
    occupation = models.CharField(max_length=20, choices=Occupation.choices, default=Occupation.RESEARCHER)
    access_level = models.CharField(max_length=20, choices=AccessLevel.choices, default=AccessLevel.VIEWER)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.full_name


class UserPreference(models.Model):
    class Theme(models.TextChoices):
        LIGHT = 'light', 'Light'
        DARK = 'dark', 'Dark'
        SYSTEM = 'system', 'System'

    class Season(models.TextChoices):
        NONE = '', 'No default'
        A = 'A', 'Season A'
        B = 'B', 'Season B'
        C = 'C', 'Season C'

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='preferences')
    theme = models.CharField(max_length=10, choices=Theme.choices, default=Theme.SYSTEM)
    default_season = models.CharField(max_length=1, choices=Season.choices, blank=True, default='')
    default_crop = models.CharField(max_length=60, blank=True)
    default_district = models.CharField(max_length=60, blank=True)
    email_notifications = models.BooleanField(default=True)
    system_alerts = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)


class AuditLog(models.Model):
    """Security-relevant events. Never store passwords, tokens, or session data here."""

    class Outcome(models.TextChoices):
        SUCCESS = 'success', 'Success'
        FAILURE = 'failure', 'Failure'

    actor = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='audit_events')
    action = models.CharField(max_length=60)
    resource = models.CharField(max_length=100, blank=True)
    outcome = models.CharField(max_length=10, choices=Outcome.choices, default=Outcome.SUCCESS)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=['action', '-created_at']), models.Index(fields=['actor', '-created_at'])]
        ordering = ['-created_at']

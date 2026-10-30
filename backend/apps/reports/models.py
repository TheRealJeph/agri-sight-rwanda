from django.conf import settings
from django.db import models


class SavedReport(models.Model):
    class ReportType(models.TextChoices):
        CSV = 'csv', 'CSV export'
        PDF = 'pdf', 'PDF report'
        SUMMARY = 'summary', 'Summary'

    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        READY = 'ready', 'Ready'
        FAILED = 'failed', 'Failed'

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reports')
    title = models.CharField(max_length=200)
    report_type = models.CharField(max_length=10, choices=ReportType.choices)
    filters = models.JSONField(default=dict, blank=True)
    file_reference = models.CharField(max_length=500, blank=True, help_text='Secure storage reference, never a public URL')
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [models.Index(fields=['user', '-created_at'])]

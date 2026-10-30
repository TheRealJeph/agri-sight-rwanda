from django.conf import settings
from django.db import models


class Dataset(models.Model):
    class Status(models.TextChoices):
        REGISTERED = 'registered', 'Registered'
        PROCESSING = 'processing', 'Processing'
        READY = 'ready', 'Ready'
        FAILED = 'failed', 'Failed'

    name = models.CharField(max_length=200)
    version = models.CharField(max_length=40, default='1')
    source = models.CharField(max_length=300, help_text='Source and attribution, e.g. NISR Seasonal Agricultural Survey 2024')
    description = models.TextField(blank=True)
    original_filename = models.CharField(max_length=300, blank=True)
    storage_reference = models.CharField(max_length=500, blank=True, help_text='Secure storage path or key; raw files stay unmodified')
    schema_metadata = models.JSONField(default=dict, blank=True)
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.REGISTERED)
    record_count = models.PositiveIntegerField(null=True, blank=True)
    checksum = models.CharField(max_length=64, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=['name', 'version'], name='unique_dataset_name_version')]
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.name} v{self.version}'


class DataImportJob(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        RUNNING = 'running', 'Running'
        COMPLETED = 'completed', 'Completed'
        FAILED = 'failed', 'Failed'

    dataset = models.ForeignKey(Dataset, on_delete=models.CASCADE, related_name='import_jobs')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='import_jobs')
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    rows_processed = models.PositiveIntegerField(default=0)
    rows_flagged = models.PositiveIntegerField(default=0)
    rows_rejected = models.PositiveIntegerField(default=0)
    error_summary = models.TextField(blank=True)
    validation_results = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['-started_at']
        indexes = [models.Index(fields=['dataset', 'status'])]


class DataQualityResult(models.Model):
    class Status(models.TextChoices):
        PASSED = 'passed', 'Passed'
        WARNING = 'warning', 'Warning'
        FAILED = 'failed', 'Failed'

    dataset = models.ForeignKey(Dataset, on_delete=models.CASCADE, related_name='quality_results')
    import_job = models.ForeignKey(DataImportJob, null=True, blank=True, on_delete=models.CASCADE, related_name='quality_results')
    check_name = models.CharField(max_length=100)
    status = models.CharField(max_length=10, choices=Status.choices)
    missing_value_stats = models.JSONField(default=dict, blank=True)
    invalid_records = models.PositiveIntegerField(default=0)
    schema_issues = models.JSONField(default=list, blank=True)
    summary = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

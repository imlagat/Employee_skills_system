from django.db import models


class Certification(models.Model):
    name = models.CharField(max_length=150)
    issuing_body = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    validity_months = models.PositiveIntegerField(
        null=True, blank=True, help_text='Leave blank if certification never expires'
    )
    document = models.FileField(upload_to='cert_templates/', null=True, blank=True)

    class Meta:
        ordering = ['name']
        unique_together = ('name', 'issuing_body')

    def __str__(self):
        return f'{self.name} ({self.issuing_body})'


class EmployeeCertification(models.Model):
    class VerificationStatus(models.TextChoices):
        PENDING = 'pending', 'Pending Verification'
        VERIFIED = 'verified', 'Verified'
        REJECTED = 'rejected', 'Rejected'

    class Status(models.TextChoices):
        ACTIVE = 'active', 'Active'
        EXPIRING_SOON = 'expiring_soon', 'Expiring Soon'
        EXPIRED = 'expired', 'Expired'

    employee = models.ForeignKey(
        'employees.Employee', on_delete=models.CASCADE, related_name='certifications'
    )
    certification = models.ForeignKey(
        Certification, on_delete=models.CASCADE, related_name='employee_links'
    )
    issue_date = models.DateField()
    expiry_date = models.DateField(null=True, blank=True)
    document = models.FileField(upload_to='certs/%Y/%m/', null=True, blank=True)
    credential_id = models.CharField(max_length=150, blank=True)
    
    # Verification Workflow
    verification_status = models.CharField(
        max_length=20,
        choices=VerificationStatus.choices,
        default=VerificationStatus.PENDING
    )
    verified_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='verified_certifications'
    )
    rejection_reason = models.TextField(blank=True)

    class Meta:
        ordering = ['expiry_date']

    def __str__(self):
        return f'{self.employee} - {self.certification}'

    @property
    def status(self):
        from datetime import date, timedelta
        if not self.expiry_date:
            return self.Status.ACTIVE
        today = date.today()
        if self.expiry_date < today:
            return self.Status.EXPIRED
        if self.expiry_date <= today + timedelta(days=30):
            return self.Status.EXPIRING_SOON
        return self.Status.ACTIVE

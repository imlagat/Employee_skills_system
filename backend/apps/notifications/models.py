from django.db import models


class Notification(models.Model):
    class NotifType(models.TextChoices):
        CERT_EXPIRY = 'cert_expiry', 'Certification Expiry'
        NEW_CERT = 'new_cert', 'New Certification Logged'
        TRAINING_REQUIRED = 'training_required', 'Training Required'
        TRAINING_REMINDER = 'training_reminder', 'Training Reminder'
        SKILL_GAP = 'skill_gap', 'Skill Gap'
        GENERAL = 'general', 'General'

    employee = models.ForeignKey(
        'employees.Employee', on_delete=models.CASCADE, related_name='notifications'
    )
    notif_type = models.CharField(max_length=30, choices=NotifType.choices, default=NotifType.GENERAL)
    message = models.CharField(max_length=255)
    related_object_id = models.PositiveIntegerField(null=True, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.employee} - {self.message[:50]}'

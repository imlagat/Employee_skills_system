from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
import random
import uuid


class User(AbstractUser):

    """
    Custom user model. Role drives permission checks across the API.
    Employee-specific fields (department, manager, etc.) live on the
    Employee profile in apps.employees, linked one-to-one to this model.
    """

    class Role(models.TextChoices):
        ADMIN = 'admin', 'Admin'
        HR = 'hr', 'HR'
        MANAGER = 'manager', 'Manager'
        EMPLOYEE = 'employee', 'Employee'

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.EMPLOYEE,
    )
    email = models.EmailField(unique=True)
    is_email_verified = models.BooleanField(default=False)
    has_accepted_consent = models.BooleanField(default=False)
    consent_accepted_at = models.DateTimeField(null=True, blank=True)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    def __str__(self):
        return f'{self.get_full_name() or self.username} ({self.role})'

    @property
    def is_admin(self):
        return self.role == self.Role.ADMIN

    @property
    def is_hr(self):
        return self.role == self.Role.HR

    @property
    def is_manager(self):
        return self.role == self.Role.MANAGER

class OTPVerification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='otp_verifications')
    otp_code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if not self.otp_code:
            self.otp_code = f"{random.randint(100000, 999999)}"
        if not self.expires_at:
            self.expires_at = timezone.now() + timezone.timedelta(minutes=15)
        super().save(*args, **kwargs)
        
    def is_valid(self):
        return not self.is_used and timezone.now() <= self.expires_at


class UserInvitation(models.Model):
    email = models.EmailField(unique=True)
    role = models.CharField(
        max_length=20,
        choices=User.Role.choices,
        default=User.Role.EMPLOYEE,
    )
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    invited_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_invitations')
    is_accepted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timezone.timedelta(days=7)
        super().save(*args, **kwargs)

    def is_valid(self):
        return not self.is_accepted and timezone.now() <= self.expires_at

    def __str__(self):
        return f"Invite for {self.email} ({self.role})"



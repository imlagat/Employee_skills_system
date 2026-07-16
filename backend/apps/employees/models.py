from django.conf import settings
from django.db import models


class Department(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

class Position(models.Model):
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='positions')

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Employee(models.Model):
    class Gender(models.TextChoices):
        MALE = 'M', 'Male'
        FEMALE = 'F', 'Female'
        OTHER = 'O', 'Other'

    class EmploymentStatus(models.TextChoices):
        FULL_TIME = 'FT', 'Full Time'
        PART_TIME = 'PT', 'Part Time'
        CONTRACT = 'CT', 'Contract'
        TERMINATED = 'TR', 'Terminated'

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='employee_profile',
    )
    employee_id = models.CharField(max_length=20, unique=True)
    department = models.ForeignKey(
        Department, on_delete=models.SET_NULL, null=True, related_name='employees'
    )
    position = models.ForeignKey(
        Position, on_delete=models.SET_NULL, null=True, related_name='employees'
    )
    manager = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='direct_reports',
    )
    hire_date = models.DateField()
    phone = models.CharField(max_length=30, blank=True)
    gender = models.CharField(max_length=1, choices=Gender.choices, blank=True)
    employment_status = models.CharField(max_length=2, choices=EmploymentStatus.choices, default=EmploymentStatus.FULL_TIME)
    bio = models.TextField(blank=True)
    profile_image = models.ImageField(upload_to='profiles/', null=True, blank=True)
    is_active = models.BooleanField(default=True)
    blood_group = models.CharField(max_length=5, blank=True)
    allergies = models.TextField(blank=True)
    chronic_illnesses = models.TextField(blank=True)
    next_of_kin_relationship = models.CharField(max_length=50, blank=True)
    next_of_kin_name = models.CharField(max_length=150, blank=True)
    next_of_kin_phone = models.CharField(max_length=30, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['user__last_name', 'user__first_name']

    def __str__(self):
        return f'{self.user.get_full_name() or self.user.username} - {self.position.name if self.position else "No Position"}'

    def __init__(self, *args, **kwargs):
        job_title = kwargs.pop('job_title', None)
        super().__init__(*args, **kwargs)
        if job_title:
            self.job_title = job_title

    @property
    def job_title(self):
        return self.position.name if self.position else ""

    @job_title.setter
    def job_title(self, value):
        if not value:
            self.position = None
            return
        
        from .models import Position, Department
        dept = self.department
        if not dept:
            dept = Department.objects.first()
            if not dept:
                dept = Department.objects.create(name="Default Department")
        
        pos, _ = Position.objects.get_or_create(name=value, department=dept)
        self.position = pos

    @property
    def full_name(self):
        return self.user.get_full_name() or self.user.username


class ProfileUpdateRequest(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending Approval'
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='profile_updates')
    requested_changes = models.JSONField(default=dict, help_text="Dictionary of changes e.g. {'first_name': 'John', 'bio': '...'}")
    profile_image = models.ImageField(upload_to='pending_profiles/', null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_profile_updates')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Update Request for {self.employee.full_name} ({self.get_status_display()})"

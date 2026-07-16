from django.db import models


class TrainingProgram(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    target_skills = models.ManyToManyField('skills.Skill', blank=True, related_name='training_programs')
    start_date = models.DateField()
    end_date = models.DateField()
    capacity = models.PositiveIntegerField(default=0, help_text='0 = unlimited')
    location = models.CharField(max_length=200, blank=True, help_text='Physical location or "Online"')
    is_mandatory = models.BooleanField(default=False)
    is_archived = models.BooleanField(default=False)
    department = models.ForeignKey('employees.Department', null=True, blank=True, on_delete=models.SET_NULL, related_name='training_programs')

    class Meta:
        ordering = ['start_date']

    def __str__(self):
        return self.title

    @property
    def seats_taken(self):
        return self.enrollments.filter(status__in=['enrolled', 'completed']).count()

    @property
    def seats_available(self):
        if self.capacity == 0:
            return None
        return max(self.capacity - self.seats_taken, 0)


class TrainingEnrollment(models.Model):
    class Status(models.TextChoices):
        PENDING_APPROVAL = 'pending_approval', 'Pending Approval'
        ENROLLED = 'enrolled', 'Enrolled'
        COMPLETED = 'completed', 'Completed'
        CANCELLED = 'cancelled', 'Cancelled'
        NO_SHOW = 'no_show', 'No Show'

    employee = models.ForeignKey(
        'employees.Employee', on_delete=models.CASCADE, related_name='enrollments'
    )
    program = models.ForeignKey(
        TrainingProgram, on_delete=models.CASCADE, related_name='enrollments'
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING_APPROVAL)
    enrolled_on = models.DateTimeField(auto_now_add=True)
    completion_date = models.DateField(null=True, blank=True)

    class Meta:
        unique_together = ('employee', 'program')
        ordering = ['-enrolled_on']

    def __str__(self):
        return f'{self.employee} -> {self.program} ({self.status})'


from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings

@receiver(post_save, sender=TrainingProgram)
def notify_employees_on_new_training(sender, instance, created, **kwargs):
    print(f"notify_employees_on_new_training called! Created: {created}, Title: {instance.title}")
    if created and not instance.is_archived:
        from apps.employees.models import Employee
        
        # Filter active employees
        employees = Employee.objects.filter(is_active=True).select_related('user')
        print(f"[Signal Debug] Total active employees: {employees.count()}")
        if instance.department_id:
            employees = employees.filter(department_id=instance.department_id)
            print(f"[Signal Debug] Filtered by department {instance.department_id}: {employees.count()}")
            
        recipient_emails = [emp.user.email for emp in employees if emp.user and emp.user.email]
        print(f"[Signal Debug] Recipient emails: {recipient_emails}")
        
        if recipient_emails:
            subject = f"New Training Available: {instance.title}"
            dept_info = f" tailored for the {instance.department.name} department" if instance.department else ""
            message = (
                f"Hello,\n\n"
                f"A new training program has been posted{dept_info}:\n\n"
                f"Title: {instance.title}\n"
                f"Description: {instance.description}\n"
                f"Location: {instance.location or 'Online'}\n"
                f"Start Date: {instance.start_date}\n\n"
                f"Please log in to the SkillMatrix system to enroll.\n\n"
                f"Best regards,\n"
                f"SkillMatrix Team"
            )
            from apps.notifications.models import Notification
            for emp in employees:
                Notification.objects.create(
                    employee=emp,
                    notif_type=Notification.NotifType.TRAINING_REQUIRED,
                    message=f"New training program available: {instance.title} (Starts {instance.start_date})",
                    related_object_id=instance.id
                )

            for email in recipient_emails:
                send_mail(
                    subject=subject,
                    message=message,
                    from_email=settings.DEFAULT_FROM_EMAIL or 'noreply@skillmatrix.com',
                    recipient_list=[email],
                    fail_silently=True
                )

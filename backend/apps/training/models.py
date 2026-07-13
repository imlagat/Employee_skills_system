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

from django.db import models


class SuccessionPlan(models.Model):
    class Readiness(models.TextChoices):
        READY_NOW = 'ready_now', 'Ready Now'
        ONE_YEAR = '1_year', '1 Year'
        TWO_YEARS = '2_years', '2+ Years'

    target_role = models.CharField(max_length=150)
    department = models.ForeignKey(
        'employees.Department', on_delete=models.SET_NULL, null=True, blank=True, related_name='succession_plans'
    )
    candidate = models.ForeignKey(
        'employees.Employee', on_delete=models.CASCADE, related_name='succession_candidacies'
    )
    incumbent = models.ForeignKey(
        'employees.Employee',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='succession_incumbencies',
    )
    readiness = models.CharField(max_length=20, choices=Readiness.choices)
    required_skills = models.ManyToManyField('skills.Skill', blank=True, related_name='succession_plans')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['target_role', 'readiness']

    def __str__(self):
        return f'{self.target_role} - {self.candidate} ({self.get_readiness_display()})'

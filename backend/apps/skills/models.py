from django.conf import settings
from django.db import models


class Skill(models.Model):
    name = models.CharField(max_length=100, unique=True)
    category = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    rating = models.IntegerField(default=0)

    class Meta:
        ordering = ['category', 'name']

    def __str__(self):
        return self.name


class EmployeeSkill(models.Model):
    class Proficiency(models.IntegerChoices):
        BEGINNER = 1, 'Beginner'
        BASIC = 2, 'Basic'
        INTERMEDIATE = 3, 'Intermediate'
        ADVANCED = 4, 'Advanced'
        EXPERT = 5, 'Expert'

    class VerificationStatus(models.TextChoices):
        SELF_ASSESSED = 'self_assessed', 'Self Assessed'
        MANAGER_VERIFIED = 'manager_verified', 'Manager Verified'
        AI_VALIDATED = 'ai_validated', 'AI Validated'

    employee = models.ForeignKey(
        'employees.Employee', on_delete=models.CASCADE, related_name='skills'
    )
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name='employee_links')
    proficiency = models.IntegerField(choices=Proficiency.choices, default=Proficiency.BEGINNER)
    verification_status = models.CharField(
        max_length=20, choices=VerificationStatus.choices, default=VerificationStatus.SELF_ASSESSED
    )
    confidence_score = models.IntegerField(default=75, help_text="Skill confidence percentage (0-100)")
    last_assessed = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        unique_together = ('employee', 'skill')
        ordering = ['-proficiency']

    def __str__(self):
        return f'{self.employee} - {self.skill} ({self.get_proficiency_display()})'

class PositionCompetency(models.Model):
    position = models.ForeignKey(
        'employees.Position', on_delete=models.CASCADE, related_name='required_competencies'
    )
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name='required_by_positions')
    required_level = models.IntegerField(choices=EmployeeSkill.Proficiency.choices)
    is_critical = models.BooleanField(default=False)

    class Meta:
        unique_together = ('position', 'skill')
        ordering = ['position', '-required_level']

    def __str__(self):
        return f'{self.position.name} requires {self.skill.name} (Lvl {self.required_level})'


class SkillsAssessment(models.Model):
    employee = models.ForeignKey(
        'employees.Employee', on_delete=models.CASCADE, related_name='assessments'
    )
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name='assessments')
    assessor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='conducted_assessments',
    )
    score = models.PositiveIntegerField(help_text='Score out of 100')
    resulting_proficiency = models.IntegerField(
        choices=EmployeeSkill.Proficiency.choices, null=True, blank=True
    )
    comments = models.TextField(blank=True)
    assessed_on = models.DateField(auto_now_add=True)

    class Meta:
        ordering = ['-assessed_on']

    def __str__(self):
        return f'{self.employee} - {self.skill}: {self.score}'

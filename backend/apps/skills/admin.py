from django.contrib import admin

from .models import Skill, EmployeeSkill, SkillsAssessment


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('name', 'category')
    list_filter = ('category',)
    search_fields = ('name',)


@admin.register(EmployeeSkill)
class EmployeeSkillAdmin(admin.ModelAdmin):
    list_display = ('employee', 'skill', 'proficiency', 'last_assessed')
    list_filter = ('proficiency', 'skill__category')
    search_fields = ('employee__user__first_name', 'employee__user__last_name', 'skill__name')


@admin.register(SkillsAssessment)
class SkillsAssessmentAdmin(admin.ModelAdmin):
    list_display = ('employee', 'skill', 'score', 'assessor', 'assessed_on')
    list_filter = ('skill', 'assessed_on')

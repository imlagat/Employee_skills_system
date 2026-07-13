from django.contrib import admin

from .models import TrainingProgram, TrainingEnrollment


@admin.register(TrainingProgram)
class TrainingProgramAdmin(admin.ModelAdmin):
    list_display = ('title', 'start_date', 'end_date', 'capacity', 'is_mandatory')
    list_filter = ('is_mandatory', 'start_date')
    search_fields = ('title',)
    filter_horizontal = ('target_skills',)


@admin.register(TrainingEnrollment)
class TrainingEnrollmentAdmin(admin.ModelAdmin):
    list_display = ('employee', 'program', 'status', 'enrolled_on', 'completion_date')
    list_filter = ('status', 'program')
    search_fields = ('employee__user__first_name', 'employee__user__last_name', 'program__title')

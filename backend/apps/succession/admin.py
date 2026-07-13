from django.contrib import admin

from .models import SuccessionPlan


@admin.register(SuccessionPlan)
class SuccessionPlanAdmin(admin.ModelAdmin):
    list_display = ('target_role', 'candidate', 'incumbent', 'readiness', 'department')
    list_filter = ('readiness', 'department')
    search_fields = ('target_role', 'candidate__user__first_name', 'candidate__user__last_name')
    filter_horizontal = ('required_skills',)

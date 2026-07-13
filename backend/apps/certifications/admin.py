from django.contrib import admin

from .models import Certification, EmployeeCertification


@admin.register(Certification)
class CertificationAdmin(admin.ModelAdmin):
    list_display = ('name', 'issuing_body', 'validity_months')
    search_fields = ('name', 'issuing_body')


@admin.register(EmployeeCertification)
class EmployeeCertificationAdmin(admin.ModelAdmin):
    list_display = ('employee', 'certification', 'issue_date', 'expiry_date', 'status')
    list_filter = ('certification',)
    search_fields = ('employee__user__first_name', 'employee__user__last_name', 'certification__name')

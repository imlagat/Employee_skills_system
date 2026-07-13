from django.contrib import admin

from .models import Department, Employee, Position

@admin.register(Position)
class PositionAdmin(admin.ModelAdmin):
    list_display = ('name', 'department')
    list_filter = ('department',)
    search_fields = ('name',)

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('employee_id', 'full_name', 'position', 'department', 'manager', 'is_active')
    list_filter = ('department', 'position', 'is_active')
    search_fields = ('employee_id', 'user__first_name', 'user__last_name', 'user__email', 'position__name')
    autocomplete_fields = ('user', 'manager')

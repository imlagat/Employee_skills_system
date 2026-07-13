from django.contrib import admin

from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('employee', 'notif_type', 'message', 'is_read', 'created_at')
    list_filter = ('notif_type', 'is_read')
    search_fields = ('employee__user__first_name', 'employee__user__last_name', 'message')

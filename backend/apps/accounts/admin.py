from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import UserCreationForm as BaseUserCreationForm

from .models import User


class UserCreationForm(BaseUserCreationForm):
    class Meta(BaseUserCreationForm.Meta):
        model = User
        fields = ('username', 'email', 'role', 'first_name', 'last_name')


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    add_form = UserCreationForm
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'is_staff')
    list_filter = BaseUserAdmin.list_filter + ('role',)
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Role', {'fields': ('role',)}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'role', 'first_name', 'last_name', 'password1', 'password2'),
        }),
    )


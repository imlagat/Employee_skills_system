import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.accounts.models import User

user = User.objects.filter(email='lagat6439@gmail.com').first()
if user:
    print("User found:", user.email)
    print("User ID:", user.id)
    print("Role:", user.role)
    if hasattr(user, 'employee_profile'):
        print("Employee Profile exists!")
        print("Position ID:", user.employee_profile.position_id)
        print("Department ID:", user.employee_profile.department_id)
        print("Phone:", user.employee_profile.phone)
    else:
        print("No employee profile!")
else:
    print("User not found!")

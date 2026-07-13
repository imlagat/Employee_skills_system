import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from rest_framework.test import APIRequestFactory, force_authenticate
from apps.employees.views import EmployeeViewSet
from apps.accounts.models import User
from apps.employees.models import Employee, Position, Department

# Create a fresh user without an employee profile
user, _ = User.objects.get_or_create(email='testfresh@example.com', username='testfresh')
Employee.objects.filter(user=user).delete()

factory = APIRequestFactory()
dept = Department.objects.first()
pos = Position.objects.first()

request = factory.patch('/api/employees/me/', {'phone': '+254111', 'department': dept.id, 'position': pos.id}, format='json')
force_authenticate(request, user=user)

view = EmployeeViewSet.as_view({'patch': 'me'})
response = view(request)

print("Status:", response.status_code)
print("Data:", response.data)

user.refresh_from_db()
print("has profile:", hasattr(user, 'employee_profile'))
if hasattr(user, 'employee_profile'):
    print("Position ID:", user.employee_profile.position_id)

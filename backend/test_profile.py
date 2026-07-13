import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from rest_framework.test import APIRequestFactory, force_authenticate
from apps.employees.views import EmployeeViewSet
from apps.accounts.models import User
from apps.employees.models import Position, Department

factory = APIRequestFactory()
user = User.objects.filter(role='employee').first()

dept = Department.objects.first()
pos = Position.objects.first()

print(f"Assigning dept={dept.id}, pos={pos.id} to user {user.email}")

request = factory.patch('/api/employees/me/', {'phone': '+25412345678', 'department': dept.id, 'position': pos.id}, format='json')
force_authenticate(request, user=user)

view = EmployeeViewSet.as_view({'patch': 'me'})
response = view(request)

print("Status:", response.status_code)
print("Data:", response.data)

user.employee_profile.refresh_from_db()
print("has_completed_profile:", user.employee_profile.position_id is not None)
print("Employee position_id:", user.employee_profile.position_id)

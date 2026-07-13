import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from rest_framework.test import APIRequestFactory, force_authenticate
from apps.employees.views import EmployeeViewSet
from apps.accounts.models import User
from apps.employees.models import Employee, Position, Department

user, _ = User.objects.get_or_create(email='testempty@example.com', username='testempty')
Employee.objects.filter(user=user).delete()

factory = APIRequestFactory()
dept = Department.objects.first()
pos = Position.objects.first()

request = factory.patch('/api/employees/me/', {'phone': '', 'department': dept.id, 'position': pos.id}, format='json')
force_authenticate(request, user=user)

view = EmployeeViewSet.as_view({'patch': 'me'})
response = view(request)

print("Status:", response.status_code)
print("Data:", response.data)

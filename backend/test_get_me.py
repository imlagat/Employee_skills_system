import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from rest_framework.test import APIRequestFactory, force_authenticate
from apps.employees.views import EmployeeViewSet
from apps.accounts.models import User
from apps.employees.models import Employee

# Create a fresh user without an employee profile
user, _ = User.objects.get_or_create(email='testgetme@example.com', username='testgetme')
Employee.objects.filter(user=user).delete()

factory = APIRequestFactory()

request = factory.get('/api/employees/me/', format='json')
force_authenticate(request, user=user)

view = EmployeeViewSet.as_view({'get': 'me'})
response = view(request)

print("Status:", response.status_code)
print("Data:", response.data)

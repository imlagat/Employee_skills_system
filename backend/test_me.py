import os
import django
from rest_framework.test import APIRequestFactory

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.employees.views import EmployeeViewSet
from apps.accounts.models import User
from apps.employees.models import Department, Position

factory = APIRequestFactory()
user = User.objects.first()

request = factory.patch('/api/employees/me/', {'phone': '+254 712345678', 'department_id': 1, 'position_id': 1}, format='json')
request.user = user

view = EmployeeViewSet.as_view({'patch': 'me'})
response = view(request)

print("Status Code:", response.status_code)
print("Response Data:", response.data)

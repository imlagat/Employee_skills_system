import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from rest_framework.test import APIRequestFactory, force_authenticate
from apps.employees.views import DepartmentViewSet
from apps.accounts.models import User

factory = APIRequestFactory()

request = factory.get('/api/departments/', format='json')
# No authentication needed as get_permissions returns []
# but let's test it with auth just in case
user = User.objects.filter(role='employee').first()
force_authenticate(request, user=user)

view = DepartmentViewSet.as_view({'get': 'list'})
response = view(request)

print("Status:", response.status_code)
print("Data:", response.data)

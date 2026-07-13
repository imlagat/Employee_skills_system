import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from rest_framework.test import APIRequestFactory
from apps.employees.views import PositionViewSet

factory = APIRequestFactory()

request = factory.get('/api/positions/', format='json')

view = PositionViewSet.as_view({'get': 'list'})
response = view(request)

print("Status:", response.status_code)
print("Data:", response.data)

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from rest_framework.test import APIRequestFactory, force_authenticate
from apps.accounts.views import MeView
from apps.accounts.models import User

factory = APIRequestFactory()
user = User.objects.filter(role='employee').first()
# Assuming we already assigned pos and dept to this user in the previous test

request = factory.get('/api/auth/me/')
force_authenticate(request, user=user)

view = MeView.as_view()
response = view(request)

print("Status:", response.status_code)
print("Data:", response.data)

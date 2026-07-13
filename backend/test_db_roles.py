import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.accounts.models import User

for u in User.objects.all():
    print(f"User: {u.email}, Role: {u.role}")

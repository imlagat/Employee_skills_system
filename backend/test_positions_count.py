import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.employees.models import Position

print("Positions count:", Position.objects.count())

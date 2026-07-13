import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from apps.certifications.models import EmployeeCertification
from apps.certifications.serializers import EmployeeCertificationSerializer

qs = EmployeeCertification.objects.all()
serializer = EmployeeCertificationSerializer(qs, many=True)
print(serializer.data)

from rest_framework import serializers
from .models import Certification, EmployeeCertification

class CertificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certification
        fields = '__all__'

class EmployeeCertificationSerializer(serializers.ModelSerializer):
    certification_name = serializers.CharField(source='certification.name', read_only=True)
    issuing_body = serializers.CharField(source='certification.issuing_body', read_only=True)
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    status = serializers.CharField(read_only=True)

    class Meta:
        model = EmployeeCertification
        fields = '__all__'
        extra_kwargs = {
            'employee': {'required': False}
        }

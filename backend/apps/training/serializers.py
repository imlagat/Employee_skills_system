from rest_framework import serializers
from .models import TrainingProgram, TrainingEnrollment

class TrainingProgramSerializer(serializers.ModelSerializer):
    seats_taken = serializers.ReadOnlyField()

    class Meta:
        model = TrainingProgram
        fields = '__all__'

class TrainingEnrollmentSerializer(serializers.ModelSerializer):
    program_name = serializers.CharField(source='program.title', read_only=True)
    program_title = serializers.CharField(source='program.title', read_only=True)
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)

    class Meta:
        model = TrainingEnrollment
        fields = '__all__'

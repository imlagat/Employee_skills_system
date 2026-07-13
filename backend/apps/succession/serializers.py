from rest_framework import serializers
from .models import SuccessionPlan

class SuccessionPlanSerializer(serializers.ModelSerializer):
    candidate_name = serializers.CharField(source='candidate.full_name', read_only=True)
    candidate_job_title = serializers.CharField(source='candidate.job_title', read_only=True)

    class Meta:
        model = SuccessionPlan
        fields = '__all__'

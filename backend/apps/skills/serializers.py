from rest_framework import serializers
from .models import Skill, EmployeeSkill, SkillsAssessment, PositionCompetency

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = '__all__'

class EmployeeSkillSerializer(serializers.ModelSerializer):
    skill_name = serializers.CharField(source='skill.name', read_only=True)
    skill_category = serializers.CharField(source='skill.category', read_only=True)
    proficiency_display = serializers.CharField(source='get_proficiency_display', read_only=True)

    class Meta:
        model = EmployeeSkill
        fields = '__all__'

class SkillsAssessmentSerializer(serializers.ModelSerializer):
    skill_name = serializers.CharField(source='skill.name', read_only=True)
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    assessor_name = serializers.CharField(source='assessor.get_full_name', read_only=True)

    class Meta:
        model = SkillsAssessment
        fields = '__all__'
        read_only_fields = ('assessor',)

class PositionCompetencySerializer(serializers.ModelSerializer):
    skill_name = serializers.CharField(source='skill.name', read_only=True)
    position_name = serializers.CharField(source='position.name', read_only=True)

    class Meta:
        model = PositionCompetency
        fields = '__all__'

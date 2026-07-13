from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Skill, EmployeeSkill, SkillsAssessment, PositionCompetency
from .serializers import SkillSerializer, EmployeeSkillSerializer, SkillsAssessmentSerializer, PositionCompetencySerializer
from apps.accounts.permissions import IsManagerUser, IsOwnerOrManager

class SkillViewSet(viewsets.ModelViewSet):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['name', 'category']
    filterset_fields = ['category']

    def get_permissions(self):
        return []

class EmployeeSkillViewSet(viewsets.ModelViewSet):
    queryset = EmployeeSkill.objects.select_related('skill', 'employee').all()
    serializer_class = EmployeeSkillSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['employee', 'skill', 'proficiency']

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if not user.is_authenticated:
            return qs.none()
        if getattr(user, 'role', '') in ['admin', 'manager', 'hr']:
            return qs
        return qs.filter(employee__user=user)

class SkillsAssessmentViewSet(viewsets.ModelViewSet):
    queryset = SkillsAssessment.objects.select_related('employee', 'skill', 'assessor').all()
    serializer_class = SkillsAssessmentSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['employee', 'skill']

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if not user.is_authenticated:
            return qs.none()
        if getattr(user, 'role', '') in ['admin', 'manager', 'hr']:
            return qs
        return qs.filter(employee__user=user)

    def perform_create(self, serializer):
        serializer.save(assessor=self.request.user)

class PositionCompetencyViewSet(viewsets.ModelViewSet):
    queryset = PositionCompetency.objects.select_related('position', 'skill').all()
    serializer_class = PositionCompetencySerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['position', 'skill', 'is_critical']

    def get_permissions(self):
        return []


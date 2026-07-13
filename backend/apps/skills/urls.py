from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SkillViewSet, EmployeeSkillViewSet, SkillsAssessmentViewSet, PositionCompetencyViewSet

router = DefaultRouter()
router.register(r'skills', SkillViewSet, basename='skill')
router.register(r'employee-skills', EmployeeSkillViewSet, basename='employee-skill')
router.register(r'assessments', SkillsAssessmentViewSet, basename='assessment')
router.register(r'position-competencies', PositionCompetencyViewSet, basename='position-competency')

app_name = 'skills'

urlpatterns = [
    path('', include(router.urls)),
]

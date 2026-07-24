from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TrainingProgramViewSet, TrainingEnrollmentViewSet, TrainingRecommendationsView, ImportScrapedTrainingView

router = DefaultRouter()
router.register(r'programs', TrainingProgramViewSet, basename='trainingprogram')
router.register(r'enrollments', TrainingEnrollmentViewSet, basename='trainingenrollment')

app_name = 'training'

urlpatterns = [
    path('', include(router.urls)),
    path('training/recommendations/', TrainingRecommendationsView.as_view(), name='training-recommendations'),
    path('training/import-scraped/', ImportScrapedTrainingView.as_view(), name='import-scraped-training'),
]

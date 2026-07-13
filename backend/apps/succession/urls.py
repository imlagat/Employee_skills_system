from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SuccessionPlanViewSet

router = DefaultRouter()
router.register(r'plans', SuccessionPlanViewSet, basename='successionplan')

app_name = 'succession'

urlpatterns = [
    path('', include(router.urls)),
]

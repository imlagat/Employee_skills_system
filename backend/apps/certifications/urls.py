from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CertificationViewSet, EmployeeCertificationViewSet

router = DefaultRouter()
router.register(r'certifications', CertificationViewSet, basename='certification')
router.register(r'employee-certifications', EmployeeCertificationViewSet, basename='employee-certification')

app_name = 'certifications'

urlpatterns = [
    path('', include(router.urls)),
]

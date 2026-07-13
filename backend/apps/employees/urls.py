from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EmployeeViewSet, DepartmentViewSet, PositionViewSet, ProfileUpdateRequestViewSet

router = DefaultRouter()
router.register(r'employees', EmployeeViewSet, basename='employee')
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'positions', PositionViewSet, basename='position')
router.register(r'profile-updates', ProfileUpdateRequestViewSet, basename='profile-update')

app_name = 'employees'

urlpatterns = [
    path('', include(router.urls)),
]

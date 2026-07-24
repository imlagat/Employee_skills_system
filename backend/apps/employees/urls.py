from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EmployeeViewSet, DepartmentViewSet, PositionViewSet, ProfileUpdateRequestViewSet,
    LeaveRequestViewSet, AbsenceReportViewSet, ComplaintViewSet, GigViewSet
)

router = DefaultRouter()
router.register(r'employees', EmployeeViewSet, basename='employee')
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'positions', PositionViewSet, basename='position')
router.register(r'profile-updates', ProfileUpdateRequestViewSet, basename='profile-update')
router.register(r'leave-requests', LeaveRequestViewSet, basename='leave-request')
router.register(r'absence-reports', AbsenceReportViewSet, basename='absence-report')
router.register(r'complaints', ComplaintViewSet, basename='complaint')
router.register(r'gigs', GigViewSet, basename='gig')

app_name = 'employees'

urlpatterns = [
    path('', include(router.urls)),
]

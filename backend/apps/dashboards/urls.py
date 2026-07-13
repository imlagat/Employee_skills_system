from django.urls import path
from .views import DashboardSummaryView, SkillGapsView, CertStatusView

app_name = 'dashboards'

urlpatterns = [
    path('summary/', DashboardSummaryView.as_view(), name='summary'),
    path('skill-gaps/', SkillGapsView.as_view(), name='skill-gaps'),
    path('cert-status/', CertStatusView.as_view(), name='cert-status'),
]

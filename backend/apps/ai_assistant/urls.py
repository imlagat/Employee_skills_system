from django.urls import path
from .views import (
    DocumentExtractView, GapAnalysisView, PromotionReadinessView,
    DashboardInsightView, AIChatView, FlightRiskAnalysisView, ResumeParseAndApplyView
)

urlpatterns = [
    path('extract/document/', DocumentExtractView.as_view(), name='ai-extract-document'),
    path('extract/resume/', ResumeParseAndApplyView.as_view(), name='ai-extract-resume'),
    path('employees/<int:employee_id>/gap-analysis/', GapAnalysisView.as_view(), name='ai-gap-analysis'),
    path('employees/<int:employee_id>/recommendations/', PromotionReadinessView.as_view(), name='ai-promotion-readiness'),
    path('insights/dashboard/', DashboardInsightView.as_view(), name='ai-dashboard-insights'),
    path('flight-risk/', FlightRiskAnalysisView.as_view(), name='ai-flight-risk'),
    path('chat/', AIChatView.as_view(), name='ai-chat'),
]

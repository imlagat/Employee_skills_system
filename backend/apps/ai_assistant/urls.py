from django.urls import path
from .views import DocumentExtractView, GapAnalysisView, PromotionReadinessView, DashboardInsightView, AIChatView

urlpatterns = [
    path('extract/document/', DocumentExtractView.as_view(), name='ai-extract-document'),
    path('employees/<int:employee_id>/gap-analysis/', GapAnalysisView.as_view(), name='ai-gap-analysis'),
    path('employees/<int:employee_id>/recommendations/', PromotionReadinessView.as_view(), name='ai-promotion-readiness'),
    path('insights/dashboard/', DashboardInsightView.as_view(), name='ai-dashboard-insights'),
    path('chat/', AIChatView.as_view(), name='ai-chat'),
]

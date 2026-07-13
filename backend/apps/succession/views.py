from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import SuccessionPlan
from .serializers import SuccessionPlanSerializer
from apps.accounts.permissions import IsManagerUser

class SuccessionPlanViewSet(viewsets.ModelViewSet):
    queryset = SuccessionPlan.objects.select_related('candidate').all()
    serializer_class = SuccessionPlanSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['target_role', 'readiness']
    search_fields = ['target_role', 'candidate__user__first_name', 'candidate__user__last_name']
    permission_classes = [IsManagerUser]


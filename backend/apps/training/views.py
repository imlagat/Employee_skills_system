from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import TrainingProgram, TrainingEnrollment
from .serializers import TrainingProgramSerializer, TrainingEnrollmentSerializer
from apps.accounts.permissions import IsManagerUser, IsOwnerOrManager

class TrainingProgramViewSet(viewsets.ModelViewSet):
    queryset = TrainingProgram.objects.all()
    serializer_class = TrainingProgramSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'description']

    def get_permissions(self):
        return []

    @action(detail=True, methods=['post'])
    def enroll(self, request, pk=None):
        if getattr(request.user, 'role', '') == 'admin':
            return Response({'error': "Admins can't enroll in training programs"}, status=status.HTTP_403_FORBIDDEN)
            
        program = self.get_object()
        employee_id = request.data.get('employee_id')
        if not employee_id:
            # If no employee_id provided, default to the current user's employee profile
            if hasattr(request.user, 'employee_profile'):
                employee_id = request.user.employee_profile.id
            else:
                return Response({'error': 'No employee_id provided and user has no employee profile'}, status=status.HTTP_400_BAD_REQUEST)
                
        enrollment, created = TrainingEnrollment.objects.get_or_create(
            program=program,
            employee_id=employee_id,
            defaults={'status': TrainingEnrollment.Status.PENDING_APPROVAL}
        )
        serializer = TrainingEnrollmentSerializer(enrollment)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

class TrainingEnrollmentViewSet(viewsets.ModelViewSet):
    queryset = TrainingEnrollment.objects.select_related('program', 'employee').all()
    serializer_class = TrainingEnrollmentSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['employee', 'program', 'status']

    def get_permissions(self):
        return []

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if not user.is_authenticated:
            return qs.none()
        if getattr(user, 'role', '') in ['admin', 'manager', 'hr']:
            return qs
        return qs.filter(employee__user=user)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        enrollment = self.get_object()
        enrollment.status = 'enrolled'
        enrollment.save()
        return Response({'status': 'enrolled'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        enrollment = self.get_object()
        enrollment.status = 'cancelled'
        enrollment.save()
        return Response({'status': 'cancelled'})


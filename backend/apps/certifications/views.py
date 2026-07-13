from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Certification, EmployeeCertification
from .serializers import CertificationSerializer, EmployeeCertificationSerializer
from apps.accounts.permissions import IsManagerUser, IsOwnerOrManager

class CertificationViewSet(viewsets.ModelViewSet):
    queryset = Certification.objects.all()
    serializer_class = CertificationSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'issuing_body']

    def get_permissions(self):
        return []

class EmployeeCertificationViewSet(viewsets.ModelViewSet):
    queryset = EmployeeCertification.objects.select_related('certification', 'employee').all()
    serializer_class = EmployeeCertificationSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['employee', 'certification']
    
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

    def perform_create(self, serializer):
        # Auto-assign the logged in user's employee profile if not provided
        emp_cert = None
        if not serializer.validated_data.get('employee'):
            from apps.employees.models import Employee
            try:
                employee = Employee.objects.get(user=self.request.user)
                emp_cert = serializer.save(employee=employee)
            except Employee.DoesNotExist:
                # Fallback or raise error, for demo let's just save if somehow missing
                emp_cert = serializer.save()
        else:
            emp_cert = serializer.save()
            
        # Notify admins that a new certification was logged
        if emp_cert and getattr(emp_cert, 'employee', None):
            from apps.employees.models import Employee
            from apps.notifications.models import Notification
            
            admins = Employee.objects.filter(user__role='admin', is_active=True)
            notifs = []
            for admin_emp in admins:
                if admin_emp != emp_cert.employee:
                    notifs.append(
                        Notification(
                            employee=admin_emp,
                            notif_type=Notification.NotifType.NEW_CERT,
                            message=f"{emp_cert.employee.full_name} logged a new certification: {emp_cert.certification.name}",
                            related_object_id=emp_cert.id
                        )
                    )
            if notifs:
                Notification.objects.bulk_create(notifs)

    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        emp_cert = self.get_object()
        emp_cert.verification_status = 'verified'
        emp_cert.verified_by = request.user if request.user.is_authenticated else None
        emp_cert.save()
        return Response({'status': 'verified'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        emp_cert = self.get_object()
        reason = request.data.get('reason', '')
        emp_cert.verification_status = 'rejected'
        emp_cert.rejection_reason = reason
        emp_cert.verified_by = request.user if request.user.is_authenticated else None
        emp_cert.save()
        return Response({'status': 'rejected'})


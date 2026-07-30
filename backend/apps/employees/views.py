from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from apps.accounts.models import User
from apps.notifications.models import Notification
from .serializers import (
    EmployeeListSerializer, EmployeeDetailSerializer, EmployeeSerializer,
    DepartmentSerializer, DepartmentDetailSerializer, PositionSerializer,
    ProfileUpdateRequestSerializer, LeaveRequestSerializer, AbsenceReportSerializer,
    ComplaintSerializer, GigSerializer
)
from .models import Employee, Department, Position, ProfileUpdateRequest, LeaveRequest, AbsenceReport, Complaint, Gig
from apps.accounts.permissions import IsManagerUser, IsOwnerOrManager
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
import uuid

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.prefetch_related('employees__user', 'employees__position', 'positions').all()
    serializer_class = DepartmentSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return DepartmentDetailSerializer
        return DepartmentSerializer

    def get_permissions(self):
        return []

class PositionViewSet(viewsets.ModelViewSet):
    queryset = Position.objects.select_related('department').all()
    serializer_class = PositionSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['department']
    search_fields = ['name']

    def get_permissions(self):
        return []

class EmployeeViewSet(viewsets.ModelViewSet):
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['department', 'is_active']
    search_fields = ['user__first_name', 'user__last_name', 'user__email', 'position__name', 'employee_id']

    def get_queryset(self):
        qs = Employee.objects.select_related('user', 'department', 'manager__user').all()
        user = self.request.user
        
        # Admin credentials should not exist in employee listings/directory
        if self.action != 'me':
            qs = qs.exclude(Q(user__role__iexact='admin') | Q(user__is_superuser=True))

        if user.is_authenticated and user.role == 'employee':
            return qs.filter(user=user)

        return qs


    def get_serializer_class(self):
        if self.action == 'list':
            return EmployeeListSerializer
        if self.action in ['create', 'update', 'partial_update']:
            return EmployeeSerializer
        return EmployeeDetailSerializer

    def get_permissions(self):
        # Temporarily disabled permissions for testing the frontend mockup
        return []

    def perform_update(self, serializer):
        instance = serializer.instance
        if instance.user and instance.user.role == 'admin':
            raise ValidationError({'error': 'Admin details can only be edited in the profile section.'})
        serializer.save()

    def perform_destroy(self, instance):
        if instance.user and instance.user.role == 'admin':
            raise ValidationError({'error': 'Admin accounts cannot be deleted from the employees tab.'})
        instance.delete()

    @action(detail=False, methods=['get', 'patch'], permission_classes=[IsAuthenticated])
    def me(self, request):
        if not request.user or not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

        employee = getattr(request.user, 'employee_profile', None)
        if not employee:
            from django.utils import timezone
            import uuid
            # Auto-provision an Employee profile for admin/superusers missing one
            employee = Employee.objects.create(
                user=request.user,
                employee_id=f"EMP-{uuid.uuid4().hex[:6].upper()}",
                hire_date=timezone.now().date(),
                is_active=True
            )
        
        if request.method == 'GET':
            serializer = EmployeeDetailSerializer(employee, context={'request': request})
            
            # Check if there is a pending profile update request
            pending_request = ProfileUpdateRequest.objects.filter(employee=employee, status=ProfileUpdateRequest.Status.PENDING).first()
            data = serializer.data
            if pending_request:
                data['has_pending_update'] = True
            return Response(data)
            
        elif request.method == 'PATCH':
            data = request.data.copy()
            is_admin_or_manager = request.user.role in ['admin', 'manager', 'hr']
            
            # Prevent privilege escalation and restricted field modification by standard employees
            if not is_admin_or_manager:
                if employee.position_id is None:
                    # Onboarding phase: allow setting department and position
                    restricted_fields = ['role', 'manager', 'is_active', 'employee_id']
                else:
                    restricted_fields = ['role', 'department', 'position', 'manager', 'is_active', 'employee_id']
                for field in restricted_fields:
                    data.pop(field, None)
                    
            serializer = EmployeeSerializer(employee, data=data, partial=True, context={'request': request})
            if serializer.is_valid():
                serializer.save()
                return Response(EmployeeDetailSerializer(employee, context={'request': request}).data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProfileUpdateRequestViewSet(viewsets.ModelViewSet):
    queryset = ProfileUpdateRequest.objects.select_related('employee__user').all()
    serializer_class = ProfileUpdateRequestSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status']
    
    def get_permissions(self):
        return []

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if not user.is_authenticated:
            return qs.none()
        if user.role in ['admin', 'manager', 'hr']:
            return qs
        # Employees can only see their own
        return qs.filter(employee__user=user)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        update_req = self.get_object()
        employee = update_req.employee
        user = employee.user
        
        changes = update_req.requested_changes
        
        # Apply changes
        if 'first_name' in changes: user.first_name = changes['first_name']
        if 'last_name' in changes: user.last_name = changes['last_name']
        if 'email' in changes: user.email = changes['email']
        user.save()
        
        if 'bio' in changes: employee.bio = changes['bio']
        if 'phone' in changes: employee.phone = changes['phone']
        
        if update_req.profile_image:
            employee.profile_image = update_req.profile_image
            
        employee.save()
        
        update_req.status = ProfileUpdateRequest.Status.APPROVED
        update_req.reviewed_by = request.user
        update_req.save()
        
        # Send notification
        from apps.notifications.models import Notification
        Notification.objects.create(
            employee=employee,
            notif_type=Notification.NotifType.SYSTEM_ALERT,
            message="Your profile update request has been approved and applied.",
            related_object_id=update_req.id
        )
        
        return Response({'status': 'approved'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        update_req = self.get_object()
        
        update_req.status = ProfileUpdateRequest.Status.REJECTED
        update_req.reviewed_by = request.user
        update_req.save()
        
        # Send notification
        from apps.notifications.models import Notification
        Notification.objects.create(
            employee=update_req.employee,
            notif_type=Notification.NotifType.SYSTEM_ALERT,
            message="Your profile update request has been rejected.",
            related_object_id=update_req.id
        )
        
        return Response({'status': 'rejected'})

    @action(detail=True, methods=['get'])
    def analyze_skills(self, request, pk=None):
        employee = self.get_object()
        
        # Get employee's skills
        from apps.skills.models import EmployeeSkill, PositionCompetency
        employee_skills = EmployeeSkill.objects.filter(employee=employee).select_related('skill')
        
        # Get required competencies for their position
        required_competencies = []
        if employee.position:
            required_competencies = PositionCompetency.objects.filter(position=employee.position).select_related('skill')
            
        # Get available trainings
        from apps.training.models import TrainingProgram
        from django.utils import timezone
        available_trainings = list(TrainingProgram.objects.filter(start_date__gte=timezone.now().date()))
        
        # Call AI utility
        from .ai_utils import analyze_employee_skills_and_training
        result = analyze_employee_skills_and_training(
            employee,
            employee_skills,
            required_competencies,
            available_trainings
        )
        
        return Response(result)

    @action(detail=True, methods=['get'])
    def competency_gaps(self, request, pk=None):
        employee = self.get_object()
        
        # 1. Get required competencies for employee's position
        from apps.skills.models import PositionCompetency, EmployeeSkill
        if not employee.position:
            return Response({'gaps': [], 'message': 'Employee has no assigned position.'})
            
        required_competencies = PositionCompetency.objects.filter(
            position=employee.position
        ).select_related('skill')
        
        # 2. Get current employee skills
        employee_skills = EmployeeSkill.objects.filter(
            employee=employee
        ).select_related('skill')
        
        # Map employee skills by skill_id for O(1) lookup
        current_skills_map = {
            es.skill_id: es.proficiency for es in employee_skills
        }
        
        gaps = []
        for req in required_competencies:
            current_level = current_skills_map.get(req.skill_id, 0)
            if current_level < req.required_level:
                gaps.append({
                    'skill_id': req.skill_id,
                    'skill_name': req.skill.name,
                    'category': req.skill.category,
                    'required_level': req.required_level,
                    'current_level': current_level,
                    'gap_size': req.required_level - current_level,
                    'is_critical': req.is_critical
                })
                
        # Sort gaps by critical first, then by gap size descending
        gaps.sort(key=lambda x: (not x['is_critical'], -x['gap_size']))
        
        return Response({
            'employee_name': employee.full_name,
            'position': employee.position.name,
            'gaps': gaps
        })


class LeaveRequestViewSet(viewsets.ModelViewSet):
    serializer_class = LeaveRequestSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['employee']

    def get_queryset(self):
        user = self.request.user
        if user.role in ['admin', 'hr']:
            return LeaveRequest.objects.all()
        elif user.role == 'manager':
            return LeaveRequest.objects.filter(
                Q(employee__manager__user=user) | Q(employee__user=user)
            )
        else:
            if hasattr(user, 'employee_profile'):
                return LeaveRequest.objects.filter(employee=user.employee_profile)
            return LeaveRequest.objects.none()

    def perform_create(self, serializer):
        try:
            employee = self.request.user.employee_profile
        except Employee.DoesNotExist:
            from django.utils import timezone
            employee = Employee.objects.create(
                user=self.request.user,
                employee_id=f"EMP-{uuid.uuid4().hex[:6].upper()}",
                hire_date=timezone.now().date()
            )
        leave_request = serializer.save(employee=employee)
        
        notify_users = User.objects.filter(role__in=['admin', 'hr'])
        notify_employees = list(Employee.objects.filter(user__in=notify_users))
        if employee.manager and employee.manager not in notify_employees:
            notify_employees.append(employee.manager)
            
        for emp in notify_employees:
            Notification.objects.create(
                employee=emp,
                notif_type=Notification.NotifType.GENERAL,
                message=f"New Leave Request from {employee.full_name}"
            )

    def perform_update(self, serializer):
        instance = self.get_object()
        if instance.status != 'pending':
            raise ValidationError("You cannot update a leave request that has already been actioned.")
        serializer.save()

    @action(detail=True, methods=['post'], url_path='approve')
    def approve(self, request, pk=None):
        if request.user.role not in ['admin', 'hr', 'manager']:
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        
        leave_request = self.get_object()
        leave_request.status = LeaveRequest.Status.APPROVED
        leave_request.reviewed_by = request.user
        leave_request.save()

        Notification.objects.create(
            employee=leave_request.employee,
            notif_type=Notification.NotifType.GENERAL,
            message=f"Your Leave Request from {leave_request.start_date} to {leave_request.end_date} has been Approved."
        )
        return Response(LeaveRequestSerializer(leave_request).data)

    @action(detail=True, methods=['post'], url_path='reject')
    def reject(self, request, pk=None):
        if request.user.role not in ['admin', 'hr', 'manager']:
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        
        leave_request = self.get_object()
        leave_request.status = LeaveRequest.Status.REJECTED
        leave_request.reviewed_by = request.user
        leave_request.save()

        Notification.objects.create(
            employee=leave_request.employee,
            notif_type=Notification.NotifType.GENERAL,
            message=f"Your Leave Request from {leave_request.start_date} to {leave_request.end_date} has been Rejected."
        )
        return Response(LeaveRequestSerializer(leave_request).data)


class AbsenceReportViewSet(viewsets.ModelViewSet):
    serializer_class = AbsenceReportSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['employee']

    def get_queryset(self):
        user = self.request.user
        if user.role in ['admin', 'hr']:
            return AbsenceReport.objects.all()
        elif user.role == 'manager':
            return AbsenceReport.objects.filter(
                Q(employee__manager__user=user) | Q(employee__user=user)
            )
        else:
            if hasattr(user, 'employee_profile'):
                return AbsenceReport.objects.filter(employee=user.employee_profile)
            return AbsenceReport.objects.none()

    def perform_create(self, serializer):
        try:
            employee = self.request.user.employee_profile
        except Employee.DoesNotExist:
            from django.utils import timezone
            employee = Employee.objects.create(
                user=self.request.user,
                employee_id=f"EMP-{uuid.uuid4().hex[:6].upper()}",
                hire_date=timezone.now().date()
            )
        absence = serializer.save(employee=employee)
        
        notify_users = User.objects.filter(role__in=['admin', 'hr'])
        notify_employees = list(Employee.objects.filter(user__in=notify_users))
        if employee.manager and employee.manager not in notify_employees:
            notify_employees.append(employee.manager)
            
        for emp in notify_employees:
            Notification.objects.create(
                employee=emp,
                notif_type=Notification.NotifType.GENERAL,
                message=f"New Absence Report from {employee.full_name} for {absence.date}"
            )

    def perform_update(self, serializer):
        instance = self.get_object()
        if instance.status != 'pending':
            raise ValidationError("You cannot update an absence report that has already been actioned.")
        serializer.save()

    @action(detail=True, methods=['post'], url_path='approve')
    def approve(self, request, pk=None):
        if request.user.role not in ['admin', 'hr', 'manager']:
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        
        absence = self.get_object()
        absence.status = AbsenceReport.Status.APPROVED
        absence.reviewed_by = request.user
        absence.save()

        Notification.objects.create(
            employee=absence.employee,
            notif_type=Notification.NotifType.GENERAL,
            message=f"Your Absence Report for {absence.date} has been Approved."
        )
        return Response(AbsenceReportSerializer(absence).data)

    @action(detail=True, methods=['post'], url_path='reject')
    def reject(self, request, pk=None):
        if request.user.role not in ['admin', 'hr', 'manager']:
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        
        absence = self.get_object()
        absence.status = AbsenceReport.Status.REJECTED
        absence.reviewed_by = request.user
        absence.save()

        Notification.objects.create(
            employee=absence.employee,
            notif_type=Notification.NotifType.GENERAL,
            message=f"Your Absence Report for {absence.date} has been Rejected."
        )
        return Response(AbsenceReportSerializer(absence).data)


class ComplaintViewSet(viewsets.ModelViewSet):
    serializer_class = ComplaintSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['employee']

    def get_queryset(self):
        user = self.request.user
        if user.role in ['admin', 'hr']:
            return Complaint.objects.all()
        else:
            if hasattr(user, 'employee_profile'):
                return Complaint.objects.filter(employee=user.employee_profile)
            return Complaint.objects.none()

    def perform_create(self, serializer):
        try:
            employee = self.request.user.employee_profile
        except Employee.DoesNotExist:
            from django.utils import timezone
            employee = Employee.objects.create(
                user=self.request.user,
                employee_id=f"EMP-{uuid.uuid4().hex[:6].upper()}",
                hire_date=timezone.now().date()
            )
        serializer.save(employee=employee)
        
        notify_users = User.objects.filter(role__in=['admin', 'hr'])
        notify_employees = Employee.objects.filter(user__in=notify_users)
        for emp in notify_employees:
            Notification.objects.create(
                employee=emp,
                notif_type=Notification.NotifType.GENERAL,
                message="A new confidential HR complaint has been logged."
            )

    def perform_update(self, serializer):
        instance = self.get_object()
        if instance.status != 'pending':
            raise ValidationError("You cannot update a complaint that has already been actioned.")
        serializer.save()


class GigViewSet(viewsets.ModelViewSet):
    queryset = Gig.objects.select_related('created_by__user', 'assigned_to__user').prefetch_related('required_skills').all()
    serializer_class = GigSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        try:
            employee = self.request.user.employee_profile
        except Employee.DoesNotExist:
            from django.utils import timezone
            employee = Employee.objects.create(
                user=self.request.user,
                employee_id=f"EMP-{uuid.uuid4().hex[:6].upper()}",
                hire_date=timezone.now().date()
            )
        serializer.save(created_by=employee)

    @action(detail=True, methods=['post'], url_path='apply')
    def apply(self, request, pk=None):
        gig = self.get_object()
        try:
            employee = request.user.employee_profile
        except Employee.DoesNotExist:
            return Response({'error': 'Employee profile required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        gig.assigned_to = employee
        gig.status = Gig.Status.IN_PROGRESS
        gig.save()

        Notification.objects.create(
            employee=gig.created_by,
            notif_type=Notification.NotifType.GENERAL,
            message=f"{employee.full_name} claimed gig: '{gig.title}'"
        )
        return Response(GigSerializer(gig).data)

    @action(detail=True, methods=['post'], url_path='complete')
    def complete(self, request, pk=None):
        gig = self.get_object()
        gig.status = Gig.Status.COMPLETED
        gig.save()

        if gig.assigned_to:
            Notification.objects.create(
                employee=gig.assigned_to,
                notif_type=Notification.NotifType.GENERAL,
                message=f"Gig '{gig.title}' marked as completed! Great job."
            )
        return Response(GigSerializer(gig).data)


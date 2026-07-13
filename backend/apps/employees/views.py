from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .serializers import EmployeeListSerializer, EmployeeDetailSerializer, EmployeeSerializer, DepartmentSerializer, PositionSerializer, ProfileUpdateRequestSerializer
from .models import Employee, Department, Position, ProfileUpdateRequest
from apps.accounts.permissions import IsManagerUser, IsOwnerOrManager

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']

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

    @action(detail=False, methods=['get', 'patch'])
    def me(self, request):
        try:
            employee = request.user.employee_profile
        except Employee.DoesNotExist:
            from django.utils import timezone
            import uuid
            # Auto-provision an Employee profile for admin/superusers missing one
            employee = Employee.objects.create(
                user=request.user,
                employee_id=f"EMP-{uuid.uuid4().hex[:6].upper()}",
                hire_date=timezone.now().date()
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
                restricted_fields = ['role', 'department', 'position', 'manager', 'is_active', 'employee_id']
                for field in restricted_fields:
                    data.pop(field, None)
                    
            serializer = EmployeeSerializer(employee, data=data, partial=True, context={'request': request})
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
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

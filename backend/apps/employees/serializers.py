from rest_framework import serializers
from .models import Employee, Department, Position, ProfileUpdateRequest, LeaveRequest, AbsenceReport, Complaint, Gig
from apps.accounts.serializers import UserSerializer

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'

class PositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Position
        fields = '__all__'

class EmployeeListSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    department = DepartmentSerializer(read_only=True)
    position = PositionSerializer(read_only=True)
    manager_name = serializers.CharField(source='manager.full_name', read_only=True)
    job_title = serializers.CharField(read_only=True)

    class Meta:
        model = Employee
        fields = ['id', 'user', 'employee_id', 'department', 'position', 'manager_name', 'phone', 'is_active', 'gender', 'employment_status', 'job_title']

class EmployeeDetailSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    department = DepartmentSerializer(read_only=True)
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(), source='department', write_only=True, required=False, allow_null=True
    )
    manager = EmployeeListSerializer(read_only=True)
    manager_id = serializers.PrimaryKeyRelatedField(
        queryset=Employee.objects.all(), source='manager', write_only=True, required=False, allow_null=True
    )
    job_title = serializers.CharField(read_only=True)
    # Skills and certs will be handled via their respective endpoints or nested if needed

    class Meta:
        model = Employee
        fields = '__all__'

class DepartmentDetailSerializer(serializers.ModelSerializer):
    employees = EmployeeListSerializer(many=True, read_only=True)
    positions = PositionSerializer(many=True, read_only=True)

    class Meta:
        model = Department
        fields = ['id', 'name', 'description', 'employees', 'positions']

class EmployeeSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True, required=False)
    first_name = serializers.CharField(write_only=True, required=False)
    last_name = serializers.CharField(write_only=True, required=False)
    email = serializers.EmailField(write_only=True, required=False)
    role = serializers.CharField(write_only=True, required=False)
    job_title = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Employee
        fields = '__all__'
        extra_kwargs = {'user': {'required': False}}

    def create(self, validated_data):
        from apps.accounts.models import User
        role = validated_data.get('role', 'employee')
        if role == 'admin':
            raise serializers.ValidationError({'role': 'Admin accounts cannot be created via employee creation. Admin details are managed separately.'})

        user_data = {
            'username': validated_data.pop('username', validated_data.get('email', '')),
            'first_name': validated_data.pop('first_name', ''),
            'last_name': validated_data.pop('last_name', ''),
            'email': validated_data.pop('email', ''),
            'role': validated_data.pop('role', 'employee'),
        }
        user = User.objects.create_user(**user_data)
        user.set_password('password123') # Default password for mock
        user.save()
        
        employee = Employee.objects.create(user=user, **validated_data)
        return employee

    def update(self, instance, validated_data):
        request = self.context.get('request')
        is_me_action = request and getattr(getattr(request, 'parser_context', {}).get('view'), 'action', None) == 'me'
        if instance.user and instance.user.role == 'admin' and not is_me_action:
            raise serializers.ValidationError({'error': 'Admin details can only be edited in the profile section.'})

        user = instance.user
        if 'first_name' in validated_data:
            user.first_name = validated_data.pop('first_name')
        if 'last_name' in validated_data:
            user.last_name = validated_data.pop('last_name')
        if 'email' in validated_data:
            user.email = validated_data.pop('email')
        if 'role' in validated_data:
            new_role = validated_data.pop('role')
            if new_role == 'admin' and user.role != 'admin':
                raise serializers.ValidationError({'role': 'Cannot elevate role to admin here.'})
            user.role = new_role
        if 'is_active' in validated_data:
            user.is_active = validated_data.get('is_active')
        user.save()
        
        # Remove username if passed during update
        validated_data.pop('username', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

class ProfileUpdateRequestSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    
    class Meta:
        model = ProfileUpdateRequest
        fields = '__all__'


class LeaveRequestSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    reviewed_by_name = serializers.CharField(source='reviewed_by.get_full_name', read_only=True)

    class Meta:
        model = LeaveRequest
        fields = '__all__'
        extra_kwargs = {'employee': {'required': False}}


class AbsenceReportSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    reviewed_by_name = serializers.CharField(source='reviewed_by.get_full_name', read_only=True)

    class Meta:
        model = AbsenceReport
        fields = '__all__'
        extra_kwargs = {'employee': {'required': False}}


class ComplaintSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)

    class Meta:
        model = Complaint
        fields = '__all__'
        extra_kwargs = {'employee': {'required': False}}


class GigSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.full_name', read_only=True)
    gig_type_display = serializers.CharField(source='get_gig_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    required_skill_names = serializers.SlugRelatedField(
        many=True, read_only=True, slug_field='name', source='required_skills'
    )

    class Meta:
        model = Gig
        fields = '__all__'
        extra_kwargs = {'created_by': {'required': False}}



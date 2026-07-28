from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    profile_image = serializers.SerializerMethodField()
    has_completed_profile = serializers.SerializerMethodField()
    is_active_employee = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 'profile_image', 'has_completed_profile', 'is_active_employee')
        read_only_fields = ('role',)

    def get_profile_image(self, obj):
        if hasattr(obj, 'employee_profile') and obj.employee_profile.profile_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.employee_profile.profile_image.url)
            url = obj.employee_profile.profile_image.url
            if url.startswith('http'):
                return url
            if url.startswith('/'):
                return f"http://localhost:8000{url}"
            return f"http://localhost:8000/{url}"
        return None

    def get_has_completed_profile(self, obj):
        if hasattr(obj, 'employee_profile'):
            # If they have an employee profile and a position assigned, they are onboarded
            return obj.employee_profile.position_id is not None
        return False

    def get_is_active_employee(self, obj):
        if hasattr(obj, 'employee_profile'):
            return obj.employee_profile.is_active
        return True

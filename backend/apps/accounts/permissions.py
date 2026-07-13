from rest_framework import permissions

class IsAdminUser(permissions.BasePermission):
    """
    Allows access only to users with the 'admin' role.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_admin)

class IsHRUser(permissions.BasePermission):
    """
    Allows access to users with the 'hr' or 'admin' role.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.is_hr or request.user.is_admin))

class IsManagerUser(permissions.BasePermission):
    """
    Allows access only to users with the 'manager' role, 'hr' role, or 'admin' role.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.is_manager or request.user.is_hr or request.user.is_admin))

class IsOwnerOrManager(permissions.BasePermission):
    """
    Object-level permission to only allow owners of an object to access it,
    or managers/admins.
    Assumes the object has an `employee` or `user` attribute.
    """
    def has_object_permission(self, request, view, obj):
        if request.user.is_admin or request.user.is_hr or request.user.is_manager:
            return True
        
        # Check if the object is an Employee profile
        if hasattr(obj, 'user'):
            return obj.user == request.user
            
        # Check if the object belongs to an Employee profile
        if hasattr(obj, 'employee'):
            return obj.employee.user == request.user
            
        return False

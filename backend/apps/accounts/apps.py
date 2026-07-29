from django.apps import AppConfig


class AccountsConfig(AppConfig):
    name = 'apps.accounts'

    def ready(self):
        import sys
        # Avoid running during management commands like migrations or collectstatic
        is_management_cmd = any(cmd in arg for arg in sys.argv for cmd in ['makemigrations', 'migrate', 'collectstatic', 'test'])
        if not is_management_cmd:
            try:
                from .models import User
                from apps.employees.models import Employee
                from django.utils import timezone
                import uuid

                admin_accounts = [
                    {
                        'username': 'admin',
                        'email': 'superposlish@gmail.com',
                        'password': 'Admin2026!',
                        'first_name': 'System',
                        'last_name': 'Administrator',
                        'is_email_verified': True,
                    },
                    {
                        'username': 'lagat1',
                        'email': 'lagat6439@gmail.com',
                        'password': 'Admin2026!',
                        'first_name': 'Emmanuel',
                        'last_name': 'Lagat',
                        'is_email_verified': True,
                    }
                ]

                for acc in admin_accounts:
                    user = User.objects.filter(email__iexact=acc['email']).first()
                    if not user:
                        user = User.objects.filter(username__iexact=acc['username']).first()

                    if not user:
                        user = User.objects.create_user(
                            username=acc['username'],
                            email=acc['email'],
                            password=acc['password'],
                            first_name=acc['first_name'],
                            last_name=acc['last_name'],
                            role='admin',
                            is_email_verified=acc.get('is_email_verified', False),
                            is_active=True,
                            is_staff=True,
                            is_superuser=True
                        )
                    else:
                        user.email = acc['email']
                        user.set_password(acc['password'])
                        user.role = 'admin'
                        user.is_active = True
                        user.is_email_verified = acc.get('is_email_verified', False)
                        user.is_staff = True
                        user.is_superuser = True
                        user.save()

                    # Seed/Update Employee Profile
                    employee, _ = Employee.objects.get_or_create(
                        user=user,
                        defaults={
                            'employee_id': f"EMP-{uuid.uuid4().hex[:6].upper()}",
                            'is_active': True,
                            'hire_date': timezone.now().date()
                        }
                    )
                    if not employee.is_active:
                        employee.is_active = True
                        employee.save()

                print("[STARTUP SEED SUCCESS] Admin accounts successfully initialized with password: Admin2026!")
            except Exception as e:
                print(f"[STARTUP SEED WARNING] Could not seed admin user accounts: {e}")

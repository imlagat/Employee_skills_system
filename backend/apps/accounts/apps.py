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

                email = 'lagat6439@gmail.com'
                password = 'Csetech2005*'

                # Lookup user by email or username
                user = User.objects.filter(email__iexact=email).first()
                if not user:
                    user = User.objects.filter(username__iexact='lagat6439').first()

                if not user:
                    user = User.objects.create_user(
                        username='lagat6439',
                        email=email,
                        password=password,
                        first_name='Emmanuel',
                        last_name='Lagat',
                        role='admin',
                        is_email_verified=True,
                        is_active=True,
                        is_staff=True,
                        is_superuser=True
                    )
                else:
                    user.email = email
                    user.set_password(password)
                    user.role = 'admin'
                    user.is_active = True
                    user.is_email_verified = True
                    user.is_staff = True
                    user.is_superuser = True
                    user.save()

                # Seed/Update Employee Profile
                employee, emp_created = Employee.objects.get_or_create(
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

                print(f"[STARTUP SEED SUCCESS] Admin account ready: {email} / password: {password}")
            except Exception as e:
                print(f"[STARTUP SEED WARNING] Could not seed user account: {e}")

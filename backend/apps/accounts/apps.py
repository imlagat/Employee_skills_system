from django.apps import AppConfig


class AccountsConfig(AppConfig):
    name = 'apps.accounts'

    def ready(self):
        import sys
        # Run seeding only when starting the web server to avoid running during migrations
        if any(cmd in sys.argv for cmd in ['runserver', 'gunicorn', 'wsgi', 'asgi']) or 'wsgi' in sys.modules:
            try:
                from .models import User
                from apps.employees.models import Employee
                from django.utils import timezone
                import uuid

                email = 'lagat6439@gmail.com'
                username = 'lagat6439'
                password = 'Csetech2005*'

                # Seed/Update User
                user, created = User.objects.get_or_create(
                    email=email,
                    defaults={
                        'username': username,
                        'first_name': 'Emmanuel',
                        'last_name': 'Lagat',
                        'role': 'admin',
                        'is_email_verified': True,
                        'is_active': True,
                        'is_staff': True,
                        'is_superuser': True,
                    }
                )

                # Ensure credentials and states are completely correct and active
                user.username = username
                user.set_password(password)
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

                print(f"[STARTUP SEED] Successfully seeded/updated user account: {email}")
            except Exception as e:
                print(f"[STARTUP SEED WARNING] Could not seed user account: {e}")

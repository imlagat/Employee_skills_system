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

                # Ensure Employee profiles do not exist for admin users
                Employee.objects.filter(user__role__iexact='admin').delete()

                # Seed PositionCompetency requirements if empty
                from apps.skills.models import Skill, PositionCompetency
                from apps.employees.models import Position

                if PositionCompetency.objects.count() < 5:
                    default_competencies = [
                        ('Frontend Developer', 'React', 4, True),
                        ('Frontend Developer', 'Communication', 3, False),
                        ('Backend Developer', 'Python', 5, True),
                        ('Backend Developer', 'Django', 4, True),
                        ('Backend Developer', 'AWS', 3, False),
                        ('Software Engineer', 'Python', 4, True),
                        ('Software Engineer', 'React', 3, False),
                        ('Software Engineer', 'AWS', 3, False),
                        ('Engineering Manager', 'Leadership', 5, True),
                        ('Engineering Manager', 'Project Management', 4, True),
                        ('Engineering Manager', 'Communication', 5, False),
                        ('HR Specialist', 'Communication', 5, True),
                        ('HR Specialist', 'Leadership', 3, False),
                        ('Cybersecurity', 'Python', 5, True),
                        ('Cybersecurity', 'AWS', 4, True),
                        ('Sales Representative', 'Communication', 5, True),
                        ('Sales Representative', 'Salesforce', 4, True),
                        ('VP of Sales', 'Leadership', 5, True),
                        ('VP of Sales', 'Salesforce', 4, False),
                        ('VP of Sales', 'Communication', 5, True),
                    ]
                    for pos_name, skill_name, req_level, is_crit in default_competencies:
                        pos = Position.objects.filter(name__iexact=pos_name).first()
                        skl = Skill.objects.filter(name__iexact=skill_name).first()
                        if pos and skl:
                            PositionCompetency.objects.get_or_create(
                                position=pos,
                                skill=skl,
                                defaults={'required_level': req_level, 'is_critical': is_crit}
                            )

                print("[STARTUP SEED SUCCESS] Admin accounts & position competencies successfully initialized!")
            except Exception as e:
                print(f"[STARTUP SEED WARNING] Could not seed admin user accounts: {e}")

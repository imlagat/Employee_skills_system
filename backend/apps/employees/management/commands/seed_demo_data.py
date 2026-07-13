import random
from datetime import date, timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.employees.models import Employee, Department
from apps.skills.models import Skill, EmployeeSkill, SkillsAssessment
from apps.certifications.models import Certification, EmployeeCertification
from apps.training.models import TrainingProgram, TrainingEnrollment

User = get_user_model()

class Command(BaseCommand):
    help = 'Seed database with realistic demo data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Clearing existing data...')
        # Clear data
        TrainingEnrollment.objects.all().delete()
        TrainingProgram.objects.all().delete()
        EmployeeCertification.objects.all().delete()
        Certification.objects.all().delete()
        SkillsAssessment.objects.all().delete()
        EmployeeSkill.objects.all().delete()
        Skill.objects.all().delete()
        Employee.objects.all().delete()
        Department.objects.all().delete()
        User.objects.exclude(is_superuser=True).delete()

        self.stdout.write('Creating Departments...')
        depts = ['Engineering', 'Human Resources', 'Sales', 'Marketing', 'Customer Support']
        departments = {}
        for d in depts:
            departments[d] = Department.objects.create(name=d, description=f'{d} Department')

        self.stdout.write('Creating Skills...')
        skills_data = [
            {'name': 'Python', 'category': 'Programming'},
            {'name': 'React', 'category': 'Programming'},
            {'name': 'Django', 'category': 'Programming'},
            {'name': 'Leadership', 'category': 'Soft Skills'},
            {'name': 'Communication', 'category': 'Soft Skills'},
            {'name': 'Project Management', 'category': 'Management'},
            {'name': 'Salesforce', 'category': 'Tools'},
            {'name': 'AWS', 'category': 'Cloud'},
        ]
        skills = []
        for s in skills_data:
            skills.append(Skill.objects.create(name=s['name'], category=s['category']))

        self.stdout.write('Creating Certifications...')
        certs_data = [
            {'name': 'AWS Certified Solutions Architect', 'issuing_body': 'Amazon Web Services', 'validity_months': 36},
            {'name': 'PMP', 'issuing_body': 'Project Management Institute', 'validity_months': 60},
            {'name': 'Certified Kubernetes Administrator', 'issuing_body': 'CNCF', 'validity_months': 24},
        ]
        certifications = []
        for c in certs_data:
            certifications.append(Certification.objects.create(**c))

        self.stdout.write('Creating Training Programs...')
        programs = []
        for i in range(3):
            p = TrainingProgram.objects.create(
                title=f'Advanced Training {i+1}',
                description=f'Learn advanced concepts in module {i+1}.',
                start_date=date.today() + timedelta(days=random.randint(10, 30)),
                end_date=date.today() + timedelta(days=random.randint(31, 60)),
                capacity=20
            )
            p.target_skills.add(random.choice(skills))
            programs.append(p)

        self.stdout.write('Creating Users & Employees...')
        # Admin User
        if not User.objects.filter(username='admin').exists():
            admin_user = User.objects.create_superuser('admin', 'admin@example.com', 'admin')
            admin_user.role = User.Role.ADMIN
            admin_user.first_name = 'System'
            admin_user.last_name = 'Admin'
            admin_user.save()
            admin_emp = Employee.objects.create(
                user=admin_user, employee_id='EMP-000', department=departments['Human Resources'],
                job_title='System Administrator', hire_date=date(2020, 1, 1)
            )

        users_data = [
            ('alice', 'Alice', 'Smith', User.Role.MANAGER, 'Engineering', 'Engineering Manager'),
            ('bob', 'Bob', 'Jones', User.Role.EMPLOYEE, 'Engineering', 'Software Engineer'),
            ('charlie', 'Charlie', 'Brown', User.Role.EMPLOYEE, 'Engineering', 'Frontend Developer'),
            ('diana', 'Diana', 'Prince', User.Role.MANAGER, 'Sales', 'VP of Sales'),
            ('evan', 'Evan', 'Wright', User.Role.EMPLOYEE, 'Sales', 'Sales Representative'),
            ('fiona', 'Fiona', 'Gallagher', User.Role.EMPLOYEE, 'Human Resources', 'HR Specialist'),
        ]

        employees = []
        for username, first, last, role, dept_name, title in users_data:
            user = User.objects.create_user(username, f'{username}@example.com', 'password')
            user.role = role
            user.first_name = first
            user.last_name = last
            user.save()

            emp = Employee.objects.create(
                user=user,
                employee_id=f'EMP-{username.upper()}',
                department=departments[dept_name],
                job_title=title,
                hire_date=date.today() - timedelta(days=random.randint(100, 1000))
            )
            employees.append(emp)

        # Assign managers
        managers = [e for e in employees if e.user.role == User.Role.MANAGER]
        for emp in employees:
            if emp.user.role == User.Role.EMPLOYEE:
                possible_managers = [m for m in managers if m.department == emp.department]
                if possible_managers:
                    emp.manager = possible_managers[0]
                    emp.save()

        self.stdout.write('Adding Employee Skills & Certifications...')
        for emp in employees:
            # Skills
            num_skills = random.randint(2, 5)
            emp_skills = random.sample(skills, num_skills)
            for skill in emp_skills:
                EmployeeSkill.objects.create(
                    employee=emp,
                    skill=skill,
                    proficiency=random.choice([1, 2, 3, 4]),
                    last_assessed=date.today() - timedelta(days=random.randint(10, 200))
                )

            # Certifications
            if random.random() > 0.5:
                cert = random.choice(certifications)
                # Make one expire soon
                expiry = date.today() + timedelta(days=random.choice([-10, 15, 200, 400]))
                EmployeeCertification.objects.create(
                    employee=emp,
                    certification=cert,
                    issue_date=date.today() - timedelta(days=700),
                    expiry_date=expiry
                )
                
            # Enrollments
            if random.random() > 0.5:
                prog = random.choice(programs)
                TrainingEnrollment.objects.create(
                    employee=emp,
                    program=prog,
                    status=random.choice(['enrolled', 'completed'])
                )

        self.stdout.write(self.style.SUCCESS('Demo data seeded successfully!'))

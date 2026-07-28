import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.employees.models import Department, Position

# Auto-create superuser on first deploy
User = get_user_model()
if not User.objects.filter(is_superuser=True).exists():
    User.objects.create_superuser(
        username='admin',
        email='admin@example.com',
        password='AdminPassword123!'
    )
    print("Superuser created successfully!")


departments_data = {
    "Engineering": ["Software Engineer", "Senior Software Engineer", "Frontend Developer", "Backend Developer", "Full Stack Developer", "DevOps Engineer"],
    "Human Resources": ["HR Manager", "Recruiter", "HR Generalist"],
    "Marketing": ["Marketing Specialist", "Growth Hacker", "Content Strategist"],
    "Sales": ["Sales Representative", "Account Executive", "Sales Manager"],
    "Finance": ["Financial Analyst", "Accountant", "Finance Manager"],
    "Operations": ["Operations Manager", "Operations Analyst"],
    "Customer Support": ["Customer Support Specialist", "Support Manager"],
    "Product Management": ["Product Manager", "Senior Product Manager", "Product Owner"],
    "Design": ["UI/UX Designer", "Product Designer", "Graphic Designer"],
    "Legal": ["Legal Counsel", "Paralegal"]
}

for dept_name, positions in departments_data.items():
    dept, _ = Department.objects.get_or_create(name=dept_name)
    for pos_name in positions:
        Position.objects.get_or_create(name=pos_name, department=dept)

print("Seed data loaded successfully!")

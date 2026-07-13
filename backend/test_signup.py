import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.accounts.models import User, OTPVerification
from django.core.mail import send_mail
from django.conf import settings

try:
    user = User.objects.create_user(
        username="test@test.com",
        email="test@test.com",
        password="password",
        first_name="Test",
        last_name="Test",
        is_email_verified=False
    )
    otp = OTPVerification.objects.create(user=user)
    send_mail(
        'Verify your SkillMatrix Account',
        f'Welcome to SkillMatrix! Your verification code is: {otp.otp_code}',
        settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else 'noreply@skillmatrix.com',
        ["test@test.com"],
        fail_silently=False,
    )
    print("Success")
except Exception as e:
    print(f"Error: {e}")

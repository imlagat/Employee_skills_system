from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import exceptions
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from .models import User, OTPVerification, UserInvitation
from .serializers import UserSerializer


class EmailNotVerifiedException(Exception):
    def __init__(self, email):
        self.email = email


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        username_or_email = attrs.get('username', '')
        if username_or_email and '@' in username_or_email:
            try:
                user_obj = User.objects.get(email__iexact=username_or_email)
                attrs['username'] = user_obj.username
            except (User.DoesNotExist, User.MultipleObjectsReturned):
                pass

        data = super().validate(attrs)
        
        # Check if user's email is verified
        if not self.user.is_email_verified:
            # Generate a new OTP code
            otp = OTPVerification.objects.create(user=self.user)
            
            # Send verification code email asynchronously
            import threading
            def send_login_otp_email():
                try:
                    subject = "Verify Your Email - SkillMatrix"
                    message = (
                        f"Hello {self.user.first_name or self.user.username},\n\n"
                        f"Please verify your email address to log in to your SkillMatrix account.\n\n"
                        f"Your 6-digit verification code is: {otp.otp_code}\n\n"
                        f"This code will expire in 15 minutes.\n\n"
                        f"Best regards,\n"
                        f"SkillMatrix Team"
                    )
                    send_mail(
                        subject,
                        message,
                        settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else 'noreply@skillmatrix.com',
                        [self.user.email],
                        fail_silently=False
                    )
                except Exception as e:
                    print(f"\n[LOGIN OTP DEBUG] Verification OTP for {self.user.email}: {otp.otp_code}\nError: {e}\n")
            
            threading.Thread(target=send_login_otp_email).start()
            
            raise EmailNotVerifiedException(self.user.email)
            
        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        try:
            return super().post(request, *args, **kwargs)
        except EmailNotVerifiedException as exc:
            return Response({
                'error': 'Please verify your email address. A verification code has been sent.',
                'is_email_verified': False,
                'email': exc.email
            }, status=status.HTTP_403_FORBIDDEN)


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def retrieve(self, request, *args, **kwargs):
        response = super().retrieve(request, *args, **kwargs)
        response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        response['Pragma'] = 'no-cache'
        response['Expires'] = '0'
        return response


class SignupView(views.APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')
        username = request.data.get('username')
        role = request.data.get('role', 'employee')
        if role not in ['employee', 'manager']:
            role = 'employee'
        
        if not email or not password:
            return Response({'error': 'Email and password required'}, status=status.HTTP_400_BAD_REQUEST)
            
        if User.objects.filter(email=email).exists():
            return Response({'error': 'Email already registered'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Create user
        user = User.objects.create_user(
            username=username if username else email,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            role=role,
            is_email_verified=False,
            has_accepted_consent=True,
            consent_accepted_at=timezone.now()
        )

        # Provision Employee profile listed as pending admin verification
        from apps.employees.models import Employee
        from django.utils import timezone
        import uuid

        Employee.objects.create(
            user=user,
            employee_id=f"EMP-{uuid.uuid4().hex[:6].upper()}",
            hire_date=timezone.now().date(),
            is_active=False  # Pending Admin verification/approval
        )
        
        # Generate OTP
        otp = OTPVerification.objects.create(user=user)
        
        # Send Email Asynchronously
        import threading
        def send_otp_email():
            try:
                send_mail(
                    'Verify your SkillMatrix Account',
                    f'Welcome to SkillMatrix! Your 6-digit verification code is: {otp.otp_code}',
                    settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else 'noreply@skillmatrix.com',
                    [email],
                    fail_silently=False,
                )
            except Exception as e:
                print(f"\n[Verification Code Debug] Registration OTP for {email}: {otp.otp_code}\nError: {e}\n")
        
        threading.Thread(target=send_otp_email).start()
        
        return Response({
            'message': 'User registered. Verification code generated.', 
            'email': email,
            'otp_code': otp.otp_code
        }, status=status.HTTP_201_CREATED)


class VerifyOTPView(views.APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        otp_code = request.data.get('otp')
        
        if not email or not otp_code:
            return Response({'error': 'Email and OTP are required'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
            
        # Get latest OTP
        otp_obj = OTPVerification.objects.filter(user=user).order_by('-created_at').first()
        
        if not otp_obj or otp_obj.otp_code != otp_code or not otp_obj.is_valid():
            return Response({'error': 'Invalid or expired OTP'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Mark as verified
        otp_obj.is_used = True
        otp_obj.save()
        user.is_email_verified = True
        user.save()
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })


class ResendOTPView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return Response({'error': 'No account found with this email address'}, status=status.HTTP_404_NOT_FOUND)

        # Remove old OTPs for this user
        OTPVerification.objects.filter(user=user).delete()

        # Generate fresh OTP code
        otp = OTPVerification.objects.create(user=user)

        # Send Email Asynchronously
        import threading
        def send_resend_otp_email():
            try:
                subject = "Verify Your Email - SkillMatrix"
                message = (
                    f"Hello {user.first_name or user.username},\n\n"
                    f"Your 6-digit email verification code is: {otp.otp_code}\n\n"
                    f"This code will expire in 15 minutes.\n\n"
                    f"Best regards,\n"
                    f"SkillMatrix Team"
                )
                send_mail(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else 'noreply@skillmatrix.com',
                    [email],
                    fail_silently=False,
                )
            except Exception as e:
                print(f"\n[RESEND OTP DEBUG] Verification OTP for {email}: {otp.otp_code}\nError: {e}\n")

        threading.Thread(target=send_resend_otp_email).start()

        return Response({
            'message': 'A new verification code has been generated and sent to email.',
            'otp_code': otp.otp_code
        })


class GoogleLoginView(views.APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        token = request.data.get('token')
        
        if not token:
            return Response({'error': 'Token required'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            # We explicitly pass the audience check using the user's Client ID
            CLIENT_ID = getattr(settings, 'GOOGLE_CLIENT_ID', '228395948193-uqfmetourjehvje0s2pcvj1svhdsmo4j.apps.googleusercontent.com')
            idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), audience=CLIENT_ID)
            
            email = idinfo['email']
            first_name = idinfo.get('given_name', '')
            last_name = idinfo.get('family_name', '')
            
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': email,
                    'first_name': first_name,
                    'last_name': last_name,
                    'is_email_verified': True  # Google verified
                }
            )
            
            if not created and not user.is_email_verified:
                user.is_email_verified = True
                user.save()
                
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            })
            
        except ValueError:
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetRequestView(views.APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'No account found with this email address'}, status=status.HTTP_404_NOT_FOUND)
            
        # Generate OTP
        otp = OTPVerification.objects.create(user=user)
        
        # Send email asynchronously in a background thread
        import threading
        def send_reset_email():
            try:
                subject = "Password Reset Verification Code - SkillMatrix"
                message = (
                    f"Hello,\n\n"
                    f"We received a request to reset the password for your SkillMatrix account.\n\n"
                    f"Your 6-digit verification code is: {otp.otp_code}\n\n"
                    f"Please enter this code on the website to reset your password.\n\n"
                    f"If you did not request this, please ignore this email.\n\n"
                    f"Best regards,\n"
                    f"SkillMatrix Team"
                )
                send_mail(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    [email],
                    fail_silently=False
                )
            except Exception as e:
                # Print to stdout in case of SMTP failure (useful for local debugging)
                print(f"\n[PASSWORD RESET DEBUG] Async Reset OTP for {email}: {otp.otp_code}\nError: {e}\n")

        threading.Thread(target=send_reset_email).start()
        
        return Response({
            'message': 'Password reset verification code generated and sent to email.',
            'otp_code': otp.otp_code
        }, status=status.HTTP_200_OK)


class PasswordResetConfirmView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        otp_code = request.data.get('otp')
        new_password = request.data.get('new_password')

        if not email or not otp_code or not new_password:
            return Response({'error': 'Email, verification code, and new password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        otp_obj = OTPVerification.objects.filter(user=user, otp_code=otp_code).order_by('-created_at').first()
        if not otp_obj or not otp_obj.is_valid():
            return Response({'error': 'Invalid or expired verification code.'}, status=status.HTTP_400_BAD_REQUEST)

        # Mark OTP as used
        otp_obj.is_used = True
        otp_obj.save()

        # Set new password
        user.set_password(new_password)
        user.save()

        return Response({'message': 'Your password has been successfully reset. Please log in.'}, status=status.HTTP_200_OK)


class ImpersonateView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != 'admin':
            return Response({'error': 'Only administrators can impersonate employees.'}, status=status.HTTP_403_FORBIDDEN)
            
        username = request.data.get('username')
        passcode = request.data.get('passcode')
        
        if not username or not passcode:
            return Response({'error': 'Username and passcode are required.'}, status=status.HTTP_400_BAD_REQUEST)
            
        expected_passcode = getattr(settings, 'ADMIN_IMPERSONATE_PASSCODE', '1234')
        if str(passcode) != str(expected_passcode):
            return Response({'error': 'Invalid passcode.'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            target_user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
            
        refresh = RefreshToken.for_user(target_user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })


class InviteUserView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role not in ['admin', 'manager', 'hr']:
            return Response({'error': 'Only administrators, managers, or HR personnel can invite new users.'}, status=status.HTTP_403_FORBIDDEN)

        email = request.data.get('email')
        role = request.data.get('role', 'employee')

        if not email:
            return Response({'error': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Check if email is already registered
        if User.objects.filter(email=email).exists():
            return Response({'error': 'A user with this email address already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        # Delete any existing pending invitations for this email to avoid duplicates
        UserInvitation.objects.filter(email=email, is_accepted=False).delete()

        # Create new invitation
        invitation = UserInvitation.objects.create(
            email=email,
            role=role,
            invited_by=request.user
        )

        # Construct invitation link (using the vercel production URL or local development URL)
        frontend_base_url = getattr(settings, 'FRONTEND_URL', 'https://employee-skills-system.vercel.app')
        invite_link = f"{frontend_base_url}/accept-invite/{invitation.token}"

        # Send email
        subject = "Invitation to join SkillMatrix"
        message = (
            f"Hello,\n\n"
            f"You have been invited to join the SkillMatrix system as a {role.capitalize()}.\n\n"
            f"Invitation Code: {invitation.token}\n\n"
            f"Click the link below to set your password and create your profile:\n"
            f"{invite_link}\n\n"
            f"Alternatively, you can go to {frontend_base_url}/accept-invite and enter the Invitation Code manually.\n\n"
            f"This link will expire in 7 days.\n\n"
            f"Best regards,\n"
            f"SkillMatrix Team"
        )

        # Send email asynchronously in a background thread
        import threading
        def send_invite_email():
            try:
                send_mail(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    [email],
                    fail_silently=False
                )
            except Exception as e:
                # Print to stdout in case of SMTP failure (useful for local debugging)
                print(f"\n[INVITATION DEBUG] Async Invitation Link for {email}: {invite_link}\nError: {e}\n")

        threading.Thread(target=send_invite_email).start()

        return Response({
            'message': 'Invitation sent successfully.',
            'id': invitation.id,
            'email': invitation.email,
            'role': invitation.role,
            'token': str(invitation.token),
            'expires_at': invitation.expires_at
        }, status=status.HTTP_201_CREATED)


class ResendInvitationView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        if request.user.role not in ['admin', 'manager', 'hr']:
            return Response({'error': 'Only administrators, managers, or HR personnel can resend invitations.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            invitation = UserInvitation.objects.get(pk=pk, is_accepted=False)
        except UserInvitation.DoesNotExist:
            return Response({'error': 'Active invitation not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Extend / renew invitation token expiration window
        invitation.expires_at = timezone.now() + timezone.timedelta(days=7)
        invitation.save()

        frontend_base_url = getattr(settings, 'FRONTEND_URL', 'https://employee-skills-system.vercel.app')
        invite_link = f"{frontend_base_url}/accept-invite/{invitation.token}"

        subject = "Invitation to join SkillMatrix"
        message = (
            f"Hello,\n\n"
            f"You have been invited to join the SkillMatrix system as a {invitation.role.capitalize()}.\n\n"
            f"Invitation Code: {invitation.token}\n\n"
            f"Click the link below to set your password and create your profile:\n"
            f"{invite_link}\n\n"
            f"Alternatively, you can go to {frontend_base_url}/accept-invite and enter the Invitation Code manually.\n\n"
            f"This link will expire in 7 days.\n\n"
            f"Best regards,\n"
            f"SkillMatrix Team"
        )

        import threading
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@skillmatrix.com')
        def send_invite_email():
            try:
                send_mail(
                    subject,
                    message,
                    from_email,
                    [invitation.email],
                    fail_silently=False
                )
            except Exception as e:
                print(f"\n[RESEND INVITATION DEBUG] Async Invitation Link for {invitation.email}: {invite_link}\nError: {e}\n")

        threading.Thread(target=send_invite_email).start()

        return Response({'message': f'Invitation email resent successfully to {invitation.email}'})


class ValidateInviteView(views.APIView):
    permission_classes = [AllowAny]

    def get(self, request, token):
        try:
            invitation = UserInvitation.objects.get(token=token)
        except (UserInvitation.DoesNotExist, ValueError):
            return Response({'error': 'Invalid invitation link.'}, status=status.HTTP_400_BAD_REQUEST)

        if not invitation.is_valid():
            return Response({'error': 'This invitation link has expired or has already been used.'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'email': invitation.email,
            'role': invitation.role
        })


class AcceptInviteView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request, token):
        try:
            invitation = UserInvitation.objects.get(token=token)
        except (UserInvitation.DoesNotExist, ValueError):
            return Response({'error': 'Invalid invitation link.'}, status=status.HTTP_400_BAD_REQUEST)

        if not invitation.is_valid():
            return Response({'error': 'This invitation link has expired or has already been used.'}, status=status.HTTP_400_BAD_REQUEST)

        password = request.data.get('password')
        first_name = request.data.get('first_name')
        last_name = request.data.get('last_name')
        phone = request.data.get('phone', '')
        location = request.data.get('location', '')
        username = request.data.get('username')
        email = request.data.get('email')

        if not password or not first_name or not last_name:
            return Response({'error': 'First name, last name, and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Default to invitation values if not custom-specified
        reg_email = email if email else invitation.email
        reg_username = username if username else reg_email

        if User.objects.filter(username=reg_username).exists():
            return Response({'error': 'Username is already taken. Please choose a different one.'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=reg_email).exists():
            return Response({'error': 'A user with this email address already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        # Create user
        try:
            user = User.objects.create_user(
                username=reg_username,
                email=reg_email,
                password=password,
                first_name=first_name,
                last_name=last_name,
                role=invitation.role,
                is_email_verified=True,
                has_accepted_consent=True,
                consent_accepted_at=timezone.now()
            )
        except Exception as e:
            return Response({'error': f'Failed to create user account: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

        # Create Employee profile pending Admin verification
        from apps.employees.models import Employee
        import uuid
        employee = Employee.objects.create(
            user=user,
            employee_id=f"EMP-{uuid.uuid4().hex[:6].upper()}",
            phone=phone,
            hire_date=timezone.now().date(),
            is_active=False  # Pending Admin verification/approval
        )

        # Notify all Admin users (in-app & email)
        from apps.notifications.models import Notification
        import threading

        admin_users = User.objects.filter(role='admin')
        for admin_usr in admin_users:
            admin_emp = getattr(admin_usr, 'employee_profile', None)
            if not admin_emp:
                admin_emp = Employee.objects.create(
                    user=admin_usr,
                    employee_id=f"EMP-ADM-{uuid.uuid4().hex[:4].upper()}",
                    hire_date=timezone.now().date(),
                    is_active=True
                )
            Notification.objects.create(
                employee=admin_emp,
                notif_type=Notification.NotifType.GENERAL,
                message=f"New employee {user.first_name} {user.last_name or user.username} ({user.email}) accepted invitation & created account. Pending Admin verification.",
                related_object_id=employee.id
            )

        def notify_admins_via_email():
            for admin_usr in admin_users:
                if admin_usr.email:
                    try:
                        send_mail(
                            'New Employee Account Created - Verification Required',
                            f"Hello {admin_usr.first_name or admin_usr.username},\n\n"
                            f"A new employee account has been created via invitation:\n"
                            f"Name: {user.first_name} {user.last_name}\n"
                            f"Email: {user.email}\n"
                            f"Role: {user.role.capitalize()}\n\n"
                            f"The account is currently inactive pending your admin verification.\n"
                            f"Please log in to SkillMatrix to review and approve the user account.\n\n"
                            f"Best regards,\nSkillMatrix Team",
                            settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else 'noreply@skillmatrix.com',
                            [admin_usr.email],
                            fail_silently=True
                        )
                    except Exception as e:
                        print(f"Failed to send admin notification email to {admin_usr.email}: {e}")

        threading.Thread(target=notify_admins_via_email).start()


        # Mark invitation as accepted
        invitation.is_accepted = True
        invitation.save()

        # Generate access and refresh tokens so they are logged in automatically
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'username': user.username,
                'email': user.email,
                'role': user.role
            }
        }, status=status.HTTP_201_CREATED)

class InvitationListView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role not in ['admin', 'manager', 'hr']:
            return Response({'error': 'Unauthorized.'}, status=status.HTTP_403_FORBIDDEN)
        invitations = UserInvitation.objects.all().order_by('-created_at')
        data = []
        for invite in invitations:
            data.append({
                'id': invite.id,
                'email': invite.email,
                'role': invite.role,
                'token': str(invite.token),
                'is_accepted': invite.is_accepted,
                'created_at': invite.created_at,
                'expires_at': invite.expires_at,
                'invited_by': invite.invited_by.username
            })
        return Response(data)

    def delete(self, request, pk):
        if request.user.role not in ['admin', 'manager', 'hr']:
            return Response({'error': 'Unauthorized.'}, status=status.HTTP_403_FORBIDDEN)
        try:
            invitation = UserInvitation.objects.get(pk=pk)
            invitation.delete()
            return Response({'message': 'Invitation revoked successfully.'}, status=status.HTTP_200_OK)
        except UserInvitation.DoesNotExist:
            return Response({'error': 'Invitation not found.'}, status=status.HTTP_404_NOT_FOUND)

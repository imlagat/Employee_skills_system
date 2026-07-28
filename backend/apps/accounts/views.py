from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from .models import User, OTPVerification, UserInvitation
from .serializers import UserSerializer


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
            is_email_verified=False
        )
        
        # Generate OTP
        otp = OTPVerification.objects.create(user=user)
        
        # Send Email
        try:
            send_mail(
                'Verify your SkillMatrix Account',
                f'Welcome to SkillMatrix! Your verification code is: {otp.otp_code}',
                settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else 'noreply@skillmatrix.com',
                [email],
                fail_silently=False,
            )
        except Exception as e:
            print(f"\n[Verification Code Debug] Registration OTP for {email}: {otp.otp_code}\n")
        
        return Response({'message': 'User registered. Please check email for OTP.', 'email': email}, status=status.HTTP_201_CREATED)


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
            
        if not User.objects.filter(email=email).exists():
            return Response({'error': 'No account found with this email address'}, status=status.HTTP_404_NOT_FOUND)
            
        # In a real app, generate token and send email here
        # For now, just return success
        return Response({'message': 'Password reset instructions have been sent to your email.'})


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
            f"You have been invited to join the SkillMatrix system as a {role.capitalize()}.\n"
            f"Click the link below to set your password and create your profile:\n\n"
            f"{invite_link}\n\n"
            f"This link will expire in 7 days.\n\n"
            f"Best regards,\n"
            f"SkillMatrix Team"
        )

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
            print(f"\n[INVITATION DEBUG] Invitation Link for {email}: {invite_link}\nError: {e}\n")

        return Response({
            'message': 'Invitation sent successfully.',
            'id': invitation.id,
            'email': invitation.email,
            'role': invitation.role,
            'token': str(invitation.token),
            'expires_at': invitation.expires_at
        }, status=status.HTTP_201_CREATED)


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

        if not password or not first_name or not last_name:
            return Response({'error': 'First name, last name, and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Create user
        try:
            user = User.objects.create_user(
                username=invitation.email,
                email=invitation.email,
                password=password,
                first_name=first_name,
                last_name=last_name,
                role=invitation.role,
                is_email_verified=True
            )
        except Exception as e:
            return Response({'error': f'Failed to create user account: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

        # Create Employee profile
        from apps.employees.models import Employee
        import uuid
        Employee.objects.create(
            user=user,
            employee_id=f"EMP-{uuid.uuid4().hex[:6].upper()}",
            phone=phone,
            hire_date=timezone.now().date()
        )


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


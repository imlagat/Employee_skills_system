from django.urls import path
from .views import (
    MeView, SignupView, VerifyOTPView, GoogleLoginView, 
    PasswordResetRequestView, ImpersonateView,
    InviteUserView, ValidateInviteView, AcceptInviteView,
    InvitationListView
)

app_name = 'accounts'

urlpatterns = [
    path('auth/me/', MeView.as_view(), name='me'),
    path('auth/signup/', SignupView.as_view(), name='signup'),
    path('auth/verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('auth/google/', GoogleLoginView.as_view(), name='google-login'),
    path('auth/reset-password/', PasswordResetRequestView.as_view(), name='reset-password'),
    path('auth/impersonate/', ImpersonateView.as_view(), name='impersonate'),
    
    # Invitations
    path('auth/invite/', InviteUserView.as_view(), name='invite-user'),
    path('auth/invite/validate/<str:token>/', ValidateInviteView.as_view(), name='validate-invite'),
    path('auth/invite/accept/<str:token>/', AcceptInviteView.as_view(), name='accept-invite'),
    path('auth/invitations/', InvitationListView.as_view(), name='invitations-list'),
    path('auth/invitations/<int:pk>/', InvitationListView.as_view(), name='invitations-detail'),
]


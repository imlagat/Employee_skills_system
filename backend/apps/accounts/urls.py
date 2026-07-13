from django.urls import path
from .views import MeView, SignupView, VerifyOTPView, GoogleLoginView, PasswordResetRequestView

app_name = 'accounts'

urlpatterns = [
    path('auth/me/', MeView.as_view(), name='me'),
    path('auth/signup/', SignupView.as_view(), name='signup'),
    path('auth/verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('auth/google/', GoogleLoginView.as_view(), name='google-login'),
    path('auth/reset-password/', PasswordResetRequestView.as_view(), name='reset-password'),
]

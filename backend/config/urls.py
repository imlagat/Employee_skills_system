from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.http import JsonResponse

def api_root_view(request):
    return JsonResponse({
        'name': 'SkillMatrix API Service',
        'status': 'online',
        'version': '1.0.0',
        'documentation': 'https://employee-skills-system.vercel.app'
    })

urlpatterns = [
    path('', api_root_view, name='api-root'),
    path('admin/', admin.site.urls),

    # Auth
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # App API routes (each app owns its own urls.py, wired up as built out)
    path('api/', include('apps.accounts.urls')),
    path('api/', include('apps.employees.urls')),
    path('api/', include('apps.skills.urls')),
    path('api/', include('apps.certifications.urls')),
    path('api/', include('apps.training.urls')),
    path('api/', include('apps.succession.urls')),
    path('api/', include('apps.notifications.urls')),
    path('api/dashboards/', include('apps.dashboards.urls')),
    path('api/ai/', include('apps.ai_assistant.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

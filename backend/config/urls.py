from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse

urlpatterns = [
    path('', lambda request: HttpResponse("Salah Tracker Backend Running")),

    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/prayers/', include('prayers.urls')),
    path('api/notifications/', include('notifications.urls')),
]
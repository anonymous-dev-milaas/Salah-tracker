from django.urls import path
from . import views

urlpatterns = [
    path('subscribe/', views.save_subscription, name='save_subscription'),
    path('unsubscribe/', views.delete_subscription, name='delete_subscription'),
]
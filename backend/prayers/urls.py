from django.urls import path
from . import views

urlpatterns = [
    path('today/', views.today_prayers, name='today_prayers'),
    path('mark/', views.mark_prayer, name='mark_prayer'),
    path('month/', views.month_prayers, name='month_prayers'),
    path('date/', views.date_prayers, name='date_prayers'),
    path('yearly-stats/', views.yearly_stats, name='yearly_stats'),
    path('streak/', views.streak, name='streak'),
]
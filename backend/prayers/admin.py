from django.contrib import admin
from .models import PrayerLog

@admin.register(PrayerLog)
class PrayerLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'date', 'prayer', 'status', 'prayer_time']
    list_filter = ['status', 'prayer', 'date']
    search_fields = ['user__email']
    ordering = ['-date', 'prayer']
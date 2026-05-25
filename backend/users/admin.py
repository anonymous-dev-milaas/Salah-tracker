from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['email', 'username', 'city', 'is_active']
    list_filter = ['is_active', 'is_staff']
    search_fields = ['email', 'username', 'city']
    ordering = ['email']
    fieldsets = UserAdmin.fieldsets + (
        ('Location', {'fields': ('city', 'latitude', 'longitude', 'calculation_method')}),
    )
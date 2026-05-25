from django.contrib.auth.models import AbstractUser
from django.db import models

import random
from django.utils import timezone

class User(AbstractUser):
    email = models.EmailField(unique=True)
    latitude = models.FloatField(default=10.9833)   # Malappuram default
    longitude = models.FloatField(default=76.0667)
    city = models.CharField(max_length=100, default='Malappuram')
    calculation_method = models.IntegerField(default=1)  # Aladhan method

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email
    
    




class PasswordResetOTP(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    def is_valid(self):
        # OTP expires after 10 minutes
        expiry = self.created_at + timezone.timedelta(minutes=10)
        return not self.is_used and timezone.now() < expiry

    @staticmethod
    def generate_otp():
        return str(random.randint(100000, 999999))
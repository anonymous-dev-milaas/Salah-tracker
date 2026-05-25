from django.contrib.auth.models import AbstractUser
from django.db import models

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
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

PRAYER_NAMES = [
    ('fajr', 'Fajr'),
    ('dhuhr', 'Dhuhr'),
    ('asr', 'Asr'),
    ('maghrib', 'Maghrib'),
    ('isha', 'Isha'),
]

STATUS_CHOICES = [
    ('ontime', 'On Time'),
    ('qada', 'Qada'),
    ('missed', 'Missed'),
    ('pending', 'Pending'),
]

class PrayerLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='prayer_logs')
    date = models.DateField()
    prayer = models.CharField(max_length=10, choices=PRAYER_NAMES)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    prayer_time = models.TimeField(null=True, blank=True)
    marked_at = models.DateTimeField(null=True, blank=True)
    notes = models.CharField(max_length=200, blank=True)

    class Meta:
        unique_together = ['user', 'date', 'prayer']
        ordering = ['date', 'prayer']

    def __str__(self):
        return f"{self.user.email} - {self.date} - {self.prayer} - {self.status}"
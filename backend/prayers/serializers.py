from rest_framework import serializers
from .models import PrayerLog

class PrayerLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrayerLog
        fields = ['id', 'date', 'prayer', 'status', 'prayer_time', 'marked_at', 'notes']
        read_only_fields = ['id', 'marked_at']

class DayStatsSerializer(serializers.Serializer):
    date = serializers.DateField()
    ontime = serializers.IntegerField()
    qada = serializers.IntegerField()
    missed = serializers.IntegerField()
    pending = serializers.IntegerField()
    total = serializers.IntegerField()
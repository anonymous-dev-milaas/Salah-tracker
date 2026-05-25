import requests
from datetime import date, datetime, timedelta
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import PrayerLog
from .serializers import PrayerLogSerializer

PRAYER_ORDER = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']

def fetch_prayer_times(lat, lng, target_date, method=1):
    url = f"http://api.aladhan.com/v1/timings/{target_date.strftime('%d-%m-%Y')}"
    params = {'latitude': lat, 'longitude': lng, 'method': method}
    try:
        resp = requests.get(url, params=params, timeout=10)
        data = resp.json()
        if data.get('code') == 200:
            t = data['data']['timings']
            return {
                'fajr': t['Fajr'],
                'dhuhr': t['Dhuhr'],
                'asr': t['Asr'],
                'maghrib': t['Maghrib'],
                'isha': t['Isha'],
            }
    except Exception:
        pass
    return None

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def today_prayers(request):
    user = request.user
    today = date.today()
    times = fetch_prayer_times(user.latitude, user.longitude, today, user.calculation_method)

    prayers_data = []
    for prayer in PRAYER_ORDER:
        log, created = PrayerLog.objects.get_or_create(
            user=user, date=today, prayer=prayer,
            defaults={'prayer_time': times.get(prayer) if times else None}
        )
        if created and times:
            log.prayer_time = times.get(prayer)
            log.save()
        prayers_data.append(PrayerLogSerializer(log).data)

    return Response({
        'date': today,
        'prayers': prayers_data,
        'times': times or {}
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_prayer(request):
    user = request.user
    prayer_name = request.data.get('prayer')
    new_status = request.data.get('status')
    target_date = request.data.get('date', str(date.today()))

    if prayer_name not in PRAYER_ORDER:
        return Response({'error': 'Invalid prayer name'}, status=status.HTTP_400_BAD_REQUEST)
    if new_status not in ['ontime', 'qada', 'missed', 'pending']:
        return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

    log, _ = PrayerLog.objects.get_or_create(
        user=user, date=target_date, prayer=prayer_name
    )
    log.status = new_status
    log.marked_at = timezone.now()
    log.save()
    return Response(PrayerLogSerializer(log).data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def month_prayers(request):
    user = request.user
    year = int(request.query_params.get('year', date.today().year))
    month = int(request.query_params.get('month', date.today().month))

    logs = PrayerLog.objects.filter(user=user, date__year=year, date__month=month)
    
    days_map = {}
    for log in logs:
        day_str = str(log.date)
        if day_str not in days_map:
            days_map[day_str] = {'ontime': 0, 'qada': 0, 'missed': 0, 'pending': 0}
        if log.status in days_map[day_str]:
            days_map[day_str][log.status] += 1

    result = []
    for day_str, counts in days_map.items():
        result.append({
            'date': day_str,
            **counts,
            'total': sum(counts.values())
        })

    return Response(result)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def date_prayers(request):
    user = request.user
    target_date_str = request.query_params.get('date', str(date.today()))
    
    try:
        target_date = datetime.strptime(target_date_str, '%Y-%m-%d').date()
    except ValueError:
        return Response({'error': 'Invalid date format. Use YYYY-MM-DD'}, status=status.HTTP_400_BAD_REQUEST)

    times = fetch_prayer_times(user.latitude, user.longitude, target_date, user.calculation_method)
    logs = PrayerLog.objects.filter(user=user, date=target_date)
    
    return Response({
        'date': target_date,
        'prayers': PrayerLogSerializer(logs, many=True).data,
        'times': times or {}
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def yearly_stats(request):
    user = request.user
    year = int(request.query_params.get('year', date.today().year))
    
    logs = PrayerLog.objects.filter(user=user, date__year=year)
    stats = {'ontime': 0, 'qada': 0, 'missed': 0, 'pending': 0, 'total': logs.count()}
    for log in logs:
        if log.status in stats:
            stats[log.status] += 1
    
    return Response(stats)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def streak(request):
    user = request.user
    today = date.today()
    current_streak = 0
    check_date = today

    while True:
        logs = PrayerLog.objects.filter(user=user, date=check_date)
        if not logs.exists():
            break
        all_good = all(l.status == 'ontime' for l in logs) and logs.count() == 5
        if not all_good:
            break
        current_streak += 1
        check_date -= timedelta(days=1)

    return Response({'streak': current_streak})
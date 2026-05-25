from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import PushSubscription

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_subscription(request):
    data = request.data
    sub, _ = PushSubscription.objects.update_or_create(
        user=request.user,
        defaults={
            'endpoint': data.get('endpoint', ''),
            'p256dh': data.get('keys', {}).get('p256dh', ''),
            'auth': data.get('keys', {}).get('auth', ''),
        }
    )
    return Response({'status': 'saved'})

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_subscription(request):
    PushSubscription.objects.filter(user=request.user).delete()
    return Response({'status': 'deleted'})
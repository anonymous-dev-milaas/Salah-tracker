from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from django.contrib.auth import get_user_model, authenticate

from django.conf import settings
from .serializers import RegisterSerializer, UserSerializer



from django.core.mail import send_mail
from .models import PasswordResetOTP

import socket



User = get_user_model()

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    email = request.data.get('email')
    password = request.data.get('password')
    user = authenticate(request, username=email, password=password)
    if user:
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data
        })
    return Response({'error': 'Invalid email or password'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def profile(request):
    if request.method == 'GET':
        return Response(UserSerializer(request.user).data)
    serializer = UserSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    try:
        token = RefreshToken(request.data.get('refresh'))
        token.blacklist()
    except Exception:
        pass
    return Response({'message': 'Logged out successfully'})








@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
    email = request.data.get('email')
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        # Don't reveal if email exists or not
        return Response({'message': 'If this email exists, an OTP has been sent.'})

    # Delete old OTPs for this user
    PasswordResetOTP.objects.filter(user=user).delete()

    # Generate and save new OTP
    otp = PasswordResetOTP.generate_otp()
    PasswordResetOTP.objects.create(user=user, otp=otp)

    from django.conf import settings

    print("HOST:", settings.EMAIL_HOST)
    print("PORT:", settings.EMAIL_PORT)
    print("TLS:", settings.EMAIL_USE_TLS)


    try:
        print(socket.gethostbyname("smtp.gmail.com"))
    except Exception as e:
        print("DNS ERROR:", e)
        
    # Send email
    try:
     send_mail(
        subject='Your Salah Tracker Password Reset OTP',
        message=f'Your OTP is: {otp}\n\nThis OTP expires in 10 minutes.',
        from_email=None,
        recipient_list=[email],
        fail_silently=False,
    )
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return Response(
            {'error': str(e)},
            status=500
    )

    return Response({'message': 'If this email exists, an OTP has been sent.'})

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp(request):
    email = request.data.get('email')
    otp = request.data.get('otp')

    try:
        user = User.objects.get(email=email)
        otp_obj = PasswordResetOTP.objects.filter(
            user=user, otp=otp, is_used=False
        ).latest('created_at')
    except (User.DoesNotExist, PasswordResetOTP.DoesNotExist):
        return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)

    if not otp_obj.is_valid():
        return Response({'error': 'OTP has expired'}, status=status.HTTP_400_BAD_REQUEST)

    return Response({'message': 'OTP verified', 'valid': True})

@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    email = request.data.get('email')
    otp = request.data.get('otp')
    new_password = request.data.get('new_password')

    if not new_password or len(new_password) < 8:
        return Response({'error': 'Password must be at least 8 characters'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(email=email)
        otp_obj = PasswordResetOTP.objects.filter(
            user=user, otp=otp, is_used=False
        ).latest('created_at')
    except (User.DoesNotExist, PasswordResetOTP.DoesNotExist):
        return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)

    if not otp_obj.is_valid():
        return Response({'error': 'OTP has expired'}, status=status.HTTP_400_BAD_REQUEST)

    # Mark OTP as used and change password
    otp_obj.is_used = True
    otp_obj.save()
    user.set_password(new_password)
    user.save()

    return Response({'message': 'Password reset successful'})
from django.contrib.auth import authenticate, login, logout, update_session_auth_hash
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import generics, serializers, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .audit import audit
from .emails import send_password_reset_email, send_verification_email
from .models import User, UserPreference, UserProfile
from .serializers import (ChangePasswordSerializer, EmailSerializer, LoginSerializer, MeSerializer, PreferenceSerializer,
                          ProfileSerializer, RegisterSerializer, ResetPasswordSerializer, TokenSerializer)
from .tokens import read_reset_token, read_verification_token

Detail = inline_serializer('Detail', {'detail': serializers.CharField()})
GENERIC_RESET = 'If an account exists for that email, a reset link has been sent.'
GENERIC_VERIFY = 'If that account exists and is not yet verified, a new verification link has been sent.'
BAD_LOGIN = 'Email or password is not correct.'


class CsrfView(APIView):
    """Provides a CSRF token for frontend requests."""
    permission_classes = [AllowAny]
    authentication_classes = []

    @extend_schema(responses=Detail)
    def get(self, request):
        csrf_token = get_token(request)
        return Response({
            'detail': 'CSRF token generated.',
            'csrfToken': csrf_token,
        })


class RegisterView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    serializer_class = RegisterSerializer
    throttle_scope = 'register'

    @extend_schema(responses={201: Detail})
    def post(self, request):
        s = self.get_serializer(data=request.data)
        s.is_valid(raise_exception=True)

        # Create the account first.
        user = s.save()

        # Try to send the verification email.
        # The email helper returns False if delivery fails.
        email_sent = send_verification_email(user)

        # Record the registration outcome.
        audit(
            user,
            'register',
            outcome='success',
            reason=None if email_sent else 'verification_email_delivery_failed',
        )

        # Do not report that email was sent when it was not.
        if email_sent:
            detail = (
                'Account created. Check your email to verify your address.'
            )
        else:
            detail = (
                'Account created, but the verification email could not '
                'be sent right now. Please request a new verification email.'
            )

        return Response(
            {'detail': detail},
            status=status.HTTP_201_CREATED,
        )

class LoginView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    serializer_class = LoginSerializer
    throttle_scope = 'login'

    @extend_schema(responses={200: MeSerializer, 401: Detail, 403: Detail})
    def post(self, request):
        s = self.get_serializer(data=request.data)
        s.is_valid(raise_exception=True)
        email, password = s.validated_data['email'].strip().lower(), s.validated_data['password']
        found = User.objects.filter(email__iexact=email).first()
        user = authenticate(request, username=found.get_username(), password=password) if found else None
        if user is None:
            audit(found, 'login', 'failure', reason='bad_credentials')  # same message whether or not the email exists
            return Response({'detail': BAD_LOGIN}, status=status.HTTP_401_UNAUTHORIZED)
        if not user.email_verified:
            audit(user, 'login', 'failure', reason='email_not_verified')
            return Response({'detail': 'Please verify your email before signing in.', 'code': 'email_not_verified'},
                            status=status.HTTP_403_FORBIDDEN)
        login(request, user)
        get_token(request)
        audit(user, 'login')
        return Response(MeSerializer(user).data)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(request=None, responses=Detail)
    def post(self, request):
        audit(request.user, 'logout')
        logout(request)  # flushes the server-side session
        return Response({'detail': 'You have been logged out.'})


class MeView(generics.RetrieveAPIView):
    serializer_class = MeSerializer

    def get_object(self):
        return self.request.user


class VerifyEmailView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    serializer_class = TokenSerializer
    throttle_scope = 'verify'

    @extend_schema(responses={200: Detail, 400: Detail})
    def post(self, request):
        s = self.get_serializer(data=request.data)
        s.is_valid(raise_exception=True)
        user = read_verification_token(s.validated_data['token'])
        if user is None:
            return Response({'detail': 'This verification link is invalid or has expired.'}, status=status.HTTP_400_BAD_REQUEST)
        if not user.email_verified:
            user.email_verified = True
            user.save(update_fields=['email_verified'])
            audit(user, 'verify_email')
        return Response({'detail': 'Your email is verified. You can now sign in.'})


class ResendVerificationView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    serializer_class = EmailSerializer
    throttle_scope = 'sensitive'

    @extend_schema(responses=Detail)
    def post(self, request):
        s = self.get_serializer(data=request.data)
        s.is_valid(raise_exception=True)
        user = User.objects.filter(email__iexact=s.validated_data['email'].strip(), is_active=True, email_verified=False).first()
        if user:
            email_sent = send_verification_email(user)

            audit(
                user,
                'resend_verification',
                outcome='success' if email_sent else 'failure',
                reason=(
                    None
                    if email_sent
                    else 'verification_email_delivery_failed'
                ),
            )

        # Keep the same response to avoid revealing whether
        # an email address belongs to an eligible account.
        return Response({'detail': GENERIC_VERIFY})


class ForgotPasswordView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    serializer_class = EmailSerializer
    throttle_scope = 'sensitive'

    @extend_schema(responses=Detail)
    def post(self, request):
        s = self.get_serializer(data=request.data)
        s.is_valid(raise_exception=True)
        user = User.objects.filter(email__iexact=s.validated_data['email'].strip(), is_active=True).first()
        if user:
            email_sent = send_password_reset_email(user)

            audit(
                user,
                'forgot_password',
                outcome='success' if email_sent else 'failure',
                reason=(
                    None
                    if email_sent
                    else 'password_reset_email_delivery_failed'
                ),
            )

        # Keep the response identical whether or not the account exists.
        return Response({'detail': GENERIC_RESET})  # identical response whether or not the account exists


class ResetPasswordView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    serializer_class = ResetPasswordSerializer
    throttle_scope = 'sensitive'

    @extend_schema(responses={200: Detail, 400: Detail})
    def post(self, request):
        from django.contrib.auth.password_validation import validate_password
        from django.core.exceptions import ValidationError as DjangoValidationError
        s = self.get_serializer(data=request.data)
        s.is_valid(raise_exception=True)
        user = read_reset_token(s.validated_data['token'])
        if user is None:
            audit(None, 'reset_password', 'failure', reason='invalid_or_expired_token')
            return Response({'detail': 'This reset link is invalid, has expired, or was already used.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            validate_password(s.validated_data['password'], user=user)
        except DjangoValidationError as e:
            return Response({'password': list(e.messages)}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(s.validated_data['password'])
        user.save(update_fields=['password'])  # the changed hash also invalidates this link and the user's other sessions
        audit(user, 'reset_password')
        return Response({'detail': 'Your password has been changed. You can now sign in.'})


class ChangePasswordView(generics.GenericAPIView):
    serializer_class = ChangePasswordSerializer
    throttle_scope = 'sensitive'

    @extend_schema(responses={200: Detail, 400: Detail})
    def post(self, request):
        s = self.get_serializer(data=request.data)
        s.is_valid(raise_exception=True)
        if not request.user.check_password(s.validated_data['current_password']):
            audit(request.user, 'change_password', 'failure', reason='wrong_current_password')
            return Response({'current_password': ['Your current password is not correct.']}, status=status.HTTP_400_BAD_REQUEST)
        request.user.set_password(s.validated_data['new_password'])
        request.user.save(update_fields=['password'])
        update_session_auth_hash(request, request.user)  # keep this session signed in
        audit(request.user, 'change_password')
        return Response({'detail': 'Your password has been changed.'})


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    http_method_names = ['get', 'patch', 'head', 'options']

    def get_object(self):
        return UserProfile.objects.select_related('user').get(user=self.request.user)


class SettingsView(generics.RetrieveUpdateAPIView):
    serializer_class = PreferenceSerializer
    http_method_names = ['get', 'patch', 'head', 'options']

    def get_object(self):
        return UserPreference.objects.get(user=self.request.user)

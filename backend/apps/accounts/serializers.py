from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from rest_framework import serializers

from .models import UserPreference, UserProfile

User = get_user_model()


class RegisterSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=30, required=False, allow_blank=True, default='')
    organization = serializers.CharField(max_length=200)
    occupation = serializers.ChoiceField(choices=UserProfile.Occupation.choices, default=UserProfile.Occupation.RESEARCHER)
    password = serializers.CharField(write_only=True, trim_whitespace=False)
    password_confirm = serializers.CharField(write_only=True, trim_whitespace=False)
    accept_terms = serializers.BooleanField()

    def validate_email(self, value):
        value = value.strip().lower()
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('An account with this email already exists.')
        return value

    def validate_accept_terms(self, value):
        if not value:
            raise serializers.ValidationError('You must accept the Terms of Service and Privacy Policy.')
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password_confirm': 'Passwords do not match.'})
        validate_password(attrs['password'], user=User(username=attrs['email'], email=attrs['email']))
        return attrs

    @transaction.atomic
    def create(self, validated):
        # access_level is never taken from user input: every public account starts as a viewer, never staff.
        user = User.objects.create_user(username=validated['email'], email=validated['email'], password=validated['password'])
        UserProfile.objects.create(user=user, full_name=validated['full_name'].strip(), phone=validated['phone'],
                                   organization=validated['organization'].strip(), occupation=validated['occupation'])
        UserPreference.objects.create(user=user)
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(trim_whitespace=False)


class TokenSerializer(serializers.Serializer):
    token = serializers.CharField()


class EmailSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ResetPasswordSerializer(serializers.Serializer):
    token = serializers.CharField()
    password = serializers.CharField(trim_whitespace=False)
    password_confirm = serializers.CharField(trim_whitespace=False)

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password_confirm': 'Passwords do not match.'})
        return attrs


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(trim_whitespace=False)
    new_password = serializers.CharField(trim_whitespace=False)

    def validate_new_password(self, value):
        validate_password(value, user=self.context['request'].user)
        return value


class ProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    email_verified = serializers.BooleanField(source='user.email_verified', read_only=True)

    class Meta:
        model = UserProfile
        fields = ['full_name', 'email', 'email_verified', 'phone', 'organization', 'biography', 'occupation',
                  'access_level', 'created_at']
        read_only_fields = ['access_level', 'created_at']  # a user can never change their own permission level


class PreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPreference
        fields = ['theme', 'default_season', 'default_crop', 'default_district', 'email_notifications', 'system_alerts']


class MeSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    preferences = PreferenceSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'email_verified', 'profile', 'preferences']

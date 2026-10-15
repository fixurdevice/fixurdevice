"""
Serializers for the accounts app.
"""
from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, UserRole


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ["id", "email", "full_name", "phone", "role", "is_active", "password", "date_joined"]
        read_only_fields = ["id", "date_joined"]

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        user = User.objects.create_user(**validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class UserBriefSerializer(serializers.ModelSerializer):
    """Minimal user info for CRM dropdowns and assignment fields."""
    class Meta:
        model = User
        fields = ["id", "full_name", "role", "email"]


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=False)
    email = serializers.CharField(required=False)
    password = serializers.CharField(write_only=True, style={"input_type": "password"})

    def validate(self, data):
        identifier = (data.get("username") or data.get("email") or "").strip()
        if not identifier:
            raise serializers.ValidationError("User ID or Email is required.")

        user = None
        if "@" in identifier:
            user = authenticate(username=identifier, password=data["password"])
        else:
            u = User.objects.filter(email__iexact=identifier).first() or \
                User.objects.filter(email__iexact=f"{identifier}@fixurdevice.in").first() or \
                User.objects.filter(email__istartswith=identifier + "@").first()
            if u:
                user = authenticate(username=u.email, password=data["password"])
            if not user:
                user = authenticate(username=identifier, password=data["password"])

        if not user:
            raise serializers.ValidationError("Invalid credentials. Please check your User ID and password.")
        if not user.is_active:
            raise serializers.ValidationError("This account has been deactivated.")
        data["user"] = user
        return data


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=10)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, data):
        if data["new_password"] != data["confirm_password"]:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return data

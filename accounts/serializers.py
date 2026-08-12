from rest_framework import serializers

from .models import User

from django.contrib.auth import password_validation
from django.core.exceptions import ValidationError as DjangoValidationError


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "phone",
            "role",
        ]
        read_only_fields = fields
        
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8,
    )

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "password",
            "first_name",
            "last_name",
            "phone",
            "role",
        ]

    def validate_role(self, value):
        allowed_roles = [
            User.Role.VOLUNTEER,
            User.Role.DONOR,
        ]

        if value not in allowed_roles:
            raise serializers.ValidationError(
                "Only VOLUNTEER or DONOR accounts "
                "can be created through public registration."
            )

        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            **validated_data
        )

        if user.role == User.Role.VOLUNTEER:
            from volunteering.models import VolunteerProfile

            VolunteerProfile.objects.get_or_create(
                user=user
            )

        return user
    
class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    new_password = serializers.CharField(
        write_only=True,
        min_length=8,
    )

    def validate_new_password(self, value):
        user = self.context.get("user")

        try:
            password_validation.validate_password(
                value,
                user=user,
            )

        except DjangoValidationError as exc:
            raise serializers.ValidationError(
                exc.messages
            )

        return value
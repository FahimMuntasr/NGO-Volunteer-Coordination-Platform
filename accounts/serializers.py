from rest_framework import serializers

from .models import User


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
        return User.objects.create_user(
            **validated_data
        )
from rest_framework import serializers

from .models import NGO


class NGOProfileSerializer(
    serializers.ModelSerializer
):
    admin_username = serializers.CharField(
        source="administrator.username",
        read_only=True,
    )

    admin_first_name = serializers.CharField(
        source="administrator.first_name",
        required=False,
        allow_blank=True,
    )

    admin_last_name = serializers.CharField(
        source="administrator.last_name",
        required=False,
        allow_blank=True,
    )

    admin_email = serializers.EmailField(
        source="administrator.email",
        required=False,
    )

    admin_phone = serializers.CharField(
        source="administrator.phone",
        required=False,
        allow_blank=True,
    )

    class Meta:
        model = NGO

        fields = [
            "id",

            # Admin
            "admin_username",
            "admin_first_name",
            "admin_last_name",
            "admin_email",
            "admin_phone",

            # NGO
            "name",
            "email",
            "address",
            "description",

            # Verification
            "registration_number",
            "verification_status",
            "is_verified",
            "verified_at",
        ]

        read_only_fields = [
            "id",
            "registration_number",
            "verification_status",
            "is_verified",
            "verified_at",
        ]

    def update(
        self,
        instance,
        validated_data,
    ):
        administrator_data = (
            validated_data.pop(
                "administrator",
                {},
            )
        )

        administrator = (
            instance.administrator
        )

        for field, value in (
            administrator_data.items()
        ):
            setattr(
                administrator,
                field,
                value,
            )

        administrator.save()

        for field, value in (
            validated_data.items()
        ):
            setattr(
                instance,
                field,
                value,
            )

        instance.save()

        return instance
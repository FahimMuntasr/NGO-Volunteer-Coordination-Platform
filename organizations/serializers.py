from rest_framework import serializers

from .models import NGO


def normalize_ngo_name(name):
    """
    Normalize NGO names the same way
    verification compares them.

    This prevents harmless changes such as
    capitalization or extra spaces from
    unnecessarily removing verification.
    """
    return " ".join(
        name.strip().casefold().split()
    )


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
        # =========================
        # Detect NGO name change
        # =========================

        old_name = normalize_ngo_name(
            instance.name
        )

        new_name_value = validated_data.get(
            "name",
            instance.name,
        )

        new_name = normalize_ngo_name(
            new_name_value
        )

        ngo_name_changed = (
            old_name != new_name
        )

        # =========================
        # Update administrator
        # =========================

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

        # =========================
        # Update NGO fields
        # =========================

        for field, value in (
            validated_data.items()
        ):
            setattr(
                instance,
                field,
                value,
            )

        # =========================
        # Verification protection
        # =========================

        if (
            ngo_name_changed
            and (
                instance.is_verified
                or instance.verification_status
                == NGO.VerificationStatus.VERIFIED
            )
        ):
            instance.is_verified = False

            instance.verification_status = (
                NGO.VerificationStatus.PENDING
            )

            instance.registry_entry = None

            instance.verified_at = None

        instance.save()

        return instance
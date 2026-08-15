from rest_framework import serializers

from .models import Certificate


class CertificateSerializer(serializers.ModelSerializer):
    volunteer_name = serializers.CharField(
        source="volunteer.user.get_full_name",
        read_only=True,
    )

    event_title = serializers.CharField(
        source="event.title",
        read_only=True,
    )

    class Meta:
        model = Certificate
        fields = [
            "id",
            "volunteer",
            "volunteer_name",
            "event",
            "event_title",
            "issued_at",
            "verification_code",
            "file",
        ]

        read_only_fields = fields
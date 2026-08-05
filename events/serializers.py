from rest_framework import serializers

from .models import Event


class EventSerializer(serializers.ModelSerializer):
    ngo_name = serializers.CharField(
        source="ngo.name",
        read_only=True,
    )

    required_skills = serializers.StringRelatedField(
        many=True,
        read_only=True,
    )

    class Meta:
        model = Event
        fields = [
            "id",
            "ngo",
            "ngo_name",
            "title",
            "description",
            "location",
            "start_date",
            "end_date",
            "registration_deadline",
            "volunteer_capacity",
            "required_skills",
            "status",
        ]
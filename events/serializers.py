from rest_framework import serializers

from .models import Event, Registration
from volunteering.models import Skill


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

class EventCreateSerializer(serializers.ModelSerializer):
    required_skill_ids = serializers.PrimaryKeyRelatedField(
        queryset=Skill.objects.all(),
        many=True,
        write_only=True,
        source="required_skills",
        required=False,
    )

    class Meta:
        model = Event
        fields = [
            "id",
            "title",
            "description",
            "location",
            "start_date",
            "end_date",
            "registration_deadline",
            "volunteer_capacity",
            "required_skill_ids",
            "status",
        ]

        read_only_fields = ["id"]

    def validate(self, attrs):
        start_date = attrs.get("start_date")
        end_date = attrs.get("end_date")
        registration_deadline = attrs.get(
            "registration_deadline"
        )

        if (
            start_date
            and end_date
            and end_date <= start_date
        ):
            raise serializers.ValidationError(
                {
                    "end_date": (
                        "The end date must be after "
                        "the start date."
                    )
                }
            )

        if (
            registration_deadline
            and start_date
            and registration_deadline >= start_date
        ):
            raise serializers.ValidationError(
                {
                    "registration_deadline": (
                        "The registration deadline must "
                        "be before the event starts."
                    )
                }
            )

        return attrs

class RegistrationSerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(
        source="event.title",
        read_only=True,
    )

    volunteer_username = serializers.CharField(
        source="volunteer.user.username",
        read_only=True,
    )

    class Meta:
        model = Registration
        fields = [
            "id",
            "event",
            "event_title",
            "volunteer",
            "volunteer_username",
            "status",
            "registered_at",
            "approved_at",
            "attendance_status",
            "hours_earned",
        ]

        read_only_fields = fields
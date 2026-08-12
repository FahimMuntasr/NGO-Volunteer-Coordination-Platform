from rest_framework import serializers

from .models import Skill, VolunteerProfile
from events.models import Registration


class SkillSerializer(serializers.ModelSerializer):

    class Meta:
        model = Skill
        fields = [
            "id",
            "name",
        ]

        read_only_fields = fields


class VolunteerProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(
        source="user.username",
        read_only=True,
    )

    first_name = serializers.CharField(
        source="user.first_name",
        read_only=True,
    )

    last_name = serializers.CharField(
        source="user.last_name",
        read_only=True,
    )

    email = serializers.EmailField(
        source="user.email",
        read_only=True,
    )

    skills = SkillSerializer(
        many=True,
        read_only=True,
    )

    skill_ids = serializers.PrimaryKeyRelatedField(
        queryset=Skill.objects.all(),
        many=True,
        write_only=True,
        source="skills",
        required=False,
    )

    class Meta:
        model = VolunteerProfile

        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "skills",
            "skill_ids",
            "total_hours",
            "completed_events",
            "availability_notes",
        ]

        read_only_fields = [
            "total_hours",
            "completed_events",
        ]
        
class VolunteerHistorySerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(
        source="event.title",
        read_only=True,
    )

    ngo_name = serializers.CharField(
        source="event.ngo.name",
        read_only=True,
    )

    event_start_date = serializers.DateTimeField(
        source="event.start_date",
        read_only=True,
    )

    event_end_date = serializers.DateTimeField(
        source="event.end_date",
        read_only=True,
    )

    class Meta:
        model = Registration
        fields = [
            "id",
            "event",
            "event_title",
            "ngo_name",
            "event_start_date",
            "event_end_date",
            "attendance_status",
            "hours_earned",
            "status",
        ]

        read_only_fields = fields
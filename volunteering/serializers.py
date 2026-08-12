from rest_framework import serializers

from .models import Skill, VolunteerProfile


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
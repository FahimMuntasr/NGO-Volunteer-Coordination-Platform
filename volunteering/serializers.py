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


class VolunteerProfileSerializer(
    serializers.ModelSerializer
):
    username = serializers.CharField(
        source="user.username",
        read_only=True,
    )

    first_name = serializers.CharField(
        source="user.first_name",
        required=False,
        allow_blank=True,
    )

    last_name = serializers.CharField(
        source="user.last_name",
        required=False,
        allow_blank=True,
    )

    email = serializers.EmailField(
        source="user.email",
        required=False,
        allow_blank=True,
    )

    phone = serializers.CharField(
        source="user.phone",
        required=False,
        allow_blank=True,
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

    custom_skill_names = serializers.ListField(
        child=serializers.CharField(
            max_length=100,
        ),
        write_only=True,
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
            "phone",
            "skills",
            "skill_ids",
            "custom_skill_names",
            "total_hours",
            "completed_events",
            "availability_notes",
        ]

        read_only_fields = [
            "total_hours",
            "completed_events",
        ]

    def update(
        self,
        instance,
        validated_data,
    ):
        # =========================
        # User account fields
        # =========================

        user_data = validated_data.pop(
            "user",
            {},
        )

        user = instance.user

        for field, value in user_data.items():
            setattr(
                user,
                field,
                value,
            )

        user.save()

        # =========================
        # Skills
        # =========================

        selected_skills = validated_data.pop(
            "skills",
            None,
        )

        custom_skill_names = validated_data.pop(
            "custom_skill_names",
            [],
        )

        # =========================
        # Volunteer profile fields
        # =========================

        for field, value in validated_data.items():
            setattr(
                instance,
                field,
                value,
            )

        instance.save()

        # =========================
        # Update skills
        # =========================

        if (
            selected_skills is not None
            or custom_skill_names
        ):
            if selected_skills is None:
                final_skills = list(
                    instance.skills.all()
                )
            else:
                final_skills = list(
                    selected_skills
                )

            for raw_name in custom_skill_names:
                name = raw_name.strip()

                if not name:
                    continue

                skill = Skill.objects.filter(
                    name__iexact=name
                ).first()

                if skill is None:
                    skill = Skill.objects.create(
                        name=name
                    )

                if skill not in final_skills:
                    final_skills.append(
                        skill
                    )

            instance.skills.set(
                final_skills
            )

        return instance
        
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
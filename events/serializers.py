from django.utils import timezone
from rest_framework import serializers

from accounts.models import User

from .models import (
    Event,
    Registration,
    Team,
    TeamMembership,
)

from volunteering.models import Skill


# =========================================
# EVENT
# =========================================
class EventSerializer(serializers.ModelSerializer):

    ngo_name = serializers.CharField(
        source="ngo.name",
        read_only=True,
    )

    required_skills = serializers.StringRelatedField(
        many=True,
        read_only=True,
    )

    coordinator_username = serializers.CharField(
        source="coordinator.username",
        read_only=True,
        allow_null=True,
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
            "capacity_mode",
            "volunteer_capacity",
            "required_skills",
            "status",
            "coordinator",
            "coordinator_username",
        ]


# =========================================
# EVENT CREATE
# =========================================
class EventCreateSerializer(serializers.ModelSerializer):

    required_skill_ids = serializers.PrimaryKeyRelatedField(
        queryset=Skill.objects.all(),
        many=True,
        write_only=True,
        source="required_skills",
        required=False,
    )

    # Optional at creation time, same as required_skill_ids - an event
    # can be created with or without a coordinator, and one can always
    # be assigned/replaced later through the dedicated
    # AssignCoordinatorView. Restricted to users with the COORDINATOR
    # role, same rule the dedicated window already enforces.
    capacity_mode = serializers.ChoiceField(
        choices=Event.CapacityMode.choices,
        default=Event.CapacityMode.FIXED,
    )

    coordinator_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role=User.Role.COORDINATOR),
        write_only=True,
        source="coordinator",
        required=False,
        allow_null=True,
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
            "capacity_mode",
            "volunteer_capacity",
            "required_skill_ids",
            "coordinator_id",
            "status",
        ]

        read_only_fields = [
            "id",
            "status",
        ]

    def validate(self, attrs):

        start_date = attrs.get("start_date")
        end_date = attrs.get("end_date")

        registration_deadline = attrs.get(
            "registration_deadline"
        )

        capacity_mode = attrs.get(
            "capacity_mode",
            Event.CapacityMode.FIXED,
        )
        volunteer_capacity = attrs.get(
            "volunteer_capacity"
        )

        if capacity_mode == Event.CapacityMode.FIXED and volunteer_capacity is None:
            raise serializers.ValidationError(
                {
                    "volunteer_capacity": (
                        "Volunteer capacity is required when capacity mode is fixed."
                    )
                }
            )

        if capacity_mode == Event.CapacityMode.UNLIMITED and volunteer_capacity is not None:
            raise serializers.ValidationError(
                {
                    "volunteer_capacity": (
                        "Leave volunteer capacity empty when capacity mode is unlimited."
                    )
                }
            )

        now = timezone.now()

        # Start date must be in the future.
        if (
            start_date
            and start_date <= now
        ):
            raise serializers.ValidationError(
                {
                    "start_date": (
                        "The event start date "
                        "must be in the future."
                    )
                }
            )

        # Registration deadline must also
        # still be in the future.
        if (
            registration_deadline
            and registration_deadline <= now
        ):
            raise serializers.ValidationError(
                {
                    "registration_deadline": (
                        "The registration deadline "
                        "must be in the future."
                    )
                }
            )

        # End must be after start.
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

        # Registration must close
        # before the event begins.
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


# =========================================
# EVENT UPDATE
# =========================================
class EventUpdateSerializer(serializers.ModelSerializer):

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
            "title",
            "description",
            "location",
            "start_date",
            "end_date",
            "registration_deadline",
            "capacity_mode",
            "volunteer_capacity",
            "required_skill_ids",
        ]

    def validate(self, attrs):

        start_date = attrs.get(
            "start_date",
            self.instance.start_date,
        )

        end_date = attrs.get(
            "end_date",
            self.instance.end_date,
        )

        registration_deadline = attrs.get(
            "registration_deadline",
            self.instance.registration_deadline,
        )

        capacity_mode = attrs.get(
            "capacity_mode",
            self.instance.capacity_mode,
        )
        volunteer_capacity = attrs.get(
            "volunteer_capacity",
            self.instance.volunteer_capacity,
        )

        # Switching an existing event to unlimited capacity should clear
        # the previous numeric capacity even when the client only changes
        # the mode.
        if (
            capacity_mode == Event.CapacityMode.UNLIMITED
            and "capacity_mode" in attrs
            and "volunteer_capacity" not in attrs
        ):
            volunteer_capacity = None
            attrs["volunteer_capacity"] = None

        if capacity_mode == Event.CapacityMode.FIXED and volunteer_capacity is None:
            raise serializers.ValidationError(
                {
                    "volunteer_capacity": (
                        "Volunteer capacity is required when capacity mode is fixed."
                    )
                }
            )

        if capacity_mode == Event.CapacityMode.UNLIMITED and volunteer_capacity is not None:
            raise serializers.ValidationError(
                {
                    "volunteer_capacity": (
                        "Leave volunteer capacity empty when capacity mode is unlimited."
                    )
                }
            )

        if end_date <= start_date:
            raise serializers.ValidationError(
                {
                    "end_date": (
                        "The end date must be after "
                        "the start date."
                    )
                }
            )

        if registration_deadline >= start_date:
            raise serializers.ValidationError(
                {
                    "registration_deadline": (
                        "The registration deadline must "
                        "be before the event starts."
                    )
                }
            )

        return attrs


# =========================================
# REGISTRATION
# =========================================
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


# =========================================
# TEAM MEMBERSHIP
# =========================================
class TeamMembershipSerializer(
    serializers.ModelSerializer
):

    volunteer_username = serializers.CharField(
        source="volunteer.user.username",
        read_only=True,
    )

    class Meta:
        model = TeamMembership

        fields = [
            "id",
            "volunteer",
            "volunteer_username",
            "assigned_task",
        ]


# =========================================
# TEAM
# =========================================
class TeamSerializer(serializers.ModelSerializer):

    leader_username = serializers.CharField(
        source="leader.user.username",
        read_only=True,
        allow_null=True,
    )

    memberships = TeamMembershipSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = Team

        fields = [
            "id",
            "event",
            "name",
            "leader",
            "leader_username",
            "memberships",
        ]

        read_only_fields = [
            "event",
        ]

    def validate_leader(self, leader):

        # Leader is optional.
        if leader is None:
            return leader

        event = self.context.get("event")

        # When serializing an existing team,
        # no creation validation is needed.
        if event is None:
            return leader

        approved_registration_exists = (
            Registration.objects.filter(
                event=event,
                volunteer=leader,
                status=Registration.Status.APPROVED,
            ).exists()
        )

        if not approved_registration_exists:
            raise serializers.ValidationError(
                "The team leader must be an "
                "approved volunteer for this event."
            )

        return leader
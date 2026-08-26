from rest_framework import serializers

from .models import (
    CoordinatorProfile,
    DonorProfile,
    User,
)

from django.contrib.auth import password_validation
from django.core.exceptions import ValidationError as DjangoValidationError

from volunteering.models import Skill

class UserSerializer(serializers.ModelSerializer):
    managed_ngo_id = serializers.SerializerMethodField()
    managed_ngo_name = serializers.SerializerMethodField()

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
            "managed_ngo_id",
            "managed_ngo_name",
        ]

        read_only_fields = fields

    def get_managed_ngo_id(self, obj):
        ngo = obj.managed_ngos.first()

        if ngo is None:
            return None

        return ngo.id

    def get_managed_ngo_name(self, obj):
        ngo = obj.managed_ngos.first()

        if ngo is None:
            return None

        return ngo.name
        
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8,
    )

    # =========================
    # Volunteer fields
    # =========================

    skill_ids = serializers.PrimaryKeyRelatedField(
        queryset=Skill.objects.all(),
        many=True,
        write_only=True,
        required=False,
    )
    
    custom_skill_names = serializers.ListField(
        child=serializers.CharField(
            max_length=100
        ),
        write_only=True,
        required=False,
    )

    availability_notes = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
    )

    # =========================
    # Coordinator fields
    # =========================

    coordinator_specialization = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
    )

    coordinator_experience = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
    )

    # =========================
    # Donor fields
    # =========================

    donor_organization = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
    )

    donor_preferred_causes = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
    )

    # =========================
    # NGO Admin fields
    # =========================

    ngo_name = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
    )

    ngo_email = serializers.EmailField(
        write_only=True,
        required=False,
        allow_blank=True,
    )

    ngo_address = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
    )

    ngo_registration_number = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
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

            # Volunteer
            "skill_ids",
            "custom_skill_names",
            "availability_notes",

            # Coordinator
            "coordinator_specialization",
            "coordinator_experience",

            # Donor
            "donor_organization",
            "donor_preferred_causes",

            # NGO
            "ngo_name",
            "ngo_email",
            "ngo_address",
            "ngo_registration_number",
        ]


    def validate(self, attrs):
        role = attrs.get("role")

        if role == User.Role.NGO_ADMIN:
            errors = {}

            if not attrs.get("ngo_name"):
                errors["ngo_name"] = (
                    "NGO name is required."
                )

            if not attrs.get("ngo_email"):
                errors["ngo_email"] = (
                    "NGO email is required."
                )

            if not attrs.get(
                "ngo_registration_number"
            ):
                errors[
                    "ngo_registration_number"
                ] = (
                    "NGO registration number "
                    "is required."
                )

            if errors:
                raise serializers.ValidationError(
                    errors
                )

        return attrs

    def create(self, validated_data):
        # Volunteer fields
        skills = validated_data.pop(
            "skill_ids",
            [],
        )
        
        custom_skill_names = validated_data.pop(
            "custom_skill_names",
            [],
        )

        availability_notes = (
            validated_data.pop(
                "availability_notes",
                "",
            )
        )

        # Coordinator fields
        specialization = (
            validated_data.pop(
                "coordinator_specialization",
                "",
            )
        )

        experience = validated_data.pop(
            "coordinator_experience",
            "",
        )

        # Donor fields
        donor_organization = (
            validated_data.pop(
                "donor_organization",
                "",
            )
        )

        preferred_causes = (
            validated_data.pop(
                "donor_preferred_causes",
                "",
            )
        )

        # NGO fields
        ngo_name = validated_data.pop(
            "ngo_name",
            "",
        )

        ngo_email = validated_data.pop(
            "ngo_email",
            "",
        )

        ngo_address = validated_data.pop(
            "ngo_address",
            "",
        )

        ngo_registration_number = (
            validated_data.pop(
                "ngo_registration_number",
                "",
            )
        )

        user = User.objects.create_user(
            **validated_data
        )

        # =========================
        # Volunteer
        # =========================

        if user.role == User.Role.VOLUNTEER:
            from volunteering.models import (
                VolunteerProfile,
            )

            profile, _ = (
                VolunteerProfile.objects.get_or_create(
                    user=user
                )
            )

            profile.availability_notes = (
                availability_notes
            )

            profile.save(
                update_fields=[
                    "availability_notes"
                ]
            )

            all_skills = list(skills)

            for raw_name in custom_skill_names:
                name = raw_name.strip()

                if not name:
                    continue

                # Reuse an existing skill if the same
                # skill already exists.
                skill = Skill.objects.filter(
                    name__iexact=name
                ).first()

                if skill is None:
                    skill = Skill.objects.create(
                        name=name
                    )

                if skill not in all_skills:
                    all_skills.append(skill)

            profile.skills.set(all_skills)

        # =========================
        # Coordinator
        # =========================

        if user.role == User.Role.COORDINATOR:
            from accounts.models import (
                CoordinatorProfile,
            )

            CoordinatorProfile.objects.create(
                user=user,
                specialization=specialization,
                experience_notes=experience,
            )

        # =========================
        # Donor
        # =========================

        if user.role == User.Role.DONOR:
            from accounts.models import (
                DonorProfile,
            )

            DonorProfile.objects.create(
                user=user,
                organization_name=(
                    donor_organization
                ),
                preferred_causes=(
                    preferred_causes
                ),
            )

        # =========================
        # NGO Admin
        # =========================

        if user.role == User.Role.NGO_ADMIN:
            from organizations.models import NGO

            NGO.objects.create(
                name=ngo_name,
                email=ngo_email,
                address=ngo_address,
                registration_number=(
                    ngo_registration_number
                ),
                administrator=user,
                is_verified=False,
                verification_status=(
                    NGO.VerificationStatus.PENDING
                ),
            )

        return user
    
class CoordinatorProfileSerializer(
    serializers.ModelSerializer
):
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
    )

    phone = serializers.CharField(
        source="user.phone",
        required=False,
        allow_blank=True,
    )

    username = serializers.CharField(
        source="user.username",
        read_only=True,
    )

    class Meta:
        model = CoordinatorProfile

        fields = [
            "username",
            "first_name",
            "last_name",
            "email",
            "phone",
            "specialization",
            "experience_notes",
        ]

    def update(
        self,
        instance,
        validated_data,
    ):
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

        for field, value in validated_data.items():
            setattr(
                instance,
                field,
                value,
            )

        instance.save()

        return instance
    
class DonorProfileSerializer(serializers.ModelSerializer):
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
    )

    phone = serializers.CharField(
        source="user.phone",
        required=False,
        allow_blank=True,
    )

    username = serializers.CharField(
        source="user.username",
        read_only=True,
    )

    class Meta:
        model = DonorProfile

        fields = [
            "username",
            "first_name",
            "last_name",
            "email",
            "phone",
            "organization_name",
            "preferred_causes",
        ]

    def update(
        self,
        instance,
        validated_data,
    ):
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

        for field, value in validated_data.items():
            setattr(
                instance,
                field,
                value,
            )

        instance.save()

        return instance
        
class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    new_password = serializers.CharField(
        write_only=True,
        min_length=8,
    )

    def validate_new_password(self, value):
        user = self.context.get("user")

        try:
            password_validation.validate_password(
                value,
                user=user,
            )

        except DjangoValidationError as exc:
            raise serializers.ValidationError(
                exc.messages
            )

        return value
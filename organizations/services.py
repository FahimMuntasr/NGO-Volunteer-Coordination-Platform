from django.utils import timezone

from .models import NGO, VerifiedNGORegistry


class NGOVerificationService:

    @staticmethod
    def _normalize_name(name):
        return " ".join(
            name.strip().casefold().split()
        )

    @classmethod
    def verify(cls, ngo):

        if not ngo.registration_number:
            return False, "Registration number is required."

        registry_entry = (
            VerifiedNGORegistry.objects
            .filter(
                registration_number__iexact=(
                    ngo.registration_number.strip()
                )
            )
            .first()
        )

        # Registration number does not exist.
        if registry_entry is None:

            ngo.is_verified = False
            ngo.verification_status = (
                NGO.VerificationStatus.REJECTED
            )
            ngo.registry_entry = None
            ngo.verified_at = None

            ngo.save(
                update_fields=[
                    "is_verified",
                    "verification_status",
                    "registry_entry",
                    "verified_at",
                ]
            )

            return False, (
                "Registration number was not found "
                "in the verified NGO registry."
            )

        # Prevent someone from using another NGO's
        # registration number.
        ngo_name = cls._normalize_name(ngo.name)
        registry_name = cls._normalize_name(
            registry_entry.name
        )

        if ngo_name != registry_name:

            ngo.is_verified = False
            ngo.verification_status = (
                NGO.VerificationStatus.REJECTED
            )
            ngo.registry_entry = None
            ngo.verified_at = None

            ngo.save(
                update_fields=[
                    "is_verified",
                    "verification_status",
                    "registry_entry",
                    "verified_at",
                ]
            )

            return False, (
                "NGO name does not match the "
                "official registry."
            )

        # Everything matches.
        ngo.is_verified = True
        ngo.verification_status = (
            NGO.VerificationStatus.VERIFIED
        )
        ngo.registry_entry = registry_entry
        ngo.verified_at = timezone.now()

        ngo.save(
            update_fields=[
                "is_verified",
                "verification_status",
                "registry_entry",
                "verified_at",
            ]
        )

        return True, "NGO verified successfully."
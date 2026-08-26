from rest_framework import serializers

from organizations.models import NGO

from .models import Donation


class DonationSerializer(serializers.ModelSerializer):
    ngo_name = serializers.CharField(
        source="ngo.name",
        read_only=True,
    )

    donor_username = serializers.CharField(
        source="donor.username",
        read_only=True,
    )

    class Meta:
        model = Donation

        fields = [
            "id",
            "ngo",
            "ngo_name",
            "donor",
            "donor_username",
            "donor_name",
            "amount",
            "allocation_details",
            "donated_at",
            "acknowledgement_sent",
        ]

        read_only_fields = [
            "donor",
            "donor_name",
            "allocation_details",
            "donated_at",
            "acknowledgement_sent",
        ]

    def validate_ngo(self, ngo):
        """
        Donations can only be made to NGOs
        that have successfully completed
        platform verification.
        """

        if (
            not ngo.is_verified
            or ngo.verification_status
            != NGO.VerificationStatus.VERIFIED
        ):
            raise serializers.ValidationError(
                (
                    "Donations can only be made "
                    "to verified NGOs."
                )
            )

        return ngo


class DonationAllocationSerializer(
    serializers.ModelSerializer
):
    class Meta:
        model = Donation

        fields = [
            "allocation_details",
            "acknowledgement_sent",
        ]
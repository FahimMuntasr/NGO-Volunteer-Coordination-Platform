from rest_framework import serializers

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


class DonationAllocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Donation
        fields = [
            "allocation_details",
            "acknowledgement_sent",
        ]
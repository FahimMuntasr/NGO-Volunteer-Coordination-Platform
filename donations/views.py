from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .services import DonationAcknowledgementService

from accounts.models import User

from .models import Donation
from .serializers import (
    DonationAllocationSerializer,
    DonationSerializer,
)

from notifications.domain_events import (
    DonationAcknowledged,
    DonationReceived,
)
from notifications.observers import notification_subject

class DonationCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != User.Role.DONOR:
            return Response(
                {
                    "detail": "Only donors can create donations."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = DonationSerializer(data=request.data)

        if serializer.is_valid():
            donor_name = (
                request.user.get_full_name()
                or request.user.username
            )

            donation = serializer.save(
                donor=request.user,
                donor_name=donor_name,
            )

            notification_subject.notify(DonationReceived(donation))

            return Response(
                DonationSerializer(donation).data,
                status=status.HTTP_201_CREATED,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )


class DonorDonationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != User.Role.DONOR:
            return Response(
                {
                    "detail": (
                        "Only donors can view their donation history."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        donations = (
            Donation.objects
            .filter(donor=request.user)
            .select_related("ngo", "donor")
            .order_by("-donated_at")
        )

        serializer = DonationSerializer(
            donations,
            many=True,
        )

        return Response(serializer.data)


class NGODonationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != User.Role.NGO_ADMIN:
            return Response(
                {
                    "detail": (
                        "Only NGO administrators can view "
                        "NGO donations."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        donations = (
            Donation.objects
            .filter(ngo__administrator=request.user)
            .select_related("ngo", "donor")
            .order_by("-donated_at")
        )

        serializer = DonationSerializer(
            donations,
            many=True,
        )

        return Response(serializer.data)


class DonationAllocationUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, donation_id):
        if request.user.role != User.Role.NGO_ADMIN:
            return Response(
                {
                    "detail": (
                        "Only NGO administrators can update "
                        "donation allocation."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        donation = get_object_or_404(
            Donation.objects.select_related("ngo"),
            pk=donation_id,
        )

        if donation.ngo.administrator_id != request.user.id:
            return Response(
                {
                    "detail": (
                        "You cannot manage donations "
                        "for this NGO."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        was_acknowledged = donation.acknowledgement_sent

        serializer = DonationAllocationSerializer(
            donation,
            data=request.data,
            partial=True,
        )

        if serializer.is_valid():
            serializer.save()

            # Only notify the donor the first time this donation is
            # marked acknowledged - not on every subsequent edit to
            # allocation_details.
            if (
                not was_acknowledged
                and donation.acknowledgement_sent
            ):
                notification_subject.notify(
                    DonationAcknowledged(donation)
                )

            return Response(
                DonationSerializer(donation).data,
                status=status.HTTP_200_OK,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )
    
class DonationAcknowledgementView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, donation_id):
        donation = get_object_or_404(
            Donation.objects.select_related(
                "ngo",
                "donor",
            ),
            pk=donation_id,
        )

        is_donor = (
            donation.donor_id == request.user.id
        )

        is_ngo_admin = (
            donation.ngo.administrator_id
            == request.user.id
        )

        if not is_donor and not is_ngo_admin:
            return Response(
                {
                    "detail": (
                        "You cannot view this "
                        "donation acknowledgement."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        include_donor = (
            request.query_params.get(
                "donor",
                "true",
            ).lower()
            == "true"
        )

        include_ngo = (
            request.query_params.get(
                "ngo",
                "true",
            ).lower()
            == "true"
        )

        include_allocation = (
            request.query_params.get(
                "allocation",
                "true",
            ).lower()
            == "true"
        )

        service = DonationAcknowledgementService()

        acknowledgement = service.generate(
            donation,
            include_donor=include_donor,
            include_ngo=include_ngo,
            include_allocation=include_allocation,
        )

        return Response(
            {
                "donation_id": donation.id,
                "acknowledgement": acknowledgement,
            },
            status=status.HTTP_200_OK,
        )
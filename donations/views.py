from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User

from .models import Donation
from .serializers import (
    DonationAllocationSerializer,
    DonationSerializer,
)


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

        serializer = DonationAllocationSerializer(
            donation,
            data=request.data,
            partial=True,
        )

        if serializer.is_valid():
            serializer.save()

            return Response(
                DonationSerializer(donation).data,
                status=status.HTTP_200_OK,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )
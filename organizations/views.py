from django.db.models import Sum
from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from donations.models import Donation
from events.models import Event, Registration

from .models import NGO
from .services import NGOVerificationService
from .serializers import NGOProfileSerializer


class NGODashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, ngo_id):
        if request.user.role != User.Role.NGO_ADMIN:
            return Response(
                {
                    "detail": (
                        "Only NGO administrators can "
                        "view the NGO dashboard."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        ngo = get_object_or_404(
            NGO,
            pk=ngo_id,
        )

        if ngo.administrator_id != request.user.id:
            return Response(
                {
                    "detail": (
                        "You do not have permission to "
                        "view this NGO dashboard."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        events = Event.objects.filter(
            ngo=ngo
        )

        registrations = Registration.objects.filter(
            event__ngo=ngo
        )

        donations = Donation.objects.filter(
            ngo=ngo
        )

        total_donation_amount = (
            donations.aggregate(
                total=Sum("amount")
            )["total"]
            or 0
        )

        data = {
            "ngo_id": ngo.id,
            "ngo_name": ngo.name,

            "events": {
                "total": events.count(),
                "draft": events.filter(
                    status=Event.Status.DRAFT
                ).count(),
                "open": events.filter(
                    status=Event.Status.OPEN
                ).count(),
                "in_progress": events.filter(
                    status=Event.Status.IN_PROGRESS
                ).count(),
                "completed": events.filter(
                    status=Event.Status.COMPLETED
                ).count(),
                "cancelled": events.filter(
                    status=Event.Status.CANCELLED
                ).count(),
            },

            "registrations": {
                "total": registrations.count(),
                "pending": registrations.filter(
                    status=Registration.Status.PENDING
                ).count(),
                "approved": registrations.filter(
                    status=Registration.Status.APPROVED
                ).count(),
                "completed": registrations.filter(
                    status=Registration.Status.COMPLETED
                ).count(),
            },

            "donations": {
                "count": donations.count(),
                "total_amount": total_donation_amount,
            },
        }

        return Response(
            data,
            status=status.HTTP_200_OK,
        )
        
class NGOVerificationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, ngo_id):

        if request.user.role != User.Role.NGO_ADMIN:
            return Response(
                {
                    "detail": (
                        "Only NGO administrators "
                        "can verify an NGO."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        ngo = get_object_or_404(
            NGO,
            pk=ngo_id,
        )

        if ngo.administrator_id != request.user.id:
            return Response(
                {
                    "detail": (
                        "You do not have permission "
                        "to verify this NGO."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        registration_number = request.data.get(
            "registration_number"
        )

        if not registration_number:
            return Response(
                {
                    "registration_number": (
                        "This field is required."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        ngo.registration_number = (
            registration_number.strip()
        )

        ngo.verification_status = (
            NGO.VerificationStatus.PENDING
        )

        ngo.is_verified = False

        ngo.save(
            update_fields=[
                "registration_number",
                "verification_status",
                "is_verified",
            ]
        )

        verified, message = (
            NGOVerificationService.verify(ngo)
        )

        return Response(
            {
                "ngo_id": ngo.id,
                "ngo_name": ngo.name,
                "registration_number": (
                    ngo.registration_number
                ),
                "verified": verified,
                "verification_status": (
                    ngo.verification_status
                ),
                "message": message,
            },
            status=status.HTTP_200_OK,
        )
        
class VerifiedNGOListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != User.Role.DONOR:
            return Response(
                {
                    "detail": (
                        "Only donors can browse "
                        "verified NGOs."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        ngos = (
            NGO.objects
            .filter(
                is_verified=True,
                verification_status=(
                    NGO.VerificationStatus.VERIFIED
                ),
            )
            .order_by("name")
        )

        data = []

        for ngo in ngos:
            data.append(
                {
                    "id": ngo.id,
                    "name": ngo.name,
                    "address": ngo.address,
                    "email": ngo.email,
                    "description": ngo.description,
                    "registration_number": (
                        ngo.registration_number
                    ),
                    "is_verified": ngo.is_verified,
                }
            )

        return Response(
            data,
            status=status.HTTP_200_OK,
        )
        
class NGOProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get_ngo(self, user):
        return (
            NGO.objects
            .filter(
                administrator=user
            )
            .first()
        )

    def get(self, request):
        if (
            request.user.role
            != User.Role.NGO_ADMIN
        ):
            return Response(
                {
                    "detail": (
                        "Only NGO administrators "
                        "can view NGO profiles."
                    )
                },
                status=(
                    status.HTTP_403_FORBIDDEN
                ),
            )

        ngo = self.get_ngo(
            request.user
        )

        if ngo is None:
            return Response(
                {
                    "detail": (
                        "No NGO is associated "
                        "with this account."
                    )
                },
                status=(
                    status.HTTP_404_NOT_FOUND
                ),
            )

        return Response(
            NGOProfileSerializer(
                ngo
            ).data,
            status=status.HTTP_200_OK,
        )

    def patch(self, request):
        if (
            request.user.role
            != User.Role.NGO_ADMIN
        ):
            return Response(
                {
                    "detail": (
                        "Only NGO administrators "
                        "can update NGO profiles."
                    )
                },
                status=(
                    status.HTTP_403_FORBIDDEN
                ),
            )

        ngo = self.get_ngo(
            request.user
        )

        if ngo is None:
            return Response(
                {
                    "detail": (
                        "No NGO is associated "
                        "with this account."
                    )
                },
                status=(
                    status.HTTP_404_NOT_FOUND
                ),
            )

        serializer = NGOProfileSerializer(
            ngo,
            data=request.data,
            partial=True,
        )

        serializer.is_valid(
            raise_exception=True
        )

        serializer.save()

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )
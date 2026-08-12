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
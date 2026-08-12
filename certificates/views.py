from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from volunteering.models import VolunteerProfile

from .models import Certificate
from .serializers import CertificateSerializer


class MyCertificateListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != User.Role.VOLUNTEER:
            return Response(
                {
                    "detail": (
                        "Only volunteers can view their certificates."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        volunteer = get_object_or_404(
            VolunteerProfile,
            user=request.user,
        )

        certificates = (
            Certificate.objects
            .filter(volunteer=volunteer)
            .select_related(
                "volunteer__user",
                "event",
            )
            .order_by("-issued_at")
        )

        serializer = CertificateSerializer(
            certificates,
            many=True,
            context={"request": request},
        )

        return Response(serializer.data)


class CertificateVerificationView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, verification_code):
        certificate = get_object_or_404(
            Certificate.objects.select_related(
                "volunteer__user",
                "event",
            ),
            verification_code=verification_code,
        )

        volunteer_name = (
            certificate.volunteer.user.get_full_name()
            or certificate.volunteer.user.username
        )

        return Response(
            {
                "valid": True,
                "verification_code": (
                    certificate.verification_code
                ),
                "volunteer_name": volunteer_name,
                "event_title": certificate.event.title,
                "issued_at": certificate.issued_at,
            },
            status=status.HTTP_200_OK,
        )
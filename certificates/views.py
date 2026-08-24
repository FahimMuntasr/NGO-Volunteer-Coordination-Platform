from django.shortcuts import get_object_or_404
from django.http import HttpResponse

from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from volunteering.models import VolunteerProfile
from events.models import Event

from .models import Certificate
from .serializers import CertificateSerializer
from .services import AttendanceReportService


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
        
class AttendanceReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, event_id):

        if request.user.role != User.Role.NGO_ADMIN:
            return Response(
                {
                    "detail": (
                        "Only NGO administrators can "
                        "download attendance reports."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        event = get_object_or_404(
            Event.objects.select_related("ngo"),
            pk=event_id,
        )

        if event.ngo.administrator_id != request.user.id:
            return Response(
                {
                    "detail": (
                        "You can only download reports "
                        "for your own NGO's events."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        pdf_file = AttendanceReportService.generate_report(
            event
        )

        response = HttpResponse(
            pdf_file.read(),
            content_type="application/pdf",
        )

        response[
            "Content-Disposition"
        ] = (
            f'attachment; filename="attendance_report_'
            f'{event.id}.pdf"'
        )

        return response
from abc import ABC, abstractmethod
from io import BytesIO

from django.core.files.base import ContentFile
from reportlab.pdfgen import canvas


class DocumentGenerator(ABC):

    @abstractmethod
    def generate(self, context):
        pass


class ParticipationCertificateGenerator(DocumentGenerator):

    def generate(self, context):
        volunteer = context["volunteer"]
        event = context["event"]
        verification_code = context["verification_code"]

        buffer = BytesIO()

        pdf = canvas.Canvas(buffer)

        pdf.setFont("Helvetica-Bold", 22)
        pdf.drawCentredString(
            300,
            750,
            "Certificate of Participation",
        )

        pdf.setFont("Helvetica", 14)
        pdf.drawCentredString(
            300,
            690,
            "This certificate is proudly presented to",
        )

        volunteer_name = (
            volunteer.user.get_full_name()
            or volunteer.user.username
        )

        pdf.setFont("Helvetica-Bold", 18)
        pdf.drawCentredString(
            300,
            650,
            volunteer_name,
        )

        pdf.setFont("Helvetica", 14)
        pdf.drawCentredString(
            300,
            600,
            f"For participating in {event.title}",
        )

        pdf.drawCentredString(
            300,
            570,
            f"Organized by {event.ngo.name}",
        )

        pdf.setFont("Helvetica", 10)
        pdf.drawCentredString(
            300,
            500,
            f"Verification Code: {verification_code}",
        )

        pdf.save()

        buffer.seek(0)

        return ContentFile(buffer.read())


class AttendanceReportGenerator(DocumentGenerator):

    def generate(self, context):
        event = context["event"]
        registrations = context["registrations"]

        buffer = BytesIO()

        pdf = canvas.Canvas(buffer)

        pdf.setFont("Helvetica-Bold", 20)
        pdf.drawString(
            50,
            780,
            f"Attendance Report - {event.title}",
        )

        y = 730

        pdf.setFont("Helvetica", 12)

        for registration in registrations:
            volunteer_name = (
                registration.volunteer.user.get_full_name()
                or registration.volunteer.user.username
            )

            line = (
                f"{volunteer_name} - "
                f"{registration.attendance_status}"
            )

            pdf.drawString(50, y, line)
            y -= 25

            if y < 50:
                pdf.showPage()
                y = 780

        pdf.save()

        buffer.seek(0)

        return ContentFile(buffer.read())
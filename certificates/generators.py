from abc import ABC, abstractmethod
from io import BytesIO

from django.core.files.base import ContentFile
from reportlab.pdfgen import canvas

# PRODUCT INTERFACE

class DocumentGenerator(ABC):

    @abstractmethod
    def generate(self, context):
        pass

# CONCRETE PRODUCT 1

class ParticipationCertificateGenerator(DocumentGenerator):

    def generate(self, context):
        volunteer = context["volunteer"]
        event = context["event"]
        verification_code = context["verification_code"]

        buffer = BytesIO()

        pdf = canvas.Canvas(buffer)

        # Title
        pdf.setFont("Helvetica-Bold", 24)
        pdf.drawCentredString(
            300,
            750,
            "Certificate of Participation",
        )

        # Main text
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

        pdf.setFont("Helvetica-Bold", 20)
        pdf.drawCentredString(
            300,
            650,
            volunteer_name,
        )

        pdf.setFont("Helvetica", 14)
        pdf.drawCentredString(
            300,
            600,
            "For successfully participating in",
        )

        pdf.setFont("Helvetica-Bold", 16)
        pdf.drawCentredString(
            300,
            565,
            event.title,
        )

        pdf.setFont("Helvetica", 13)
        pdf.drawCentredString(
            300,
            525,
            f"Organized by {event.ngo.name}",
        )

        # Verification code
        pdf.setFont("Helvetica", 10)
        pdf.drawCentredString(
            300,
            460,
            f"Verification Code: {verification_code}",
        )

        pdf.save()

        buffer.seek(0)

        return ContentFile(buffer.read())

# CONCRETE PRODUCT 2

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
            "Attendance Report",
        )

        pdf.setFont("Helvetica-Bold", 14)
        pdf.drawString(
            50,
            750,
            event.title,
        )

        pdf.setFont("Helvetica", 12)

        y_position = 700

        for registration in registrations:
            volunteer_name = (
                registration.volunteer.user.get_full_name()
                or registration.volunteer.user.username
            )

            attendance = registration.attendance_status

            line = (
                f"{volunteer_name} - {attendance}"
            )

            pdf.drawString(
                50,
                y_position,
                line,
            )

            y_position -= 25

            # Start another PDF page if necessary
            if y_position < 50:
                pdf.showPage()
                pdf.setFont("Helvetica", 12)
                y_position = 780

        pdf.save()

        buffer.seek(0)

        return ContentFile(buffer.read())
from .creators import (
    AttendanceReportCreator,
    ParticipationCertificateCreator,
)
from .models import Certificate


class CertificateService:
    
    @staticmethod
    def generate_certificate(registration):
        certificate, created = Certificate.objects.get_or_create(
            volunteer=registration.volunteer,
            event=registration.event,
        )

        # Prevents duplicate certificate generation
        if certificate.file:
            return certificate

        # Concrete Creator
        creator = ParticipationCertificateCreator()

        # The client asks the creator to create the document
        pdf_file = creator.create_document(
            {
                "volunteer": registration.volunteer,
                "event": registration.event,
                "verification_code": (
                    certificate.verification_code
                ),
            }
        )

        filename = (
            f"certificate_"
            f"{registration.event.id}_"
            f"{registration.volunteer.id}.pdf"
        )

        certificate.file.save(
            filename,
            pdf_file,
            save=True,
        )

        return certificate


class AttendanceReportService:

    @staticmethod
    def generate_report(event):
        registrations = (
            event.registrations
            .select_related("volunteer__user")
            .all()
        )

        # Different Concrete Creator
        creator = AttendanceReportCreator()

        return creator.create_document(
            {
                "event": event,
                "registrations": registrations,
            }
        )
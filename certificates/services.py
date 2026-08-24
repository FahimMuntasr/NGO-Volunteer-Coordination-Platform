from .creators import (
    AttendanceReportCreator,
    ParticipationCertificateCreator,
)
from .models import Certificate


class CertificateService:

    @staticmethod
    def generate_certificate(registration):
        """
        Create the persistent certificate record.

        The PDF itself is generated on demand instead
        of being permanently stored on the server's
        local filesystem.
        """

        certificate, _ = (
            Certificate.objects.get_or_create(
                volunteer=registration.volunteer,
                event=registration.event,
            )
        )

        return certificate

    @staticmethod
    def generate_certificate_document(
        certificate,
    ):
        """
        Generate the certificate PDF in memory.

        Uses the existing Factory Method implementation.
        """

        creator = (
            ParticipationCertificateCreator()
        )

        return creator.create_document(
            {
                "volunteer": certificate.volunteer,
                "event": certificate.event,
                "verification_code": (
                    certificate.verification_code
                ),
            }
        )


class AttendanceReportService:

    @staticmethod
    def generate_report(event):
        registrations = (
            event.registrations
            .select_related(
                "volunteer__user"
            )
            .all()
        )

        creator = (
            AttendanceReportCreator()
        )

        return creator.create_document(
            {
                "event": event,
                "registrations": registrations,
            }
        )
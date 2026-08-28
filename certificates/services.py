from .creators import (
    AttendanceReportCreator,
    ParticipationCertificateCreator,
)
from .models import Certificate

from notifications.domain_events import CertificateIssued
from notifications.strategies import NotificationContext

class CertificateService:

    @staticmethod
    def generate_certificate(registration):

        certificate, _ = (
            Certificate.objects.get_or_create(
                volunteer=registration.volunteer,
                event=registration.event,
            )
        )

        NotificationContext().execute(CertificateIssued(certificate))

        return certificate

    @staticmethod
    def generate_certificate_document(certificate):

        creator = (ParticipationCertificateCreator())

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

        creator = (AttendanceReportCreator())

        return creator.create_document(
            {
                "event": event,
                "registrations": registrations,
            }
        )
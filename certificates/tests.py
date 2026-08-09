from types import SimpleNamespace

from django.test import SimpleTestCase

from .creators import (
    AttendanceReportCreator,
    ParticipationCertificateCreator,
)
from .generators import (
    AttendanceReportGenerator,
    DocumentGenerator,
    ParticipationCertificateGenerator,
)


class FactoryMethodTests(SimpleTestCase):

    def test_certificate_creator_returns_certificate_generator(self):
        creator = ParticipationCertificateCreator()

        product = creator.factory_method()

        self.assertIsInstance(
            product,
            ParticipationCertificateGenerator,
        )

        self.assertIsInstance(
            product,
            DocumentGenerator,
        )

    def test_attendance_creator_returns_attendance_generator(self):
        creator = AttendanceReportCreator()

        product = creator.factory_method()

        self.assertIsInstance(
            product,
            AttendanceReportGenerator,
        )

        self.assertIsInstance(
            product,
            DocumentGenerator,
        )

    def test_certificate_creator_generates_pdf(self):
        user = SimpleNamespace(
            username="volunteer1",
            get_full_name=lambda: "Test Volunteer",
        )

        volunteer = SimpleNamespace(
            user=user,
        )

        ngo = SimpleNamespace(
            name="Helping Hands NGO",
        )

        event = SimpleNamespace(
            title="Community Cleanup",
            ngo=ngo,
        )

        context = {
            "volunteer": volunteer,
            "event": event,
            "verification_code": "TEST-123",
        }

        creator = ParticipationCertificateCreator()

        document = creator.create_document(context)

        self.assertGreater(
            document.size,
            0,
        )

    def test_attendance_creator_generates_pdf(self):
        user = SimpleNamespace(
            username="volunteer1",
            get_full_name=lambda: "Test Volunteer",
        )

        volunteer = SimpleNamespace(
            user=user,
        )

        registration = SimpleNamespace(
            volunteer=volunteer,
            attendance_status="PRESENT",
        )

        event = SimpleNamespace(
            title="Community Cleanup",
        )

        context = {
            "event": event,
            "registrations": [registration],
        }

        creator = AttendanceReportCreator()

        document = creator.create_document(context)

        self.assertGreater(
            document.size,
            0,
        )
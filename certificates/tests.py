from django.test import TestCase

from .factory import DocumentGeneratorFactory
from .generators import (
    AttendanceReportGenerator,
    ParticipationCertificateGenerator,
)


class DocumentGeneratorFactoryTests(TestCase):

    def test_certificate_generator(self):
        generator = DocumentGeneratorFactory.create(
            "certificate"
        )

        self.assertIsInstance(
            generator,
            ParticipationCertificateGenerator,
        )

    def test_attendance_report_generator(self):
        generator = DocumentGeneratorFactory.create(
            "attendance_report"
        )

        self.assertIsInstance(
            generator,
            AttendanceReportGenerator,
        )

    def test_invalid_document_type(self):
        with self.assertRaises(ValueError):
            DocumentGeneratorFactory.create(
                "invalid"
            )
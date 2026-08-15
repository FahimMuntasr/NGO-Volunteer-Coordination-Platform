from types import SimpleNamespace

from django.test import SimpleTestCase

from .creators import (
    AttendanceReportCreator,
    ParticipationCertificateCreator,
)
from .products import (
    AttendanceReportGenerator,
    DocumentGenerator,
    ParticipationCertificateGenerator,
)
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User
from organizations.models import NGO
from events.models import Event
from volunteering.models import VolunteerProfile

from datetime import timedelta
from uuid import uuid4

from .models import Certificate


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
        
class CertificateAPITests(APITestCase):

    def setUp(self):
        self.volunteer_user = User.objects.create_user(
            username="volunteer1",
            password="test123",
            first_name="Test",
            last_name="Volunteer",
            role=User.Role.VOLUNTEER,
        )

        self.volunteer, _ = VolunteerProfile.objects.get_or_create(
            user=self.volunteer_user,
        )

        self.other_volunteer_user = User.objects.create_user(
            username="volunteer2",
            password="test123",
            first_name="Other",
            last_name="Volunteer",
            role=User.Role.VOLUNTEER,
        )

        self.other_volunteer, _ = (
            VolunteerProfile.objects.get_or_create(
                user=self.other_volunteer_user,
            )
        )

        self.admin = User.objects.create_user(
            username="admin1",
            password="test123",
            role=User.Role.NGO_ADMIN,
        )

        self.ngo = NGO.objects.create(
            name="Helping Hands",
            administrator=self.admin,
        )

        start = timezone.now() + timedelta(days=10)
        end = start + timedelta(hours=3)
        deadline = start - timedelta(days=1)

        self.event = Event.objects.create(
            ngo=self.ngo,
            created_by=self.admin,
            title="Community Cleanup",
            description="Clean up the local community.",
            location="Dhaka",
            start_date=start,
            end_date=end,
            registration_deadline=deadline,
            volunteer_capacity=20,
        )

        self.certificate = Certificate.objects.create(
            volunteer=self.volunteer,
            event=self.event,
        )

    def test_volunteer_can_view_own_certificates(self):
        self.client.force_authenticate(
            user=self.volunteer_user
        )

        response = self.client.get(
            reverse("certificate-my-list")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(len(response.data), 1)

        self.assertEqual(
            response.data[0]["event_title"],
            "Community Cleanup",
        )

    def test_volunteer_only_sees_own_certificates(self):
        Certificate.objects.create(
            volunteer=self.other_volunteer,
            event=self.event,
        )

        self.client.force_authenticate(
            user=self.volunteer_user
        )

        response = self.client.get(
            reverse("certificate-my-list")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(len(response.data), 1)

        self.assertEqual(
            response.data[0]["volunteer"],
            self.volunteer.id,
        )

    def test_ngo_admin_cannot_view_my_certificates(self):
        self.client.force_authenticate(
            user=self.admin
        )

        response = self.client.get(
            reverse("certificate-my-list")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_valid_certificate_can_be_verified(self):
        response = self.client.get(
            reverse(
                "certificate-verify",
                args=[self.certificate.verification_code],
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertTrue(response.data["valid"])

        self.assertEqual(
            response.data["event_title"],
            "Community Cleanup",
        )

        self.assertEqual(
            response.data["volunteer_name"],
            "Test Volunteer",
        )

    def test_invalid_certificate_code_returns_404(self):
        fake_code = uuid4()

        response = self.client.get(
            reverse(
                "certificate-verify",
                args=[fake_code],
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )
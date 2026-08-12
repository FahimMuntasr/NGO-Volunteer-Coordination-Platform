from datetime import timedelta
from decimal import Decimal

from django.urls import reverse
from django.utils import timezone

from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User
from donations.models import Donation
from events.models import Event, Registration
from volunteering.models import VolunteerProfile

from .models import NGO


class NGODashboardTests(APITestCase):

    def setUp(self):
        self.admin = User.objects.create_user(
            username="admin1",
            password="test123",
            role=User.Role.NGO_ADMIN,
        )

        self.other_admin = User.objects.create_user(
            username="admin2",
            password="test123",
            role=User.Role.NGO_ADMIN,
        )

        self.volunteer_user = User.objects.create_user(
            username="volunteer1",
            password="test123",
            role=User.Role.VOLUNTEER,
        )

        self.volunteer, _ = (
            VolunteerProfile.objects.get_or_create(
                user=self.volunteer_user,
            )
        )

        self.donor = User.objects.create_user(
            username="donor1",
            password="test123",
            role=User.Role.DONOR,
        )

        self.ngo = NGO.objects.create(
            name="Helping Hands",
            email="helpinghands@example.com",
            administrator=self.admin,
        )

        self.other_ngo = NGO.objects.create(
            name="Other NGO",
            email="other@example.com",
            administrator=self.other_admin,
        )

        start = timezone.now() + timedelta(days=10)
        end = start + timedelta(hours=3)
        deadline = start - timedelta(days=1)

        self.open_event = Event.objects.create(
            ngo=self.ngo,
            created_by=self.admin,
            title="Cleanup",
            description="Cleanup event.",
            location="Dhaka",
            start_date=start,
            end_date=end,
            registration_deadline=deadline,
            volunteer_capacity=20,
            status=Event.Status.OPEN,
        )

        self.completed_event = Event.objects.create(
            ngo=self.ngo,
            created_by=self.admin,
            title="Food Drive",
            description="Food drive event.",
            location="Dhaka",
            start_date=start,
            end_date=end,
            registration_deadline=deadline,
            volunteer_capacity=20,
            status=Event.Status.COMPLETED,
        )

        Registration.objects.create(
            event=self.open_event,
            volunteer=self.volunteer,
            status=Registration.Status.PENDING,
        )

        Donation.objects.create(
            ngo=self.ngo,
            donor=self.donor,
            donor_name="donor1",
            amount=Decimal("100.00"),
        )

        Donation.objects.create(
            ngo=self.ngo,
            donor=self.donor,
            donor_name="donor1",
            amount=Decimal("50.00"),
        )

    def test_correct_admin_can_view_dashboard(self):
        self.client.force_authenticate(
            user=self.admin
        )

        response = self.client.get(
            reverse(
                "ngo-dashboard",
                args=[self.ngo.id],
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["ngo_name"],
            "Helping Hands",
        )

    def test_dashboard_statistics_are_correct(self):
        self.client.force_authenticate(
            user=self.admin
        )

        response = self.client.get(
            reverse(
                "ngo-dashboard",
                args=[self.ngo.id],
            )
        )

        self.assertEqual(
            response.data["events"]["total"],
            2,
        )

        self.assertEqual(
            response.data["events"]["open"],
            1,
        )

        self.assertEqual(
            response.data["events"]["completed"],
            1,
        )

        self.assertEqual(
            response.data["registrations"]["pending"],
            1,
        )

        self.assertEqual(
            response.data["donations"]["count"],
            2,
        )

        self.assertEqual(
            Decimal(
                response.data["donations"]["total_amount"]
            ),
            Decimal("150.00"),
        )

    def test_wrong_admin_cannot_view_dashboard(self):
        self.client.force_authenticate(
            user=self.other_admin
        )

        response = self.client.get(
            reverse(
                "ngo-dashboard",
                args=[self.ngo.id],
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_volunteer_cannot_view_dashboard(self):
        self.client.force_authenticate(
            user=self.volunteer_user
        )

        response = self.client.get(
            reverse(
                "ngo-dashboard",
                args=[self.ngo.id],
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )
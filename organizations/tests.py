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

from .models import NGO, VerifiedNGORegistry


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
        
class NGOVerificationTests(APITestCase):

    def setUp(self):
        self.admin = User.objects.create_user(
            username="verification_admin",
            password="test123",
            role=User.Role.NGO_ADMIN,
        )

        self.other_admin = User.objects.create_user(
            username="other_verification_admin",
            password="test123",
            role=User.Role.NGO_ADMIN,
        )

        self.volunteer = User.objects.create_user(
            username="verification_volunteer",
            password="test123",
            role=User.Role.VOLUNTEER,
        )

        self.ngo = NGO.objects.create(
            name="Abdul Alim Foundation",
            email="abdulalim@example.com",
            administrator=self.admin,
        )

        self.registry_entry = (
            VerifiedNGORegistry.objects.create(
                name="Abdul Alim Foundation",
                registration_number="3287",
                address="Dhaka",
            )
        )

    def test_matching_ngo_is_verified(self):
        self.client.force_authenticate(
            user=self.admin
        )

        response = self.client.post(
            reverse(
                "ngo-verify",
                args=[self.ngo.id],
            ),
            {
                "registration_number": "3287",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.ngo.refresh_from_db()

        self.assertTrue(
            self.ngo.is_verified
        )

        self.assertEqual(
            self.ngo.verification_status,
            NGO.VerificationStatus.VERIFIED,
        )

        self.assertEqual(
            self.ngo.registry_entry,
            self.registry_entry,
        )

        self.assertIsNotNone(
            self.ngo.verified_at
        )

        self.assertTrue(
            response.data["verified"]
        )

    def test_unknown_registration_number_is_rejected(self):
        self.client.force_authenticate(
            user=self.admin
        )

        response = self.client.post(
            reverse(
                "ngo-verify",
                args=[self.ngo.id],
            ),
            {
                "registration_number": "9999",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.ngo.refresh_from_db()

        self.assertFalse(
            self.ngo.is_verified
        )

        self.assertEqual(
            self.ngo.verification_status,
            NGO.VerificationStatus.REJECTED,
        )

        self.assertIsNone(
            self.ngo.registry_entry
        )

        self.assertIsNone(
            self.ngo.verified_at
        )

        self.assertFalse(
            response.data["verified"]
        )

    def test_registration_number_with_wrong_name_is_rejected(self):
        self.ngo.name = "Fake NGO"
        self.ngo.save(
            update_fields=["name"]
        )

        self.client.force_authenticate(
            user=self.admin
        )

        response = self.client.post(
            reverse(
                "ngo-verify",
                args=[self.ngo.id],
            ),
            {
                "registration_number": "3287",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.ngo.refresh_from_db()

        self.assertFalse(
            self.ngo.is_verified
        )

        self.assertEqual(
            self.ngo.verification_status,
            NGO.VerificationStatus.REJECTED,
        )

        self.assertIsNone(
            self.ngo.registry_entry
        )

    def test_wrong_admin_cannot_verify_ngo(self):
        self.client.force_authenticate(
            user=self.other_admin
        )

        response = self.client.post(
            reverse(
                "ngo-verify",
                args=[self.ngo.id],
            ),
            {
                "registration_number": "3287",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

        self.ngo.refresh_from_db()

        self.assertFalse(
            self.ngo.is_verified
        )

        self.assertEqual(
            self.ngo.verification_status,
            NGO.VerificationStatus.PENDING,
        )

    def test_volunteer_cannot_verify_ngo(self):
        self.client.force_authenticate(
            user=self.volunteer
        )

        response = self.client.post(
            reverse(
                "ngo-verify",
                args=[self.ngo.id],
            ),
            {
                "registration_number": "3287",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

        self.ngo.refresh_from_db()

        self.assertFalse(
            self.ngo.is_verified
        )

    def test_registration_number_is_required(self):
        self.client.force_authenticate(
            user=self.admin
        )

        response = self.client.post(
            reverse(
                "ngo-verify",
                args=[self.ngo.id],
            ),
            {},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertIn(
            "registration_number",
            response.data,
        )
        
    def test_expired_ngo_registration_is_rejected(self):
        from datetime import timedelta
        from django.utils import timezone

        self.registry_entry.valid_upto = (
            timezone.localdate() - timedelta(days=1)
        )
        self.registry_entry.save(
            update_fields=["valid_upto"]
        )

        self.client.force_authenticate(
            user=self.admin
        )

        response = self.client.post(
            reverse(
                "ngo-verify",
                args=[self.ngo.id],
            ),
            {
                "registration_number": "3287",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.ngo.refresh_from_db()

        self.assertFalse(
            self.ngo.is_verified
        )

        self.assertEqual(
            self.ngo.verification_status,
            NGO.VerificationStatus.REJECTED,
        )

        self.assertEqual(
            self.ngo.registry_entry,
            self.registry_entry,
        )

        self.assertIsNone(
            self.ngo.verified_at
        )

        self.assertFalse(
            response.data["verified"]
        )

        self.assertEqual(
            response.data["message"],
            "NGO registration has expired.",
        )
        
class NGOProfileVerificationProtectionTests(
    APITestCase
):

    def setUp(self):
        self.admin = User.objects.create_user(
            username="profile_admin",
            password="test123",
            role=User.Role.NGO_ADMIN,
        )

        self.registry_entry = (
            VerifiedNGORegistry.objects.create(
                name="Helping Hands",
                registration_number="12345",
                address="Dhaka",
            )
        )

        self.ngo = NGO.objects.create(
            name="Helping Hands",
            email="helpinghands@example.com",
            administrator=self.admin,
            registration_number="12345",
            is_verified=True,
            verification_status=(
                NGO.VerificationStatus.VERIFIED
            ),
            registry_entry=self.registry_entry,
            verified_at=timezone.now(),
        )

    def test_verified_ngo_name_change_resets_verification(
        self,
    ):
        self.client.force_authenticate(
            user=self.admin
        )

        response = self.client.patch(
            reverse("ngo-profile"),
            {
                "name": "Different Organization",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.ngo.refresh_from_db()

        self.assertEqual(
            self.ngo.name,
            "Different Organization",
        )

        self.assertFalse(
            self.ngo.is_verified
        )

        self.assertEqual(
            self.ngo.verification_status,
            NGO.VerificationStatus.PENDING,
        )

        self.assertIsNone(
            self.ngo.registry_entry
        )

        self.assertIsNone(
            self.ngo.verified_at
        )

    def test_same_normalized_name_keeps_verification(
        self,
    ):
        self.client.force_authenticate(
            user=self.admin
        )

        response = self.client.patch(
            reverse("ngo-profile"),
            {
                "name": "  HELPING   HANDS  ",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.ngo.refresh_from_db()

        self.assertTrue(
            self.ngo.is_verified
        )

        self.assertEqual(
            self.ngo.verification_status,
            NGO.VerificationStatus.VERIFIED,
        )

        self.assertEqual(
            self.ngo.registry_entry,
            self.registry_entry,
        )

        self.assertIsNotNone(
            self.ngo.verified_at
        )

    def test_editing_non_identity_fields_keeps_verification(
        self,
    ):
        self.client.force_authenticate(
            user=self.admin
        )

        response = self.client.patch(
            reverse("ngo-profile"),
            {
                "address": "New Dhaka Address",
                "description": (
                    "Updated NGO description."
                ),
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.ngo.refresh_from_db()

        self.assertEqual(
            self.ngo.address,
            "New Dhaka Address",
        )

        self.assertTrue(
            self.ngo.is_verified
        )

        self.assertEqual(
            self.ngo.verification_status,
            NGO.VerificationStatus.VERIFIED,
        )
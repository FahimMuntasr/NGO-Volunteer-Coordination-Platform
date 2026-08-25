from decimal import Decimal

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User
from organizations.models import NGO

from .models import Donation
from .acknowledgement import (
    BasicDonationAcknowledgement,
    DonorDetailsDecorator,
    NGOInformationDecorator,
    AllocationDetailsDecorator,
)


class DonationAPITests(APITestCase):

    def setUp(self):
        self.donor = User.objects.create_user(
            username="donor1",
            password="test123",
            role=User.Role.DONOR,
        )

        self.volunteer = User.objects.create_user(
            username="volunteer1",
            password="test123",
            role=User.Role.VOLUNTEER,
        )

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

        self.ngo = NGO.objects.create(
            name="Helping Hands",
            email="helpinghands@example.com",
            administrator=self.admin,
            is_verified=True,
            verification_status=(
                NGO.VerificationStatus.VERIFIED
            ),
        )

        self.other_ngo = NGO.objects.create(
            name="Other NGO",
            administrator=self.other_admin,
        )

    def test_donor_can_create_donation(self):
        self.client.force_authenticate(user=self.donor)

        response = self.client.post(
            reverse("donation-create"),
            {
                "ngo": self.ngo.id,
                "amount": "100.00",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertEqual(
            Donation.objects.count(),
            1,
        )

        donation = Donation.objects.first()

        self.assertEqual(
            donation.donor,
            self.donor,
        )

        self.assertEqual(
            donation.amount,
            Decimal("100.00"),
        )

    def test_volunteer_cannot_create_donation(self):
        self.client.force_authenticate(
            user=self.volunteer
        )

        response = self.client.post(
            reverse("donation-create"),
            {
                "ngo": self.ngo.id,
                "amount": "100.00",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_donor_only_sees_own_donations(self):
        Donation.objects.create(
            ngo=self.ngo,
            donor=self.donor,
            donor_name="donor1",
            amount=Decimal("100.00"),
        )

        other_donor = User.objects.create_user(
            username="donor2",
            password="test123",
            role=User.Role.DONOR,
        )

        Donation.objects.create(
            ngo=self.ngo,
            donor=other_donor,
            donor_name="donor2",
            amount=Decimal("200.00"),
        )

        self.client.force_authenticate(
            user=self.donor
        )

        response = self.client.get(
            reverse("donation-my-list")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            len(response.data),
            1,
        )

    def test_ngo_admin_can_view_received_donations(self):
        Donation.objects.create(
            ngo=self.ngo,
            donor=self.donor,
            donor_name="donor1",
            amount=Decimal("100.00"),
        )

        Donation.objects.create(
            ngo=self.other_ngo,
            donor=self.donor,
            donor_name="donor1",
            amount=Decimal("200.00"),
        )

        self.client.force_authenticate(
            user=self.admin
        )

        response = self.client.get(
            reverse("donation-ngo-list")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            len(response.data),
            1,
        )

    def test_admin_can_update_donation_allocation(self):
        donation = Donation.objects.create(
            ngo=self.ngo,
            donor=self.donor,
            donor_name="donor1",
            amount=Decimal("100.00"),
        )

        self.client.force_authenticate(
            user=self.admin
        )

        response = self.client.patch(
            reverse(
                "donation-allocation-update",
                args=[donation.id],
            ),
            {
                "allocation_details": (
                    "Used to purchase food supplies"
                ),
                "acknowledgement_sent": True,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        donation.refresh_from_db()

        self.assertEqual(
            donation.allocation_details,
            "Used to purchase food supplies",
        )

        self.assertTrue(
            donation.acknowledgement_sent
        )

    def test_other_admin_cannot_update_donation(self):
        donation = Donation.objects.create(
            ngo=self.ngo,
            donor=self.donor,
            donor_name="donor1",
            amount=Decimal("100.00"),
        )

        self.client.force_authenticate(
            user=self.other_admin
        )

        response = self.client.patch(
            reverse(
                "donation-allocation-update",
                args=[donation.id],
            ),
            {
                "allocation_details": "Something",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )
        
    def test_donor_cannot_donate_to_unverified_ngo(self):
        self.client.force_authenticate(
            user=self.donor
        )

        response = self.client.post(
            reverse("donation-create"),
            {
                "ngo": self.other_ngo.id,
                "amount": "100.00",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertIn(
            "ngo",
            response.data,
        )

        self.assertEqual(
            Donation.objects.count(),
            0,
        )
        
    def test_donor_cannot_donate_if_verification_status_is_not_verified(self):
        self.ngo.is_verified = True

        self.ngo.verification_status = (
            NGO.VerificationStatus.PENDING
        )

        self.ngo.save(
            update_fields=[
                "is_verified",
                "verification_status",
            ]
        )

        self.client.force_authenticate(
            user=self.donor
        )

        response = self.client.post(
            reverse("donation-create"),
            {
                "ngo": self.ngo.id,
                "amount": "100.00",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertEqual(
            Donation.objects.count(),
            0,
        )
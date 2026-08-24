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
            administrator=self.admin,
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


class DonationAcknowledgementTests(APITestCase):

    def setUp(self):
        self.donor = User.objects.create_user(
            username="donor1",
            password="test123",
            role=User.Role.DONOR,
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

        self.donation = Donation.objects.create(
            ngo=self.ngo,
            donor=self.donor,
            donor_name="donor1",
            amount=Decimal("1000.00"),
            allocation_details=(
                "Used to purchase food supplies"
            ),
        )

    def test_basic_acknowledgement(self):
        acknowledgement = (
            BasicDonationAcknowledgement()
        )

        result = acknowledgement.generate(
            self.donation
        )

        self.assertEqual(
            result,
            "Donation Amount: ৳1000.00",
        )

    def test_donor_details_decorator(self):
        acknowledgement = (
            BasicDonationAcknowledgement()
        )

        acknowledgement = DonorDetailsDecorator(
            acknowledgement
        )

        result = acknowledgement.generate(
            self.donation
        )

        self.assertIn(
            "Donation Amount: ৳1000.00",
            result,
        )

        self.assertIn(
            "Donor: donor1",
            result,
        )

    def test_ngo_information_decorator(self):
        acknowledgement = (
            BasicDonationAcknowledgement()
        )

        acknowledgement = NGOInformationDecorator(
            acknowledgement
        )

        result = acknowledgement.generate(
            self.donation
        )

        self.assertIn(
            "Donation Amount: ৳1000.00",
            result,
        )

        self.assertIn(
            "NGO: Helping Hands",
            result,
        )

    def test_allocation_details_decorator(self):
        acknowledgement = (
            BasicDonationAcknowledgement()
        )

        acknowledgement = AllocationDetailsDecorator(
            acknowledgement
        )

        result = acknowledgement.generate(
            self.donation
        )

        self.assertIn(
            "Donation Amount: ৳1000.00",
            result,
        )

        self.assertIn(
            "Allocation: "
            "Used to purchase food supplies",
            result,
        )

    def test_multiple_decorators(self):
        acknowledgement = (
            BasicDonationAcknowledgement()
        )

        acknowledgement = DonorDetailsDecorator(
            acknowledgement
        )

        acknowledgement = NGOInformationDecorator(
            acknowledgement
        )

        acknowledgement = AllocationDetailsDecorator(
            acknowledgement
        )

        result = acknowledgement.generate(
            self.donation
        )

        self.assertIn(
            "Donation Amount: ৳1000.00",
            result,
        )

        self.assertIn(
            "Donor: donor1",
            result,
        )

        self.assertIn(
            "NGO: Helping Hands",
            result,
        )

        self.assertIn(
            "Allocation: "
            "Used to purchase food supplies",
            result,
        )

    def test_donor_can_view_acknowledgement(self):
        self.client.force_authenticate(
            user=self.donor
        )

        response = self.client.get(
            reverse(
                "donation-acknowledgement",
                args=[self.donation.id],
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        acknowledgement = (
            response.data["acknowledgement"]
        )

        self.assertIn(
            "Donation Amount: ৳1000.00",
            acknowledgement,
        )

        self.assertIn(
            "Donor: donor1",
            acknowledgement,
        )

        self.assertIn(
            "NGO: Helping Hands",
            acknowledgement,
        )

        self.assertIn(
            "Allocation: "
            "Used to purchase food supplies",
            acknowledgement,
        )

    def test_unauthorized_user_cannot_view_acknowledgement(
        self,
    ):
        other_user = User.objects.create_user(
            username="other",
            password="test123",
            role=User.Role.DONOR,
        )

        self.client.force_authenticate(
            user=other_user
        )

        response = self.client.get(
            reverse(
                "donation-acknowledgement",
                args=[self.donation.id],
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )
from django.urls import reverse

from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User
from volunteering.models import VolunteerProfile


class AuthenticationAPITests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            password="test123",
            first_name="Test",
            last_name="User",
            role=User.Role.VOLUNTEER,
        )

    def test_user_can_login_with_correct_credentials(self):
        response = self.client.post(
            reverse("login"),
            {
                "username": "testuser",
                "password": "test123",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertIn("token", response.data)
        self.assertIn("user", response.data)

    def test_login_fails_with_wrong_password(self):
        response = self.client.post(
            reverse("login"),
            {
                "username": "testuser",
                "password": "wrongpassword",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_login_requires_username_and_password(self):
        response = self.client.post(
            reverse("login"),
            {},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_authenticated_user_can_view_me(self):
        self.client.force_authenticate(
            user=self.user
        )

        response = self.client.get(
            reverse("current-user")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["username"],
            "testuser",
        )

    def test_unauthenticated_user_cannot_view_me(self):
        response = self.client.get(
            reverse("current-user")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )
        
    def test_volunteer_can_register(self):
        response = self.client.post(
            reverse("register"),
            {
                "username": "newvolunteer",
                "email": "new@example.com",
                "password": "testpass123",
                "first_name": "New",
                "last_name": "Volunteer",
                "role": User.Role.VOLUNTEER,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertIn("token", response.data)

        self.assertTrue(
            VolunteerProfile.objects.filter(
                user__username="newvolunteer"
            ).exists()
        )


    def test_donor_can_register(self):
        response = self.client.post(
            reverse("register"),
            {
                "username": "newdonor",
                "email": "donor@example.com",
                "password": "testpass123",
                "role": User.Role.DONOR,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )


    def test_user_cannot_self_register_as_ngo_admin(self):
        response = self.client.post(
            reverse("register"),
            {
                "username": "fakeadmin",
                "email": "fake@example.com",
                "password": "testpass123",
                "role": User.Role.NGO_ADMIN,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertFalse(
            User.objects.filter(
                username="fakeadmin"
            ).exists()
        )
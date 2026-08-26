from django.urls import reverse

from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from accounts.models import User


class LogoutAPITests(APITestCase):

    def setUp(self):

        self.user = User.objects.create_user(
            username="logoutuser",
            password="test123",
            role=User.Role.VOLUNTEER,
        )

        self.token = Token.objects.create(
            user=self.user
        )


    def test_authenticated_user_can_logout(self):

        self.client.credentials(
            HTTP_AUTHORIZATION=(
                f"Token {self.token.key}"
            )
        )

        response = self.client.post(
            reverse("logout")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertFalse(
            Token.objects.filter(
                user=self.user
            ).exists()
        )


    def test_old_token_cannot_be_used_after_logout(self):

        old_token = self.token.key

        self.client.credentials(
            HTTP_AUTHORIZATION=(
                f"Token {old_token}"
            )
        )

        self.client.post(
            reverse("logout")
        )

        # Try using the same deleted token again.
        self.client.credentials(
            HTTP_AUTHORIZATION=(
                f"Token {old_token}"
            )
        )

        response = self.client.get(
            reverse("current-user")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )


    def test_unauthenticated_user_cannot_logout(self):

        response = self.client.post(
            reverse("logout")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )
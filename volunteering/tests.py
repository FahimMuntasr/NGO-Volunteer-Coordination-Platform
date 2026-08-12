from django.urls import reverse

from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User

from .models import Skill, VolunteerProfile


class VolunteerProfileAPITests(APITestCase):

    def setUp(self):
        self.volunteer_user = User.objects.create_user(
            username="volunteer1",
            password="test123",
            first_name="Test",
            last_name="Volunteer",
            email="volunteer@example.com",
            role=User.Role.VOLUNTEER,
        )

        self.volunteer, _ = VolunteerProfile.objects.get_or_create(
            user=self.volunteer_user,
        )

        self.admin = User.objects.create_user(
            username="admin1",
            password="test123",
            role=User.Role.NGO_ADMIN,
        )

        self.skill1 = Skill.objects.create(
            name="Teaching"
        )

        self.skill2 = Skill.objects.create(
            name="First Aid"
        )

    def test_volunteer_can_view_profile(self):
        self.client.force_authenticate(
            user=self.volunteer_user
        )

        response = self.client.get(
            reverse("volunteer-profile-me")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["username"],
            "volunteer1",
        )

    def test_volunteer_can_update_skills(self):
        self.client.force_authenticate(
            user=self.volunteer_user
        )

        response = self.client.patch(
            reverse("volunteer-profile-me"),
            {
                "skill_ids": [
                    self.skill1.id,
                    self.skill2.id,
                ],
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.volunteer.refresh_from_db()

        self.assertEqual(
            self.volunteer.skills.count(),
            2,
        )

    def test_volunteer_can_update_availability(self):
        self.client.force_authenticate(
            user=self.volunteer_user
        )

        response = self.client.patch(
            reverse("volunteer-profile-me"),
            {
                "availability_notes": (
                    "Available Fridays and weekends"
                ),
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.volunteer.refresh_from_db()

        self.assertEqual(
            self.volunteer.availability_notes,
            "Available Fridays and weekends",
        )

    def test_volunteer_cannot_change_total_hours(self):
        self.client.force_authenticate(
            user=self.volunteer_user
        )

        self.client.patch(
            reverse("volunteer-profile-me"),
            {
                "total_hours": 999,
            },
            format="json",
        )

        self.volunteer.refresh_from_db()

        self.assertEqual(
            self.volunteer.total_hours,
            0,
        )

    def test_ngo_admin_cannot_access_volunteer_profile(self):
        self.client.force_authenticate(
            user=self.admin
        )

        response = self.client.get(
            reverse("volunteer-profile-me")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_authenticated_user_can_view_skills(self):
        self.client.force_authenticate(
            user=self.volunteer_user
        )

        response = self.client.get(
            reverse("skill-list")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            len(response.data),
            2,
        )
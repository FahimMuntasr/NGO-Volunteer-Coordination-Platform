from django.urls import reverse

from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User

from .models import Skill, VolunteerProfile
from datetime import timedelta
from decimal import Decimal

from django.utils import timezone

from organizations.models import NGO
from events.models import Event, Registration


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
        
class VolunteerHistoryTests(APITestCase):

    def setUp(self):
        self.admin = User.objects.create_user(
            username="admin1",
            password="test123",
            role=User.Role.NGO_ADMIN,
        )

        self.user1 = User.objects.create_user(
            username="volunteer1",
            password="test123",
            first_name="Alice",
            last_name="Volunteer",
            role=User.Role.VOLUNTEER,
        )

        self.user2 = User.objects.create_user(
            username="volunteer2",
            password="test123",
            first_name="Bob",
            last_name="Volunteer",
            role=User.Role.VOLUNTEER,
        )

        self.volunteer1, _ = (
            VolunteerProfile.objects.get_or_create(
                user=self.user1,
            )
        )

        self.volunteer2, _ = (
            VolunteerProfile.objects.get_or_create(
                user=self.user2,
            )
        )

        self.volunteer1.total_hours = 10
        self.volunteer1.completed_events = 3
        self.volunteer1.save()

        self.volunteer2.total_hours = 5
        self.volunteer2.completed_events = 2
        self.volunteer2.save()

        self.ngo = NGO.objects.create(
            name="Helping Hands",
            email="helpinghands@example.com",
            administrator=self.admin,
        )

        start = timezone.now() - timedelta(days=2)
        end = start + timedelta(hours=3)
        deadline = start - timedelta(days=1)

        self.event = Event.objects.create(
            ngo=self.ngo,
            created_by=self.admin,
            title="Community Cleanup",
            description="Cleanup event.",
            location="Dhaka",
            start_date=start,
            end_date=end,
            registration_deadline=deadline,
            volunteer_capacity=20,
            status=Event.Status.COMPLETED,
        )

        self.registration = Registration.objects.create(
            event=self.event,
            volunteer=self.volunteer1,
            status=Registration.Status.COMPLETED,
            attendance_status=(
                Registration.AttendanceStatus.PRESENT
            ),
            hours_earned=Decimal("3.00"),
        )

    def test_volunteer_can_view_completed_history(self):
        self.client.force_authenticate(
            user=self.user1
        )

        response = self.client.get(
            reverse("volunteer-history")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            len(response.data),
            1,
        )

        self.assertEqual(
            response.data[0]["event_title"],
            "Community Cleanup",
        )

        self.assertEqual(
            response.data[0]["hours_earned"],
            "3.00",
        )

    def test_volunteer_does_not_see_other_history(self):
        Registration.objects.create(
            event=self.event,
            volunteer=self.volunteer2,
            status=Registration.Status.COMPLETED,
            attendance_status=(
                Registration.AttendanceStatus.PRESENT
            ),
            hours_earned=Decimal("3.00"),
        )

        self.client.force_authenticate(
            user=self.user1
        )

        response = self.client.get(
            reverse("volunteer-history")
        )

        self.assertEqual(
            len(response.data),
            1,
        )

    def test_ngo_admin_cannot_view_volunteer_history(self):
        self.client.force_authenticate(
            user=self.admin
        )

        response = self.client.get(
            reverse("volunteer-history")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )
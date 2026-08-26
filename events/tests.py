from datetime import timedelta

from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from django.core.exceptions import PermissionDenied, ValidationError
from django.db import IntegrityError, transaction
from decimal import Decimal

from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User
from organizations.models import NGO

from .models import (
    Event,
    Registration,
    Team,
    TeamMembership,
)

from rest_framework.exceptions import (
    ValidationError as DRFValidationError,
)

from .registration_decorators import (
    BasicRegistrationService,
    CapacityDecorator,
    DuplicateRegistrationDecorator,
    EventOpenDecorator,
    RegistrationDeadlineDecorator,
    RegistrationService,
)

from accounts.models import User
from events.models import Event, Registration
from events.services import ProxyEventService, RealEventService
from notifications.models import Notification
from volunteering.models import VolunteerProfile


class EventCreationTests(APITestCase):

    def setUp(self):
        self.admin = User.objects.create_user(
            username="admin1",
            password="test123",
            role=User.Role.NGO_ADMIN,
        )

        self.volunteer = User.objects.create_user(
            username="volunteer1",
            password="test123",
            role=User.Role.VOLUNTEER,
        )

        self.ngo = NGO.objects.create(
            name="Helping Hands",
            email="helpinghands@example.com",
            administrator=self.admin,
            is_verified=True,
        )
        self.now = timezone.now()
        self.start = timezone.now() + timedelta(days=10)
        self.end = self.start + timedelta(hours=3)
        self.deadline = self.start - timedelta(days=1)

        self.valid_data = {
            "title": "Community Cleanup",
            "description": "Clean up the local area.",
            "location": "Dhaka",
            "start_date": self.start.isoformat(),
            "end_date": self.end.isoformat(),
            "registration_deadline": self.deadline.isoformat(),
            "volunteer_capacity": 20,
        }

    def test_ngo_admin_can_create_event(self):
        self.client.force_authenticate(
            user=self.admin
        )

        response = self.client.post(
            reverse("event-create"),
            self.valid_data,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertEqual(Event.objects.count(), 1)

        event = Event.objects.first()

        self.assertEqual(
            event.created_by,
            self.admin,
        )

        self.assertEqual(
            event.ngo,
            self.ngo,
        )

    def test_event_can_be_created_without_a_coordinator(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.post(
            reverse("event-create"),
            self.valid_data,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        event = Event.objects.get(pk=response.data["id"])

        self.assertIsNone(event.coordinator)

    def test_ngo_admin_can_assign_coordinator_during_creation(self):
        coordinator = User.objects.create_user(
            username="coordinator1",
            password="test123",
            role=User.Role.COORDINATOR,
        )

        self.client.force_authenticate(user=self.admin)

        response = self.client.post(
            reverse("event-create"),
            {
                **self.valid_data,
                "coordinator_id": coordinator.id,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        event = Event.objects.get(pk=response.data["id"])

        self.assertEqual(event.coordinator, coordinator)

    def test_only_a_coordinator_role_user_can_be_assigned_at_creation(self):
        non_coordinator = User.objects.create_user(
            username="volunteer2",
            password="test123",
            role=User.Role.VOLUNTEER,
        )

        self.client.force_authenticate(user=self.admin)

        response = self.client.post(
            reverse("event-create"),
            {
                **self.valid_data,
                "coordinator_id": non_coordinator.id,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_volunteer_cannot_create_event(self):
        self.client.force_authenticate(
            user=self.volunteer
        )

        response = self.client.post(
            reverse("event-create"),
            self.valid_data,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

        self.assertEqual(Event.objects.count(), 0)

    def test_event_end_date_must_be_after_start_date(self):
        self.client.force_authenticate(
            user=self.admin
        )

        invalid_data = self.valid_data.copy()

        invalid_data["end_date"] = (
            self.start - timedelta(hours=1)
        ).isoformat()

        response = self.client.post(
            reverse("event-create"),
            invalid_data,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertIn(
            "end_date",
            response.data,
        )

        self.assertEqual(Event.objects.count(), 0)
        
    def test_event_status_cannot_be_set_during_creation(self):
        self.client.force_authenticate(
            user=self.admin
        )

        data = self.valid_data.copy()
        data["status"] = Event.Status.COMPLETED

        response = self.client.post(
            reverse("event-create"),
            data,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        event = Event.objects.first()

        self.assertEqual(
            event.status,
            Event.Status.DRAFT,
        )
    
    def test_unverified_ngo_cannot_create_event(self):
        self.ngo.is_verified = False
        self.ngo.save(
            update_fields=["is_verified"]
        )

        self.client.force_authenticate(
            user=self.admin
        )

        response = self.client.post(
            reverse("event-create"),
            self.valid_data,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

        self.assertEqual(
            Event.objects.count(),
            0,
        )
        
    def test_event_start_date_cannot_be_in_past(self):

        self.client.force_authenticate(
            user=self.admin
        )

        past_start = (
            timezone.now()
            - timedelta(days=2)
        )

        past_end = (
            timezone.now()
            - timedelta(days=1)
        )

        past_deadline = (
            timezone.now()
            - timedelta(days=3)
        )

        invalid_data = {
            "title": "Past Event",
            "description": "Invalid past event.",
            "location": "Dhaka",
            "start_date": past_start.isoformat(),
            "end_date": past_end.isoformat(),
            "registration_deadline": (
                past_deadline.isoformat()
            ),
            "volunteer_capacity": 20,
        }

        response = self.client.post(
            reverse("event-create"),
            invalid_data,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertIn(
            "start_date",
            response.data,
        )

        self.assertEqual(
            Event.objects.count(),
            0,
        )
        
    def test_registration_deadline_cannot_be_in_past(
    self
):

        self.client.force_authenticate(
            user=self.admin
        )

        invalid_data = self.valid_data.copy()

        invalid_data[
            "registration_deadline"
        ] = (
            timezone.now()
            - timedelta(hours=1)
        ).isoformat()

        response = self.client.post(
            reverse("event-create"),
            invalid_data,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertIn(
            "registration_deadline",
            response.data,
        )

        self.assertEqual(
            Event.objects.count(),
            0,
        )
            
class EventRegistrationTests(APITestCase):

    def setUp(self):
        self.admin = User.objects.create_user(
            username="admin1",
            password="test123",
            role=User.Role.NGO_ADMIN,
        )

        self.volunteer_user = User.objects.create_user(
            username="volunteer1",
            password="test123",
            role=User.Role.VOLUNTEER,
        )

        self.volunteer, _ = VolunteerProfile.objects.get_or_create(
            user=self.volunteer_user,
        )

        self.ngo = NGO.objects.create(
            name="Helping Hands",
            email="helpinghands@example.com",
            administrator=self.admin,
        )

        self.start = timezone.now() + timedelta(days=10)
        self.end = self.start + timedelta(hours=3)
        self.deadline = self.start - timedelta(days=1)

        self.event = Event.objects.create(
            ngo=self.ngo,
            created_by=self.admin,
            title="Community Cleanup",
            description="Clean up the local area.",
            location="Dhaka",
            start_date=self.start,
            end_date=self.end,
            registration_deadline=self.deadline,
            volunteer_capacity=20,
            status=Event.Status.OPEN,
        )

    def test_volunteer_can_register_for_open_event(self):
        self.client.force_authenticate(
            user=self.volunteer_user
        )

        response = self.client.post(
            reverse(
                "event-register",
                args=[self.event.id],
            ),
            {},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertEqual(
            Registration.objects.count(),
            1,
        )

        registration = Registration.objects.first()

        self.assertEqual(
            registration.volunteer,
            self.volunteer,
        )

        self.assertEqual(
            registration.event,
            self.event,
        )

    def test_ngo_admin_cannot_register_for_event(self):
        self.client.force_authenticate(
            user=self.admin
        )

        response = self.client.post(
            reverse(
                "event-register",
                args=[self.event.id],
            ),
            {},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

        self.assertEqual(
            Registration.objects.count(),
            0,
        )

    def test_volunteer_cannot_register_for_draft_event(self):
        self.event.status = Event.Status.DRAFT
        self.event.save(update_fields=["status"])

        self.client.force_authenticate(
            user=self.volunteer_user
        )

        response = self.client.post(
            reverse(
                "event-register",
                args=[self.event.id],
            ),
            {},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertEqual(
            Registration.objects.count(),
            0,
        )

    def test_volunteer_cannot_register_after_deadline(self):
        self.event.registration_deadline = (
            timezone.now() - timedelta(hours=1)
        )

        self.event.save(
            update_fields=["registration_deadline"]
        )

        self.client.force_authenticate(
            user=self.volunteer_user
        )

        response = self.client.post(
            reverse(
                "event-register",
                args=[self.event.id],
            ),
            {},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertEqual(
            Registration.objects.count(),
            0,
        )
        
    def test_duplicate_registration_is_blocked(self):
        Registration.objects.create(
            volunteer=self.volunteer,
            event=self.event,
        )

        self.client.force_authenticate(
            user=self.volunteer_user
        )

        response = self.client.post(
            reverse(
                "event-register",
                args=[self.event.id],
            ),
            {},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertEqual(
            Registration.objects.count(),
            1,
        )
    
    def test_volunteer_without_profile_cannot_register(self):
        user_without_profile = User.objects.create_user(
            username="volunteer2",
            password="test123",
            role=User.Role.VOLUNTEER,
        )

        self.client.force_authenticate(
            user=user_without_profile
        )

        response = self.client.post(
            reverse(
                "event-register",
                args=[self.event.id],
            ),
            {},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )
        
    def test_registration_blocked_when_event_is_full(self):
        self.event.volunteer_capacity = 1
        self.event.save(
            update_fields=["volunteer_capacity"]
        )

        other_user = User.objects.create_user(
            username="volunteer2",
            password="test123",
            role=User.Role.VOLUNTEER,
        )

        other_volunteer, _ = (
            VolunteerProfile.objects.get_or_create(
                user=other_user,
            )
        )

        Registration.objects.create(
            volunteer=other_volunteer,
            event=self.event,
            status=Registration.Status.APPROVED,
        )

        self.client.force_authenticate(
            user=self.volunteer_user
        )

        response = self.client.post(
            reverse(
                "event-register",
                args=[self.event.id],
            ),
            {},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

class RegistrationApprovalTests(APITestCase):

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

        self.volunteer, _ = VolunteerProfile.objects.get_or_create(
            user=self.volunteer_user,
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

        self.event = Event.objects.create(
            ngo=self.ngo,
            created_by=self.admin,
            title="Community Cleanup",
            description="Clean up the local area.",
            location="Dhaka",
            start_date=start,
            end_date=end,
            registration_deadline=deadline,
            volunteer_capacity=5,
            status=Event.Status.OPEN,
        )

        self.registration = Registration.objects.create(
            event=self.event,
            volunteer=self.volunteer,
            status=Registration.Status.PENDING,
        )
    
    def test_correct_ngo_admin_can_approve_registration(self):
        self.client.force_authenticate(
            user=self.admin
        )

        response = self.client.post(
            reverse(
                "registration-approve",
                args=[self.registration.id],
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.registration.refresh_from_db()

        self.assertEqual(
            self.registration.status,
            Registration.Status.APPROVED,
        )

        self.assertIsNotNone(
            self.registration.approved_at
        )
        
    def test_wrong_ngo_admin_cannot_approve_registration(self):
        self.client.force_authenticate(
            user=self.other_admin
        )

        response = self.client.post(
            reverse(
                "registration-approve",
                args=[self.registration.id],
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

        self.registration.refresh_from_db()

        self.assertEqual(
            self.registration.status,
            Registration.Status.PENDING,
        )
    
    def test_only_pending_registration_can_be_approved(self):
        self.registration.status = (
            Registration.Status.APPROVED
        )

        self.registration.save(
            update_fields=["status"]
        )

        self.client.force_authenticate(
            user=self.admin
        )

        response = self.client.post(
            reverse(
                "registration-approve",
                args=[self.registration.id],
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )
        
    def test_cannot_approve_when_event_is_full(self):
        self.event.volunteer_capacity = 1

        self.event.save(
            update_fields=["volunteer_capacity"]
        )

        other_user = User.objects.create_user(
            username="volunteer2",
            password="test123",
            role=User.Role.VOLUNTEER,
        )

        other_volunteer, _ = (
            VolunteerProfile.objects.get_or_create(
                user=other_user,
            )
        )

        Registration.objects.create(
            event=self.event,
            volunteer=other_volunteer,
            status=Registration.Status.APPROVED,
        )

        self.client.force_authenticate(
            user=self.admin
        )

        response = self.client.post(
            reverse(
                "registration-approve",
                args=[self.registration.id],
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.registration.refresh_from_db()

        self.assertEqual(
            self.registration.status,
            Registration.Status.PENDING,
        )
        
class RegistrationRejectionTests(APITestCase):

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

        self.volunteer, _ = VolunteerProfile.objects.get_or_create(
            user=self.volunteer_user,
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

        self.event = Event.objects.create(
            ngo=self.ngo,
            created_by=self.admin,
            title="Community Cleanup",
            description="Clean up the local area.",
            location="Dhaka",
            start_date=start,
            end_date=end,
            registration_deadline=deadline,
            volunteer_capacity=5,
            status=Event.Status.OPEN,
        )

        self.registration = Registration.objects.create(
            event=self.event,
            volunteer=self.volunteer,
            status=Registration.Status.PENDING,
        )
        
    def test_correct_ngo_admin_can_reject_registration(self):
        self.client.force_authenticate(
            user=self.admin
        )

        response = self.client.post(
            reverse(
                "registration-reject",
                args=[self.registration.id],
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.registration.refresh_from_db()

        self.assertEqual(
            self.registration.status,
            Registration.Status.REJECTED,
        )
    def test_wrong_ngo_admin_cannot_reject_registration(self):
        self.client.force_authenticate(
            user=self.other_admin
        )

        response = self.client.post(
            reverse(
                "registration-reject",
                args=[self.registration.id],
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

        self.registration.refresh_from_db()

        self.assertEqual(
            self.registration.status,
            Registration.Status.PENDING,
        )
    def test_only_pending_registration_can_be_rejected(self):
        self.registration.status = (
            Registration.Status.APPROVED
        )

        self.registration.save(
            update_fields=["status"]
        )

        self.client.force_authenticate(
            user=self.admin
        )

        response = self.client.post(
            reverse(
                "registration-reject",
                args=[self.registration.id],
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.registration.refresh_from_db()

        self.assertEqual(
            self.registration.status,
            Registration.Status.APPROVED,
        )
        
class CoordinatorAssignmentTests(APITestCase):

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

        self.coordinator = User.objects.create_user(
            username="coordinator1",
            password="test123",
            role=User.Role.COORDINATOR,
        )

        self.volunteer_user = User.objects.create_user(
            username="volunteer1",
            password="test123",
            role=User.Role.VOLUNTEER,
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

        self.event = Event.objects.create(
            ngo=self.ngo,
            created_by=self.admin,
            title="Community Cleanup",
            description="Clean up the local area.",
            location="Dhaka",
            start_date=start,
            end_date=end,
            registration_deadline=deadline,
            volunteer_capacity=20,
            status=Event.Status.OPEN,
        )
    def test_correct_admin_can_assign_coordinator(self):
        self.client.force_authenticate(
            user=self.admin
        )

        response = self.client.post(
            reverse(
                "assign-coordinator",
                args=[self.event.id],
            ),
            {
                "coordinator_id": self.coordinator.id,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.event.refresh_from_db()

        self.assertEqual(
            self.event.coordinator,
            self.coordinator,
        )
    def test_wrong_admin_cannot_assign_coordinator(self):
        self.client.force_authenticate(
            user=self.other_admin
        )

        response = self.client.post(
            reverse(
                "assign-coordinator",
                args=[self.event.id],
            ),
            {
                "coordinator_id": self.coordinator.id,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

        self.event.refresh_from_db()

        self.assertIsNone(
            self.event.coordinator
        )
    def test_non_coordinator_user_cannot_be_assigned(self):
        self.client.force_authenticate(
            user=self.admin
        )

        response = self.client.post(
            reverse(
                "assign-coordinator",
                args=[self.event.id],
            ),
            {
                "coordinator_id": self.volunteer_user.id,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

        self.event.refresh_from_db()

        self.assertIsNone(
            self.event.coordinator
        )

    def test_reassigning_a_coordinator_requires_a_reason(self):
        self.event.coordinator = self.coordinator
        self.event.save(update_fields=["coordinator"])

        new_coordinator = User.objects.create_user(
            username="coordinator2",
            password="test123",
            role=User.Role.COORDINATOR,
        )

        self.client.force_authenticate(user=self.admin)

        response = self.client.post(
            reverse(
                "assign-coordinator",
                args=[self.event.id],
            ),
            {
                "coordinator_id": new_coordinator.id,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.event.refresh_from_db()

        self.assertEqual(
            self.event.coordinator,
            self.coordinator,
        )

    def test_reassigning_notifies_both_old_and_new_coordinator(self):
        self.event.coordinator = self.coordinator
        self.event.save(update_fields=["coordinator"])

        new_coordinator = User.objects.create_user(
            username="coordinator2",
            password="test123",
            role=User.Role.COORDINATOR,
        )

        self.client.force_authenticate(user=self.admin)

        response = self.client.post(
            reverse(
                "assign-coordinator",
                args=[self.event.id],
            ),
            {
                "coordinator_id": new_coordinator.id,
                "reason": (
                    "Reassigning for load balancing - the new "
                    "coordinator lives closer to the venue."
                ),
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.event.refresh_from_db()

        self.assertEqual(
            self.event.coordinator,
            new_coordinator,
        )

        removed_notification = Notification.objects.get(
            recipient=self.coordinator,
            notification_type=(
                Notification.Type.COORDINATOR_REMOVED
            ),
        )

        self.assertIn(
            "load balancing",
            removed_notification.message,
        )

        assigned_notification = Notification.objects.get(
            recipient=new_coordinator,
            notification_type=(
                Notification.Type.COORDINATOR_ASSIGNED
            ),
        )

        self.assertEqual(
            assigned_notification.event,
            self.event,
        )

    def test_reassigning_same_coordinator_is_a_no_op(self):
        self.event.coordinator = self.coordinator
        self.event.save(update_fields=["coordinator"])

        self.client.force_authenticate(user=self.admin)

        response = self.client.post(
            reverse(
                "assign-coordinator",
                args=[self.event.id],
            ),
            {
                "coordinator_id": self.coordinator.id,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertFalse(
            Notification.objects.filter(
                notification_type=(
                    Notification.Type.COORDINATOR_REMOVED
                ),
            ).exists()
        )

    def test_assigned_coordinator_can_view_registrations(self):
        self.event.coordinator = self.coordinator
        self.event.save(
            update_fields=["coordinator"]
        )

        volunteer_profile, _ = (
            VolunteerProfile.objects.get_or_create(
                user=self.volunteer_user,
            )
        )

        Registration.objects.create(
            event=self.event,
            volunteer=volunteer_profile,
            status=Registration.Status.APPROVED,
        )

        self.client.force_authenticate(
            user=self.coordinator
        )

        response = self.client.get(
            reverse(
                "event-registration-list",
                args=[self.event.id],
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            len(response.data),
            1,
        )

class TeamTests(APITestCase):

    def setUp(self):
        self.admin = User.objects.create_user(
            username="admin1",
            password="test123",
            role=User.Role.NGO_ADMIN,
        )

        self.coordinator = User.objects.create_user(
            username="coordinator1",
            password="test123",
            role=User.Role.COORDINATOR,
        )

        self.volunteer_user = User.objects.create_user(
            username="volunteer1",
            password="test123",
            role=User.Role.VOLUNTEER,
        )

        self.volunteer, _ = VolunteerProfile.objects.get_or_create(
            user=self.volunteer_user,
        )

        self.ngo = NGO.objects.create(
            name="Helping Hands",
            email="helpinghands@example.com",
            administrator=self.admin,
        )

        start = timezone.now() + timedelta(days=10)
        end = start + timedelta(hours=3)
        deadline = start - timedelta(days=1)

        self.event = Event.objects.create(
            ngo=self.ngo,
            created_by=self.admin,
            coordinator=self.coordinator,
            title="Community Cleanup",
            description="Clean up the local area.",
            location="Dhaka",
            start_date=start,
            end_date=end,
            registration_deadline=deadline,
            volunteer_capacity=20,
            status=Event.Status.OPEN,
        )

        self.registration = Registration.objects.create(
            event=self.event,
            volunteer=self.volunteer,
            status=Registration.Status.APPROVED,
        )

    def test_ngo_admin_can_create_team(self):
        self.client.force_authenticate(
            user=self.admin
        )

        response = self.client.post(
            reverse(
                "event-teams",
                args=[self.event.id],
            ),
            {
                "name": "Logistics Team",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertEqual(
            Team.objects.count(),
            1,
        )

        self.assertEqual(
            Team.objects.first().name,
            "Logistics Team",
        )

    def test_assigned_coordinator_can_create_team(self):
        self.client.force_authenticate(
            user=self.coordinator
        )

        response = self.client.post(
            reverse(
                "event-teams",
                args=[self.event.id],
            ),
            {
                "name": "Registration Team",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertEqual(
            Team.objects.count(),
            1,
        )

    def test_volunteer_cannot_create_team(self):
        self.client.force_authenticate(
            user=self.volunteer_user
        )

        response = self.client.post(
            reverse(
                "event-teams",
                args=[self.event.id],
            ),
            {
                "name": "Unauthorized Team",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

        self.assertEqual(
            Team.objects.count(),
            0,
        )

    def test_approved_volunteer_can_be_added_to_team(self):
        team = Team.objects.create(
            event=self.event,
            name="Logistics Team",
        )

        self.client.force_authenticate(
            user=self.admin
        )

        response = self.client.post(
            reverse(
                "add-team-member",
                args=[team.id],
            ),
            {
                "volunteer_id": self.volunteer.id,
                "assigned_task": "Manage supplies",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertEqual(
            TeamMembership.objects.count(),
            1,
        )

        membership = TeamMembership.objects.first()

        self.assertEqual(
            membership.volunteer,
            self.volunteer,
        )

        self.assertEqual(
            membership.assigned_task,
            "Manage supplies",
        )

    def test_non_approved_volunteer_cannot_be_added(self):
        self.registration.status = (
            Registration.Status.PENDING
        )

        self.registration.save(
            update_fields=["status"]
        )

        team = Team.objects.create(
            event=self.event,
            name="Logistics Team",
        )

        self.client.force_authenticate(
            user=self.admin
        )

        response = self.client.post(
            reverse(
                "add-team-member",
                args=[team.id],
            ),
            {
                "volunteer_id": self.volunteer.id,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

        self.assertEqual(
            TeamMembership.objects.count(),
            0,
        )

    def test_volunteer_cannot_join_two_teams_same_event(self):
        team1 = Team.objects.create(
            event=self.event,
            name="Logistics Team",
        )

        team2 = Team.objects.create(
            event=self.event,
            name="Registration Team",
        )

        TeamMembership.objects.create(
            team=team1,
            volunteer=self.volunteer,
        )

        self.client.force_authenticate(
            user=self.admin
        )

        response = self.client.post(
            reverse(
                "add-team-member",
                args=[team2.id],
            ),
            {
                "volunteer_id": self.volunteer.id,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertEqual(
            TeamMembership.objects.filter(
                volunteer=self.volunteer
            ).count(),
            1,
        )
        
    def test_approved_volunteer_can_be_team_leader(self):

        self.client.force_authenticate(
            user=self.admin
        )

        response = self.client.post(
            reverse(
                "event-teams",
                args=[self.event.id],
            ),
            {
                "name": "Logistics Team",
                "leader": self.volunteer.id,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        team = Team.objects.get(
            pk=response.data["id"]
        )

        self.assertEqual(
            team.leader,
            self.volunteer,
        )
        
    def test_non_approved_volunteer_cannot_be_team_leader(
    self
):

        self.registration.status = (
            Registration.Status.PENDING
        )

        self.registration.save(
            update_fields=["status"]
        )

        self.client.force_authenticate(
            user=self.admin
        )

        response = self.client.post(
            reverse(
                "event-teams",
                args=[self.event.id],
            ),
            {
                "name": "Logistics Team",
                "leader": self.volunteer.id,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertIn(
            "leader",
            response.data,
        )

        self.assertEqual(
            Team.objects.count(),
            0,
        )
        
    def test_volunteer_from_other_event_cannot_be_team_leader(
    self
):

        other_volunteer_user = User.objects.create_user(
            username="other_volunteer",
            password="test123",
            role=User.Role.VOLUNTEER,
        )

        other_volunteer, _ = (
            VolunteerProfile.objects.get_or_create(
                user=other_volunteer_user
            )
        )

        other_event = Event.objects.create(
            ngo=self.ngo,
            created_by=self.admin,
            title="Other Event",
            description="Another event.",
            location="Dhaka",
            start_date=(
                self.event.start_date
                + timedelta(days=5)
            ),
            end_date=(
                self.event.end_date
                + timedelta(days=5)
            ),
            registration_deadline=(
                self.event.registration_deadline
                + timedelta(days=5)
            ),
            volunteer_capacity=10,
            status=Event.Status.OPEN,
        )

        Registration.objects.create(
            event=other_event,
            volunteer=other_volunteer,
            status=Registration.Status.APPROVED,
        )

        self.client.force_authenticate(
            user=self.admin
        )

        response = self.client.post(
            reverse(
                "event-teams",
                args=[self.event.id],
            ),
            {
                "name": "Logistics Team",
                "leader": other_volunteer.id,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertIn(
            "leader",
            response.data,
        )

        self.assertEqual(
            Team.objects.count(),
            0,
        )
        
class AttendanceTests(APITestCase):

    def setUp(self):
        self.admin = User.objects.create_user(
            username="admin1",
            password="test123",
            role=User.Role.NGO_ADMIN,
        )

        self.coordinator = User.objects.create_user(
            username="coordinator1",
            password="test123",
            role=User.Role.COORDINATOR,
        )

        self.volunteer_user = User.objects.create_user(
            username="volunteer1",
            password="test123",
            role=User.Role.VOLUNTEER,
        )

        self.volunteer, _ = VolunteerProfile.objects.get_or_create(
            user=self.volunteer_user,
        )

        self.ngo = NGO.objects.create(
            name="Helping Hands",
            email="helpinghands@example.com",
            administrator=self.admin,
        )

        start = timezone.now() + timedelta(days=10)
        end = start + timedelta(hours=3)
        deadline = start - timedelta(days=1)

        self.event = Event.objects.create(
            ngo=self.ngo,
            created_by=self.admin,
            coordinator=self.coordinator,
            title="Community Cleanup",
            description="Clean up the local area.",
            location="Dhaka",
            start_date=start,
            end_date=end,
            registration_deadline=deadline,
            volunteer_capacity=20,
            status=Event.Status.IN_PROGRESS,
        )

        self.registration = Registration.objects.create(
            event=self.event,
            volunteer=self.volunteer,
            status=Registration.Status.APPROVED,
        )

    def test_ngo_admin_can_mark_present(self):
        self.client.force_authenticate(
            user=self.admin
        )

        response = self.client.post(
            reverse(
                "registration-attendance",
                args=[self.registration.id],
            ),
            {
                "attendance_status": (
                    Registration.AttendanceStatus.PRESENT
                ),
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.registration.refresh_from_db()

        self.assertEqual(
            self.registration.attendance_status,
            Registration.AttendanceStatus.PRESENT,
        )

    def test_assigned_coordinator_can_mark_attendance(self):
        self.client.force_authenticate(
            user=self.coordinator
        )

        response = self.client.post(
            reverse(
                "registration-attendance",
                args=[self.registration.id],
            ),
            {
                "attendance_status": (
                    Registration.AttendanceStatus.ABSENT
                ),
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.registration.refresh_from_db()

        self.assertEqual(
            self.registration.attendance_status,
            Registration.AttendanceStatus.ABSENT,
        )

    def test_volunteer_cannot_mark_attendance(self):
        self.client.force_authenticate(
            user=self.volunteer_user
        )

        response = self.client.post(
            reverse(
                "registration-attendance",
                args=[self.registration.id],
            ),
            {
                "attendance_status": (
                    Registration.AttendanceStatus.PRESENT
                ),
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

        self.registration.refresh_from_db()

        self.assertEqual(
            self.registration.attendance_status,
            Registration.AttendanceStatus.NOT_MARKED,
        )

    def test_pending_registration_cannot_have_attendance_marked(self):
        self.registration.status = (
            Registration.Status.PENDING
        )

        self.registration.save(
            update_fields=["status"]
        )

        self.client.force_authenticate(
            user=self.admin
        )

        response = self.client.post(
            reverse(
                "registration-attendance",
                args=[self.registration.id],
            ),
            {
                "attendance_status": (
                    Registration.AttendanceStatus.PRESENT
                ),
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.registration.refresh_from_db()

        self.assertEqual(
            self.registration.attendance_status,
            Registration.AttendanceStatus.NOT_MARKED,
        )

    def test_invalid_attendance_status_is_rejected(self):
        self.client.force_authenticate(
            user=self.admin
        )

        response = self.client.post(
            reverse(
                "registration-attendance",
                args=[self.registration.id],
            ),
            {
                "attendance_status": "LATE",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.registration.refresh_from_db()

        self.assertEqual(
            self.registration.attendance_status,
            Registration.AttendanceStatus.NOT_MARKED,
        )
        
class EventStatusTests(APITestCase):

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

        self.event = Event.objects.create(
            ngo=self.ngo,
            created_by=self.admin,
            title="Community Cleanup",
            description="Clean up the local area.",
            location="Dhaka",
            start_date=start,
            end_date=end,
            registration_deadline=deadline,
            volunteer_capacity=20,
            status=Event.Status.DRAFT,
        )

    def test_draft_event_can_be_opened(self):
        self.client.force_authenticate(
            user=self.admin
        )

        response = self.client.post(
            reverse(
                "event-open",
                args=[self.event.id],
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.event.refresh_from_db()

        self.assertEqual(
            self.event.status,
            Event.Status.OPEN,
        )

    def test_wrong_admin_cannot_open_event(self):
        self.client.force_authenticate(
            user=self.other_admin
        )

        response = self.client.post(
            reverse(
                "event-open",
                args=[self.event.id],
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

        self.event.refresh_from_db()

        self.assertEqual(
            self.event.status,
            Event.Status.DRAFT,
        )

    def test_open_event_can_be_started(self):
        self.event.status = Event.Status.OPEN
        self.event.save(
            update_fields=["status"]
        )

        self.client.force_authenticate(
            user=self.admin
        )

        response = self.client.post(
            reverse(
                "event-start",
                args=[self.event.id],
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.event.refresh_from_db()

        self.assertEqual(
            self.event.status,
            Event.Status.IN_PROGRESS,
        )

    def test_draft_event_cannot_be_started(self):
        self.client.force_authenticate(
            user=self.admin
        )

        response = self.client.post(
            reverse(
                "event-start",
                args=[self.event.id],
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.event.refresh_from_db()

        self.assertEqual(
            self.event.status,
            Event.Status.DRAFT,
        )

    def test_draft_event_can_be_cancelled(self):
        self.client.force_authenticate(
            user=self.admin
        )

        response = self.client.post(
            reverse(
                "event-cancel",
                args=[self.event.id],
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.event.refresh_from_db()

        self.assertEqual(
            self.event.status,
            Event.Status.CANCELLED,
        )

    def test_open_event_can_be_cancelled(self):
        self.event.status = Event.Status.OPEN
        self.event.save(
            update_fields=["status"]
        )

        self.client.force_authenticate(
            user=self.admin
        )

        response = self.client.post(
            reverse(
                "event-cancel",
                args=[self.event.id],
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.event.refresh_from_db()

        self.assertEqual(
            self.event.status,
            Event.Status.CANCELLED,
        )

    def test_in_progress_event_cannot_be_cancelled(self):
        self.event.status = Event.Status.IN_PROGRESS
        self.event.save(
            update_fields=["status"]
        )

        self.client.force_authenticate(
            user=self.admin
        )

        response = self.client.post(
            reverse(
                "event-cancel",
                args=[self.event.id],
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.event.refresh_from_db()

        self.assertEqual(
            self.event.status,
            Event.Status.IN_PROGRESS,
        )
        
class EventModelConstraintTests(APITestCase):

    def setUp(self):
        self.admin = User.objects.create_user(
            username="admin1",
            password="test123",
            role=User.Role.NGO_ADMIN,
        )

        self.volunteer_user = User.objects.create_user(
            username="volunteer1",
            password="test123",
            role=User.Role.VOLUNTEER,
        )

        self.volunteer, _ = VolunteerProfile.objects.get_or_create(
            user=self.volunteer_user,
        )

        self.ngo = NGO.objects.create(
            name="Helping Hands",
            email="helpinghands@example.com",
            administrator=self.admin,
        )

        self.start = timezone.now() + timedelta(days=10)
        self.end = self.start + timedelta(hours=3)
        self.deadline = self.start - timedelta(days=1)

        self.event = Event.objects.create(
            ngo=self.ngo,
            created_by=self.admin,
            title="Community Cleanup",
            description="Clean up the local area.",
            location="Dhaka",
            start_date=self.start,
            end_date=self.end,
            registration_deadline=self.deadline,
            volunteer_capacity=20,
            status=Event.Status.OPEN,
        )

    def test_duplicate_registration_is_blocked_by_database(self):
        Registration.objects.create(
            event=self.event,
            volunteer=self.volunteer,
        )

        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                Registration.objects.create(
                    event=self.event,
                    volunteer=self.volunteer,
                )

    def test_event_model_rejects_end_before_start(self):
        event = Event(
            ngo=self.ngo,
            created_by=self.admin,
            title="Invalid Event",
            description="Invalid dates.",
            location="Dhaka",
            start_date=self.start,
            end_date=self.start - timedelta(hours=1),
            registration_deadline=self.deadline,
            volunteer_capacity=10,
        )

        with self.assertRaises(ValidationError):
            event.full_clean()

    def test_event_model_rejects_deadline_after_start(self):
        event = Event(
            ngo=self.ngo,
            created_by=self.admin,
            title="Invalid Event",
            description="Invalid deadline.",
            location="Dhaka",
            start_date=self.start,
            end_date=self.end,
            registration_deadline=self.start + timedelta(hours=1),
            volunteer_capacity=10,
        )

        with self.assertRaises(ValidationError):
            event.full_clean()

    def test_event_capacity_must_be_positive(self):
        event = Event(
            ngo=self.ngo,
            created_by=self.admin,
            title="Invalid Capacity",
            description="Capacity cannot be zero.",
            location="Dhaka",
            start_date=self.start,
            end_date=self.end,
            registration_deadline=self.deadline,
            volunteer_capacity=0,
        )

        with self.assertRaises(ValidationError):
            event.full_clean()
class ProxyEventServiceTestCase(TestCase):
    """Tests for the Proxy Design Pattern role-based event visibility."""

    def setUp(self):
        self.admin_user = User.objects.create_user(
            username="admin_user",
            password="password123",
            role=User.Role.NGO_ADMIN,
        )

        self.coordinator_user = User.objects.create_user(
            username="coordinator_user",
            password="password123",
            role=User.Role.COORDINATOR,
        )

        self.volunteer_user = User.objects.create_user(
            username="volunteer_sian",
            password="password123",
            role=User.Role.VOLUNTEER,
        )

        self.donor_user = User.objects.create_user(
            username="donor_john",
            password="password123",
            role=User.Role.DONOR,
        )

        self.volunteer_profile = VolunteerProfile.objects.create(
            user=self.volunteer_user,
        )

        self.ngo = NGO.objects.create(
            name="Helping Hands",
            email="helpinghands@example.com",
            administrator=self.admin_user,
        )

        now = timezone.now()
        self.start = now + timedelta(days=10)
        self.end = self.start + timedelta(hours=3)
        self.deadline = self.start - timedelta(days=1)

        self.draft_event = self._create_event(
            "Secret Draft",
            Event.Status.DRAFT,
        )
        self.open_event = self._create_event(
            "Public Cleanup",
            Event.Status.OPEN,
        )
        self.in_progress_event = self._create_event(
            "Ongoing Project",
            Event.Status.IN_PROGRESS,
        )
        self.completed_event = self._create_event(
            "Completed Project",
            Event.Status.COMPLETED,
        )
        self.cancelled_event = self._create_event(
            "Cancelled Project",
            Event.Status.CANCELLED,
        )

        # The volunteer is explicitly registered for the private draft event.
        # This verifies that registration-based visibility works independently
        # from the event's public OPEN status.
        self.volunteer_registered_event = self._create_event(
            "Volunteer Registered Event",
            Event.Status.DRAFT,
        )
        Registration.objects.create(
            event=self.volunteer_registered_event,
            volunteer=self.volunteer_profile,
        )

        self.proxy = ProxyEventService()

    def _create_event(self, title, event_status):
        return Event.objects.create(
            ngo=self.ngo,
            created_by=self.admin_user,
            coordinator=self.coordinator_user,
            title=title,
            description="Test event description.",
            location="Dhaka",
            start_date=self.start,
            end_date=self.end,
            registration_deadline=self.deadline,
            volunteer_capacity=20,
            status=event_status,
        )

    def _ids(self, queryset):
        return set(queryset.values_list("id", flat=True))

    def test_admin_can_see_all_events(self):
        visible_ids = self._ids(
            self.proxy.get_events(self.admin_user)
        )

        self.assertEqual(
            visible_ids,
            set(Event.objects.values_list("id", flat=True)),
        )

    def test_coordinator_can_see_all_events(self):
        visible_ids = self._ids(
            self.proxy.get_events(self.coordinator_user)
        )

        self.assertEqual(
            visible_ids,
            set(Event.objects.values_list("id", flat=True)),
        )

    def test_donor_can_see_only_open_events(self):
        visible_ids = self._ids(
            self.proxy.get_events(self.donor_user)
        )

        self.assertEqual(
            visible_ids,
            {self.open_event.id},
        )

    def test_volunteer_can_see_open_and_registered_events(self):
        visible_ids = self._ids(
            self.proxy.get_events(self.volunteer_user)
        )

        self.assertEqual(
            visible_ids,
            {
                self.open_event.id,
                self.volunteer_registered_event.id,
            },
        )

    def test_volunteer_cannot_see_unregistered_private_events(self):
        visible_ids = self._ids(
            self.proxy.get_events(self.volunteer_user)
        )

        self.assertNotIn(self.draft_event.id, visible_ids)
        self.assertNotIn(self.in_progress_event.id, visible_ids)
        self.assertNotIn(self.completed_event.id, visible_ids)
        self.assertNotIn(self.cancelled_event.id, visible_ids)

    def test_donor_cannot_see_draft_event(self):
        visible_ids = self._ids(
            self.proxy.get_events(self.donor_user)
        )

        self.assertNotIn(self.draft_event.id, visible_ids)

    def test_real_subject_is_wrapped_by_proxy(self):
        real_service = RealEventService()
        proxy = ProxyEventService(real_service=real_service)

        self.assertIs(
            proxy._real_service,
            real_service,
        )

    def test_unknown_role_is_denied(self):
        user = User.objects.create_user(
            username="unknown_role",
            password="password123",
            role=User.Role.DONOR,
        )

        # Temporarily use an invalid role value to verify the Proxy's default
        # deny branch.
        user.role = "UNKNOWN_ROLE"

        with self.assertRaises(PermissionDenied):
            self.proxy.get_events(user)

    def test_create_event_is_denied_for_non_admin(self):
        with self.assertRaises(PermissionDenied):
            self.proxy.create_event(
                self.donor_user,
                {
                    "ngo": self.ngo,
                    "created_by": self.donor_user,
                    "title": "Not Allowed",
                    "description": "Should not be created.",
                    "location": "Dhaka",
                    "start_date": self.start,
                    "end_date": self.end,
                    "registration_deadline": self.deadline,
                    "volunteer_capacity": 10,
                    "status": Event.Status.DRAFT,
                },
            )

            
class EventCompletionFacadeTests(APITestCase):

    def setUp(self):
        self.admin = User.objects.create_user(
            username="facade_admin",
            password="test123",
            role=User.Role.NGO_ADMIN,
        )

        self.volunteer_user = User.objects.create_user(
            username="facade_volunteer",
            password="test123",
            role=User.Role.VOLUNTEER,
        )

        self.volunteer, _ = (
            VolunteerProfile.objects.get_or_create(
                user=self.volunteer_user,
            )
        )

        self.ngo = NGO.objects.create(
            name="Facade Test NGO",
            email="facade@example.com",
            administrator=self.admin,
        )

        self.start = timezone.now() - timedelta(hours=3)
        self.end = self.start + timedelta(hours=3)

        self.event = Event.objects.create(
            ngo=self.ngo,
            created_by=self.admin,
            title="Facade Test Event",
            description="Testing the Facade pattern.",
            location="Dhaka",
            start_date=self.start,
            end_date=self.end,
            registration_deadline=(
                self.start - timedelta(days=1)
            ),
            volunteer_capacity=10,
            status=Event.Status.IN_PROGRESS,
        )

        self.registration = Registration.objects.create(
            event=self.event,
            volunteer=self.volunteer,
            status=Registration.Status.APPROVED,
            attendance_status=(
                Registration.AttendanceStatus.PRESENT
            ),
        )

    def test_admin_can_complete_event(self):

        self.client.force_authenticate(
            user=self.admin
        )

        response = self.client.post(
            reverse(
                "event-complete",
                args=[self.event.id],
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.event.refresh_from_db()
        self.registration.refresh_from_db()
        self.volunteer.refresh_from_db()

        self.assertEqual(
            self.event.status,
            Event.Status.COMPLETED,
        )

        self.assertEqual(
            self.registration.status,
            Registration.Status.COMPLETED,
        )

        self.assertEqual(
            self.registration.hours_earned,
            Decimal("3.00"),
        )

        self.assertEqual(
            self.volunteer.total_hours,
            Decimal("3.00"),
        )

        self.assertEqual(
            self.volunteer.completed_events,
            1,
        )

    def test_cannot_complete_without_attendance(self):

        self.registration.attendance_status = (
            Registration.AttendanceStatus.NOT_MARKED
        )

        self.registration.save(
            update_fields=["attendance_status"]
        )

        self.client.force_authenticate(
            user=self.admin
        )

        response = self.client.post(
            reverse(
                "event-complete",
                args=[self.event.id],
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.event.refresh_from_db()

        self.assertEqual(
            self.event.status,
            Event.Status.IN_PROGRESS,
        )
        
class RegistrationDecoratorTests(TestCase):

    def setUp(self):
        self.admin = User.objects.create_user(
            username="decorator_admin",
            password="test123",
            role=User.Role.NGO_ADMIN,
        )

        self.volunteer_user = User.objects.create_user(
            username="decorator_volunteer",
            password="test123",
            role=User.Role.VOLUNTEER,
        )

        self.volunteer, _ = (
            VolunteerProfile.objects.get_or_create(
                user=self.volunteer_user
            )
        )

        self.ngo = NGO.objects.create(
            name="Decorator NGO",
            email="decorator@example.com",
            administrator=self.admin,
        )

        self.start = (
            timezone.now()
            + timedelta(days=10)
        )

        self.event = Event.objects.create(
            ngo=self.ngo,
            created_by=self.admin,
            title="Decorator Test Event",
            description="Testing Decorator Pattern",
            location="Dhaka",
            start_date=self.start,
            end_date=(
                self.start + timedelta(hours=3)
            ),
            registration_deadline=(
                self.start - timedelta(days=1)
            ),
            volunteer_capacity=10,
            status=Event.Status.OPEN,
        )

    def get_decorated_service(self):
        return EventOpenDecorator(
            RegistrationDeadlineDecorator(
                DuplicateRegistrationDecorator(
                    CapacityDecorator(
                        BasicRegistrationService()
                    )
                )
            )
        )

    def test_decorated_service_is_registration_service(self):
        service = self.get_decorated_service()

        self.assertIsInstance(
            service,
            RegistrationService,
        )

    def test_decorator_chain_creates_registration(self):
        service = self.get_decorated_service()

        registration = service.register(
            self.volunteer,
            self.event,
        )

        self.assertEqual(
            registration.volunteer,
            self.volunteer,
        )

        self.assertEqual(
            registration.event,
            self.event,
        )

        self.assertEqual(
            Registration.objects.count(),
            1,
        )

    def test_event_open_decorator_blocks_draft_event(self):
        self.event.status = Event.Status.DRAFT
        self.event.save(
            update_fields=["status"]
        )

        service = EventOpenDecorator(
            BasicRegistrationService()
        )

        with self.assertRaises(
            DRFValidationError
        ):
            service.register(
                self.volunteer,
                self.event,
            )

        self.assertEqual(
            Registration.objects.count(),
            0,
        )

    def test_deadline_decorator_blocks_expired_event(self):
        self.event.registration_deadline = (
            timezone.now()
            - timedelta(hours=1)
        )

        self.event.save(
            update_fields=[
                "registration_deadline"
            ]
        )

        service = RegistrationDeadlineDecorator(
            BasicRegistrationService()
        )

        with self.assertRaises(
            DRFValidationError
        ):
            service.register(
                self.volunteer,
                self.event,
            )

        self.assertEqual(
            Registration.objects.count(),
            0,
        )

    def test_duplicate_decorator_blocks_duplicate(self):
        Registration.objects.create(
            event=self.event,
            volunteer=self.volunteer,
        )

        service = DuplicateRegistrationDecorator(
            BasicRegistrationService()
        )

        with self.assertRaises(
            DRFValidationError
        ):
            service.register(
                self.volunteer,
                self.event,
            )

        self.assertEqual(
            Registration.objects.count(),
            1,
        )

    def test_capacity_decorator_blocks_full_event(self):
        self.event.volunteer_capacity = 1
        self.event.save(
            update_fields=["volunteer_capacity"]
        )

        other_user = User.objects.create_user(
            username="capacity_volunteer",
            password="test123",
            role=User.Role.VOLUNTEER,
        )

        other_volunteer, _ = (
            VolunteerProfile.objects.get_or_create(
                user=other_user
            )
        )

        Registration.objects.create(
            event=self.event,
            volunteer=other_volunteer,
            status=Registration.Status.APPROVED,
        )

        service = CapacityDecorator(
            BasicRegistrationService()
        )

        with self.assertRaises(
            DRFValidationError
        ):
            service.register(
                self.volunteer,
                self.event,
            )

        self.assertEqual(
            Registration.objects.count(),
            1,
        )


from datetime import timedelta

from django.test import TestCase
from django.utils import timezone

from accounts.models import User
from organizations.models import NGO
from volunteering.models import Skill

from .builders import (
    DraftEventBuilder,
    EventDirector,
    PublishedEventBuilder,
)


class EventBuilderTests(TestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username="event_admin",
            password="test-password",
            role=User.Role.NGO_ADMIN,
        )

        self.coordinator = User.objects.create_user(
            username="event_coordinator",
            password="test-password",
            role=User.Role.COORDINATOR,
        )

        self.ngo = NGO.objects.create(
            name="Helping Hands",
            email="helpinghands@example.com",
            administrator=self.admin,
        )

        self.skill = Skill.objects.create(name="First Aid")

        now = timezone.now()

        self.event_data = {
            "ngo": self.ngo,
            "created_by": self.admin,
            "title": "Community Cleanup",
            "description": "Clean the local park.",
            "location": "Central Park",
            "start_date": now + timedelta(days=3),
            "end_date": now + timedelta(days=3, hours=3),
            "registration_deadline": now + timedelta(days=2),
            "volunteer_capacity": 20,
        }

    def test_full_event_recipe_sets_required_skills(self):
        director = EventDirector()
        director.set_builder(DraftEventBuilder())

        event = director.build_full_event(
            required_skills=[self.skill],
            **self.event_data,
        )

        self.assertEqual(event.status, "DRAFT")
        self.assertEqual(event.required_skills.count(), 1)
        self.assertIsNone(event.coordinator)

    def test_event_without_skills_recipe_skips_required_skills_step(self):
        director = EventDirector()
        director.set_builder(PublishedEventBuilder())

        event = director.build_event_without_skills(**self.event_data)

        self.assertEqual(event.status, "OPEN")
        self.assertEqual(event.required_skills.count(), 0)
        self.assertIsNone(event.coordinator)

    def test_event_with_coordinator_recipe_adds_the_extra_step(self):
        director = EventDirector()
        director.set_builder(PublishedEventBuilder())

        event = director.build_event_with_coordinator(
            coordinator=self.coordinator,
            required_skills=[self.skill],
            **self.event_data,
        )

        self.assertEqual(event.status, "OPEN")
        self.assertEqual(event.required_skills.count(), 1)
        self.assertEqual(event.coordinator, self.coordinator)

    def test_unlimited_capacity_recipe(self):
        director = EventDirector()
        director.set_builder(PublishedEventBuilder())

        event = director.build_event_without_skills(
            capacity_mode="UNLIMITED",
            volunteer_capacity=None,
            **{
                key: value
                for key, value in self.event_data.items()
                if key != "volunteer_capacity"
            },
        )

        self.assertEqual(event.status, "OPEN")
        self.assertEqual(event.capacity_mode, "UNLIMITED")
        self.assertIsNone(event.volunteer_capacity)

    def test_assigned_event_without_skills_recipe(self):
        director = EventDirector()
        director.set_builder(DraftEventBuilder())

        event = director.build_assigned_event_without_skills(
            coordinator=self.coordinator,
            **self.event_data,
        )

        self.assertEqual(event.status, "DRAFT")
        self.assertEqual(event.required_skills.count(), 0)
        self.assertEqual(event.coordinator, self.coordinator)

    def test_same_director_recipes_work_with_any_builder(self):
        director = EventDirector()

        for index, builder in enumerate(
            [DraftEventBuilder(), PublishedEventBuilder()]
        ):
            director.set_builder(builder)

            event_data = {
                **self.event_data,
                "title": f"Community Cleanup {index}",
            }

            full = director.build_full_event(
                required_skills=[self.skill],
                **event_data,
            )
            without_skills = director.build_event_without_skills(
                **event_data,
            )
            with_coordinator = director.build_event_with_coordinator(
                coordinator=self.coordinator,
                required_skills=[self.skill],
                **event_data,
            )

            expected_status = (
                "DRAFT"
                if isinstance(builder, DraftEventBuilder)
                else "OPEN"
            )

            for event in (full, without_skills, with_coordinator):
                self.assertEqual(event.status, expected_status)

            self.assertEqual(full.required_skills.count(), 1)
            self.assertEqual(without_skills.required_skills.count(), 0)
            self.assertEqual(with_coordinator.coordinator, self.coordinator)

class EventTeamPrivacyTests(APITestCase):

    def setUp(self):
        self.admin = User.objects.create_user(
            username="team_admin",
            password="test123",
            role=User.Role.NGO_ADMIN,
        )

        self.coordinator = User.objects.create_user(
            username="assigned_coordinator",
            password="test123",
            role=User.Role.COORDINATOR,
        )

        self.other_coordinator = User.objects.create_user(
            username="other_coordinator",
            password="test123",
            role=User.Role.COORDINATOR,
        )

        self.volunteer_user = User.objects.create_user(
            username="team_volunteer",
            password="test123",
            role=User.Role.VOLUNTEER,
        )

        self.donor = User.objects.create_user(
            username="team_donor",
            password="test123",
            role=User.Role.DONOR,
        )

        self.volunteer, _ = (
            VolunteerProfile.objects.get_or_create(
                user=self.volunteer_user,
            )
        )

        self.ngo = NGO.objects.create(
            name="Team Privacy NGO",
            email="teamprivacy@example.com",
            administrator=self.admin,
            is_verified=True,
        )

        start = (
            timezone.now()
            + timedelta(days=10)
        )

        end = (
            start
            + timedelta(hours=3)
        )

        deadline = (
            start
            - timedelta(days=1)
        )

        self.event = Event.objects.create(
            ngo=self.ngo,
            created_by=self.admin,
            coordinator=self.coordinator,
            title="Private Team Event",
            description="Team privacy test.",
            location="Dhaka",
            start_date=start,
            end_date=end,
            registration_deadline=deadline,
            volunteer_capacity=20,
            status=Event.Status.OPEN,
        )

        self.team = Team.objects.create(
            event=self.event,
            name="Logistics Team",
        )

        TeamMembership.objects.create(
            team=self.team,
            volunteer=self.volunteer,
            assigned_task="Manage supplies",
        )

    def test_ngo_admin_can_view_event_teams(self):
        self.client.force_authenticate(
            user=self.admin
        )

        response = self.client.get(
            reverse(
                "event-teams",
                args=[self.event.id],
            )
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
            response.data[0]["name"],
            "Logistics Team",
        )

    def test_assigned_coordinator_can_view_event_teams(
        self,
    ):
        self.client.force_authenticate(
            user=self.coordinator
        )

        response = self.client.get(
            reverse(
                "event-teams",
                args=[self.event.id],
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

    def test_unassigned_coordinator_cannot_view_event_teams(
        self,
    ):
        self.client.force_authenticate(
            user=self.other_coordinator
        )

        response = self.client.get(
            reverse(
                "event-teams",
                args=[self.event.id],
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_volunteer_cannot_view_event_teams(self):
        self.client.force_authenticate(
            user=self.volunteer_user
        )

        response = self.client.get(
            reverse(
                "event-teams",
                args=[self.event.id],
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_donor_cannot_view_event_teams(self):
        self.client.force_authenticate(
            user=self.donor
        )

        response = self.client.get(
            reverse(
                "event-teams",
                args=[self.event.id],
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )
        
class EventUpdateLockTests(
    APITestCase
):

    def setUp(self):
        self.admin = (
            User.objects.create_user(
                username="update_admin",
                password="test123",
                role=User.Role.NGO_ADMIN,
            )
        )

        self.other_admin = (
            User.objects.create_user(
                username="update_other_admin",
                password="test123",
                role=User.Role.NGO_ADMIN,
            )
        )

        self.ngo = (
            NGO.objects.create(
                name="Update Test NGO",
                email="update@example.com",
                administrator=self.admin,
                is_verified=True,
            )
        )

        start = (
            timezone.now()
            + timedelta(days=10)
        )

        end = (
            start
            + timedelta(hours=3)
        )

        deadline = (
            start
            - timedelta(days=1)
        )

        self.event = (
            Event.objects.create(
                ngo=self.ngo,
                created_by=self.admin,
                title="Original Event",
                description=(
                    "Original description."
                ),
                location="Dhaka",
                start_date=start,
                end_date=end,
                registration_deadline=(
                    deadline
                ),
                volunteer_capacity=20,
                status=Event.Status.DRAFT,
            )
        )

    def test_admin_can_edit_draft_event(
        self,
    ):
        self.client.force_authenticate(
            user=self.admin
        )

        response = self.client.patch(
            reverse(
                "event-update",
                args=[
                    self.event.id
                ],
            ),
            {
                "title": (
                    "Updated Event"
                )
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.event.refresh_from_db()

        self.assertEqual(
            self.event.title,
            "Updated Event",
        )

    def test_completed_event_cannot_be_edited(
        self,
    ):
        self.event.status = (
            Event.Status.COMPLETED
        )

        self.event.save(
            update_fields=[
                "status"
            ]
        )

        original_title = (
            self.event.title
        )

        self.client.force_authenticate(
            user=self.admin
        )

        response = self.client.patch(
            reverse(
                "event-update",
                args=[
                    self.event.id
                ],
            ),
            {
                "title": (
                    "Should Not Change"
                )
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.event.refresh_from_db()

        self.assertEqual(
            self.event.title,
            original_title,
        )

    def test_cancelled_event_cannot_be_edited(
        self,
    ):
        self.event.status = (
            Event.Status.CANCELLED
        )

        self.event.save(
            update_fields=[
                "status"
            ]
        )

        original_location = (
            self.event.location
        )

        self.client.force_authenticate(
            user=self.admin
        )

        response = self.client.patch(
            reverse(
                "event-update",
                args=[
                    self.event.id
                ],
            ),
            {
                "location": (
                    "Different Location"
                )
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.event.refresh_from_db()

        self.assertEqual(
            self.event.location,
            original_location,
        )

    def test_wrong_admin_still_cannot_edit_event(
        self,
    ):
        self.client.force_authenticate(
            user=self.other_admin
        )

        response = self.client.patch(
            reverse(
                "event-update",
                args=[
                    self.event.id
                ],
            ),
            {
                "title": "Illegal Edit"
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

        self.event.refresh_from_db()

        self.assertEqual(
            self.event.title,
            "Original Event",
        )
from datetime import timedelta

from django.test import TestCase
from django.utils import timezone

from accounts.models import User
from certificates.models import Certificate
from donations.models import Donation
from events.models import Event, Registration
from organizations.models import NGO
from volunteering.models import VolunteerProfile

from .domain_events import (
    CertificateIssued,
    CoordinatorAssigned,
    CoordinatorRemoved,
    DonationAcknowledged,
    DonationReceived,
    EventPublished,
    EventReminderDue,
    RegistrationCreated,
    RegistrationStatusChanged,
)
from .models import Notification
from .observers import (
    Observer,
    VolunteerNotificationObserver,
    VolunteerNotificationSubject,
    create_volunteer_notification_subject,
)
from .strategies import NotificationContext, NotificationStrategy


class RecordingObserver(Observer):
    def __init__(self):
        self.received_events = []

    def update(self, domain_event):
        self.received_events.append(domain_event)


class ObserverPatternTests(TestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username="ngo_admin",
            password="test-password",
            role=User.Role.NGO_ADMIN,
        )

        volunteer_user = User.objects.create_user(
            username="volunteer_one",
            password="test-password",
            role=User.Role.VOLUNTEER,
        )
        second_volunteer_user = User.objects.create_user(
            username="volunteer_two",
            password="test-password",
            role=User.Role.VOLUNTEER,
        )

        self.volunteer = VolunteerProfile.objects.create(user=volunteer_user)
        self.second_volunteer = VolunteerProfile.objects.create(
            user=second_volunteer_user
        )

        self.ngo = NGO.objects.create(
            name="Helping Hands",
            email="helpinghands@example.com",
            administrator=self.admin,
        )

        now = timezone.now()
        self.event = Event.objects.create(
            ngo=self.ngo,
            created_by=self.admin,
            title="Community Cleanup",
            description="Clean the local park.",
            location="Central Park",
            start_date=now + timedelta(days=3),
            end_date=now + timedelta(days=3, hours=3),
            registration_deadline=now + timedelta(days=2),
            volunteer_capacity=20,
            status=Event.Status.OPEN,
        )

        self.registration = Registration.objects.create(
            event=self.event,
            volunteer=self.volunteer,
            status=Registration.Status.PENDING,
        )

    def test_subject_attaches_and_notifies_observer(self):
        subject = VolunteerNotificationSubject()
        observer = RecordingObserver()
        subject.attach(observer)
        subject.notify(EventPublished(self.event))
        self.assertEqual(len(observer.received_events), 1)

    def test_subject_detaches_observer(self):
        subject = VolunteerNotificationSubject()
        observer = RecordingObserver()
        subject.attach(observer)
        subject.detach(observer)
        subject.notify(EventPublished(self.event))
        self.assertEqual(len(observer.received_events), 0)

    def test_new_event_loops_through_registered_volunteer_observers(self):
        subject = create_volunteer_notification_subject(
            VolunteerProfile.objects.select_related("user")
        )
        subject.notify(EventPublished(self.event))

        notifications = Notification.objects.filter(
            notification_type=Notification.Type.EVENT_PUBLISHED,
            event=self.event,
        )
        self.assertEqual(notifications.count(), 2)

    def test_event_reminder_notifies_approved_observer_only(self):
        self.registration.status = Registration.Status.APPROVED
        self.registration.save(update_fields=["status"])

        subject = create_volunteer_notification_subject(
            VolunteerProfile.objects.filter(id=self.volunteer.id).select_related("user")
        )
        subject.notify(EventReminderDue(self.event))

        notification = Notification.objects.get(
            notification_type=Notification.Type.EVENT_REMINDER,
            event=self.event,
        )
        self.assertEqual(notification.recipient, self.volunteer.user)

    def test_volunteer_observer_delegates_strategy_to_context(self):
        self.registration.status = Registration.Status.APPROVED
        self.registration.save(update_fields=["status"])

        observer = VolunteerNotificationObserver(self.volunteer)
        observer.update(EventReminderDue(self.event))

        self.assertTrue(
            Notification.objects.filter(
                recipient=self.volunteer.user,
                notification_type=Notification.Type.EVENT_REMINDER,
            ).exists()
        )


class StrategyTests(TestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username="strategy_admin",
            password="test-password",
            role=User.Role.NGO_ADMIN,
        )
        volunteer_user = User.objects.create_user(
            username="strategy_volunteer",
            password="test-password",
            role=User.Role.VOLUNTEER,
        )
        self.volunteer = VolunteerProfile.objects.create(user=volunteer_user)
        self.ngo = NGO.objects.create(
            name="Strategy NGO",
            email="strategy@example.com",
            administrator=self.admin,
        )
        now = timezone.now()
        self.event = Event.objects.create(
            ngo=self.ngo,
            created_by=self.admin,
            title="Strategy Event",
            description="Test event.",
            location="Dhaka",
            start_date=now + timedelta(days=3),
            end_date=now + timedelta(days=3, hours=2),
            registration_deadline=now + timedelta(days=2),
            volunteer_capacity=10,
            status=Event.Status.OPEN,
        )
        self.registration = Registration.objects.create(
            event=self.event,
            volunteer=self.volunteer,
            status=Registration.Status.PENDING,
        )

    def test_context_selects_registration_received_strategy(self):
        NotificationContext().execute(RegistrationCreated(self.registration))
        self.assertTrue(
            Notification.objects.filter(
                notification_type=Notification.Type.REGISTRATION_RECEIVED
            ).exists()
        )

    def test_context_selects_approved_strategy(self):
        self.registration.status = Registration.Status.APPROVED
        self.registration.save(update_fields=["status"])
        NotificationContext().execute(RegistrationStatusChanged(self.registration))
        self.assertTrue(
            Notification.objects.filter(
                notification_type=Notification.Type.REGISTRATION_APPROVED
            ).exists()
        )

    def test_context_selects_rejected_strategy(self):
        self.registration.status = Registration.Status.REJECTED
        self.registration.save(update_fields=["status"])
        NotificationContext().execute(RegistrationStatusChanged(self.registration))
        self.assertTrue(
            Notification.objects.filter(
                notification_type=Notification.Type.REGISTRATION_REJECTED
            ).exists()
        )

    def test_context_delegates_donation_to_both_notification_strategies(self):
        donor = User.objects.create_user(
            username="strategy_donor",
            password="test-password",
            role=User.Role.DONOR,
        )
        donation = Donation.objects.create(
            ngo=self.ngo,
            donor=donor,
            donor_name="Strategy Donor",
            amount="50.00",
        )

        NotificationContext().execute(DonationReceived(donation))

        self.assertTrue(
            Notification.objects.filter(
                notification_type=Notification.Type.DONATION_RECEIVED
            ).exists()
        )
        self.assertTrue(
            Notification.objects.filter(
                notification_type=Notification.Type.DONATION_SENT,
                recipient=donor,
            ).exists()
        )

    def test_context_delegates_coordinator_assignment(self):
        coordinator = User.objects.create_user(
            username="strategy_coordinator",
            password="test-password",
            role=User.Role.COORDINATOR,
        )
        self.event.coordinator = coordinator
        self.event.save(update_fields=["coordinator"])

        NotificationContext().execute(CoordinatorAssigned(self.event))

        self.assertTrue(
            Notification.objects.filter(
                notification_type=Notification.Type.COORDINATOR_ASSIGNED,
                recipient=coordinator,
            ).exists()
        )

    def test_context_delegates_certificate_strategy(self):
        certificate = Certificate.objects.create(
            volunteer=self.volunteer,
            event=self.event,
        )
        NotificationContext().execute(CertificateIssued(certificate))
        self.assertTrue(
            Notification.objects.filter(
                notification_type=Notification.Type.CERTIFICATE_ISSUED,
                recipient=self.volunteer.user,
            ).exists()
        )

    def test_custom_strategy_interface_can_be_executed_directly(self):
        received = []

        class SpyStrategy(NotificationStrategy):
            def notify(self, domain_event, recipient=None):
                received.append(domain_event)

        strategy = SpyStrategy()
        event = EventPublished(self.event)
        strategy.notify(event)
        self.assertEqual(received, [event])

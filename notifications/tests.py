from django.test import TestCase
from datetime import timedelta
from types import SimpleNamespace
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
    CoordinatorNotificationObserver,
    DonorNotificationObserver,
    NGOAdministratorNotificationObserver,
    NotificationSubject,
    Observer,
    VolunteerNotificationObserver,
)
from .strategies import NotificationStrategy


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

        self.volunteer = VolunteerProfile.objects.create(
            user=volunteer_user,
        )

        self.second_volunteer = VolunteerProfile.objects.create(
            user=second_volunteer_user,
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
        subject = NotificationSubject()
        observer = RecordingObserver()

        subject.attach(observer)
        subject.notify(EventPublished(self.event))

        self.assertEqual(len(observer.received_events), 1)

    def test_subject_detaches_observer(self):
        subject = NotificationSubject()
        observer = RecordingObserver()

        subject.attach(observer)
        subject.detach(observer)
        subject.notify(EventPublished(self.event))

        self.assertEqual(len(observer.received_events), 0)

    def test_approved_registration_notifies_volunteer(self):
        subject = NotificationSubject()
        subject.attach(VolunteerNotificationObserver())

        self.registration.status = Registration.Status.APPROVED
        self.registration.save(update_fields=["status"])

        subject.notify(
            RegistrationStatusChanged(self.registration)
        )

        notification = Notification.objects.get(
            recipient=self.volunteer.user,
            notification_type=Notification.Type.REGISTRATION_APPROVED,
        )

        self.assertEqual(notification.event, self.event)
        self.assertEqual(notification.registration, self.registration)

    def test_new_event_notifies_all_volunteers(self):
        subject = NotificationSubject()
        subject.attach(VolunteerNotificationObserver())

        subject.notify(EventPublished(self.event))

        notifications = Notification.objects.filter(
            notification_type=Notification.Type.EVENT_PUBLISHED,
            event=self.event,
        )

        self.assertEqual(notifications.count(), 2)

    def test_event_reminder_notifies_approved_volunteers_only(self):
        self.registration.status = Registration.Status.APPROVED
        self.registration.save(update_fields=["status"])

        subject = NotificationSubject()
        subject.attach(VolunteerNotificationObserver())

        subject.notify(EventReminderDue(self.event))

        notifications = Notification.objects.filter(
            notification_type=Notification.Type.EVENT_REMINDER,
            event=self.event,
        )

        self.assertEqual(notifications.count(), 1)
        self.assertEqual(
            notifications.first().recipient,
            self.volunteer.user,
        )

    def test_new_registration_notifies_ngo_administrator(self):
        subject = NotificationSubject()
        subject.attach(NGOAdministratorNotificationObserver())

        subject.notify(RegistrationCreated(self.registration))

        notification = Notification.objects.get(
            notification_type=Notification.Type.REGISTRATION_RECEIVED,
        )

        self.assertEqual(notification.recipient, self.admin)
        self.assertEqual(notification.event, self.event)

    def test_same_event_is_not_notified_twice(self):
        subject = NotificationSubject()
        subject.attach(VolunteerNotificationObserver())

        subject.notify(EventPublished(self.event))
        subject.notify(EventPublished(self.event))

        notifications = Notification.objects.filter(
            notification_type=Notification.Type.EVENT_PUBLISHED,
            event=self.event,
        )

        self.assertEqual(notifications.count(), 2)

    def test_coordinator_is_notified_when_assigned(self):
        coordinator_user = User.objects.create_user(
            username="coordinator_one",
            password="test-password",
            role=User.Role.COORDINATOR,
        )

        self.event.coordinator = coordinator_user
        self.event.save(update_fields=["coordinator"])

        subject = NotificationSubject()
        subject.attach(CoordinatorNotificationObserver())

        subject.notify(CoordinatorAssigned(self.event))

        notification = Notification.objects.get(
            notification_type=Notification.Type.COORDINATOR_ASSIGNED,
        )

        self.assertEqual(notification.recipient, coordinator_user)
        self.assertEqual(notification.event, self.event)

    def test_volunteer_is_notified_when_certificate_is_issued(self):
        certificate = Certificate.objects.create(
            volunteer=self.volunteer,
            event=self.event,
        )

        subject = NotificationSubject()
        subject.attach(VolunteerNotificationObserver())

        subject.notify(CertificateIssued(certificate))

        notification = Notification.objects.get(
            notification_type=Notification.Type.CERTIFICATE_ISSUED,
        )

        self.assertEqual(notification.recipient, self.volunteer.user)
        self.assertEqual(notification.certificate, certificate)

    def test_donor_is_notified_when_donation_is_sent(self):
        donor_user = User.objects.create_user(
            username="donor_one",
            password="test-password",
            role=User.Role.DONOR,
        )

        donation = Donation.objects.create(
            ngo=self.ngo,
            donor=donor_user,
            donor_name="Donor One",
            amount="50.00",
        )

        subject = NotificationSubject()
        subject.attach(DonorNotificationObserver())

        subject.notify(DonationReceived(donation))

        notification = Notification.objects.get(
            notification_type=Notification.Type.DONATION_SENT,
        )

        self.assertEqual(notification.recipient, donor_user)
        self.assertEqual(notification.donation, donation)

    def test_donor_is_notified_when_donation_is_acknowledged(self):
        donor_user = User.objects.create_user(
            username="donor_two",
            password="test-password",
            role=User.Role.DONOR,
        )

        donation = Donation.objects.create(
            ngo=self.ngo,
            donor=donor_user,
            donor_name="Donor Two",
            amount="75.00",
        )

        subject = NotificationSubject()
        subject.attach(DonorNotificationObserver())

        subject.notify(DonationAcknowledged(donation))

        notification = Notification.objects.get(
            notification_type=Notification.Type.DONATION_ACKNOWLEDGED,
        )

        self.assertEqual(notification.recipient, donor_user)
        self.assertEqual(notification.donation, donation)

    def test_donation_received_does_not_notify_anonymous_donor(self):
        donation = Donation.objects.create(
            ngo=self.ngo,
            donor=None,
            donor_name="Anonymous",
            amount="10.00",
        )

        subject = NotificationSubject()
        subject.attach(DonorNotificationObserver())

        subject.notify(DonationReceived(donation))

        self.assertFalse(
            Notification.objects.filter(
                notification_type=Notification.Type.DONATION_SENT,
            ).exists()
        )

    def test_previous_coordinator_is_notified_when_removed(self):
        coordinator_user = User.objects.create_user(
            username="coordinator_removed",
            password="test-password",
            role=User.Role.COORDINATOR,
        )

        subject = NotificationSubject()
        subject.attach(CoordinatorNotificationObserver())

        subject.notify(
            CoordinatorRemoved(
                event=self.event,
                previous_coordinator=coordinator_user,
                reason="Reassigned for load balancing.",
            )
        )

        notification = Notification.objects.get(
            notification_type=Notification.Type.COORDINATOR_REMOVED,
        )

        self.assertEqual(notification.recipient, coordinator_user)
        self.assertEqual(
            notification.message,
            "Reassigned for load balancing.",
        )

    def test_coordinator_reassignment_notifies_a_second_time(self):
        # A coordinator can legitimately be assigned to the same event
        # more than once over time (assigned, removed, reassigned) -
        # each assignment should produce its own notification.
        coordinator_user = User.objects.create_user(
            username="coordinator_reassigned",
            password="test-password",
            role=User.Role.COORDINATOR,
        )

        self.event.coordinator = coordinator_user
        self.event.save(update_fields=["coordinator"])

        subject = NotificationSubject()
        subject.attach(CoordinatorNotificationObserver())

        subject.notify(CoordinatorAssigned(self.event))
        subject.notify(CoordinatorAssigned(self.event))

        notifications = Notification.objects.filter(
            recipient=coordinator_user,
            notification_type=Notification.Type.COORDINATOR_ASSIGNED,
        )

        self.assertEqual(notifications.count(), 2)


class StrategySwapTests(TestCase):
    """An Observer's reaction to a domain event can be swapped at
    runtime by injecting a different NotificationStrategy list, without
    touching Subject/Observer wiring at all."""

    def test_custom_strategy_replaces_default_behaviour(self):
        received = []

        class SpyStrategy(NotificationStrategy):
            def handles(self, domain_event):
                return isinstance(domain_event, EventPublished)

            def notify(self, domain_event):
                received.append(domain_event)

        subject = NotificationSubject()
        subject.attach(
            VolunteerNotificationObserver(strategies=[SpyStrategy()])
        )

        # A bare object works here - the spy strategy never touches
        # the database, unlike the default NewEventPublishedStrategy.
        fake_event = SimpleNamespace(title="Fake Event")
        domain_event = EventPublished(fake_event)

        subject.notify(domain_event)

        self.assertEqual(received, [domain_event])
        self.assertEqual(Notification.objects.count(), 0)
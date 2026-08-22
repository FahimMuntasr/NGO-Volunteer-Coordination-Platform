from django.test import TestCase
from datetime import timedelta
from django.utils import timezone

from accounts.models import User
from events.models import Event, Registration
from organizations.models import NGO
from volunteering.models import VolunteerProfile

from .domain_events import (
    EventPublished,
    EventReminderDue,
    RegistrationCreated,
    RegistrationStatusChanged,
)
from .models import Notification
from .observers import (
    NGOAdministratorNotificationObserver,
    NotificationSubject,
    Observer,
    VolunteerNotificationObserver,
)


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

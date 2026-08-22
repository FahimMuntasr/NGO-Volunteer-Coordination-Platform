from abc import ABC, abstractmethod

from events.models import Registration
from volunteering.models import VolunteerProfile

from .domain_events import (
    DonationReceived,
    EventPublished,
    EventReminderDue,
    RegistrationCreated,
    RegistrationStatusChanged,
    TeamMemberAssigned,
)
from .models import Notification


class Observer(ABC):
    @abstractmethod
    def update(self, domain_event):
        pass


class Subject(ABC):
    @abstractmethod
    def attach(self, observer):
        pass

    @abstractmethod
    def detach(self, observer):
        pass

    @abstractmethod
    def notify(self, domain_event):
        pass


class NotificationSubject(Subject):
    def __init__(self):
        self._observers = []

    def attach(self, observer):
        if observer not in self._observers:
            self._observers.append(observer)

    def detach(self, observer):
        if observer in self._observers:
            self._observers.remove(observer)

    def notify(self, domain_event):
        for observer in tuple(self._observers):
            observer.update(domain_event)


class VolunteerNotificationObserver(Observer):
    def update(self, domain_event):
        if isinstance(domain_event, RegistrationStatusChanged):
            self._registration_status_notification(
                domain_event.registration
            )

        elif isinstance(domain_event, EventPublished):
            self._new_event_notifications(domain_event.event)

        elif isinstance(domain_event, EventReminderDue):
            self._event_reminder_notifications(domain_event.event)

        elif isinstance(domain_event, TeamMemberAssigned):
            self._team_assignment_notification(
                domain_event.membership
            )

    def _registration_status_notification(self, registration):
        if registration.status == Registration.Status.APPROVED:
            notification_type = Notification.Type.REGISTRATION_APPROVED
            title = "Registration approved"
            message = (
                f"Your registration for '{registration.event.title}' "
                "has been approved."
            )

        elif registration.status == Registration.Status.REJECTED:
            notification_type = Notification.Type.REGISTRATION_REJECTED
            title = "Registration rejected"
            message = (
                f"Your registration for '{registration.event.title}' "
                "has been rejected."
            )

        else:
            return

        Notification.objects.get_or_create(
            recipient=registration.volunteer.user,
            notification_type=notification_type,
            registration=registration,
            defaults={
                "event": registration.event,
                "title": title,
                "message": message,
            },
        )

    def _new_event_notifications(self, event):
        volunteers = VolunteerProfile.objects.select_related("user")

        for profile in volunteers:
            Notification.objects.get_or_create(
                recipient=profile.user,
                notification_type=Notification.Type.EVENT_PUBLISHED,
                event=event,
                defaults={
                    "title": f"New event: {event.title}",
                    "message": (
                        f"A new volunteer opportunity, '{event.title}', "
                        f"is available at {event.location}."
                    ),
                },
            )

    def _event_reminder_notifications(self, event):
        registrations = event.registrations.filter(
            status=Registration.Status.APPROVED
        ).select_related("volunteer__user")

        for registration in registrations:
            Notification.objects.get_or_create(
                recipient=registration.volunteer.user,
                notification_type=Notification.Type.EVENT_REMINDER,
                event=event,
                defaults={
                    "registration": registration,
                    "title": f"Reminder: {event.title} is tomorrow",
                    "message": (
                        f"Your event '{event.title}' starts tomorrow at "
                        f"{event.location}."
                    ),
                },
            )

    def _team_assignment_notification(self, membership):
        Notification.objects.get_or_create(
            recipient=membership.volunteer.user,
            notification_type=Notification.Type.TEAM_ASSIGNED,
            team_membership=membership,
            defaults={
                "event": membership.team.event,
                "title": (
                    f"You were assigned to {membership.team.name}"
                ),
                "message": (
                    f"You have been assigned to the "
                    f"'{membership.team.name}' team for "
                    f"'{membership.team.event.title}'."
                ),
            },
        )


class NGOAdministratorNotificationObserver(Observer):
    def update(self, domain_event):
        if isinstance(domain_event, RegistrationCreated):
            registration = domain_event.registration
            event = registration.event

            Notification.objects.get_or_create(
                recipient=event.ngo.administrator,
                notification_type=Notification.Type.REGISTRATION_RECEIVED,
                registration=registration,
                defaults={
                    "event": event,
                    "title": "New volunteer registration",
                    "message": (
                        f"{registration.volunteer.user.username} registered "
                        f"for '{event.title}'."
                    ),
                },
            )

        elif isinstance(domain_event, DonationReceived):
            donation = domain_event.donation

            Notification.objects.get_or_create(
                recipient=donation.ngo.administrator,
                notification_type=Notification.Type.DONATION_RECEIVED,
                donation=donation,
                defaults={
                    "title": "New donation received",
                    "message": (
                        f"A donation of {donation.amount} was received "
                        f"for {donation.ngo.name}."
                    ),
                },
            )


notification_subject = NotificationSubject()

# One subject can notify multiple concrete observers.
notification_subject.attach(VolunteerNotificationObserver())
notification_subject.attach(NGOAdministratorNotificationObserver())
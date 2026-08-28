from abc import ABC, abstractmethod

from events.models import Registration

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
    TeamMemberAssigned,
)
from .models import Notification


#STRATEGY INTERFACE
class NotificationStrategy(ABC):
    @abstractmethod
    def notify(self, domain_event, recipient=None):
        pass


#STRATEGY CONTEXT
class NotificationContext:
    def __init__(self):
        self._strategy = None

    def _select_strategies(self, domain_event):
        if isinstance(domain_event, RegistrationStatusChanged):
            if domain_event.registration.status == Registration.Status.APPROVED:
                return [RegistrationApprovedStrategy()]
            if domain_event.registration.status == Registration.Status.REJECTED:
                return [RegistrationRejectedStrategy()]
            return []

        strategy_map = {
            RegistrationCreated: [RegistrationReceivedStrategy()],
            DonationReceived: [
                DonationReceivedStrategy(),
                DonationSentStrategy(),
            ],
            DonationAcknowledged: [DonationAcknowledgedStrategy()],
            CoordinatorAssigned: [CoordinatorAssignmentStrategy()],
            CoordinatorRemoved: [CoordinatorRemovalStrategy()],
            EventPublished: [NewEventPublishedStrategy()],
            EventReminderDue: [EventReminderStrategy()],
            TeamMemberAssigned: [TeamAssignmentStrategy()],
            CertificateIssued: [CertificateIssuedStrategy()],
        }

        strategies = strategy_map.get(type(domain_event))
        if strategies is None:
            raise ValueError(
                f"No notification strategy exists for "
                f"{type(domain_event).__name__}."
            )

        return strategies

    def execute(self, domain_event, recipient=None):
        for strategy in self._select_strategies(domain_event):
            self._strategy = strategy
            self._strategy.notify(
                domain_event,
                recipient=recipient,
            )


#CONCRETE STRATEGIES
class RegistrationReceivedStrategy(NotificationStrategy):
    def notify(self, domain_event, recipient=None):
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


class RegistrationApprovedStrategy(NotificationStrategy):
    def notify(self, domain_event, recipient=None):
        registration = domain_event.registration

        Notification.objects.get_or_create(
            recipient=registration.volunteer.user,
            notification_type=Notification.Type.REGISTRATION_APPROVED,
            registration=registration,
            defaults={
                "event": registration.event,
                "title": "Registration approved",
                "message": (
                    f"Your registration for '{registration.event.title}' "
                    "has been approved."
                ),
            },
        )


class RegistrationRejectedStrategy(NotificationStrategy):
    def notify(self, domain_event, recipient=None):
        registration = domain_event.registration

        Notification.objects.get_or_create(
            recipient=registration.volunteer.user,
            notification_type=Notification.Type.REGISTRATION_REJECTED,
            registration=registration,
            defaults={
                "event": registration.event,
                "title": "Registration rejected",
                "message": (
                    f"Your registration for '{registration.event.title}' "
                    "has been rejected."
                ),
            },
        )


class DonationReceivedStrategy(NotificationStrategy):
    def notify(self, domain_event, recipient=None):
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


class DonationSentStrategy(NotificationStrategy):
    def notify(self, domain_event, recipient=None):
        donation = domain_event.donation

        if not donation.donor_id:
            return

        Notification.objects.create(
            recipient=donation.donor,
            notification_type=Notification.Type.DONATION_SENT,
            donation=donation,
            title="Your donation was sent",
            message=(
                f"Your donation of {donation.amount} to "
                f"{donation.ngo.name} was sent successfully."
            ),
        )


class DonationAcknowledgedStrategy(NotificationStrategy):
    def notify(self, domain_event, recipient=None):
        donation = domain_event.donation

        if not donation.donor_id:
            return

        Notification.objects.create(
            recipient=donation.donor,
            notification_type=Notification.Type.DONATION_ACKNOWLEDGED,
            donation=donation,
            title="Your donation was acknowledged",
            message=(
                f"{donation.ngo.name} has acknowledged your donation "
                f"of {donation.amount}. Thank you for your support!"
            ),
        )


class CoordinatorAssignmentStrategy(NotificationStrategy):
    def notify(self, domain_event, recipient=None):
        event = domain_event.event

        if not event.coordinator_id:
            return

        Notification.objects.create(
            recipient=event.coordinator,
            notification_type=Notification.Type.COORDINATOR_ASSIGNED,
            event=event,
            title=f"You were assigned to coordinate {event.title}",
            message=(
                f"You have been assigned as the coordinator for "
                f"'{event.title}'."
            ),
        )


class CoordinatorRemovalStrategy(NotificationStrategy):
    def notify(self, domain_event, recipient=None):
        event = domain_event.event

        Notification.objects.create(
            recipient=domain_event.previous_coordinator,
            notification_type=Notification.Type.COORDINATOR_REMOVED,
            event=event,
            title=f"You were reassigned from {event.title}",
            message=domain_event.reason,
        )


class NewEventPublishedStrategy(NotificationStrategy):
    """Strategy for creating a new-event notification for one observer."""
    def notify(self, domain_event, recipient=None):
        if recipient is None:
            return

        event = domain_event.event

        Notification.objects.get_or_create(
            recipient=recipient,
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


class EventReminderStrategy(NotificationStrategy):
    def notify(self, domain_event, recipient=None):
        if recipient is None:
            return

        event = domain_event.event
        registration = (
            event.registrations
            .filter(
                volunteer__user=recipient,
                status=Registration.Status.APPROVED,
            )
            .first()
        )

        if registration is None:
            return

        Notification.objects.get_or_create(
            recipient=recipient,
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


class TeamAssignmentStrategy(NotificationStrategy):
    def notify(self, domain_event, recipient=None):
        membership = domain_event.membership

        Notification.objects.get_or_create(
            recipient=membership.volunteer.user,
            notification_type=Notification.Type.TEAM_ASSIGNED,
            team_membership=membership,
            defaults={
                "event": membership.team.event,
                "title": f"You were assigned to {membership.team.name}",
                "message": (
                    f"You have been assigned to the "
                    f"'{membership.team.name}' team for "
                    f"'{membership.team.event.title}'."
                ),
            },
        )


class CertificateIssuedStrategy(NotificationStrategy):
    def notify(self, domain_event, recipient=None):
        certificate = domain_event.certificate

        Notification.objects.get_or_create(
            recipient=certificate.volunteer.user,
            notification_type=Notification.Type.CERTIFICATE_ISSUED,
            certificate=certificate,
            defaults={
                "event": certificate.event,
                "title": f"Certificate ready for {certificate.event.title}",
                "message": (
                    f"Your certificate of participation for "
                    f"'{certificate.event.title}' is ready to download."
                ),
            },
        )
from abc import ABC, abstractmethod

from events.models import Registration
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
    TeamMemberAssigned,
)
from .models import Notification


# STRATEGY INTERFACE

class NotificationStrategy(ABC):

    @abstractmethod
    def handles(self, domain_event):
        """Return True if this strategy knows how to react to domain_event."""

    @abstractmethod
    def notify(self, domain_event):
        """Create the Notification row(s) for domain_event."""


# CONCRETE STRATEGIES

class RegistrationReceivedStrategy(NotificationStrategy):
    """Tells the NGO administrator a volunteer registered."""

    def handles(self, domain_event):
        return isinstance(domain_event, RegistrationCreated)

    def notify(self, domain_event):
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


class DonationReceivedStrategy(NotificationStrategy):
    """Tells the NGO administrator a donation came in."""

    def handles(self, domain_event):
        return isinstance(domain_event, DonationReceived)

    def notify(self, domain_event):
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
    """Confirms to the donor that their donation was sent. Reacts to
    the same DonationReceived event as DonationReceivedStrategy above -
    one occurrence, two independent recipients (NGO admin and donor),
    which is exactly what having two separate Observers is for."""

    def handles(self, domain_event):
        return isinstance(domain_event, DonationReceived)

    def notify(self, domain_event):
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
    """Tells the donor their donation was acknowledged by the NGO."""

    def handles(self, domain_event):
        return isinstance(domain_event, DonationAcknowledged)

    def notify(self, domain_event):
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
    """Tells a coordinator they were assigned to an event."""

    def handles(self, domain_event):
        return isinstance(domain_event, CoordinatorAssigned)

    def notify(self, domain_event):
        event = domain_event.event

        if not event.coordinator_id:
            return

        # A plain create() (not get_or_create) is deliberate: a
        # coordinator can be assigned to the same event more than once
        # over time (assigned, later removed, later reassigned), and
        # each assignment is a distinct occurrence that deserves its
        # own notification rather than being silently deduplicated
        # against an old row.
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
    """Tells the previous coordinator they were reassigned off an
    event, along with the reason the NGO administrator gave."""

    def handles(self, domain_event):
        return isinstance(domain_event, CoordinatorRemoved)

    def notify(self, domain_event):
        event = domain_event.event

        Notification.objects.create(
            recipient=domain_event.previous_coordinator,
            notification_type=Notification.Type.COORDINATOR_REMOVED,
            event=event,
            title=f"You were reassigned from {event.title}",
            message=domain_event.reason,
        )


class RegistrationStatusStrategy(NotificationStrategy):
    """Tells a volunteer their registration was approved/rejected."""

    def handles(self, domain_event):
        return isinstance(domain_event, RegistrationStatusChanged)

    def notify(self, domain_event):
        registration = domain_event.registration

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


class NewEventPublishedStrategy(NotificationStrategy):
    """Broadcasts a newly published event to every volunteer."""

    def handles(self, domain_event):
        return isinstance(domain_event, EventPublished)

    def notify(self, domain_event):
        event = domain_event.event
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


class EventReminderStrategy(NotificationStrategy):
    """Reminds approved registrants an event is coming up."""

    def handles(self, domain_event):
        return isinstance(domain_event, EventReminderDue)

    def notify(self, domain_event):
        event = domain_event.event

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


class TeamAssignmentStrategy(NotificationStrategy):
    """Tells a volunteer they were assigned to a team."""

    def handles(self, domain_event):
        return isinstance(domain_event, TeamMemberAssigned)

    def notify(self, domain_event):
        membership = domain_event.membership

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


class CertificateIssuedStrategy(NotificationStrategy):
    """Tells a volunteer their certificate is ready."""

    def handles(self, domain_event):
        return isinstance(domain_event, CertificateIssued)

    def notify(self, domain_event):
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


# DEFAULT STRATEGY SETS

def default_volunteer_strategies():
    return [
        RegistrationStatusStrategy(),
        NewEventPublishedStrategy(),
        EventReminderStrategy(),
        TeamAssignmentStrategy(),
        CertificateIssuedStrategy(),
    ]


def default_ngo_administrator_strategies():
    return [
        RegistrationReceivedStrategy(),
        DonationReceivedStrategy(),
    ]


def default_coordinator_strategies():
    return [
        CoordinatorAssignmentStrategy(),
        CoordinatorRemovalStrategy(),
    ]


def default_donor_strategies():
    return [
        DonationSentStrategy(),
        DonationAcknowledgedStrategy(),
    ]
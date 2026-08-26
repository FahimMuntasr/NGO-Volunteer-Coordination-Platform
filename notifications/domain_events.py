from dataclasses import dataclass
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from certificates.models import Certificate
    from donations.models import Donation
    from events.models import Event, Registration, TeamMembership

@dataclass(frozen=True)
class RegistrationCreated:
    registration: "Registration"

@dataclass(frozen=True)
class RegistrationStatusChanged:
    registration: "Registration"

@dataclass(frozen=True)
class EventPublished:
    event: "Event"

@dataclass(frozen=True)
class EventReminderDue:
    event: "Event"

@dataclass(frozen=True)
class TeamMemberAssigned:
    membership: "TeamMembership"

@dataclass(frozen=True)
class DonationReceived:
    donation: "Donation"

@dataclass(frozen=True)
class CoordinatorAssigned:
    event: "Event"

@dataclass(frozen=True)
class CertificateIssued:
    certificate: "Certificate"
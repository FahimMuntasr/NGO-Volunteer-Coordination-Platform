from abc import ABC, abstractmethod

from django.core.exceptions import PermissionDenied
from django.db.models import Q

from accounts.models import User

from .models import Event


# Subject Interface
class AbstractEventService(ABC):
    """Common interface implemented by the Real Subject and Proxy."""

    @abstractmethod
    def get_events(self, user):
        """Return the events visible to the caller."""
        raise NotImplementedError

    @abstractmethod
    def create_event(self, user, event_data):
        """Create an event after access control has been applied."""
        raise NotImplementedError


# Real Subject
class RealEventService(AbstractEventService):
    """Handles the event data operations."""

    def get_events(self, user):
        return Event.objects.all()

    def create_event(self, user, event_data):
        # Assign many-to-many skills after creating the event.
        required_skills = event_data.pop("required_skills", None)

        event = Event.objects.create(**event_data)

        if required_skills is not None:
            event.required_skills.set(required_skills)

        return event


# Proxy Subject
class ProxyEventService(AbstractEventService):
    """Controls event visibility according to the user's role."""

    def __init__(self, real_service=None):
        self._real_service = real_service or RealEventService()

    def get_events(self, user):
        if not getattr(user, "is_authenticated", False):
            raise PermissionDenied("Authentication is required.")

        # Retrieve the available events from the real service.
        base_queryset = self._real_service.get_events(user)

        # Apply role-based visibility before returning the events.
        if user.role in (
            User.Role.NGO_ADMIN,
            User.Role.COORDINATOR,
        ):
            # Administrators and coordinators can view all event statuses.
            return base_queryset

        if user.role == User.Role.DONOR:
            # OPEN events are available for donor viewing.
            return base_queryset.filter(
                status=Event.Status.OPEN,
            )

        if user.role == User.Role.VOLUNTEER:
            # Include open events and events registered by the volunteer.
            return base_queryset.filter(
                Q(status=Event.Status.OPEN)
                | Q(registrations__volunteer__user=user)
            ).distinct()

        raise PermissionDenied("Access denied: unrecognized user role.")

    def create_event(self, user, event_data):
        # Event creation is restricted to NGO administrators.
        if user.role != User.Role.NGO_ADMIN:
            raise PermissionDenied(
                "Only NGO administrators can create events."
            )

        return self._real_service.create_event(user, event_data)

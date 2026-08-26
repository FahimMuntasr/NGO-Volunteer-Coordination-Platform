from abc import ABC, abstractmethod

from django.core.exceptions import PermissionDenied
from django.db.models import Q

from accounts.models import User

from .models import Event

from .builders import (
    DraftEventBuilder,
    EventDirector,
)


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
        required_skills = event_data.pop(
            "required_skills",
            [],
        )

        director = EventDirector()
        director.set_builder(DraftEventBuilder())

        coordinator = event_data.get("coordinator")

        common_kwargs = dict(
            ngo=event_data["ngo"],
            created_by=event_data["created_by"],
            title=event_data["title"],
            description=event_data["description"],
            location=event_data["location"],
            start_date=event_data["start_date"],
            end_date=event_data["end_date"],
            registration_deadline=event_data[
                "registration_deadline"
            ],
            volunteer_capacity=event_data.get(
                "volunteer_capacity"
            ),
            capacity_mode=event_data.get(
                "capacity_mode",
                Event.CapacityMode.FIXED,
            ),
        )

        # Pick the recipe that matches what was supplied: whether a
        # coordinator was assigned up front and whether required skills
        # were specified. The director/builder pair does not change -
        # only the sequence of steps invoked on it does.
        if coordinator and required_skills:
            return director.build_event_with_coordinator(
                coordinator=coordinator,
                required_skills=required_skills,
                **common_kwargs,
            )

        if coordinator:
            return director.build_assigned_event_without_skills(
                coordinator=coordinator,
                **common_kwargs,
            )

        if required_skills:
            return director.build_full_event(
                required_skills=required_skills,
                **common_kwargs,
            )

        return director.build_event_without_skills(**common_kwargs)


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

        if user.role == User.Role.NGO_ADMIN:
            return base_queryset.filter(
                ngo__administrator=user
            )

        if user.role == User.Role.COORDINATOR:
            return base_queryset.filter(
                coordinator=user
            )

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
        ngo = event_data.get("ngo")

        # NGO must be verified before creating events.
        if ngo is None or not ngo.is_verified:
            raise PermissionDenied(
                "Only verified NGOs can create events."
            )

        return self._real_service.create_event(user, event_data)
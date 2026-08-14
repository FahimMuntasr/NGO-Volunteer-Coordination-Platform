from abc import ABC, abstractmethod
from django.core.exceptions import PermissionDenied
from django.db.models import Q
from accounts.models import User
from .models import Event

# =======================================================
# 1. SUBJECT INTERFACE
# =======================================================
class AbstractEventService(ABC):
    """
    Defines the exact interface that both Real Subject and Proxy Subject implement.
    """
    @abstractmethod
    def get_events(self, user):
        pass

    @abstractmethod
    def create_event(self, user, event_data):
        pass


# =======================================================
# 2. REAL SUBJECT
# =======================================================
class RealEventService(AbstractEventService):
    """
    Handles the actual ORM queries and database execution.
    """
    def get_events(self, user):
        return Event.objects.all()

    def create_event(self, user, event_data):
        return Event.objects.create(**event_data)


# =======================================================
# 3. PROXY SUBJECT
# =======================================================
class ProxyEventService(AbstractEventService):
    """
    Controls access to RealEventService based on User Role.
    Strips unauthorized events dynamically before returning response.
    """
    def __init__(self):
        # Keeps internal reference to the Real Subject
        self._real_service = RealEventService()

    def get_events(self, user):
        # Fetch base queryset through Real Subject
        base_queryset = self._real_service.get_events(user)

        # NGO_ADMIN & COORDINATOR: Full visibility of all events
        if user.role in [User.Role.NGO_ADMIN, User.Role.COORDINATOR]:
            return base_queryset.all()

        # VOLUNTEER: Can see Active/Open events OR events they registered for
        elif user.role == User.Role.VOLUNTEER:
            return base_queryset.filter(
                Q(status__in=["ACTIVE", "OPEN"]) | 
                Q(registrations__volunteer__user=user)
            ).distinct()

        # DONOR: Can only see active public events
        elif user.role == User.Role.DONOR:
            return base_queryset.filter(status="ACTIVE")

        else:
            raise PermissionDenied("Access Denied: Unrecognized user role.")

    def create_event(self, user, event_data):
        # Access control on action
        if user.role not in [User.Role.NGO_ADMIN, User.Role.COORDINATOR]:
            raise PermissionDenied("Access Denied: Only Admins and Coordinators can create events.")

        # Delegate execution to Real Subject if access granted
        return self._real_service.create_event(user, event_data)
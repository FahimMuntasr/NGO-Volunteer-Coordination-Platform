from abc import ABC, abstractmethod

from django.utils import timezone
from rest_framework.exceptions import ValidationError

from .models import Event, Registration


# Component
class RegistrationService(ABC):

    @abstractmethod
    def register(self, volunteer, event):
        pass


# Concrete Component
class BasicRegistrationService(RegistrationService):

    def register(self, volunteer, event):
        return Registration.objects.create(
            event=event,
            volunteer=volunteer,
        )


# Base Decorator
class RegistrationServiceDecorator(RegistrationService):

    def __init__(self, service):
        self._service = service

    def register(self, volunteer, event):
        return self._service.register(
            volunteer,
            event,
        )


# Concrete Decorator 1
class EventOpenDecorator(
    RegistrationServiceDecorator
):

    def register(self, volunteer, event):
        if event.status != Event.Status.OPEN:
            raise ValidationError(
                {
                    "detail": (
                        "This event is not open "
                        "for registration."
                    )
                }
            )

        return self._service.register(
            volunteer,
            event,
        )


# Concrete Decorator 2
class RegistrationDeadlineDecorator(
    RegistrationServiceDecorator
):

    def register(self, volunteer, event):
        if timezone.now() >= event.registration_deadline:
            raise ValidationError(
                {
                    "detail": (
                        "The registration deadline "
                        "has passed."
                    )
                }
            )

        return self._service.register(
            volunteer,
            event,
        )


# Concrete Decorator 3
class DuplicateRegistrationDecorator(
    RegistrationServiceDecorator
):

    def register(self, volunteer, event):
        already_registered = (
            Registration.objects
            .filter(
                event=event,
                volunteer=volunteer,
            )
            .exists()
        )

        if already_registered:
            raise ValidationError(
                {
                    "detail": (
                        "You have already registered "
                        "for this event."
                    )
                }
            )

        return self._service.register(
            volunteer,
            event,
        )


# Concrete Decorator 4
class CapacityDecorator(
    RegistrationServiceDecorator
):

    def register(self, volunteer, event):
        approved_count = (
            event.registrations
            .filter(
                status=Registration.Status.APPROVED,
            )
            .count()
        )

        if (
            event.capacity_mode == Event.CapacityMode.FIXED
            and approved_count >= event.volunteer_capacity
        ):
            raise ValidationError(
                {
                    "detail": (
                        "This event has reached "
                        "its capacity."
                    )
                }
            )

        return self._service.register(
            volunteer,
            event,
        )
from decimal import Decimal, ROUND_HALF_UP

from django.db import transaction
from rest_framework.exceptions import PermissionDenied, ValidationError

from accounts.models import User
from certificates.services import CertificateService

from .models import Event, Registration


class EventCompletionFacade:
    """
    Facade for completing an event.

    It coordinates all the steps required when an event
    is completed so the API view only needs to call
    one method.
    """

    @staticmethod
    @transaction.atomic
    def complete_event(event, user):

        # 1. Check that the correct NGO admin is completing the event.
        if (
            user.role != User.Role.NGO_ADMIN
            or event.ngo.administrator_id != user.id
        ):
            raise PermissionDenied(
                "Only this NGO's administrator can complete the event."
            )

        # 2. Only an IN_PROGRESS event can be completed.
        if event.status != Event.Status.IN_PROGRESS:
            raise ValidationError(
                "Only an event that is in progress can be completed."
            )

        # 3. Get all approved registrations.
        registrations = (
            event.registrations
            .select_related("volunteer")
            .filter(status=Registration.Status.APPROVED)
        )

        # 4. Attendance must be marked before completing the event.
        if registrations.filter(
            attendance_status=(
                Registration.AttendanceStatus.NOT_MARKED
            )
        ).exists():
            raise ValidationError(
                "Attendance must be marked for all approved "
                "volunteers before completing the event."
            )

        # 5. Calculate event duration in hours.
        seconds = Decimal(
            str(
                (
                    event.end_date - event.start_date
                ).total_seconds()
            )
        )

        event_hours = (
            seconds / Decimal("3600")
        ).quantize(
            Decimal("0.01"),
            rounding=ROUND_HALF_UP,
        )

        certificates_generated = 0
        completed_registrations = 0

        # 6. Process every approved volunteer.
        for registration in registrations:

            volunteer = registration.volunteer

            # Only PRESENT volunteers earn hours
            # and receive certificates.
            if (
                registration.attendance_status
                == Registration.AttendanceStatus.PRESENT
            ):
                registration.hours_earned = event_hours

                volunteer.total_hours += event_hours
                volunteer.completed_events += 1

                volunteer.save(
                    update_fields=[
                        "total_hours",
                        "completed_events",
                    ]
                )

                # Uses our existing Factory Method implementation.
                CertificateService.generate_certificate(
                    registration
                )

                certificates_generated += 1

            else:
                registration.hours_earned = Decimal("0.00")

            # Complete the registration.
            registration.status = Registration.Status.COMPLETED

            registration.save(
                update_fields=[
                    "status",
                    "hours_earned",
                ]
            )

            completed_registrations += 1

        # 7. Finally complete the event.
        event.status = Event.Status.COMPLETED
        event.save(update_fields=["status"])

        # 8. Return a summary to the API.
        return {
            "message": "Event completed successfully.",
            "event_id": event.id,
            "event_status": event.status,
            "event_hours": str(event_hours),
            "completed_registrations": completed_registrations,
            "certificates_generated": certificates_generated,
        }
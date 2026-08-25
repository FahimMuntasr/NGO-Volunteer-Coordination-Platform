from decimal import Decimal, ROUND_HALF_UP

from rest_framework.exceptions import (
    PermissionDenied,
    ValidationError,
)

from accounts.models import User
from certificates.services import CertificateService

from .models import Event, Registration


# =========================================
# SUBSYSTEM 1
# =========================================
class EventValidationService:

    def validate_event(self, event, user):

        if (
            user.role != User.Role.NGO_ADMIN
            or event.ngo.administrator_id != user.id
        ):
            raise PermissionDenied(
                "Only this NGO's administrator "
                "can complete the event."
            )

        if event.status != Event.Status.IN_PROGRESS:
            raise ValidationError(
                "Only an event that is in progress "
                "can be completed."
            )


# =========================================
# SUBSYSTEM 2
# =========================================
class AttendanceService:

    def get_approved_registrations(self, event):

        return (
            event.registrations
            .select_related("volunteer")
            .filter(
                status=Registration.Status.APPROVED
            )
        )

    def check_attendance(self, registrations):

        attendance_missing = registrations.filter(
            attendance_status=(
                Registration.AttendanceStatus.NOT_MARKED
            )
        ).exists()

        if attendance_missing:
            raise ValidationError(
                "Attendance must be marked for all "
                "approved volunteers before "
                "completing the event."
            )


# =========================================
# SUBSYSTEM 3
# =========================================
class EventHoursService:

    def calculate_hours(self, event):

        duration = event.end_date - event.start_date

        seconds = Decimal(
            str(duration.total_seconds())
        )

        hours = (
            seconds / Decimal("3600")
        ).quantize(
            Decimal("0.01"),
            rounding=ROUND_HALF_UP,
        )

        return hours


# =========================================
# SUBSYSTEM 4
# =========================================
class VolunteerProgressService:

    def process_volunteer(
        self,
        registration,
        event_hours,
    ):

        volunteer = registration.volunteer

        certificate_generated = False

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

            CertificateService.generate_certificate(
                registration
            )

            certificate_generated = True

        else:
            registration.hours_earned = Decimal("0.00")

        registration.status = (
            Registration.Status.COMPLETED
        )

        registration.save(
            update_fields=[
                "status",
                "hours_earned",
            ]
        )

        return certificate_generated


# =========================================
# SUBSYSTEM 5
# =========================================
class EventStatusService:

    def complete_event(self, event):

        event.status = Event.Status.COMPLETED

        event.save(
            update_fields=["status"]
        )

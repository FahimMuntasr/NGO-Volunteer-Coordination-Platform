from django.db import transaction

from .completion_services import (
    AttendanceService,
    EventHoursService,
    EventStatusService,
    EventValidationService,
    VolunteerProgressService,
)


# =========================================
# FACADE
# =========================================
class EventCompletionFacade:

    def __init__(self):

        self.validation = EventValidationService()
        self.attendance = AttendanceService()
        self.hours = EventHoursService()
        self.volunteer_progress = VolunteerProgressService()
        self.event_status = EventStatusService()

    @transaction.atomic
    def complete_event(self, event, user):

        # Step 1: Validate event
        self.validation.validate_event(
            event,
            user,
        )

        # Step 2: Get approved registrations
        registrations = (
            self.attendance
            .get_approved_registrations(event)
        )

        # Step 3: Check attendance
        self.attendance.check_attendance(
            registrations
        )

        # Step 4: Calculate event hours
        event_hours = self.hours.calculate_hours(
            event
        )

        certificates_generated = 0
        completed_registrations = 0

        # Step 5: Process volunteers
        for registration in registrations:

            certificate_generated = (
                self.volunteer_progress
                .process_volunteer(
                    registration,
                    event_hours,
                )
            )

            if certificate_generated:
                certificates_generated += 1

            completed_registrations += 1

        # Step 6: Complete event
        self.event_status.complete_event(
            event
        )

        return {
            "message": "Event completed successfully.",
            "event_id": event.id,
            "event_status": event.status,
            "event_hours": str(event_hours),
            "completed_registrations": (
                completed_registrations
            ),
            "certificates_generated": (
                certificates_generated
            ),
        }
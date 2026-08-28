from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from volunteering.models import VolunteerProfile

from events.models import Event
from notifications.domain_events import EventReminderDue
from notifications.observers import notify_volunteers


class Command(BaseCommand):
    help = "Send reminders for events starting tomorrow."

    def handle(self, *args, **options):
        tomorrow = timezone.localdate() + timedelta(days=1)

        events = Event.objects.filter(
            start_date__date=tomorrow,
            status__in=[
                Event.Status.OPEN,
                Event.Status.IN_PROGRESS,
            ],
        )

        for event in events:
            approved_volunteers = (
                event.registrations
                .filter(status="APPROVED")
                .select_related("volunteer__user")
                .values_list("volunteer", flat=True)
            )

            volunteers = VolunteerProfile.objects.filter(
                id__in=approved_volunteers
            ).select_related("user")

            notify_volunteers(
                volunteers,
                EventReminderDue(event),
            )

        self.stdout.write(
            self.style.SUCCESS(
                "Event reminders were processed successfully."
            )
        )
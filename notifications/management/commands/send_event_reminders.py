from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from events.models import Event
from notifications.domain_events import EventReminderDue
from notifications.observers import notification_subject


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
            notification_subject.notify(EventReminderDue(event))

        self.stdout.write(
            self.style.SUCCESS(
                "Event reminders were processed successfully."
            )
        )
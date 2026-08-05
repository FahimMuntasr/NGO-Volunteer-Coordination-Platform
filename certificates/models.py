import uuid

from django.db import models

from events.models import Event
from volunteering.models import VolunteerProfile


class Certificate(models.Model):
    volunteer = models.ForeignKey(
        VolunteerProfile,
        on_delete=models.CASCADE,
        related_name="certificates",
    )

    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name="certificates",
    )

    issued_at = models.DateTimeField(auto_now_add=True)

    verification_code = models.UUIDField(
        default=uuid.uuid4,
        editable=False,
        unique=True,
    )

    file = models.FileField(
        upload_to="certificates/",
        blank=True,
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["volunteer", "event"],
                name="unique_volunteer_event_certificate",
            )
        ]

    def __str__(self):
        return f"{self.volunteer} - {self.event}"
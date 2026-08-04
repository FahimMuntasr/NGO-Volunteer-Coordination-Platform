from django.conf import settings
from django.db import models

from organizations.models import NGO
from volunteering.models import Skill, VolunteerProfile


class Event(models.Model):
    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        OPEN = "OPEN", "Open for Registration"
        IN_PROGRESS = "IN_PROGRESS", "In Progress"
        COMPLETED = "COMPLETED", "Completed"
        CANCELLED = "CANCELLED", "Cancelled"

    ngo = models.ForeignKey(
        NGO,
        on_delete=models.CASCADE,
        related_name="events",
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="created_events",
    )

    title = models.CharField(max_length=150)
    description = models.TextField()
    location = models.CharField(max_length=200)

    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    registration_deadline = models.DateTimeField()

    volunteer_capacity = models.PositiveIntegerField()

    required_skills = models.ManyToManyField(
        Skill,
        blank=True,
        related_name="events",
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
    )

    def __str__(self):
        return self.title

class Registration(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        APPROVED = "APPROVED", "Approved"
        REJECTED = "REJECTED", "Rejected"
        CANCELLED = "CANCELLED", "Cancelled"
        COMPLETED = "COMPLETED", "Completed"

    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name="registrations",
    )

    volunteer = models.ForeignKey(
        VolunteerProfile,
        on_delete=models.CASCADE,
        related_name="registrations",
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )

    registered_at = models.DateTimeField(auto_now_add=True)
    approved_at = models.DateTimeField(null=True, blank=True)

    attendance_marked = models.BooleanField(default=False)
    hours_earned = models.PositiveIntegerField(default=0)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["event", "volunteer"],
                name="unique_event_volunteer_registration",
            )
        ]

    def __str__(self):
        return (
            f"{self.volunteer} - "
            f"{self.event} - "
            f"{self.get_status_display()}"
        )
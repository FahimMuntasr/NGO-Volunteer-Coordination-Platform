from decimal import Decimal

from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
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
        on_delete=models.PROTECT,
        related_name="created_events",
    )

    title = models.CharField(max_length=150)
    description = models.TextField()
    location = models.CharField(max_length=200)

    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    registration_deadline = models.DateTimeField()

    volunteer_capacity = models.PositiveIntegerField(
    validators=[MinValueValidator(1)]
)

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

def clean(self):
    errors = {}

    if (
        self.start_date
        and self.end_date
        and self.end_date <= self.start_date
    ):
        errors["end_date"] = (
            "The event end date must be after the start date."
        )

    if (
        self.registration_deadline
        and self.start_date
        and self.registration_deadline >= self.start_date
    ):
        errors["registration_deadline"] = (
            "The registration deadline must be before the event starts."
        )

    if errors:
        raise ValidationError(errors)

def __str__(self):
        return self.title

class Registration(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        APPROVED = "APPROVED", "Approved"
        REJECTED = "REJECTED", "Rejected"
        CANCELLED = "CANCELLED", "Cancelled"
        COMPLETED = "COMPLETED", "Completed"

    class AttendanceStatus(models.TextChoices):
        NOT_MARKED = "NOT_MARKED", "Not Marked"
        PRESENT = "PRESENT", "Present"
        ABSENT = "ABSENT", "Absent"
        EXCUSED = "EXCUSED", "Excused"

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

    attendance_status = models.CharField(
        max_length=20,
        choices=AttendanceStatus.choices,
        default=AttendanceStatus.NOT_MARKED,
    )

    hours_earned = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00"))],
    )       
    

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

class Team(models.Model):
    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name="teams",
    )

    name = models.CharField(max_length=100)

    leader = models.ForeignKey(
        VolunteerProfile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="led_teams",
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["event", "name"],
                name="unique_team_name_per_event",
            )
        ]

    def __str__(self):
        return f"{self.name} - {self.event.title}"

class TeamMembership(models.Model):
    team = models.ForeignKey(
        Team,
        on_delete=models.CASCADE,
        related_name="memberships",
    )

    volunteer = models.ForeignKey(
        VolunteerProfile,
        on_delete=models.CASCADE,
        related_name="team_memberships",
    )

    assigned_task = models.CharField(
        max_length=250,
        blank=True,
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["team", "volunteer"],
                name="unique_team_volunteer",
            )
        ]

    def __str__(self):
        return f"{self.volunteer} - {self.team}"
from django.db import models
from django.conf import settings

class Notification(models.Model):
    class Type(models.TextChoices):
        REGISTRATION_RECEIVED = (
            "REGISTRATION_RECEIVED",
            "Registration Received",
        )
        REGISTRATION_APPROVED = (
            "REGISTRATION_APPROVED",
            "Registration Approved",
        )
        REGISTRATION_REJECTED = (
            "REGISTRATION_REJECTED",
            "Registration Rejected",
        )
        EVENT_PUBLISHED = "EVENT_PUBLISHED", "New Event Published"
        EVENT_REMINDER = "EVENT_REMINDER", "Event Reminder"
        TEAM_ASSIGNED = "TEAM_ASSIGNED", "Team Assigned"
        DONATION_RECEIVED = "DONATION_RECEIVED", "Donation Received"
        DONATION_SENT = "DONATION_SENT", "Donation Sent"
        DONATION_ACKNOWLEDGED = (
            "DONATION_ACKNOWLEDGED",
            "Donation Acknowledged",
        )
        COORDINATOR_ASSIGNED = (
            "COORDINATOR_ASSIGNED",
            "Coordinator Assigned",
        )
        COORDINATOR_REMOVED = (
            "COORDINATOR_REMOVED",
            "Coordinator Removed",
        )
        CERTIFICATE_ISSUED = (
            "CERTIFICATE_ISSUED",
            "Certificate Issued",
        )

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )

    notification_type = models.CharField(
        max_length=30,
        choices=Type.choices,
    )

    event = models.ForeignKey(
        "events.Event",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="notifications",
    )

    registration = models.ForeignKey(
        "events.Registration",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="notifications",
    )

    team_membership = models.ForeignKey(
        "events.TeamMembership",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="notifications",
    )

    donation = models.ForeignKey(
        "donations.Donation",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="notifications",
    )

    certificate = models.ForeignKey(
        "certificates.Certificate",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="notifications",
    )

    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.recipient.username}: {self.title}"
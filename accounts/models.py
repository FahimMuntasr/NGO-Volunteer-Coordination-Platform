from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        VOLUNTEER = "VOLUNTEER", "Volunteer"
        NGO_ADMIN = "NGO_ADMIN", "NGO Administrator"
        COORDINATOR = "COORDINATOR", "Event Coordinator"
        DONOR = "DONOR", "Donor"

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.VOLUNTEER,
    )

    phone = models.CharField(
        max_length=20,
        blank=True,
    )

    def __str__(self):
        return f"{self.username} - {self.get_role_display()}"
    
class CoordinatorProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="coordinator_profile",
    )

    specialization = models.CharField(
        max_length=150,
        blank=True,
    )

    experience_notes = models.TextField(
        blank=True,
    )

    def __str__(self):
        return (
            self.user.get_full_name()
            or self.user.username
        )


class DonorProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="donor_profile",
    )

    organization_name = models.CharField(
        max_length=150,
        blank=True,
    )

    preferred_causes = models.TextField(
        blank=True,
    )

    def __str__(self):
        return (
            self.user.get_full_name()
            or self.user.username
        )

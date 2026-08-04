from django.db import models

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

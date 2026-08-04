from django.conf import settings
from django.db import models


class Skill(models.Model):
    name = models.CharField(
        max_length=100,
        unique=True,
    )

    def __str__(self):
        return self.name


class VolunteerProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="volunteer_profile",
    )

    skills = models.ManyToManyField(
        Skill,
        blank=True,
        related_name="volunteers",
    )

    total_hours = models.PositiveIntegerField(default=0)
    completed_events = models.PositiveIntegerField(default=0)
    availability_notes = models.TextField(blank=True)

    def __str__(self):
        return self.user.get_full_name() or self.user.username
from django.conf import settings
from django.db import models


class NGO(models.Model):
    name = models.CharField(max_length=150)
    address = models.TextField(blank=True)
    email = models.EmailField()
    description = models.TextField(blank=True)

    administrator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="managed_ngos",
    )

    is_verified = models.BooleanField(default=False)

    def __str__(self):
        return self.name

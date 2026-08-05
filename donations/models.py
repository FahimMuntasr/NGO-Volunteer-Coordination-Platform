from decimal import Decimal

from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models

from organizations.models import NGO


class Donation(models.Model):
    ngo = models.ForeignKey(
        NGO,
        on_delete=models.CASCADE,
        related_name="donations",
    )

    donor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="donations",
    )

    donor_name = models.CharField(max_length=150)

    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
    )

    allocation_details = models.TextField(blank=True)

    donated_at = models.DateTimeField(auto_now_add=True)

    acknowledgement_sent = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.donor_name} - {self.amount} - {self.ngo.name}"

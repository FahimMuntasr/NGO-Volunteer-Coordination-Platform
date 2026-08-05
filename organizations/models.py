from django.conf import settings
from django.db import models


class NGO(models.Model):
    name = models.CharField(max_length=150)
    address = models.TextField(blank=True)
    email = models.EmailField()
    description = models.TextField(blank=True)

    administrator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="managed_ngos",
    )   

    is_verified = models.BooleanField(default=False)

    def __str__(self):
        return self.name

class OrganizationMembership(models.Model):
    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Administrator"
        COORDINATOR = "COORDINATOR", "Event Coordinator"

    ngo = models.ForeignKey(
        NGO,
        on_delete=models.CASCADE,
        related_name="memberships",
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="organization_memberships",
    )

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
    )

    is_active = models.BooleanField(default=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["ngo", "user"],
                name="unique_ngo_user_membership",
            )
        ]

    def __str__(self):
        return (
            f"{self.user.username} - "
            f"{self.ngo.name} - "
            f"{self.get_role_display()}"
        )
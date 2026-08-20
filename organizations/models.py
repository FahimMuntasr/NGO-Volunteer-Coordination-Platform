from django.conf import settings
from django.db import models


class NGO(models.Model):
    class VerificationStatus(models.TextChoices):
        PENDING = "PENDING", "Pending"
        VERIFIED = "VERIFIED", "Verified"
        REJECTED = "REJECTED", "Rejected"

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

    registration_number = models.CharField(
        max_length=100,
        blank=True,
    )

    verification_status = models.CharField(
        max_length=20,
        choices=VerificationStatus.choices,
        default=VerificationStatus.PENDING,
    )

    verified_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    registry_entry = models.ForeignKey(
        "VerifiedNGORegistry",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="platform_ngos",
    )

    def __str__(self):
        return self.name
    
class VerifiedNGORegistry(models.Model):
    name = models.CharField(max_length=255)

    registration_number = models.CharField(
        max_length=100,
        unique=True,
    )

    address = models.TextField(blank=True)

    registration_date = models.DateField(
        null=True,
        blank=True,
    )

    renewed_on = models.DateField(
        null=True,
        blank=True,
    )

    valid_upto = models.DateField(
        null=True,
        blank=True,
    )

    district = models.CharField(
        max_length=100,
        blank=True,
    )

    country = models.CharField(
        max_length=100,
        default="Bangladesh",
    )

    remarks = models.TextField(blank=True)

    source_name = models.CharField(
        max_length=150,
        default="Bangladesh NGO Affairs Bureau",
    )

    imported_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return (
            f"{self.name} "
            f"({self.registration_number})"
        )

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
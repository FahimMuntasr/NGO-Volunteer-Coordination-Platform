from django.contrib import admin

from .models import (
    NGO,
    OrganizationMembership,
    VerifiedNGORegistry,
)


@admin.register(NGO)
class NGOAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "registration_number",
        "verification_status",
        "is_verified",
    )

    search_fields = (
        "name",
        "registration_number",
    )


@admin.register(VerifiedNGORegistry)
class VerifiedNGORegistryAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "registration_number",
        "source_name",
    )

    search_fields = (
        "name",
        "registration_number",
    )


admin.site.register(OrganizationMembership)
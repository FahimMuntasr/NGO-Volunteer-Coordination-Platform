from django.contrib import admin

from accounts.models import User
from .models import Event, Registration, Team, TeamMembership


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "ngo",
        "start_date",
        "status",
    )

    def has_add_permission(self, request):
        return (
            request.user.is_superuser
            or request.user.role == User.Role.NGO_ADMIN
        )

    def has_change_permission(self, request, obj=None):
        return (
            request.user.is_superuser
            or request.user.role == User.Role.NGO_ADMIN
        )

    def has_delete_permission(self, request, obj=None):
        return (
            request.user.is_superuser
            or request.user.role == User.Role.NGO_ADMIN
        )


admin.site.register(Registration)
admin.site.register(Team)
admin.site.register(TeamMembership)
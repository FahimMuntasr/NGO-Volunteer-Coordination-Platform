from django.contrib import admin

from accounts.models import User
from .models import Event, Registration, Team, TeamMembership
from .services import ProxyEventService


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "ngo",
        "start_date",
        "status",
    )

    def has_module_permission(self, request):
        # Shows the Events app on the Admin dashboard home page
        return request.user.is_authenticated and request.user.is_staff

    def has_view_permission(self, request, obj=None):
        # Allows users to open the events list page and view items
        return request.user.is_authenticated and request.user.is_staff

    def get_queryset(self, request):
        """
        Delegates event retrieval strictly to the Proxy Subject.
        Superusers see all events; regular users (like Volunteers) get 
        dynamically filtered lists based on their role.
        """
        if request.user.is_superuser:
            return super().get_queryset(request)
        
        proxy = ProxyEventService()
        return proxy.get_events(request.user)

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
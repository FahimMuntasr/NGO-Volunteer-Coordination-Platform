from django.contrib import admin

from .models import Event, Registration, Team, TeamMembership


admin.site.register(Event)
admin.site.register(Registration)
admin.site.register(Team)
admin.site.register(TeamMembership)
from django.contrib import admin

from .models import NGO, OrganizationMembership


admin.site.register(NGO)
admin.site.register(OrganizationMembership)
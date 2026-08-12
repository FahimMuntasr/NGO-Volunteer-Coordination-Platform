from django.urls import path

from .views import NGODashboardView


urlpatterns = [
    path(
        "<int:ngo_id>/dashboard/",
        NGODashboardView.as_view(),
        name="ngo-dashboard",
    ),
]
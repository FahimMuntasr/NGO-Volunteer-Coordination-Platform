from django.urls import path

from .views import (
    NGODashboardView,
    NGOVerificationView,
)


urlpatterns = [
    path(
        "<int:ngo_id>/dashboard/",
        NGODashboardView.as_view(),
        name="ngo-dashboard",
    ),
    
    path(
    "<int:ngo_id>/verify/",
    NGOVerificationView.as_view(),
    name="ngo-verify",
),
]
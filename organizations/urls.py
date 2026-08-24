from django.urls import path

from .views import (
    NGODashboardView,
    NGOProfileView,
    NGOVerificationView,
    VerifiedNGOListView,
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
    
    path(
        "verified/",
        VerifiedNGOListView.as_view(),
        name="verified-ngo-list",
    ),
    
    path(
        "profile/",
        NGOProfileView.as_view(),
        name="ngo-profile",
    ),
]
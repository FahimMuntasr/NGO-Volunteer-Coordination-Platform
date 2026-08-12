from django.urls import path

from .views import (
    DonationAllocationUpdateView,
    DonationCreateView,
    DonorDonationListView,
    NGODonationListView,
)

urlpatterns = [
    path(
        "",
        DonationCreateView.as_view(),
        name="donation-create",
    ),
    path(
        "my/",
        DonorDonationListView.as_view(),
        name="donation-my-list",
    ),
    path(
        "ngo/",
        NGODonationListView.as_view(),
        name="donation-ngo-list",
    ),
    path(
        "<int:donation_id>/allocation/",
        DonationAllocationUpdateView.as_view(),
        name="donation-allocation-update",
    ),
]
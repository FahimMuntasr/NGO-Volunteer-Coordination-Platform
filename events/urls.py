from django.urls import path

from .views import (
    EventCreateView,
    EventDetailView,
    EventListView,
    EventRegistrationListView,
    EventRegistrationView,
    RegistrationApproveView,
    RegistrationRejectView,
)


urlpatterns = [
    path(
        "",
        EventListView.as_view(),
        name="event-list",
    ),

    path(
        "create/",
        EventCreateView.as_view(),
        name="event-create",
    ),

    path(
        "registrations/<int:pk>/approve/",
        RegistrationApproveView.as_view(),
        name="registration-approve",
    ),

    path(
        "registrations/<int:pk>/reject/",
        RegistrationRejectView.as_view(),
        name="registration-reject",
    ),

    path(
        "<int:event_id>/registrations/",
        EventRegistrationListView.as_view(),
        name="event-registration-list",
    ),

    path(
        "<int:pk>/register/",
        EventRegistrationView.as_view(),
        name="event-register",
    ),

    path(
        "<int:pk>/",
        EventDetailView.as_view(),
        name="event-detail",
    ),
]
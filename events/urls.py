from django.urls import path

from .views import (
    EventCreateView,
    EventDetailView,
    EventListView,
    EventRegistrationView,
)


urlpatterns = [
    path("", EventListView.as_view(), name="event-list"),

    path(
        "create/",
        EventCreateView.as_view(),
        name="event-create",
    ),

    path(
        "<int:pk>/",
        EventDetailView.as_view(),
        name="event-detail",
    ),

    path(
    "<int:pk>/register/",
    EventRegistrationView.as_view(),
    name="event-register",
),
]
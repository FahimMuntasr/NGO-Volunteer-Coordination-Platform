from django.urls import path

from .views import (
    EventCreateView,
    EventDetailView,
    EventListView,
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
]
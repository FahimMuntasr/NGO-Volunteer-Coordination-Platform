from django.urls import path

from .views import (
    MyVolunteerProfileView,
    SkillListView,
    VolunteerHistoryView,
)

urlpatterns = [
    path(
        "me/",
        MyVolunteerProfileView.as_view(),
        name="volunteer-profile-me",
    ),

    path(
        "skills/",
        SkillListView.as_view(),
        name="skill-list",
    ),
    
    path(
        "me/history/",
        VolunteerHistoryView.as_view(),
        name="volunteer-history",
    ),
]
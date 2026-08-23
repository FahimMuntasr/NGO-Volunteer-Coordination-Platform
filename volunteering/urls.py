from django.urls import path

from .views import (
    MyRegistrationsView,
    MyVolunteerProfileView,
    SkillListView,
    VolunteerHistoryView,
    VolunteerRankingView,
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
    
    path(
        "me/registrations/",
        MyRegistrationsView.as_view(),
        name="volunteer-registrations",
    ),
    
    path(
        "rankings/",
        VolunteerRankingView.as_view(),
        name="volunteer-rankings",
    ),
]
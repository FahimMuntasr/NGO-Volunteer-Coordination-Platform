from django.urls import path

from .logout_view import LogoutView

from .views import (
    CoordinatorListView,
    CoordinatorProfileView,
    CurrentUserView,
    DonorProfileView,
    LoginView,
    PasswordResetConfirmView,
    PasswordResetRequestView,
    RegisterView,
)


urlpatterns = [

    path(
        "login/",
        LoginView.as_view(),
        name="login",
    ),

    path(
        "logout/",
        LogoutView.as_view(),
        name="logout",
    ),

    path(
        "me/",
        CurrentUserView.as_view(),
        name="current-user",
    ),

    path(
        "register/",
        RegisterView.as_view(),
        name="register",
    ),

    path(
        "password-reset/",
        PasswordResetRequestView.as_view(),
        name="password-reset",
    ),

    path(
        "password-reset/confirm/<str:uidb64>/<str:token>/",
        PasswordResetConfirmView.as_view(),
        name="password-reset-confirm",
    ),

    path(
        "coordinators/",
        CoordinatorListView.as_view(),
        name="coordinator-list",
    ),

    path(
        "donor-profile/",
        DonorProfileView.as_view(),
        name="donor-profile",
    ),

    path(
        "coordinator-profile/",
        CoordinatorProfileView.as_view(),
        name="coordinator-profile",
    ),
]
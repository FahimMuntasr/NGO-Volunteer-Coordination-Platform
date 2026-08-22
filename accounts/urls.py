from django.urls import path

from .views import (
    CurrentUserView,
    LoginView,
    RegisterView,
    PasswordResetConfirmView,
    PasswordResetRequestView,
    CoordinatorListView,
)


urlpatterns = [
    path("login/", LoginView.as_view(), name="login"),
    path("me/", CurrentUserView.as_view(), name="current-user"),
    path("register/", RegisterView.as_view(), name="register"),
    path("password-reset/", PasswordResetRequestView.as_view(),name="password-reset"),
    path("password-reset/confirm/<str:uidb64>/<str:token>/", PasswordResetConfirmView.as_view(),name="password-reset-confirm"),
    path("coordinators/",CoordinatorListView.as_view(),name="coordinator-list"),
]
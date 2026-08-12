from django.urls import path

from .views import (
    CurrentUserView,
    LoginView,
    RegisterView,
)


urlpatterns = [
    path("login/", LoginView.as_view(), name="login"),
    path("me/", CurrentUserView.as_view(), name="current-user"),
    path("register/",RegisterView.as_view(), name="register"),
]
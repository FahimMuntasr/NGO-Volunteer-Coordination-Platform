from django.urls import path

from .views import (
    CertificateVerificationView,
    MyCertificateListView,
)

urlpatterns = [
    path(
        "my/",
        MyCertificateListView.as_view(),
        name="certificate-my-list",
    ),
    path(
        "verify/<uuid:verification_code>/",
        CertificateVerificationView.as_view(),
        name="certificate-verify",
    ),
]
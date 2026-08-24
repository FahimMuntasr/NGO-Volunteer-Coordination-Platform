from django.urls import path

from .views import (
    AttendanceReportView,
    CertificateDownloadView,
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
        "<int:certificate_id>/download/",
        CertificateDownloadView.as_view(),
        name="certificate-download",
    ),

    path(
        "verify/<uuid:verification_code>/",
        CertificateVerificationView.as_view(),
        name="certificate-verify",
    ),

    path(
        "events/<int:event_id>/attendance-report/",
        AttendanceReportView.as_view(),
        name="attendance-report",
    ),
]
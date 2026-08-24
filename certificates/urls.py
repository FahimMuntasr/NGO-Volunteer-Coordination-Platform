from django.urls import path

from .views import (
    AttendanceReportView,
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
    path(
        "events/<int:event_id>/attendance-report/",
        AttendanceReportView.as_view(),
        name="attendance-report",
    ),
]
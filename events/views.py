from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework import status
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.generics import (
    CreateAPIView,
    ListAPIView,
    RetrieveAPIView,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from volunteering.models import VolunteerProfile

from .models import Event, Registration
from .serializers import (
    EventCreateSerializer,
    EventSerializer,
    RegistrationSerializer,
)

def user_can_manage_event(user, event):
    """Return True when the user administers the event's NGO."""
    return (
        user.role == User.Role.NGO_ADMIN
        and event.ngo.administrator_id == user.id
    )


class EventListView(ListAPIView):
    serializer_class = EventSerializer

    def get_queryset(self):
        return (
            Event.objects
            .select_related("ngo")
            .prefetch_related("required_skills")
            .order_by("start_date")
        )

class EventDetailView(RetrieveAPIView):
    queryset = (
        Event.objects
        .select_related("ngo", "created_by")
        .prefetch_related("required_skills")
    )

    serializer_class = EventSerializer


class EventCreateView(CreateAPIView):
    serializer_class = EventCreateSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user

        if user.role != User.Role.NGO_ADMIN:
            raise PermissionDenied(
                "Only NGO administrators can create events."
            )

        ngo = user.managed_ngos.first()

        if ngo is None:
            raise ValidationError(
                {
                    "ngo": (
                        "This administrator is not connected "
                        "to an NGO."
                    )
                }
            )

        serializer.save(
            ngo=ngo,
            created_by=user,
        )

class EventRegistrationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        user = request.user

        # Only volunteers can register.
        if user.role != User.Role.VOLUNTEER:
            return Response(
                {
                    "detail": (
                        "Only volunteers can register for events."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # The volunteer user must have a VolunteerProfile.
        try:
            volunteer_profile = user.volunteer_profile
        except VolunteerProfile.DoesNotExist:
            return Response(
                {
                    "detail": (
                        "Create a volunteer profile before "
                        "registering for an event."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        event = get_object_or_404(Event, pk=pk)

        # Registration is allowed only for open events.
        if event.status != Event.Status.OPEN:
            return Response(
                {
                    "detail": (
                        "This event is not open for registration."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Prevent registration after the deadline.
        if timezone.now() >= event.registration_deadline:
            return Response(
                {
                    "detail": (
                        "The registration deadline has passed."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Prevent duplicate registration.
        already_registered = Registration.objects.filter(
            event=event,
            volunteer=volunteer_profile,
        ).exists()

        if already_registered:
            return Response(
                {
                    "detail": (
                        "You have already registered for this event."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Stop registration when all places are already approved.
        approved_count = event.registrations.filter(
            status=Registration.Status.APPROVED,
        ).count()

        if approved_count >= event.volunteer_capacity:
            return Response(
                {
                    "detail": "This event has reached its capacity."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        registration = Registration.objects.create(
            event=event,
            volunteer=volunteer_profile,
        )

        return Response(
            RegistrationSerializer(registration).data,
            status=status.HTTP_201_CREATED,
        )

class EventRegistrationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, event_id):
        event = get_object_or_404(
            Event.objects.select_related("ngo"),
            pk=event_id,
        )

        if not user_can_manage_event(request.user, event):
            return Response(
                {
                    "detail": (
                        "You do not have permission to view "
                        "registrations for this event."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        registrations = (
            event.registrations
            .select_related("volunteer__user", "event")
            .order_by("-registered_at")
        )

        serializer = RegistrationSerializer(
            registrations,
            many=True,
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

class RegistrationApproveView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        registration = get_object_or_404(
            Registration.objects.select_related(
                "event__ngo",
                "volunteer__user",
            ),
            pk=pk,
        )

        event = registration.event

        if not user_can_manage_event(request.user, event):
            return Response(
                {
                    "detail": (
                        "You do not have permission to approve "
                        "this registration."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        if registration.status != Registration.Status.PENDING:
            return Response(
                {
                    "detail": (
                        "Only pending registrations can be approved."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        approved_count = event.registrations.filter(
            status=Registration.Status.APPROVED,
        ).count()

        if approved_count >= event.volunteer_capacity:
            return Response(
                {
                    "detail": (
                        "The event has reached its volunteer capacity."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        registration.status = Registration.Status.APPROVED
        registration.approved_at = timezone.now()

        registration.save(
            update_fields=[
                "status",
                "approved_at",
            ]
        )

        return Response(
            {
                "message": "Registration approved successfully.",
                "registration": RegistrationSerializer(
                    registration
                ).data,
            },
            status=status.HTTP_200_OK,
        )

class RegistrationRejectView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        registration = get_object_or_404(
            Registration.objects.select_related(
                "event__ngo",
                "volunteer__user",
            ),
            pk=pk,
        )

        event = registration.event

        if not user_can_manage_event(request.user, event):
            return Response(
                {
                    "detail": (
                        "You do not have permission to reject "
                        "this registration."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        if registration.status != Registration.Status.PENDING:
            return Response(
                {
                    "detail": (
                        "Only pending registrations can be rejected."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        registration.status = Registration.Status.REJECTED
        registration.approved_at = None

        registration.save(
            update_fields=[
                "status",
                "approved_at",
            ]
        )

        return Response(
            {
                "message": "Registration rejected successfully.",
                "registration": RegistrationSerializer(
                    registration
                ).data,
            },
            status=status.HTTP_200_OK,
        )
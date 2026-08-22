from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework import status
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.generics import (
    CreateAPIView,
    ListAPIView,
    RetrieveAPIView,
    UpdateAPIView,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from volunteering.models import VolunteerProfile
from .facades import EventCompletionFacade

from .models import Event, Registration, Team, TeamMembership
from .services import ProxyEventService
from .serializers import (
    EventCreateSerializer,
    EventSerializer,
    EventUpdateSerializer,
    RegistrationSerializer,
    TeamSerializer,
    TeamMembershipSerializer,
)

from notifications.domain_events import (
    EventPublished,
    RegistrationCreated,
    RegistrationStatusChanged,
    TeamMemberAssigned,
)
from notifications.observers import notification_subject

from .registration_decorators import (
    BasicRegistrationService,
    CapacityDecorator,
    DuplicateRegistrationDecorator,
    EventOpenDecorator,
    RegistrationDeadlineDecorator,
)

def user_can_manage_event(user, event):
    """Return True when the user administers the event's NGO."""
    return (
        user.role == User.Role.NGO_ADMIN
        and event.ngo.administrator_id == user.id
    )

def user_can_coordinate_event(user, event):
    return (
        user_can_manage_event(user, event)
        or (
            user.role == User.Role.COORDINATOR
            and event.coordinator_id == user.id
        )
    )

class EventListView(ListAPIView):
    """Return events available to the authenticated user."""

    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        proxy = ProxyEventService()

        return (
            proxy
            .get_events(self.request.user)
            .select_related("ngo", "created_by", "coordinator")
            .prefetch_related("required_skills")
            .order_by("start_date")
        )


class EventDetailView(RetrieveAPIView):
    """Return an event only when it is visible to the current user."""

    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        proxy = ProxyEventService()

        return (
            proxy
            .get_events(self.request.user)
            .select_related("ngo", "created_by", "coordinator")
            .prefetch_related("required_skills")
        )


class EventCreateView(CreateAPIView):
    serializer_class = EventCreateSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        user = request.user
        proxy = ProxyEventService()

        # 1. Let Proxy handles the permission check FIRST
        if user.role != User.Role.NGO_ADMIN:
            # Invoking the proxy with raw data triggers its role check and raises PermissionDenied
            proxy.create_event(user, request.data)

        # 2. NGO relationship check
        ngo = user.managed_ngos.first()
        if ngo is None:
            raise ValidationError(
                {"ngo": "This administrator is not connected to an NGO."}
            )

        # 3. Serializer validation SECOND
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # 4. Delegate actual creation to Proxy
        event_data = dict(serializer.validated_data)
        event_data["ngo"] = ngo
        event_data["created_by"] = user

        event = proxy.create_event(user, event_data)

        headers = self.get_success_headers(serializer.data)
        return Response(
            EventSerializer(event).data,
            status=status.HTTP_201_CREATED,
            headers=headers,
        )


class EventUpdateView(UpdateAPIView):
    queryset = Event.objects.select_related("ngo")
    serializer_class = EventUpdateSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        event = super().get_object()

        if not user_can_manage_event(
            self.request.user,
            event,
        ):
            raise PermissionDenied(
                "Only this NGO's administrator can edit this event."
            )

        return event
    
    def perform_update(self, serializer):
        previous_status = serializer.instance.status
        event = serializer.save()

        if (
            previous_status != Event.Status.OPEN
            and event.status == Event.Status.OPEN
        ):
            notification_subject.notify(EventPublished(event))

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

        registration_service = EventOpenDecorator(
        RegistrationDeadlineDecorator(
            DuplicateRegistrationDecorator(
                CapacityDecorator(
                    BasicRegistrationService()
                    )
                )
            )
        )

        registration = registration_service.register(
        volunteer_profile,
        event,
        )

        notification_subject.notify(
            RegistrationCreated(registration)
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

        if not user_can_coordinate_event(request.user, event):
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

        notification_subject.notify(
            RegistrationStatusChanged(registration)
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

        notification_subject.notify(
            RegistrationStatusChanged(registration)
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

class AssignCoordinatorView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, event_id):
        event = get_object_or_404(
            Event.objects.select_related("ngo"),
            pk=event_id,
        )

        if not user_can_manage_event(request.user, event):
            return Response(
                {
                    "detail": (
                        "Only this NGO's administrator can "
                        "assign a coordinator."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        coordinator_id = request.data.get("coordinator_id")

        coordinator = get_object_or_404(
            User,
            pk=coordinator_id,
            role=User.Role.COORDINATOR,
        )

        event.coordinator = coordinator
        event.save(update_fields=["coordinator"])

        return Response(
            {
                "message": "Coordinator assigned successfully.",
                "event_id": event.id,
                "coordinator": {
                    "id": coordinator.id,
                    "username": coordinator.username,
                },
            },
            status=status.HTTP_200_OK,
        )

class EventTeamListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, event_id):
        proxy = ProxyEventService()

        event = get_object_or_404(
            proxy.get_events(request.user),
            pk=event_id,
        )

        teams = (
            event.teams
            .select_related("leader__user")
            .prefetch_related("memberships__volunteer__user")
        )

        return Response(
            TeamSerializer(teams, many=True).data,
            status=status.HTTP_200_OK,
        )

    def post(self, request, event_id):
        event = get_object_or_404(
            Event.objects.select_related("ngo"),
            pk=event_id,
        )

        if not user_can_coordinate_event(request.user, event):
            return Response(
                {"detail": "You cannot create teams for this event."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = TeamSerializer(data=request.data)

        if serializer.is_valid():
            team = serializer.save(event=event)

            return Response(
                TeamSerializer(team).data,
                status=status.HTTP_201_CREATED,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

class AddTeamMemberView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, team_id):
        team = get_object_or_404(
            Team.objects.select_related("event__ngo"),
            pk=team_id,
        )

        event = team.event

        if not user_can_coordinate_event(request.user, event):
            return Response(
                {"detail": "You cannot manage this team."},
                status=status.HTTP_403_FORBIDDEN,
            )

        volunteer_id = request.data.get("volunteer_id")
        assigned_task = request.data.get(
            "assigned_task",
            "",
        )

        registration = get_object_or_404(
            Registration,
            event=event,
            volunteer_id=volunteer_id,
            status=Registration.Status.APPROVED,
        )

        already_assigned = TeamMembership.objects.filter(
            team__event=event,
            volunteer=registration.volunteer,
        ).exists()

        if already_assigned:
            return Response(
                {
                    "detail": (
                        "This volunteer is already assigned "
                        "to a team for this event."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        membership = TeamMembership.objects.create(
            team=team,
            volunteer=registration.volunteer,
            assigned_task=assigned_task,
        )

        notification_subject.notify(
            TeamMemberAssigned(membership)
        )

        return Response(
            TeamMembershipSerializer(membership).data,
            status=status.HTTP_201_CREATED,
        )

class RegistrationAttendanceView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        registration = get_object_or_404(
            Registration.objects.select_related(
                "event__ngo"
            ),
            pk=pk,
        )

        event = registration.event

        if not user_can_coordinate_event(request.user, event):
            return Response(
                {
                    "detail": (
                        "You cannot mark attendance "
                        "for this event."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        if registration.status != Registration.Status.APPROVED:
            return Response(
                {
                    "detail": (
                        "Attendance can only be marked "
                        "for approved volunteers."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        attendance_status = request.data.get(
            "attendance_status"
        )

        allowed_statuses = [
            Registration.AttendanceStatus.PRESENT,
            Registration.AttendanceStatus.ABSENT,
            Registration.AttendanceStatus.EXCUSED,
        ]

        if attendance_status not in allowed_statuses:
            return Response(
                {
                    "detail": (
                        "Attendance must be PRESENT, "
                        "ABSENT, or EXCUSED."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        registration.attendance_status = attendance_status

        registration.save(
            update_fields=["attendance_status"]
        )

        return Response(
            RegistrationSerializer(registration).data,
            status=status.HTTP_200_OK,
        )

class EventOpenView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, event_id):
        event = get_object_or_404(
            Event.objects.select_related("ngo"),
            pk=event_id,
        )

        if not user_can_manage_event(request.user, event):
            return Response(
                {
                    "detail": (
                        "You do not have permission to open this event."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        if event.status != Event.Status.DRAFT:
            return Response(
                {
                    "detail": (
                        "Only draft events can be opened."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        event.status = Event.Status.OPEN
        event.save(
            update_fields=["status"]
        )

        notification_subject.notify(
            EventPublished(event)
        )

        return Response(
            {
                "message": "Event opened successfully.",
                "event": EventSerializer(event).data,
            },
            status=status.HTTP_200_OK,
        )


class EventStartView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, event_id):
        event = get_object_or_404(
            Event.objects.select_related("ngo"),
            pk=event_id,
        )

        if not user_can_manage_event(request.user, event):
            return Response(
                {
                    "detail": (
                        "You do not have permission to start this event."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        if event.status != Event.Status.OPEN:
            return Response(
                {
                    "detail": (
                        "Only open events can be started."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        event.status = Event.Status.IN_PROGRESS
        event.save(update_fields=["status"])

        return Response(
            {
                "message": "Event started successfully.",
                "event": EventSerializer(event).data,
            },
            status=status.HTTP_200_OK,
        )


class EventCancelView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, event_id):
        event = get_object_or_404(
            Event.objects.select_related("ngo"),
            pk=event_id,
        )

        if not user_can_manage_event(request.user, event):
            return Response(
                {
                    "detail": (
                        "You do not have permission to cancel this event."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        if event.status not in [
            Event.Status.DRAFT,
            Event.Status.OPEN,
        ]:
            return Response(
                {
                    "detail": (
                        "Only draft or open events can be cancelled."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        event.status = Event.Status.CANCELLED
        event.save(update_fields=["status"])

        return Response(
            {
                "message": "Event cancelled successfully.",
                "event": EventSerializer(event).data,
            },
            status=status.HTTP_200_OK,
        )
        
class EventCompleteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, event_id):

        event = get_object_or_404(
            Event.objects.select_related("ngo"),
            pk=event_id,
        )

        result = EventCompletionFacade.complete_event(
            event=event,
            user=request.user,
        )

        return Response(
            result,
            status=status.HTTP_200_OK,
        )
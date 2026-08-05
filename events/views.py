from rest_framework.exceptions import (
    PermissionDenied,
    ValidationError,
)
from rest_framework.generics import (
    CreateAPIView,
    ListAPIView,
    RetrieveAPIView,
)
from rest_framework.permissions import IsAuthenticated

from accounts.models import User

from .models import Event
from .serializers import (
    EventCreateSerializer,
    EventSerializer,
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
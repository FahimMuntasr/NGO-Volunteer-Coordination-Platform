from rest_framework.generics import ListAPIView

from .models import Event
from .serializers import EventSerializer


class EventListView(ListAPIView):
    serializer_class = EventSerializer

    def get_queryset(self):
        return (
            Event.objects
            .select_related("ngo")
            .prefetch_related("required_skills")
            .order_by("start_date")
        )
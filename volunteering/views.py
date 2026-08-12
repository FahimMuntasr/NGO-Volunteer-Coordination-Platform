from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User

from .models import Skill, VolunteerProfile
from .serializers import (
    SkillSerializer,
    VolunteerHistorySerializer,
    VolunteerProfileSerializer,
)
from events.models import Registration


class SkillListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        skills = Skill.objects.all().order_by("name")

        serializer = SkillSerializer(
            skills,
            many=True,
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )


class MyVolunteerProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get_profile(self, user):
        profile, _ = VolunteerProfile.objects.get_or_create(
            user=user
        )

        return profile

    def get(self, request):
        if request.user.role != User.Role.VOLUNTEER:
            return Response(
                {
                    "detail": (
                        "Only volunteers have volunteer profiles."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        profile = self.get_profile(
            request.user
        )

        serializer = VolunteerProfileSerializer(
            profile
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    def patch(self, request):
        if request.user.role != User.Role.VOLUNTEER:
            return Response(
                {
                    "detail": (
                        "Only volunteers can update "
                        "volunteer profiles."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        profile = self.get_profile(
            request.user
        )

        serializer = VolunteerProfileSerializer(
            profile,
            data=request.data,
            partial=True,
        )

        if serializer.is_valid():
            serializer.save()

            return Response(
                serializer.data,
                status=status.HTTP_200_OK,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )
        
class VolunteerHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != User.Role.VOLUNTEER:
            return Response(
                {
                    "detail": (
                        "Only volunteers can view "
                        "volunteer history."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        profile, _ = VolunteerProfile.objects.get_or_create(
            user=request.user
        )

        registrations = (
            Registration.objects
            .filter(
                volunteer=profile,
                status=Registration.Status.COMPLETED,
            )
            .select_related(
                "event",
                "event__ngo",
            )
            .order_by("-event__end_date")
        )

        serializer = VolunteerHistorySerializer(
            registrations,
            many=True,
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )


class VolunteerLeaderboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        volunteers = (
            VolunteerProfile.objects
            .select_related("user")
            .order_by(
                "-total_hours",
                "-completed_events",
                "user__username",
            )
        )

        leaderboard = []

        for rank, volunteer in enumerate(
            volunteers,
            start=1,
        ):
            name = (
                volunteer.user.get_full_name()
                or volunteer.user.username
            )

            leaderboard.append(
                {
                    "rank": rank,
                    "volunteer_id": volunteer.id,
                    "name": name,
                    "total_hours": volunteer.total_hours,
                    "completed_events": (
                        volunteer.completed_events
                    ),
                }
            )

        return Response(
            leaderboard,
            status=status.HTTP_200_OK,
        )
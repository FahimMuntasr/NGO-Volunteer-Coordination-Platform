from rest_framework import status
from rest_framework.permissions import AllowAny,IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User

from .models import Skill, VolunteerProfile
from .serializers import (
    SkillSerializer,
    VolunteerHistorySerializer,
    VolunteerProfileSerializer,
)
from rest_framework.exceptions import ValidationError

from .ranking import (
    Volunteer,
    VolunteerRanker,
    SkillRanking,
    ExperienceRanking,
    HoursRanking,
    BeginnerRanking,
    ConsistencyRanking,
    VolunteerRating,
)
from events.models import Registration


class SkillListView(APIView):
    permission_classes = [AllowAny]

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
        
class MyRegistrationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != User.Role.VOLUNTEER:
            return Response(
                {
                    "detail": (
                        "Only volunteers can view "
                        "their registrations."
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
                volunteer=profile
            )
            .select_related(
                "event",
                "event__ngo",
            )
            .order_by("-registered_at")
        )

        serializer = VolunteerHistorySerializer(
            registrations,
            many=True,
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )
        
class VolunteerRankingView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != User.Role.NGO_ADMIN:
            return Response(
                {
                    "detail": (
                        "Only NGO administrators "
                        "can view volunteer rankings."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        strategy_name = request.query_params.get(
            "strategy",
            "overall",
        )

        strategies = {
            "skill": SkillRanking(),
            "experience": ExperienceRanking(),
            "hours": HoursRanking(),
            "beginner": BeginnerRanking(),
            "consistency": ConsistencyRanking(),
            "overall": VolunteerRating(),
        }

        strategy = strategies.get(strategy_name)

        if strategy is None:
            raise ValidationError(
                {
                    "strategy": (
                        "Invalid ranking strategy."
                    )
                }
            )

        profiles = (
            VolunteerProfile.objects
            .select_related("user")
            .prefetch_related("skills")
        )

        volunteers = []

        for profile in profiles:
            volunteers.append(
                Volunteer(
                    name=(
                        profile.user.get_full_name()
                        or profile.user.username
                    ),
                    skills=profile.skills.count(),
                    completed_events=profile.completed_events,
                    total_hours=float(profile.total_hours),
                )
            )

        ranker = VolunteerRanker()
        ranker.set_strategy(strategy)

        return Response(
            {
                "strategy": strategy_name,
                "rankings": ranker.get_ranking(volunteers),
            }
        )
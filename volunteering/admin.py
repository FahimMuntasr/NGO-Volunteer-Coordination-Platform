from django.contrib import admin
from django.db.models import Case, When
from .models import Skill, VolunteerProfile
from .ranking import (
    SkillRanking,
    ExperienceRanking,
    HoursRanking,
    BeginnerRanking,
    ConsistencyRanking,
    VolunteerRating,
)


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('id', 'name') if hasattr(Skill, 'name') else ('id',)


@admin.register(VolunteerProfile)
class VolunteerProfileAdmin(admin.ModelAdmin):
    list_display = (
        'user',
        'get_volunteer_rating',
        'get_skill_score',
        'get_experience_score',
        'get_hours_score',
        'get_beginner_score',
        'get_consistency_score',
    )

    @admin.display(description='Volunteer Rating')
    def get_volunteer_rating(self, obj):
        return round(VolunteerRating().rank(self._build_ranking_object(obj)), 2)

    @admin.display(description='Skill Score')
    def get_skill_score(self, obj):
        return round(SkillRanking().rank(self._build_ranking_object(obj)), 2)

    @admin.display(description='Experience Score')
    def get_experience_score(self, obj):
        return round(ExperienceRanking().rank(self._build_ranking_object(obj)), 2)

    @admin.display(description='Hours Score')
    def get_hours_score(self, obj):
        return round(HoursRanking().rank(self._build_ranking_object(obj)), 2)

    @admin.display(description='Beginner Score')
    def get_beginner_score(self, obj):
        return round(BeginnerRanking().rank(self._build_ranking_object(obj)), 2)

    @admin.display(description='Consistency Score')
    def get_consistency_score(self, obj):
        return round(ConsistencyRanking().rank(self._build_ranking_object(obj)), 2)

    def get_queryset(self, request):
        qs = super().get_queryset(request).distinct()

        # Sort profiles by Volunteer Rating in Python
        profiles = list(qs)
        rating_strategy = VolunteerRating()
        profiles.sort(
            key=lambda profile: rating_strategy.rank(self._build_ranking_object(profile)),
            reverse=True
        )

        # Map sorted primary keys back to a valid Django QuerySet
        pks = [p.pk for p in profiles]
        if pks:
            preserved_order = Case(*[When(pk=pk, then=pos) for pos, pk in enumerate(pks)])
            return qs.filter(pk__in=pks).order_by(preserved_order)

        return qs

    def _build_ranking_object(self, obj):
        skills_count = obj.skills.count() if hasattr(obj.skills, 'count') else getattr(obj, 'skills', 0)
        completed_events_count = getattr(obj, 'completed_events', 0)
        total_hours = getattr(obj, 'total_hours', 0)

        class RankingAdapter:
            def __init__(self, name, skills, completed_events, total_hours):
                self.name = name
                self.skills = skills
                self.completed_events = completed_events
                self.total_hours = total_hours

        return RankingAdapter(
            name=str(obj),
            skills=skills_count,
            completed_events=completed_events_count,
            total_hours=total_hours,
        )
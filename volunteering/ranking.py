from abc import ABC, abstractmethod


# ==========================================
# Volunteer Class
# ==========================================
class Volunteer:

    def __init__(self, name, skills, completed_events, total_hours):
        self.name = name
        self.skills = skills
        self.completed_events = completed_events
        self.total_hours = total_hours

    def __str__(self):
        return self.name


# ==========================================
# Strategy Interface
# ==========================================
class RankingStrategy(ABC):

    @abstractmethod
    def rank(self, volunteer):
        pass


# ==========================================
# Concrete Strategies
# ==========================================

# 1. Skill Ranking
# Used for technical or skill-based events.
class SkillRanking(RankingStrategy):

    def rank(self, volunteer):
        return (volunteer.skills ** 2) * 10 + volunteer.completed_events


# 2. Experience Ranking
# Used when selecting experienced volunteers.
class ExperienceRanking(RankingStrategy):

    def rank(self, volunteer):
        return (volunteer.completed_events ** 2) + (volunteer.skills * 15)


# 3. Hours Ranking
# Rewards volunteers with the highest contribution time.
class HoursRanking(RankingStrategy):

    def rank(self, volunteer):
        return volunteer.total_hours + (volunteer.completed_events * 5)


# 4. Beginner Ranking
# Encourages new volunteers by giving them a bonus.
class BeginnerRanking(RankingStrategy):

    def rank(self, volunteer):

        score = volunteer.skills * 15 + volunteer.total_hours

        if volunteer.completed_events < 5:
            score += 100

        return score


# 5. Consistency Ranking
# Rewards volunteers who participate regularly.
class ConsistencyRanking(RankingStrategy):

    def rank(self, volunteer):

        if volunteer.completed_events == 0:
            return 0

        average_hours = volunteer.total_hours / volunteer.completed_events

        return average_hours * volunteer.skills


# 6. Volunteer Rating
# Overall performance rating.
# Gives higher priority to verified data (events and hours)
# than self-declared skills.
class VolunteerRating(RankingStrategy):

    def rank(self, volunteer):

        return (
            volunteer.completed_events * 50 +
            volunteer.total_hours * 3 +
            volunteer.skills * 10
        )


# ==========================================
# Context
# ==========================================
class VolunteerRanker:

    def __init__(self):
        self.strategy = None

    def set_strategy(self, strategy):
        self.strategy = strategy

    def display_ranking(self, volunteers):

        if self.strategy is None:
            print("No ranking strategy selected.")
            return

        ranked = sorted(
            volunteers,
            key=lambda volunteer: self.strategy.rank(volunteer),
            reverse=True
        )

        for position, volunteer in enumerate(ranked, start=1):
            score = self.strategy.rank(volunteer)
            print(f"{position}. {volunteer.name:<10} Score: {score:.2f}")


# ==========================================
# Client
# ==========================================
if __name__ == "__main__":

    volunteers = [

        Volunteer("Alice", 5, 12, 180),
        Volunteer("Bob", 3, 18, 250),
        Volunteer("Charlie", 8, 6, 100),
        Volunteer("David", 4, 2, 60),
        Volunteer("Emma", 6, 10, 140)

    ]

    ranker = VolunteerRanker()

    strategies = [

        ("Skill Ranking", SkillRanking()),
        ("Experience Ranking", ExperienceRanking()),
        ("Hours Ranking", HoursRanking()),
        ("Beginner Ranking", BeginnerRanking()),
        ("Consistency Ranking", ConsistencyRanking()),
        ("Volunteer Rating", VolunteerRating())

    ]

    for title, strategy in strategies:

        print("\n" + "=" * 50)
        print(title)
        print("=" * 50)

        ranker.set_strategy(strategy)
        ranker.display_ranking(volunteers)
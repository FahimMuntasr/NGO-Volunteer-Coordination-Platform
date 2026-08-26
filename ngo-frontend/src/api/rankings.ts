import api from "../services/api";

export type RankingStrategy =
  | "skill"
  | "experience"
  | "hours"
  | "beginner"
  | "consistency"
  | "overall";

export type RankedVolunteer = {
  position: number;
  name: string;
  skills: number;
  completed_events: number;
  total_hours: number;
  score: number;
};

export async function getVolunteerRankings(
  strategy: RankingStrategy
): Promise<RankedVolunteer[]> {
  const response = await api.get(
    `/api/volunteers/rankings/?strategy=${strategy}`
  );

  return response.data.rankings;
}
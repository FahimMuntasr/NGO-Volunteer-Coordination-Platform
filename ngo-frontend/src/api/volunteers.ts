import api from "../services/api";

import type {
  VolunteerProfile,
  Skill,
  UpdateVolunteerProfileRequest,
  VolunteerHistoryItem,
} from "../types/volunteer";

export async function getVolunteerProfile(): Promise<VolunteerProfile> {
  const response = await api.get<VolunteerProfile>(
    "/api/volunteers/me/",
  );

  return response.data;
}

export async function getAvailableSkills(): Promise<Skill[]> {
  const response = await api.get<Skill[]>(
    "/api/volunteers/skills/",
  );

  return response.data;
}

export async function updateVolunteerProfile(
  data: UpdateVolunteerProfileRequest,
): Promise<VolunteerProfile> {
  const response = await api.patch<VolunteerProfile>(
    "/api/volunteers/me/",
    data,
  );

  return response.data;
}

export async function getVolunteerHistory(): Promise<
  VolunteerHistoryItem[]
> {
  const response = await api.get<VolunteerHistoryItem[]>(
    "/api/volunteers/me/history/",
  );

  return response.data;
}
import api from "../services/api";
import type {
  VolunteerProfile,
  AvailableSkill,
} from "../types/volunteer";

export async function getVolunteerProfile(): Promise<VolunteerProfile> {
  const response = await api.get<VolunteerProfile>(
    "/volunteers/me/",
  );

  return response.data;
}

export async function updateVolunteerProfile(data: {
  skill_ids?: number[];
  availability_notes?: string;
}): Promise<VolunteerProfile> {
  const response = await api.patch<VolunteerProfile>(
    "/volunteers/me/",
    data,
  );

  return response.data;
}

export async function getAvailableSkills(): Promise<
  AvailableSkill[]
> {
  const response = await api.get<AvailableSkill[]>(
    "/volunteers/skills/",
  );

  return response.data;
}
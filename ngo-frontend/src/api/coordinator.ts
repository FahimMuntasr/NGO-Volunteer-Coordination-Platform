import api from "../services/api";

import type {
  AttendanceStatus,
  EventRegistration,
} from "../types/event";

export type TeamMember = {
  id: number;
  volunteer: number;
  volunteer_username: string;
  assigned_task: string;
};

export type Team = {
  id: number;
  event: number;
  name: string;
  leader: number | null;
  leader_username: string | null;
  memberships: TeamMember[];
};

export async function getEventTeams(
  eventId: number,
): Promise<Team[]> {
  const response = await api.get<
    Team[]
  >(
    `/api/events/${eventId}/teams/`,
  );

  return response.data;
}

export async function createTeam(
  eventId: number,
  name: string,
  leader?: number,
): Promise<Team> {
  const response = await api.post<Team>(
    `/api/events/${eventId}/teams/`,
    {
      name,
      ...(leader
        ? { leader }
        : {}),
    },
  );

  return response.data;
}

export async function addTeamMember(
  teamId: number,
  volunteerId: number,
  assignedTask: string,
): Promise<TeamMember> {
  const response = await api.post<
    TeamMember
  >(
    `/api/events/teams/${teamId}/members/`,
    {
      volunteer_id: volunteerId,
      assigned_task: assignedTask,
    },
  );

  return response.data;
}

export async function markAttendance(
  registrationId: number,
  attendanceStatus: AttendanceStatus,
): Promise<EventRegistration> {
  const response =
    await api.post<EventRegistration>(
      `/api/events/registrations/${registrationId}/attendance/`,
      {
        attendance_status:
          attendanceStatus,
      },
    );

  return response.data;
}
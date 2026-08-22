import api from "../services/api";

import type { Event } from "../types/event";

export type NGODashboardData = {
  ngo_id: number;
  ngo_name: string;

  events: {
    total: number;
    draft: number;
    open: number;
    in_progress: number;
    completed: number;
    cancelled: number;
  };

  registrations: {
    total: number;
    pending: number;
    approved: number;
    completed: number;
  };

  donations: {
    count: number;
    total_amount: number | string;
  };
};

export type CreateEventRequest = {
  title: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  volunteer_capacity: number;
  required_skill_ids?: number[];
};

export type VerificationResult = {
  ngo_id: number;
  ngo_name: string;
  registration_number: string;
  verified: boolean;
  verification_status: string;
  message: string;
};

export async function getNGODashboard(
  ngoId: number,
): Promise<NGODashboardData> {
  const response = await api.get<NGODashboardData>(
    `/api/organizations/${ngoId}/dashboard/`,
  );

  return response.data;
}

export async function verifyNGO(
  ngoId: number,
  registrationNumber: string,
): Promise<VerificationResult> {
  const response = await api.post<VerificationResult>(
    `/api/organizations/${ngoId}/verify/`,
    {
      registration_number: registrationNumber,
    },
  );

  return response.data;
}

export async function createEvent(
  data: CreateEventRequest,
): Promise<Event> {
  const response = await api.post<Event>(
    "/api/events/create/",
    data,
  );

  return response.data;
}

export async function openEvent(
  eventId: number,
): Promise<Event> {
  const response = await api.post<{
    message: string;
    event: Event;
  }>(
    `/api/events/${eventId}/open/`,
    {},
  );

  return response.data.event;
}

export async function startEvent(
  eventId: number,
): Promise<Event> {
  const response = await api.post<{
    message: string;
    event: Event;
  }>(
    `/api/events/${eventId}/start/`,
    {},
  );

  return response.data.event;
}

export async function cancelEvent(
  eventId: number,
): Promise<Event> {
  const response = await api.post<{
    message: string;
    event: Event;
  }>(
    `/api/events/${eventId}/cancel/`,
    {},
  );

  return response.data.event;
}

export async function completeEvent(
  eventId: number,
) {
  const response = await api.post(
    `/api/events/${eventId}/complete/`,
    {},
  );

  return response.data;
}

export type CoordinatorOption = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: "COORDINATOR";
};

export async function getCoordinators():
Promise<CoordinatorOption[]> {
  const response = await api.get<
    CoordinatorOption[]
  >(
    "/api/auth/coordinators/",
  );

  return response.data;
}

export async function assignCoordinator(
  eventId: number,
  coordinatorId: number,
) {
  const response = await api.post(
    `/api/events/${eventId}/assign-coordinator/`,
    {
      coordinator_id: coordinatorId,
    },
  );

  return response.data;
}
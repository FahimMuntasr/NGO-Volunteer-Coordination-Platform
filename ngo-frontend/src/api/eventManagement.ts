import api from "../services/api";

import type {
  EventRegistration,
} from "../types/event";

export async function getEventRegistrations(
  eventId: number,
): Promise<EventRegistration[]> {
  const response = await api.get<EventRegistration[]>(
    `/api/events/${eventId}/registrations/`,
  );

  return response.data;
}

export async function approveRegistration(
  registrationId: number,
): Promise<EventRegistration> {
  const response = await api.post<{
    message: string;
    registration: EventRegistration;
  }>(
    `/api/events/registrations/${registrationId}/approve/`,
    {},
  );

  return response.data.registration;
}

export async function rejectRegistration(
  registrationId: number,
): Promise<EventRegistration> {
  const response = await api.post<{
    message: string;
    registration: EventRegistration;
  }>(
    `/api/events/registrations/${registrationId}/reject/`,
    {},
  );

  return response.data.registration;
}
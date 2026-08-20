import api from "../services/api";
import type { Event, EventRegistration } from "../types/event";

export async function getEvents(): Promise<Event[]> {
  const response = await api.get<Event[]>("/api/events/");

  return response.data;
}

export async function getEvent(id: number): Promise<Event> {
  const response = await api.get<Event>(`/api/events/${id}/`);

  return response.data;
}

export async function registerForEvent(
  id: number,
): Promise<EventRegistration> {
  const response = await api.post<EventRegistration>(
    `/api/events/${id}/register/`,
    {},
  );

  return response.data;
}
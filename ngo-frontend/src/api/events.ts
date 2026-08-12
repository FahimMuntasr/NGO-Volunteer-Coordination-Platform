import api from "../services/api";
import type { Event, EventRegistration } from "../types/event";

export async function getEvents(): Promise<Event[]> {
  const response = await api.get<Event[]>("/events/");

  return response.data;
}

export async function getEvent(id: number): Promise<Event> {
  const response = await api.get<Event>(`/events/${id}/`);

  return response.data;
}

export async function registerForEvent(
  id: number,
): Promise<EventRegistration> {
  const response = await api.post<EventRegistration>(
    `/events/${id}/register/`,
    {},
  );

  return response.data;
}
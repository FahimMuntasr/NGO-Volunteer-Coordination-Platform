import api from "../services/api";

export type RegistrationStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "COMPLETED";

export type AttendanceStatus =
  | "NOT_MARKED"
  | "PRESENT"
  | "ABSENT"
  | "EXCUSED";

export type Registration = {
  id: number;
  event: number;
  event_title: string;
  volunteer: number;
  volunteer_username: string;
  status: RegistrationStatus;
  registered_at: string;
  approved_at: string | null;
  attendance_status: AttendanceStatus;
  hours_earned: string;
};

export async function getMyRegistrations(): Promise<
  Registration[]
> {
  const response = await api.get<Registration[]>(
    "/api/events/my-registrations/",
  );

  return response.data;
}
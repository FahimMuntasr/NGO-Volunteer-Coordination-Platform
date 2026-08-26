export type EventStatus =
  | "DRAFT"
  | "OPEN"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export interface Event {
  id: number;
  ngo: number;
  ngo_name: string;
  title: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  volunteer_capacity: number;
  required_skills: string[];
  status: EventStatus;
  coordinator: number | null;
  coordinator_username: string | null;
}

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

export interface EventRegistration {
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
}
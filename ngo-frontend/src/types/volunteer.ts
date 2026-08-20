export type Skill = {
  id: number;
  name: string;
};

export type VolunteerProfile = {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  skills: Skill[];
  total_hours: number;
  completed_events: number;
  availability_notes: string;
};

export type UpdateVolunteerProfileRequest = {
  skill_ids?: number[];
  availability_notes?: string;
};

export type AttendanceStatus =
  | "NOT_MARKED"
  | "PRESENT"
  | "ABSENT"
  | "EXCUSED";

export type VolunteerHistoryItem = {
  id: number;
  event: number;
  event_title: string;
  ngo_name: string;
  event_start_date: string;
  event_end_date: string;
  attendance_status: AttendanceStatus;
  hours_earned: string;
  status: "COMPLETED";
};
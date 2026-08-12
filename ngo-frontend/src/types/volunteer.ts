export interface VolunteerSkill {
  id: number;
  name: string;
}

export interface VolunteerProfile {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  skills: VolunteerSkill[];
  total_hours: number;
  completed_events: number;
  availability_notes: string;
}

export interface AvailableSkill {
  id: number;
  name: string;
}
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
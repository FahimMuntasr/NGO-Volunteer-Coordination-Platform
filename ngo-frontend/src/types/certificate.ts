export type Certificate = {
  id: number;
  volunteer: number;
  volunteer_name: string;
  event: number;
  event_title: string;
  issued_at: string;
  verification_code: string;
  file: string | null;
};
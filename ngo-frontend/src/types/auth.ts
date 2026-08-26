export type UserRole =
  | "VOLUNTEER"
  | "NGO_ADMIN"
  | "COORDINATOR"
  | "DONOR";

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: UserRole;
  managed_ngo_id: number | null;
  managed_ngo_name: string | null;
}

export interface LoginResponse {
  token: string;
  user: User;
}
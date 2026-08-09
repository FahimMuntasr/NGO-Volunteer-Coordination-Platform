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
}

export interface LoginResponse {
  token: string;
  user: User;
}
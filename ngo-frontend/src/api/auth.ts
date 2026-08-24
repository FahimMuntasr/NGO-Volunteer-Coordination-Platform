import api from "../services/api";

import type {
  LoginResponse,
  User,
  UserRole,
} from "../types/auth";


export async function login(
  username: string,
  password: string,
): Promise<LoginResponse> {
  const response =
    await api.post<LoginResponse>(
      "/api/auth/login/",
      {
        username,
        password,
      },
    );

  return response.data;
}


export async function getCurrentUser():
Promise<User> {
  const response =
    await api.get<User>(
      "/api/auth/me/",
    );

  return response.data;
}


export type RegisterRequest = {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: UserRole;

  // Volunteer
  skill_ids?: number[];
  custom_skill_names?: string[];
  availability_notes?: string;

  // Coordinator
  coordinator_specialization?: string;
  coordinator_experience?: string;

  // Donor
  donor_organization?: string;
  donor_preferred_causes?: string;

  // NGO Admin
  ngo_name?: string;
  ngo_email?: string;
  ngo_address?: string;
  ngo_registration_number?: string;
};


export async function registerAccount(
  data: RegisterRequest,
): Promise<LoginResponse> {
  const response =
    await api.post<LoginResponse>(
      "/api/auth/register/",
      data,
    );

  return response.data;
}


export type PasswordResetResponse = {
  detail: string;
};


export async function requestPasswordReset(
  email: string,
): Promise<PasswordResetResponse> {
  const response =
    await api.post<PasswordResetResponse>(
      "/api/auth/password-reset/",
      {
        email,
      },
    );

  return response.data;
}


export async function confirmPasswordReset(
  uid: string,
  token: string,
  newPassword: string,
): Promise<PasswordResetResponse> {
  const response =
    await api.post<PasswordResetResponse>(
      `/api/auth/password-reset/confirm/${uid}/${token}/`,
      {
        new_password: newPassword,
      },
    );

  return response.data;
}
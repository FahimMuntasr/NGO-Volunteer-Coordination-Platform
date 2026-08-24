import api from "../services/api";


export type NGOProfile = {
  id: number;

  admin_username: string;
  admin_first_name: string;
  admin_last_name: string;
  admin_email: string;
  admin_phone: string;

  name: string;
  email: string;
  address: string;
  description: string;

  registration_number: string;
  verification_status: string;
  is_verified: boolean;
  verified_at: string | null;
};


export type UpdateNGOProfileRequest = {
  admin_first_name?: string;
  admin_last_name?: string;
  admin_email?: string;
  admin_phone?: string;

  name?: string;
  email?: string;
  address?: string;
  description?: string;
};


export async function getNGOProfile():
Promise<NGOProfile> {
  const response =
    await api.get<NGOProfile>(
      "/api/organizations/profile/",
    );

  return response.data;
}


export async function updateNGOProfile(
  data: UpdateNGOProfileRequest,
): Promise<NGOProfile> {
  const response =
    await api.patch<NGOProfile>(
      "/api/organizations/profile/",
      data,
    );

  return response.data;
}
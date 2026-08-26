import api from "../services/api";


export type DonorProfile = {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  organization_name: string;
  preferred_causes: string;
};


export type UpdateDonorProfileRequest = {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  organization_name?: string;
  preferred_causes?: string;
};


export async function getDonorProfile():
Promise<DonorProfile> {
  const response =
    await api.get<DonorProfile>(
      "/api/auth/donor-profile/",
    );

  return response.data;
}


export async function updateDonorProfile(
  data: UpdateDonorProfileRequest,
): Promise<DonorProfile> {
  const response =
    await api.patch<DonorProfile>(
      "/api/auth/donor-profile/",
      data,
    );

  return response.data;
}

export type CoordinatorProfile = {
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    specialization: string;
    experience_notes: string;
  };
  
  
  export type UpdateCoordinatorProfileRequest = {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    specialization?: string;
    experience_notes?: string;
  };
  
  
  export async function getCoordinatorProfile():
  Promise<CoordinatorProfile> {
    const response =
      await api.get<CoordinatorProfile>(
        "/api/auth/coordinator-profile/",
      );
  
    return response.data;
  }
  
  
  export async function updateCoordinatorProfile(
    data: UpdateCoordinatorProfileRequest,
  ): Promise<CoordinatorProfile> {
    const response =
      await api.patch<CoordinatorProfile>(
        "/api/auth/coordinator-profile/",
        data,
      );
  
    return response.data;
  }
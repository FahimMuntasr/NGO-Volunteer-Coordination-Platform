import api from "../services/api";


export type VerifiedNGO = {
  id: number;
  name: string;
  address: string;
  email: string;
  description: string;
  registration_number: string;
  is_verified: boolean;
};


export type Donation = {
  id: number;

  ngo: number;
  ngo_name: string;

  donor: number | null;
  donor_username: string;

  donor_name: string;

  amount: string;

  allocation_details: string;

  donated_at: string;

  acknowledgement_sent: boolean;
};


export type CreateDonationRequest = {
  ngo: number;
  amount: number;
};


export type UpdateDonationAllocationRequest = {
  allocation_details?: string;
  acknowledgement_sent?: boolean;
};


/* =========================================
   VERIFIED NGOs
========================================= */

export async function getVerifiedNGOs():
Promise<VerifiedNGO[]> {
  const response = await api.get<
    VerifiedNGO[]
  >(
    "/api/organizations/verified/",
  );

  return response.data;
}


/* =========================================
   DONOR - CREATE DONATION
========================================= */

export async function createDonation(
  data: CreateDonationRequest,
): Promise<Donation> {
  const response = await api.post<Donation>(
    "/api/donations/",
    data,
  );

  return response.data;
}


/* =========================================
   DONOR - MY DONATIONS
========================================= */

export async function getMyDonations():
Promise<Donation[]> {
  const response = await api.get<
    Donation[]
  >(
    "/api/donations/my/",
  );

  return response.data;
}


/* =========================================
   NGO ADMIN - RECEIVED DONATIONS
========================================= */

export async function getNGODonations():
Promise<Donation[]> {
  const response = await api.get<
    Donation[]
  >(
    "/api/donations/ngo/",
  );

  return response.data;
}


/* =========================================
   NGO ADMIN - UPDATE ALLOCATION
========================================= */

export async function updateDonationAllocation(
  donationId: number,
  data: UpdateDonationAllocationRequest,
): Promise<Donation> {
  const response = await api.patch<Donation>(
    `/api/donations/${donationId}/allocation/`,
    data,
  );

  return response.data;
}
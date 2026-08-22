import api from "../services/api";

export type Donation = {
  id: number;
  ngo: number;
  ngo_name: string;
  donor: number;
  donor_username: string;
  donor_name: string;
  amount: string;
  allocation_details: string;
  donated_at: string;
  acknowledgement_sent: boolean;
};

export type UpdateDonationRequest = {
  allocation_details?: string;
  acknowledgement_sent?: boolean;
};

export async function getNGODonations():
Promise<Donation[]> {
  const response = await api.get<
    Donation[]
  >(
    "/api/donations/ngo/",
  );

  return response.data;
}

export async function updateDonationAllocation(
  donationId: number,
  data: UpdateDonationRequest,
): Promise<Donation> {
  const response = await api.patch<
    Donation
  >(
    `/api/donations/${donationId}/allocation/`,
    data,
  );

  return response.data;
}
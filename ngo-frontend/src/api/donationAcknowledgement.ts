import api from "../services/api";

export interface AcknowledgementOptions {
    donor: boolean;
    ngo: boolean;
    allocation: boolean;
}

export interface DonationAcknowledgementResponse {
    donation_id: number;
    acknowledgement: string;
}

export const getDonationAcknowledgement = async (
    donationId: number,
    options: AcknowledgementOptions
) => {
    const response =
        await api.get<DonationAcknowledgementResponse>(
            `/api/donations/${donationId}/acknowledgement/`,
            {
                params: {
                    donor: options.donor,
                    ngo: options.ngo,
                    allocation: options.allocation,
                },
            }
        );

    return response.data;
};
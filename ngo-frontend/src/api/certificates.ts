import api from "../services/api";


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


export type CertificateVerification = {
  valid: boolean;
  verification_code: string;
  volunteer_name: string;
  event_title: string;
  issued_at: string;
};


export async function getMyCertificates(): Promise<
  Certificate[]
> {
  const response =
    await api.get<Certificate[]>(
      "/api/certificates/my/",
    );

  return response.data;
}


export async function downloadCertificate(
  certificateId: number,
): Promise<Blob> {
  const response = await api.get(
    `/api/certificates/${certificateId}/download/`,
    {
      responseType: "blob",
    },
  );

  return response.data;
}


export async function verifyCertificate(
  verificationCode: string,
): Promise<CertificateVerification> {
  const response =
    await api.get<CertificateVerification>(
      `/api/certificates/verify/${verificationCode}/`,
    );

  return response.data;
}


export async function downloadAttendanceReport(
  eventId: number,
): Promise<Blob> {
  const response = await api.get(
    `/api/certificates/events/${eventId}/attendance-report/`,
    {
      responseType: "blob",
    },
  );

  return response.data;
}
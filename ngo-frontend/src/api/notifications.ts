import api from "../services/api";

export type Notification = {
  id: number;
  notification_type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at?: string;
};

export async function getNotifications(): Promise<Notification[]> {
  const response = await api.get("/api/notifications/");
  return response.data;
}

export async function markNotificationRead(
  id: number
): Promise<Notification> {
  const response = await api.patch(
    `/api/notifications/${id}/read/`
  );

  return response.data;
}
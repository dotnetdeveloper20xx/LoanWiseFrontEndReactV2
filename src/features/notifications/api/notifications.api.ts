import { api } from "../../../shared/lib/axios";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAtUtc: string; // ISO string
}

// GET /api/notifications → ApiResponse<NotificationItem[]>
export async function getMyNotifications(): Promise<NotificationItem[]> {
  const res = await api.get("/api/notifications");
  return res.data?.data ?? [];
}

// PUT /api/notifications/{id}/read → ApiResponse<boolean>
export async function markNotificationRead(id: string): Promise<boolean> {
  const res = await api.put(`/api/notifications/${id}/read`);
  const payload = res.data?.data ?? res.data;
  return payload === true || (res.status >= 200 && res.status < 300);
}

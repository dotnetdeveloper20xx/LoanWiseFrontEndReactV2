import { api } from "../../../shared/lib/axios";


export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAtUtc: string; // ISO string
}

// GET /api/notifications  → { success, message, data: NotificationItem[] }
export async function getMyNotifications(): Promise<NotificationItem[]> {
  const res = await api.get("/api/notifications"); // protected endpoint:contentReference[oaicite:0]{index=0}
  return res.data?.data ?? [];
}

// POST /api/notifications/{id}/read → { success, data: true }
export async function markNotificationRead(id: string): Promise<boolean> {
  const res = await api.post(`/api/notifications/${id}/read`); // protected:contentReference[oaicite:1]{index=1}
  return !!res.data?.data;
}

import { useQuery } from "@tanstack/react-query";
import { api } from "../../shared/lib/axios";

async function getMyNotifications() {
  const res = await api.get("/api/notifications");
  return res.data?.data ?? res.data ?? [];
}

/** Poll unread count every minute */
export function useUnreadNotifications() {
  const q = useQuery({
    queryKey: ["notifications", "me"],
    queryFn: getMyNotifications,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
  const unread = Array.isArray(q.data) ? q.data.filter((n: any) => !n.isRead).length : 0;
  return { unread, ...q };
}

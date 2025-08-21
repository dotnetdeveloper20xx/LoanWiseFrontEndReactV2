import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getMyNotifications,
  markNotificationRead,
  type NotificationItem,
} from "../api/notifications.api";

function NotificationCard({ n, onRead }: { n: NotificationItem; onRead: (id: string) => void }) {
  return (
    <div className="card p-5 space-y-2">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold">{n.title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">{n.message}</p>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {new Date(n.createdAtUtc).toLocaleString()}
          </div>
        </div>
        {!n.isRead ? (
          <button className="btn whitespace-nowrap" onClick={() => onRead(n.id)}>
            Mark read
          </button>
        ) : (
          <span className="text-xs rounded-full px-2 py-1 border border-black/10">Read</span>
        )}
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const qc = useQueryClient();

  const notifQuery = useQuery({
    queryKey: ["notifications", "me"],
    queryFn: getMyNotifications,
    staleTime: 60_000,
  });

  const markRead = useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications", "me"] });
    },
  });

  async function markAll() {
    const items = notifQuery.data ?? [];
    const unread = items.filter((n) => !n.isRead);
    await Promise.all(unread.map((n) => markNotificationRead(n.id)));
    qc.invalidateQueries({ queryKey: ["notifications", "me"] });
  }

  if (notifQuery.isLoading) return <div>Loading notifications…</div>;
  if (notifQuery.isError) {
    return (
      <div className="card p-6">
        <div className="text-red-600 font-medium">Failed to load notifications</div>
        <div className="text-sm text-gray-500 mt-1">
          {(notifQuery.error as any)?.message ?? "Error"}
        </div>
        <button
          className="btn mt-3"
          onClick={() => notifQuery.refetch()}
          disabled={notifQuery.isFetching}
        >
          Retry
        </button>
      </div>
    );
  }

  const items = notifQuery.data ?? [];

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Notifications</h1>
        <div className="flex gap-2">
          <button
            className="btn"
            onClick={() => notifQuery.refetch()}
            disabled={notifQuery.isFetching}
          >
            {notifQuery.isFetching ? "Refreshing…" : "Refresh"}
          </button>
          {items.some((n) => !n.isRead) && (
            <button className="btn" onClick={markAll}>
              Mark all read
            </button>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="card p-6 text-sm text-gray-600 dark:text-gray-300">
          You have no notifications.
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((n) => (
            <NotificationCard key={n.id} n={n} onRead={(id) => markRead.mutate(id)} />
          ))}
        </div>
      )}
    </section>
  );
}

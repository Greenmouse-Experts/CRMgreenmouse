import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck, ChevronLeft, ChevronRight, RefreshCw, Settings2 } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/Headers/PageHeader";
import { getNotifications, getUnreadNotifications, markAllNotificationsRead, markNotificationRead } from "@/api/notifications-api";
import { getNotificationPreferences } from "@/api/notificationPreferences";

export const Route = createFileRoute("/tenant/notifications/")({
  component: RouteComponent,
});

function RouteComponent() {
  const queryClient = useQueryClient();
  const [preferences] = useState(getNotificationPreferences);
  const [unreadOnly, setUnreadOnly] = useState(preferences.unreadOnly);
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: ["tenant-notifications", page, preferences.pageSize, unreadOnly],
    queryFn: () => unreadOnly
      ? getUnreadNotifications(page, preferences.pageSize)
      : getNotifications({ page, limit: preferences.pageSize }),
  });
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["tenant-notifications"] });
    queryClient.invalidateQueries({ queryKey: ["tenant-notifications-count"] });
  };
  const readOne = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: refresh,
    onError: () => toast.error("Could not mark this notification as read."),
  });
  const readAll = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => { refresh(); toast.success("All notifications marked as read."); },
    onError: () => toast.error("Could not mark notifications as read."),
  });
  const notifications = query.data?.notifications ?? [];
  const total = query.data?.total ?? 0;

  return (
    <section className="mx-auto max-w-5xl space-y-5 pb-10">
      <PageHeader title="Notifications" description="Updates and activity for your workspace.">
        <Link to="/tenant/settings/notifications" className="btn btn-outline btn-sm gap-2">
          <Settings2 className="size-4" /> Display settings
        </Link>
      </PageHeader>
      <div className="rounded-box bg-base-100 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-base-200 p-4">
          <div role="group" aria-label="Filter notifications" className="join">
            <button type="button" className={`btn btn-sm join-item ${!unreadOnly ? "btn-primary" : "btn-ghost"}`} aria-pressed={!unreadOnly} onClick={() => { setUnreadOnly(false); setPage(1); }}>All</button>
            <button type="button" className={`btn btn-sm join-item ${unreadOnly ? "btn-primary" : "btn-ghost"}`} aria-pressed={unreadOnly} onClick={() => { setUnreadOnly(true); setPage(1); }}>Unread</button>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => query.refetch()} disabled={query.isFetching} aria-label="Refresh notifications"><RefreshCw className={`size-4 ${query.isFetching ? "animate-spin" : ""}`} /></button>
            <button type="button" className="btn btn-outline btn-sm gap-2" onClick={() => readAll.mutate()} disabled={readAll.isPending || query.isPending || total === 0}>
              <CheckCheck className="size-4" /> Mark all read
            </button>
          </div>
        </div>
        {query.isPending ? (
          <div className="flex min-h-52 items-center justify-center" role="status"><span className="loading loading-spinner loading-md" /> <span className="sr-only">Loading notifications</span></div>
        ) : query.isError ? (
          <div className="p-8 text-center space-y-3"><p>Could not load notifications.</p><button className="btn btn-primary btn-sm" onClick={() => query.refetch()}>Try again</button></div>
        ) : notifications.length === 0 ? (
          <div className="flex min-h-52 flex-col items-center justify-center gap-3 p-8 text-center text-base-content/70"><Bell className="size-8" /><p>{unreadOnly ? "You're all caught up." : "No notifications yet."}</p></div>
        ) : (
          <ul className="divide-y divide-base-200">
            {notifications.map((notification) => (
              <li key={notification.id} className={`flex gap-3 p-4 sm:p-5 ${notification.isRead ? "" : "bg-primary/5"}`}>
                <span aria-hidden="true" className={`mt-2 size-2 shrink-0 rounded-full ${notification.isRead ? "bg-base-300" : "bg-primary"}`} />
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h2 className={`text-sm ${notification.isRead ? "font-medium" : "font-semibold"}`}>{notification.title || "Notification"}</h2>
                    <time className="text-xs text-base-content/60" dateTime={notification.createdAt}>{notification.createdAt && !Number.isNaN(Date.parse(notification.createdAt)) ? new Date(notification.createdAt).toLocaleString() : ""}</time>
                  </div>
                  <p className="whitespace-pre-wrap break-words text-sm text-base-content/75">{notification.message}</p>
                  {!notification.isRead && <button type="button" className="link link-primary text-xs font-medium" disabled={readOne.isPending} onClick={() => readOne.mutate(notification.id)}>Mark as read</button>}
                </div>
              </li>
            ))}
          </ul>
        )}
        {!query.isError && !query.isPending && (page > 1 || query.data?.hasMore) && (
          <div className="flex items-center justify-between border-t border-base-200 p-4 text-sm">
            <span>Page {page}{total > 0 ? ` · ${total} notifications` : ""}</span>
            <div className="join">
              <button type="button" className="btn btn-sm join-item" disabled={page === 1 || query.isFetching} onClick={() => setPage((value) => value - 1)} aria-label="Previous page"><ChevronLeft className="size-4" /></button>
              <button type="button" className="btn btn-sm join-item" disabled={!query.data?.hasMore || query.isFetching} onClick={() => setPage((value) => value + 1)} aria-label="Next page"><ChevronRight className="size-4" /></button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

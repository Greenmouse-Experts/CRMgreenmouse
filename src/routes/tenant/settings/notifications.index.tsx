import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { getNotificationPreferences, saveNotificationPreferences } from "@/api/notificationPreferences";

export const Route = createFileRoute("/tenant/settings/notifications/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [preferences, setPreferences] = useState(getNotificationPreferences);

  return (
    <div className="max-w-2xl space-y-6 p-2 sm:p-4">
      <div>
        <h1 className="text-2xl font-semibold">Notification display</h1>
        <p className="mt-1 text-sm text-base-content/70">Choose how the notification inbox opens on this browser.</p>
      </div>
      <form className="space-y-6" onSubmit={(event) => { event.preventDefault(); try { saveNotificationPreferences(preferences); toast.success("Notification display settings saved."); } catch { toast.error("Could not save settings in this browser."); } }}>
        <fieldset className="space-y-3">
          <legend className="font-semibold">Default inbox view</legend>
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-base-300 p-3">
            <input type="radio" name="inboxView" className="radio radio-primary radio-sm" checked={!preferences.unreadOnly} onChange={() => setPreferences((value) => ({ ...value, unreadOnly: false }))} />
            <span>All notifications</span>
          </label>
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-base-300 p-3">
            <input type="radio" name="inboxView" className="radio radio-primary radio-sm" checked={preferences.unreadOnly} onChange={() => setPreferences((value) => ({ ...value, unreadOnly: true }))} />
            <span>Unread notifications only</span>
          </label>
        </fieldset>
        <label className="form-control block space-y-2">
          <span className="font-semibold">Notifications per page</span>
          <select className="select select-bordered w-full max-w-xs" value={preferences.pageSize} onChange={(event) => setPreferences((value) => ({ ...value, pageSize: Number(event.target.value) }))}>
            <option value={10}>10</option><option value={20}>20</option><option value={50}>50</option>
          </select>
        </label>
        <div className="flex flex-wrap items-center gap-3 border-t border-base-200 pt-4">
          <button type="submit" className="btn btn-primary">Save settings</button>
          <Link to="/tenant/notifications" className="btn btn-ghost">Open inbox</Link>
        </div>
      </form>
      <p className="text-xs text-base-content/60">These settings are stored on this browser. They do not change which notifications your workspace receives.</p>
    </div>
  );
}

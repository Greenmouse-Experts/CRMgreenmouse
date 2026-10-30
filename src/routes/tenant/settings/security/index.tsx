import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { KeyRound, MonitorSmartphone, ShieldCheck } from "lucide-react";
import { useTenantLoginActivity } from "@/api/tenantApi";
import { get_user_value } from "@/store/authStore";

export const Route = createFileRoute("/tenant/settings/security/")({ component: RouteComponent });

function RouteComponent() {
  const [limit, setLimit] = useState(5);
  const activity = useTenantLoginActivity({ page: 1, limit });
  const email = get_user_value()?.user?.email;

  return (
    <div className="mx-auto max-w-3xl space-y-5 pb-8">
      <div>
        <h1 className="text-xl font-semibold">Security</h1>
        <p className="mt-1 text-sm text-base-content/65">Manage password recovery and review access to your account.</p>
      </div>

      <section className="rounded-box border border-base-200 bg-base-100 p-5 shadow-sm sm:p-6" aria-labelledby="password-title">
        <div className="flex items-start gap-3">
          <span className="rounded-lg bg-primary/10 p-2 text-primary"><KeyRound className="size-5" aria-hidden="true" /></span>
          <div className="flex-1 space-y-2">
            <h2 id="password-title" className="font-semibold">Password</h2>
            <p className="text-sm text-base-content/65">Request a verification code by email to set a new password.</p>
            <Link to="/auth/forgot-password" search={{ email }} className="btn btn-primary btn-sm mt-2">Reset password</Link>
          </div>
        </div>
      </section>

      <section className="rounded-box border border-base-200 bg-base-100 p-5 shadow-sm sm:p-6" aria-labelledby="two-factor-title">
        <div className="flex items-start gap-3">
          <span className="rounded-lg bg-base-200 p-2 text-base-content/70"><ShieldCheck className="size-5" aria-hidden="true" /></span>
          <div>
            <h2 id="two-factor-title" className="font-semibold">Two-factor authentication</h2>
            <p className="mt-2 text-sm text-base-content/65">Two-factor authentication is not available for tenant accounts yet.</p>
          </div>
        </div>
      </section>

      <section className="rounded-box border border-base-200 bg-base-100 shadow-sm" aria-labelledby="activity-title">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-base-200 p-5 sm:px-6">
          <div>
            <h2 id="activity-title" className="font-semibold">Recent login activity</h2>
            <p className="mt-1 text-sm text-base-content/65">Devices and locations used to sign in.</p>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => activity.refetch()} disabled={activity.isFetching}>{activity.isFetching ? "Refreshing…" : "Refresh"}</button>
        </div>
        {activity.isPending ? (
          <div className="p-6 text-sm text-base-content/65" role="status">Loading login activity…</div>
        ) : activity.isError ? (
          <div className="p-6 text-sm text-error">Could not load login activity. Try refreshing.</div>
        ) : !activity.data?.length ? (
          <div className="p-6 text-sm text-base-content/65">No login activity available.</div>
        ) : (
          <ul className="divide-y divide-base-200">
            {activity.data.map((entry, index) => {
              const timestamp = entry.createdAt || entry.timestamp;
              const device = [entry.browser, entry.os].filter(Boolean).join(" on ") || entry.device || "Unknown device";
              return (
                <li key={entry.id || entry._id || index} className="flex items-start gap-3 px-5 py-4 sm:px-6">
                  <MonitorSmartphone className="mt-0.5 size-5 shrink-0 text-base-content/50" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{device}</p>
                    <p className="mt-0.5 break-words text-xs text-base-content/60">{[entry.location, entry.ipAddress].filter(Boolean).join(" · ") || "Location unavailable"}</p>
                  </div>
                  <time className="shrink-0 text-xs text-base-content/60" dateTime={timestamp}>
                    {timestamp && !Number.isNaN(Date.parse(timestamp)) ? new Date(timestamp).toLocaleString() : ""}
                  </time>
                </li>
              );
            })}
          </ul>
        )}
        {activity.data?.length === limit && limit === 5 && (
          <div className="border-t border-base-200 p-4 text-center">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setLimit(20)}>Show more activity</button>
          </div>
        )}
      </section>
    </div>
  );
}

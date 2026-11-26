import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  KeyRound,
  MonitorSmartphone,
  ShieldCheck,
} from "lucide-react";
import {
  useChangeStaffPassword,
  useTenantLoginActivity,
  type ChangeStaffPasswordPayload,
} from "@/api/tenantApi";
import { get_user_value } from "@/store/authStore";

export const Route = createFileRoute("/hr/settings/security/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [limit, setLimit] = useState(5);
  const currentUser = get_user_value()?.user;
  const isStaff = currentUser?.userType === "staff";
  const email = currentUser?.email;

  const activity = useTenantLoginActivity({ page: 1, limit }, !isStaff);
  const changePassword = useChangeStaffPassword();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ChangeStaffPasswordPayload>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const newPasswordValue = watch("newPassword");

  const onSubmit = handleSubmit(async (values) => {
    try {
      await changePassword.mutateAsync(values);
      toast.success("Password changed successfully.");
      reset();
    } catch (error: any) {
      toast.error(
        error?.message || "Could not change your password. Try again.",
      );
    }
  });

  return (
    <div className="mx-auto max-w-3xl space-y-5 pb-8">
      <div>
        <h1 className="text-xl font-semibold">Security</h1>
        <p className="mt-1 text-sm text-base-content/65">
          Manage your password and review security options for your account.
        </p>
      </div>

      <section
        className="rounded-box border border-base-200 bg-base-100 p-5 shadow-sm sm:p-6"
        aria-labelledby="password-title"
      >
        <div className="flex items-start gap-3">
          <span className="rounded-lg bg-primary/10 p-2 text-primary">
            <KeyRound className="size-5" aria-hidden="true" />
          </span>
          {isStaff ? (
            <div className="flex-1 space-y-4">
              <div>
                <h2 id="password-title" className="font-semibold">
                  Change password
                </h2>
                <p className="text-sm text-base-content/65">
                  Enter your current password and choose a new password.
                </p>
              </div>

              <form onSubmit={onSubmit} className="space-y-4 max-w-xl">
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium">Current password</span>
                  <div className="relative">
                    <input
                      type={showCurrent ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Enter current password"
                      disabled={changePassword.isPending}
                      aria-invalid={!!errors.currentPassword}
                      className={`input input-bordered w-full pr-10 ${errors.currentPassword ? "input-error" : ""}`}
                      {...register("currentPassword", {
                        required: "Current password is required",
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent((prev) => !prev)}
                      aria-label={
                        showCurrent
                          ? "Hide current password"
                          : "Show current password"
                      }
                      className="btn btn-ghost btn-sm btn-square absolute right-2 top-1/2 -translate-y-1/2 text-base-content/60"
                    >
                      {showCurrent ? (
                        <EyeOff className="size-4" aria-hidden="true" />
                      ) : (
                        <Eye className="size-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  {errors.currentPassword && (
                    <span className="text-sm text-error">
                      {errors.currentPassword.message}
                    </span>
                  )}
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block space-y-1.5">
                    <span className="text-sm font-medium">New password</span>
                    <div className="relative">
                      <input
                        type={showNew ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="Enter new password"
                        disabled={changePassword.isPending}
                        aria-invalid={!!errors.newPassword}
                        className={`input input-bordered w-full pr-10 ${errors.newPassword ? "input-error" : ""}`}
                        {...register("newPassword", {
                          required: "New password is required",
                          minLength: {
                            value: 6,
                            message: "Password must be at least 6 characters",
                          },
                        })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew((prev) => !prev)}
                        aria-label={
                          showNew ? "Hide new password" : "Show new password"
                        }
                        className="btn btn-ghost btn-sm btn-square absolute right-2 top-1/2 -translate-y-1/2 text-base-content/60"
                      >
                        {showNew ? (
                          <EyeOff className="size-4" aria-hidden="true" />
                        ) : (
                          <Eye className="size-4" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                    {errors.newPassword && (
                      <span className="text-sm text-error">
                        {errors.newPassword.message}
                      </span>
                    )}
                  </label>

                  <label className="block space-y-1.5">
                    <span className="text-sm font-medium">
                      Confirm new password
                    </span>
                    <div className="relative">
                      <input
                        type={showConfirm ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="Re-enter new password"
                        disabled={changePassword.isPending}
                        aria-invalid={!!errors.confirmNewPassword}
                        className={`input input-bordered w-full pr-10 ${errors.confirmNewPassword ? "input-error" : ""}`}
                        {...register("confirmNewPassword", {
                          required: "Please confirm your new password",
                          validate: (value) =>
                            value === newPasswordValue ||
                            "Passwords do not match",
                        })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((prev) => !prev)}
                        aria-label={
                          showConfirm
                            ? "Hide password confirmation"
                            : "Show password confirmation"
                        }
                        className="btn btn-ghost btn-sm btn-square absolute right-2 top-1/2 -translate-y-1/2 text-base-content/60"
                      >
                        {showConfirm ? (
                          <EyeOff className="size-4" aria-hidden="true" />
                        ) : (
                          <Eye className="size-4" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                    {errors.confirmNewPassword && (
                      <span className="text-sm text-error">
                        {errors.confirmNewPassword.message}
                      </span>
                    )}
                  </label>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <Link
                    to="/auth/forgot-password"
                    search={{ email, type: "staff" }}
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot current password? Reset via email
                  </Link>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={changePassword.isPending}
                  >
                    {changePassword.isPending
                      ? "Updating..."
                      : "Update password"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex-1 space-y-2">
              <h2 id="password-title" className="font-semibold">
                Password
              </h2>
              <p className="text-sm text-base-content/65">
                Request a verification code by email to set a new password.
              </p>
              <Link
                to="/auth/forgot-password"
                search={{ email }}
                className="btn btn-primary btn-sm mt-2"
              >
                Reset password
              </Link>
            </div>
          )}
        </div>
      </section>

      <section
        className="rounded-box border border-base-200 bg-base-100 p-5 shadow-sm sm:p-6"
        aria-labelledby="two-factor-title"
      >
        <div className="flex items-start gap-3">
          <span className="rounded-lg bg-base-200 p-2 text-base-content/80">
            <ShieldCheck className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 id="two-factor-title" className="font-semibold">
              Two-factor authentication
            </h2>
            <p className="mt-2 text-sm text-base-content/65">
              Two-factor authentication is not available for{" "}
              {isStaff ? "staff" : "tenant"} accounts yet.
            </p>
          </div>
        </div>
      </section>

      {!isStaff && (
        <section
          className="rounded-box border border-base-200 bg-base-100 shadow-sm"
          aria-labelledby="activity-title"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-base-200 p-5 sm:px-6">
            <div>
              <h2 id="activity-title" className="font-semibold">
                Recent login activity
              </h2>
              <p className="mt-1 text-sm text-base-content/65">
                Devices and locations used to sign in.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => activity.refetch()}
              disabled={activity.isFetching}
            >
              {activity.isFetching ? "Refreshing…" : "Refresh"}
            </button>
          </div>
          {activity.isPending ? (
            <div className="p-6 text-sm text-base-content/65" role="status">
              Loading login activity…
            </div>
          ) : activity.isError ? (
            <div className="p-6 text-sm text-error">
              Could not load login activity. Try refreshing.
            </div>
          ) : !activity.data?.length ? (
            <div className="p-6 text-sm text-base-content/65">
              No login activity available.
            </div>
          ) : (
            <ul className="divide-y divide-base-200">
              {activity.data.map((entry, index) => {
                const timestamp = entry.createdAt || entry.timestamp;
                const device =
                  [entry.browser, entry.os].filter(Boolean).join(" on ") ||
                  entry.device ||
                  "Unknown device";
                return (
                  <li
                    key={entry.id || entry._id || index}
                    className="flex items-start gap-3 px-5 py-4 sm:px-6"
                  >
                    <MonitorSmartphone
                      className="mt-0.5 size-5 shrink-0 text-base-content/80"
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{device}</p>
                      <p className="mt-0.5 break-words text-base-content/80">
                        {[entry.location, entry.ipAddress]
                          .filter(Boolean)
                          .join(" · ") || "Location unavailable"}
                      </p>
                    </div>
                    <time
                      className="shrink-0 text-base-content/80"
                      dateTime={timestamp}
                    >
                      {timestamp && !Number.isNaN(Date.parse(timestamp))
                        ? new Date(timestamp).toLocaleString()
                        : ""}
                    </time>
                  </li>
                );
              })}
            </ul>
          )}
          {activity.data?.length === limit && limit === 5 && (
            <div className="border-t border-base-200 p-4 text-center">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setLimit(20)}
              >
                Show more activity
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Eye, EyeOff, KeyRound, ShieldCheck } from "lucide-react";
import {
  useChangeStaffPassword,
  type ChangeStaffPasswordPayload,
} from "@/api/tenantApi";
import { get_user_value } from "@/store/authStore";

export const Route = createFileRoute("/staff/settings/security/")({
  component: RouteComponent,
});

function RouteComponent() {
  const email = get_user_value()?.user?.email;
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
          Update your password and review security options for your account.
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
                    className="btn btn-ghost btn-xs btn-square absolute right-2 top-1/2 -translate-y-1/2 text-base-content/60"
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
                      className="btn btn-ghost btn-xs btn-square absolute right-2 top-1/2 -translate-y-1/2 text-base-content/60"
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
                      className="btn btn-ghost btn-xs btn-square absolute right-2 top-1/2 -translate-y-1/2 text-base-content/60"
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
                  {changePassword.isPending ? "Updating..." : "Update password"}
                </button>
              </div>
            </form>
          </div>
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
              Two-factor authentication is not available for staff accounts yet.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

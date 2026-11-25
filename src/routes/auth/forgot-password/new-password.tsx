import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowRight, ShieldCheck } from "lucide-react";
import SimpleInput from "@/components/inputs/SimpleInput";
import apiClient from "@/client/api";
import AuthLayout from "../-components/AuthLayout";

export const Route = createFileRoute("/auth/forgot-password/new-password")({
  component: RouteComponent,
  validateSearch: (
    search: Record<string, unknown>,
  ): { email: string; type?: "tenant" | "staff" } => {
    return {
      email: typeof search.email === "string" ? search.email : "",
      type: search.type === "staff" ? "staff" : undefined,
    };
  },
});

interface NewPasswordProps {
  email: string;
  otp: string;
  newPassword: string;
}

function RouteComponent() {
  const { email, type } = Route.useSearch();
  const isStaff = type === "staff";
  const nav = useNavigate();
  const form = useForm<NewPasswordProps>({
    defaultValues: {
      email: email || "",
      otp: "",
      newPassword: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: NewPasswordProps) =>
      apiClient
        .post(
          isStaff
            ? "/staff/auth/reset-password"
            : "/tenant/auth/reset-password",
          data,
        )
        .then((res) => res.data),
    onSuccess: () => {
      toast.success(
        "Password reset successful. Please login with your new password.",
      );
      nav({ to: isStaff ? "/auth/staff" : "/auth/login" });
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message ??
        err?.message ??
        "Failed to reset password";
      toast.error(message);
    },
  });

  const onSubmit = (data: NewPasswordProps) => mutate(data);
  const signInRoute = isStaff ? "/auth/staff" : "/auth/login";

  return (
    <AuthLayout
      icon={ShieldCheck}
      title="Set new password"
      subtitle="Enter the OTP sent to your email and your new password."
      topRight={
        <p className="text-sm text-base-content/70">
          Remembered it?{" "}
          <Link
            to={signInRoute}
            className="text-primary font-semibold hover:underline"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <SimpleInput
          label="Email address"
          {...form.register("email", { required: "Email is required" })}
          readOnly
        />

        <SimpleInput
          label="OTP code"
          {...form.register("otp", { required: "OTP is required" })}
          placeholder="482910"
        />

        <SimpleInput
          label="New password"
          {...form.register("newPassword", {
            required: "New password is required",
          })}
          type="password"
          placeholder="Enter your new password"
        />

        <button
          type="submit"
          disabled={isPending}
          className="btn btn-primary w-full h-11 rounded-xl text-white font-semibold gap-2 shadow-sm shadow-primary/20"
        >
          {isPending ? (
            <span className="loading loading-spinner loading-sm" />
          ) : (
            <>
              <span>Reset Password</span>
              <ArrowRight className="size-4" />
            </>
          )}
        </button>

        <p className="text-center text-sm text-base-content/70 pt-1">
          Didn&apos;t receive a code?{" "}
          <Link
            to="/auth/forgot-password"
            search={{
              email,
              ...(isStaff ? { type: "staff" as const } : {}),
            }}
            className="text-primary font-semibold hover:underline"
          >
            Resend OTP
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

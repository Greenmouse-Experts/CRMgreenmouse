import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowRight, KeyRound } from "lucide-react";
import SimpleInput from "@/components/inputs/SimpleInput";
import apiClient from "@/client/api";
import AuthLayout from "../-components/AuthLayout";

export const Route = createFileRoute("/auth/forgot-password/")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): { email?: string } => {
    return {
      email: typeof search.email === "string" ? search.email : undefined,
    };
  },
});

interface ForgotPasswordProps {
  email: string;
}

function RouteComponent() {
  const { email } = Route.useSearch();
  const nav = useNavigate();
  const form = useForm<ForgotPasswordProps>({
    defaultValues: {
      email: email || "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ForgotPasswordProps) =>
      apiClient
        .post("/tenant/auth/forgot-password", data)
        .then((res) => res.data),
    onSuccess: (res) => {
      toast.success(res.message || "Reset OTP sent to your email");
      nav({
        to: "/auth/forgot-password/new-password",
        search: { email: form.getValues("email") },
      });
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message ??
        err?.message ??
        "Failed to send reset OTP";
      toast.error(message);
    },
  });

  const onSubmit = (data: ForgotPasswordProps) => mutate(data);

  return (
    <AuthLayout
      icon={KeyRound}
      title="Reset password"
      subtitle="Enter your business email address and we'll send you an OTP to reset your password."
      topRight={
        <p className="text-sm text-base-content/70">
          Remembered it?{" "}
          <Link
            to="/auth/login"
            className="text-primary font-semibold hover:underline"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <SimpleInput
          label="Business email"
          type="email"
          required
          placeholder="you@company.com"
          {...form.register("email", { required: true })}
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
              <span>Send Reset OTP</span>
              <ArrowRight className="size-4" />
            </>
          )}
        </button>

        <p className="text-center text-sm text-base-content/70 pt-1">
          Back to{" "}
          <Link
            to="/auth/login"
            className="text-primary font-semibold hover:underline"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

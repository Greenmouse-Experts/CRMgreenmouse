import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm, FormProvider } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowRight, Mail } from "lucide-react";
import SimpleInput from "@/components/inputs/SimpleInput";
import apiClient from "@/client/api";
import AuthLayout from "../-components/AuthLayout";

export const Route = createFileRoute("/auth/verify/")({
  component: RouteComponent,
  validateSearch: (search: { email?: string }): { email: string } => {
    return { email: search.email ?? "" };
  },
});

interface VerifyForm {
  otp: string;
}

function RouteComponent() {
  const { email } = Route.useSearch();
  const nav = useNavigate();
  const form = useForm<VerifyForm>();

  const { mutate: verifyMutate, isPending: isVerifying } = useMutation({
    mutationFn: (data: VerifyForm) =>
      apiClient
        .post("/tenant/auth/verify-email", { email, otp: data.otp })
        .then((res) => res.data),
    onSuccess: () => {
      toast.success("Email verified successfully! You can now log in.");
      nav({
        to: "/auth/login",
        search: { email },
      });
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message ?? err?.message ?? "Verification failed";
      toast.error(message);
    },
  });

  const { mutate: resendMutate, isPending: isResending } = useMutation({
    mutationFn: () =>
      apiClient
        .post("/tenant/auth/resend-otp", { email })
        .then((res) => res.data),
    onSuccess: () => {
      toast.success("Verification code resent to your email.");
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message ?? err?.message ?? "Failed to resend code";
      toast.error(message);
    },
  });

  return (
    <AuthLayout
      icon={Mail}
      title="Verify your email"
      subtitle={
        <>
          We&apos;ve sent a 6-digit verification code to{" "}
          <span className="text-base-content font-semibold">
            {email || "your email"}
          </span>
          .
        </>
      }
      topRight={
        <p className="text-sm text-base-content/70">
          Already verified?{" "}
          <Link
            to="/auth/login"
            search={{ email }}
            className="text-primary font-semibold hover:underline"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit((data) => verifyMutate(data))}
          className="space-y-4"
        >
          <SimpleInput
            label="Verification code"
            placeholder="Enter 6-digit code"
            maxLength={6}
            {...form.register("otp", {
              required: "Code is required",
              minLength: {
                value: 6,
                message: "Enter the 6-digit code",
              },
            })}
          />

          <button
            type="submit"
            disabled={isVerifying}
            className="btn btn-primary w-full h-11 rounded-xl text-white font-semibold gap-2 shadow-sm shadow-primary/20"
          >
            {isVerifying ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              <>
                <span>Verify Email</span>
                <ArrowRight className="size-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 space-y-2 text-center text-sm text-base-content/70">
          <p>
            Didn&apos;t receive the code?{" "}
            <button
              type="button"
              onClick={() => resendMutate()}
              disabled={isResending}
              className="text-primary font-semibold hover:underline disabled:opacity-50"
            >
              {isResending ? "Resending..." : "Resend Code"}
            </button>
          </p>

          <p>
            Wait, I want to{" "}
            <button
              type="button"
              onClick={() => nav({ to: "/auth/login", search: { email } })}
              className="text-primary font-semibold hover:underline"
            >
              Sign in
            </button>
          </p>
        </div>
      </FormProvider>
    </AuthLayout>
  );
}

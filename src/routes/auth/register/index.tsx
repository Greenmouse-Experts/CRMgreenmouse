import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm, FormProvider } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowRight, Building2 } from "lucide-react";
import SimpleInput from "@/components/inputs/SimpleInput";
import SimplePhoneInput from "@/components/inputs/SimplePhoneInput";
import apiClient from "@/client/api";
import AuthLayout from "../-components/AuthLayout";

export const Route = createFileRoute("/auth/register/")({
  component: RouteComponent,
});

interface RegisterForm {
  email: string;
  password: string;
  companyName: string;
  phoneNumber: string;
}

function RouteComponent() {
  const nav = useNavigate();
  const form = useForm<RegisterForm>();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: RegisterForm) =>
      apiClient.post("/tenant/auth/register", data).then((res) => res.data),
    onSuccess: (_, variables) => {
      toast.success("Account created! Please verify your email.");
      nav({
        to: "/auth/verify",
        search: { email: variables.email },
      });
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message ?? err?.message ?? "Registration failed";
      toast.error(message);
    },
  });

  return (
    <AuthLayout
      icon={Building2}
      title="Get started"
      subtitle="Create your account to start managing your business."
      topRight={
        <p className="text-sm text-base-content/70">
          Already have an account?{" "}
          <Link
            to="/auth/login"
            className="text-primary font-semibold hover:underline"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit((data) => mutate(data))}
          className="space-y-4"
        >
          <SimpleInput
            label="Company name"
            placeholder="Acme Corp"
            {...form.register("companyName", {
              required: "Company name is required",
            })}
          />

          <SimpleInput
            label="Work email"
            type="email"
            placeholder="john@acmecorp.com"
            {...form.register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            })}
          />

          <SimplePhoneInput
            label="Phone number"
            placeholder="+234 801 234 5678"
            {...form.register("phoneNumber", {
              required: "Phone number is required",
            })}
          />

          <SimpleInput
            label="Password"
            type="password"
            placeholder="Create a strong password"
            {...form.register("password", {
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters",
              },
            })}
          />

          <button
            type="submit"
            disabled={isPending}
            className="btn btn-primary w-full h-11 rounded-xl text-white font-semibold gap-2 shadow-sm shadow-primary/20 mt-2"
          >
            {isPending ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="size-4" />
              </>
            )}
          </button>

          <p className="text-center text-sm text-base-content/70 pt-1">
            Already have an account?{" "}
            <Link
              to="/auth/login"
              className="text-primary font-semibold hover:underline"
            >
              Sign in
            </Link>
          </p>
        </form>
      </FormProvider>
    </AuthLayout>
  );
}

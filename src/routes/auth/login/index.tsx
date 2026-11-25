import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import axios from "axios";
import { ArrowRight, Lock } from "lucide-react";
import SimpleInput from "@/components/inputs/SimpleInput";
import apiClient, { new_url } from "@/client/api";
import { set_user_value, set_profile_value } from "@/store/authStore";
import { setProfileFavicon } from "@/utils/favicon";
import { extract_message } from "@/helpers/errors";
import AuthLayout from "../-components/AuthLayout";

export const Route = createFileRoute("/auth/login/")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): { email?: string } => {
    return {
      email: typeof search.email === "string" ? search.email : undefined,
    };
  },
});

interface LoginProps {
  email: string;
  password: string;
}

function RouteComponent() {
  const { email } = Route.useSearch();
  const nav = useNavigate();
  const form = useForm<LoginProps>({
    defaultValues: {
      email: email || "",
      password: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: LoginProps) =>
      axios.post(new_url + "tenant/auth/login", data).then((res) => res.data),
    onSuccess: async (res) => {
      set_user_value(res);
      toast.success("Login successful");

      let needsOnboarding = false;
      try {
        const profileRes = await apiClient
          .get("/tenant/auth/me")
          .then((r) => r.data);
        const profileData = profileRes.data ?? profileRes;

        if (profileData) {
          set_profile_value(profileData);
          needsOnboarding = !profileData.isOnboarded;
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }

      try {
        const { data } = await apiClient.get("/tenant/onboarding");
        setProfileFavicon((data?.data ?? data)?.logo);
      } catch (err) {
        console.error("Failed to fetch company logo", err);
      }

      nav({
        to: needsOnboarding ? "/auth/register/on-boarding" : "/tenant",
      });
    },
    onError: (err: unknown) => {
      toast.error(extract_message(err));
    },
  });

  const onSubmit = (data: LoginProps) => mutate(data);

  return (
    <AuthLayout
      icon={Lock}
      title="Welcome back"
      subtitle="Sign in to continue to your KINOVIA workspace."
      topRight={
        <p className="text-sm text-base-content/70">
          New to KINOVIA?{" "}
          <Link
            to="/auth/register"
            className="text-primary font-semibold hover:underline"
          >
            Create an account
          </Link>
        </p>
      }
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <SimpleInput
          label="Work email"
          type="email"
          required
          placeholder="you@company.com"
          {...form.register("email", { required: true })}
        />

        <SimpleInput
          label="Password"
          type="password"
          required
          placeholder="Enter your password"
          {...form.register("password", { required: true })}
        />

        <div className="flex items-center justify-between text-sm pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-base-content/80">
            <input
              type="checkbox"
              className="checkbox checkbox-primary checkbox-sm rounded"
            />
            <span>Keep me signed in</span>
          </label>
          <Link
            to="/auth/forgot-password"
            className="text-primary font-medium hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="btn btn-primary w-full h-11 rounded-xl text-white font-semibold gap-2 shadow-sm shadow-primary/20"
        >
          {isPending ? (
            <span className="loading loading-spinner loading-sm" />
          ) : (
            <>
              <span>Sign in to CRM</span>
              <ArrowRight className="size-4" />
            </>
          )}
        </button>

        <p className="text-center text-sm text-base-content/70 pt-1">
          Don&apos;t have an account?{" "}
          <Link
            to="/auth/register"
            className="text-primary font-semibold hover:underline"
          >
            Create one
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

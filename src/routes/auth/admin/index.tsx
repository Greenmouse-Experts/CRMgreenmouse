import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import axios from "axios";
import { ArrowRight, ShieldCheck } from "lucide-react";
import SimpleInput from "@/components/inputs/SimpleInput";
import apiClient, { new_url } from "@/client/api";
import { set_user_value } from "@/store/authStore";
import { setProfileFavicon } from "@/utils/favicon";
import AuthLayout from "../-components/AuthLayout";

export const Route = createFileRoute("/auth/admin/")({
  component: RouteComponent,
  validateSearch: (search: { email?: string }): { email: string } => {
    return { email: search.email ?? "" };
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
      axios.post(new_url + "auth/admin/login", data).then((res) => res.data),
    onSuccess: async (res) => {
      // res is { accessToken, refreshToken, user }
      set_user_value(res);
      toast.success("Login successful");
      try {
        const { data } = await apiClient.get("/admins/profile");
        setProfileFavicon((data?.data ?? data)?.profilePic);
      } catch (err) {
        console.error("Failed to fetch profile picture", err);
      }
      return nav({ to: "/admin" });
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message ?? err?.message ?? "Login failed";
      toast.error(message);
    },
  });

  const onSubmit = (data: LoginProps) => mutate(data);

  return (
    <AuthLayout
      icon={ShieldCheck}
      title="Admin portal"
      subtitle="Enter your administrator credentials to access the portal."
      brandFooterText="Platform administration portal"
      topRight={
        <p className="text-sm text-base-content/70">
          Business workspace?{" "}
          <Link
            to="/auth/login"
            className="text-primary font-semibold hover:underline"
          >
            Tenant sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <SimpleInput
          label="Email address"
          type="email"
          required
          placeholder="admin@kinovia.com"
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
              <span>Sign in to Admin</span>
              <ArrowRight className="size-4" />
            </>
          )}
        </button>

        {import.meta.env.DEV && (
          <button
            type="button"
            className="btn btn-ghost border border-base-300 w-full h-11 rounded-xl font-semibold"
            onClick={() => {
              const data = {
                email: "greenmousedev@gmail.com",
                password: "Password@2022",
              };
              mutate(data);
            }}
          >
            Prefill Dev Admin
          </button>
        )}
      </form>
    </AuthLayout>
  );
}

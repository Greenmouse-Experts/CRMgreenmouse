import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import axios from "axios";
import { ArrowRight, Briefcase } from "lucide-react";
import SimpleInput from "@/components/inputs/SimpleInput";
import { new_url } from "@/client/api";
import { extract_message } from "@/helpers/errors";
import {
  set_user_value,
  set_profile_value,
  type AuthUser,
} from "@/store/authStore";
import AuthLayout from "../-components/AuthLayout";

export const Route = createFileRoute("/auth/staff/")({
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
      axios.post(new_url + "auth/staff/login", data).then((res) => res.data),
    onSuccess: (res) => {
      // Staff identity and permissions are included in the login response.
      set_profile_value(null);
      set_user_value(res);
      toast.success("Login successful");
      const current_user = res as AuthUser;
      const roleName = current_user.user.role?.name?.toLowerCase() ?? "";
      const userType = current_user.user.userType?.toLowerCase() ?? "";
      if (roleName === "hr" || userType.includes("hr")) {
        return nav({ to: "/hr" });
      }
      nav({ to: "/tenant" });
    },
    onError: (err: unknown) => {
      toast.error(extract_message(err));
    },
  });

  const onSubmit = (data: LoginProps) => mutate(data);

  return (
    <AuthLayout
      icon={Briefcase}
      title="Staff sign in"
      subtitle="Sign in to access your KINOVIA team workspace."
      topRight={
        <p className="text-sm text-base-content/70">
          Workspace owner?{" "}
          <Link
            to="/auth/login"
            className="text-primary font-semibold hover:underline"
          >
            Owner sign in
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
              <span>Sign in to Workspace</span>
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
            Register your business
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import axios from "axios";
import { ArrowRight, Home, Lock, Truck, Users } from "lucide-react";
import SimpleInput from "@/components/inputs/SimpleInput";
import apiClient, { new_url } from "@/client/api";
import { set_user_value, set_profile_value } from "@/store/authStore";
import { setProfileFavicon } from "@/utils/favicon";
import { extract_message } from "@/helpers/errors";

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

const PLATFORM_APPS = [
  {
    title: "KINOVIA CRM",
    description: "Customers, sales and business insights.",
    icon: Users,
  },
  {
    title: "Logistics & E-commerce",
    description: "Orders, inventory and delivery coordination.",
    icon: Truck,
  },
  {
    title: "Estate Management App",
    description: "Properties, residents and service requests.",
    icon: Home,
  },
] as const;

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
    <div className="min-h-screen bg-base-200/60 p-3 sm:p-5 lg:p-6 flex items-stretch">
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Left Brand Panel */}
        <div
          className="hidden lg:flex relative overflow-hidden rounded-2xl p-10 xl:p-12 flex-col justify-between text-white"
          style={{
            backgroundImage: "url('/auth_bg.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div>
            <span className="text-2xl font-extrabold tracking-tight">
              <span className="text-indigo-300">KI</span>
              <span>NOVIA</span>
              <span className="text-indigo-300">.</span>
            </span>
          </div>

          <div className="space-y-8 my-auto py-8">
            <div className="space-y-4">
              <h1 className="text-4xl xl:text-5xl font-bold leading-tight tracking-tight">
                One platform.
                <br />
                <span className="text-indigo-300">Every side</span> of your
                <br />
                business.
              </h1>
              <p className="text-base text-white/80 max-w-md leading-relaxed">
                From customer relationships to delivery workflows and estate
                operations, access the tools that keep your business moving.
              </p>
            </div>

            <div className="space-y-3">
              {PLATFORM_APPS.map((app) => {
                const Icon = app.icon;
                return (
                  <div
                    key={app.title}
                    className="bg-white text-base-content rounded-xl px-4 py-3.5 flex items-center justify-between gap-4 shadow-sm"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Icon className="size-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-base text-base-content truncate">
                          {app.title}
                        </p>
                        <p className="text-sm text-base-content/70 truncate">
                          {app.description}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="size-4 text-primary shrink-0" />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-white/75 pt-4">
            <span className="inline-flex items-center gap-2">
              <Lock className="size-4" />
              <span>Your workspace starts here</span>
            </span>
            <span className="font-medium tracking-wider">KINOVIA / 2026</span>
          </div>
        </div>

        {/* Right Login Form Panel */}
        <div className="bg-base-100 rounded-2xl border border-base-200 p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
          <div className="flex items-center justify-between lg:justify-end gap-4">
            <span className="lg:hidden text-xl font-extrabold tracking-tight text-base-content">
              <span className="text-primary">KI</span>NOVIA
              <span className="text-primary">.</span>
            </span>
            <p className="text-sm text-base-content/70">
              New to KINOVIA?{" "}
              <Link
                to="/auth/register"
                className="text-primary font-semibold hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>

          <div className="max-w-md w-full mx-auto my-auto py-8 space-y-6">
            <div className="space-y-3">
              <div className="size-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Lock className="size-5" />
              </div>
              <div className="space-y-1">
                <h2 className="text-3xl font-bold text-base-content tracking-tight">
                  Welcome back<span className="text-primary">.</span>
                </h2>
                <p className="text-sm text-base-content/70">
                  Sign in to continue to your KINOVIA workspace.
                </p>
              </div>
            </div>

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
          </div>

          <div className="pt-6 border-t border-base-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-base-content/60">
            <span>© 2026 KINOVIA</span>
            <span>Designed for connected work</span>
          </div>
        </div>
      </div>
    </div>
  );
}

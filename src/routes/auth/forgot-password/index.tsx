import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import SimpleInput from "@/components/inputs/SimpleInput";
import apiClient from "@/client/api";

export const Route = createFileRoute("/auth/forgot-password/")({
  component: RouteComponent,
  validateSearch: (search: { email?: string }): { email: string } => {
    return { email: search.email ?? "" };
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
    onSuccess: () => {
      toast.success("Reset link sent to your email");
      nav({
        to: "/auth/forgot-password/new-password",
        search: { email: form.getValues("email") },
      });
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message ??
        err?.message ??
        "Failed to send reset link";
      toast.error(message);
    },
  });

  const onSubmit = (data: ForgotPasswordProps) => mutate(data);

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-300 isolate">
      <div
        className={`fixed inset-0 z-[-2] h-screen w-screen rotate-180 transform bg-white dark:bg-base-300 bg-[radial-gradient(oklch(from_var(--color-base-100)_l_c_h_/_50%),oklch(from_var(--color-primary)_l_c_h_/_50%))] opacity-50`}
      ></div>
      <div className="fixed inset-0 opacity-20 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:56px_96px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
      <div className="w-full flex flex-col mx-auto space-y-4 px-4 z-20">
        <div className="mt-12 text-center">
          <h2 className="text-3xl font-bold leading-normal">CRMgreenmouse</h2>
          <p className="font-semibold text-primary mx-auto w-fit text-sm">
            Business Management Portal
          </p>
        </div>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="p-6 space-y-6 py-8 mx-auto bg-base-100/70 backdrop-blur-md rounded-box drop-shadow-xl ring ring-current/10 w-full max-w-md m-2 mb-12"
        >
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-center">Forgot Password</h2>
            <p className="text-sm text-center fieldset-label">
              Enter your email address and we'll send you a code to reset your
              password.
            </p>
          </div>

          <SimpleInput
            label="Email Address"
            {...form.register("email", { required: "Email is required" })}
            placeholder="john@acmecorp.com"
          />

          <button className="btn btn-primary btn-block" disabled={isPending}>
            {isPending ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              "Send Reset Code"
            )}
          </button>

          <div className="text-center">
            <Link
              to="/auth/login"
              className="link link-primary text-sm font-semibold"
            >
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

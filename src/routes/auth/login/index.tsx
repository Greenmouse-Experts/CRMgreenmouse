import { createFileRoute } from "@tanstack/react-router";
import { Divide } from "lucide-react";
import { useForm } from "react-hook-form";
import Lottie from "lottie-react";
import anim from "./data_scan.json";
import { useNavigate } from "@tanstack/react-router";
import SimpleInput from "@/components/SimpleInput";
export const Route = createFileRoute("/auth/login/")({
  component: RouteComponent,
});

interface LoginProps {
  email: string;
  password: string;
}
function RouteComponent() {
  const nav = useNavigate();
  const form = useForm<LoginProps>();
  const onSubmit = (data: LoginProps) => {
    console.log(data);
    nav({
      to: "/admin",
    });
  };

  return (
    <div className="min-h-screen grid  place-items-center bg-base-300">
      <form
        action=""
        className="p-6 space-y-6 py-8 bg-base-100 shadow w-full max-w-lg m-2 "
      >
        <div className="space-y-3 text-center">
          <h2 className="text-4xl font-bold text-center leading-normal">
            Kinovia <br /> Crm{" "}
          </h2>
          <h2 className="text-2xl font-semibold">Admin Login</h2>
          <p className="text-sm text-center label ">
            Enter your credentials to access your account
          </p>
        </div>

        <SimpleInput label="Email Address" {...form.register("email")} />
        <SimpleInput
          label="Password"
          {...form.register("password")}
          type="password"
        />
        <button className="btn btn-primary btn-block">Login</button>
      </form>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { Divide } from "lucide-react";
import { useForm } from "react-hook-form";
import Lottie from "lottie-react";
import anim from "./data_scan.json";
import { useNavigate } from "@tanstack/react-router";
import SimpleInput from "@/components/inputs/SimpleInput";
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
    <div className="min-h-screen grid  place-items-center from-accent/20 bg-linear-60 to-secondary/20">
      <div className="w-full flex flex-col mx-auto space-y-4">
        <h2 className="text-4xl font-bold text-center leading-normal">
          Kinovia <br /> Crm{" "}
        </h2>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          action=""
          className="p-6 space-y-6 py-8 mx-auto bg-base-100 shadow w-full max-w-lg m-2 "
        >
          <div className="space-y-1 ">
            <h2 className="text-2xl font-bold">Admin Login</h2>
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
          <div className="flex items-center gap-2">
            <input type="checkbox" className="toggle" name="" id="" />{" "}
            <span className="fieldset-label text-sm">Remember Me</span>
          </div>
          <button className="btn btn-primary btn-block">Login</button>
        </form>
      </div>
    </div>
  );
}

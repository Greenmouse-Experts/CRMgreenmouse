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
    <div className="min-h-screen grid  md:grid-cols-2">
      <div className="bg-linear-120 from-primary to-secondary hidden md:flex  flex-col text-primary-content">
        <div className="h-3/5 grid place-items-center  ">
          <Lottie animationData={anim} className="" />
        </div>
        <div className="h-1/3 mx-auto max-w-xl   space-y-4 mt-8 px-4">
          <h2 className="text-3xl font-bold">
            Effortlessly manage your customer and operations
          </h2>
          <p>
            Welcome to OS CRM! Streamline customer relationships, boost sales,
            and drive business growth effortlessly.
          </p>
        </div>
      </div>
      <div className="grid place-items-center  w-full">
        <form
          action=""
          className="md:max-w-4/5 max-w-9/10 w-full p-4 space-y-4"
          onSubmit={form.handleSubmit((data) => {
            nav({
              to: "/admin",
              viewTransition: true,
            });
          })}
        >
          <div className="text-xl font-bold">CRM</div>
          <div className="space-y-2 ">
            <h2 className="text-2xl font-bold">Welcome Back Enter</h2>
            <p className=" fieldset-label text-sm">
              Enter your credentials to access your account
            </p>
          </div>
          <SimpleInput
            {...form.register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            })}
            label="Email"
            _form={form}
          />
          <SimpleInput
            {...form.register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
            type="password"
            label="Password"
            _form={form}
          />
          <button className="btn btn-primary btn-block">Sumbit</button>
          <div className="w-full ">
            <div className="divider">OR</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button className="btn btn-accent" type="button">
              Google
            </button>
            <button className="btn btn-accent" type="button">
              Facebook
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

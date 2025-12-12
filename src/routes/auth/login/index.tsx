import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
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
    <div className="min-h-screen flex items-center justify-center bg-base-300 isolate">
      <div
        className={`fixed inset-0 z-[-2] h-screen w-screen rotate-180 transform bg-white dark:bg-base-300 bg-[radial-gradient(oklch(from_var(--color-base-100)_l_c_h_/_50%),oklch(from_var(--color-primary)_l_c_h_/_50%))] opacity-50`}
      ></div>
      <div className="fixed inset-0 opacity-20 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:28px_48px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
      <div className="w-full flex flex-col mx-auto space-y-4 px-4  z-20  ">
        <div className="mt-12">
          <h2 className="text-3xl font-bold text-center leading-normal ">
            Kinovia Crm
          </h2>
          <p className="font-semibold text-primary mx-auto w-fit text-sm">
            Super Admin Portal
          </p>
        </div>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          action=""
          className="p-6 space-y-6 py-8 mx-auto  bg-base-200 rounded-box drop-shadow-xl ring ring-current/10 w-full max-w-md m-2  "
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
          <div className="">
            <section className="ring ring-current/10 bg-base-200 rounded-box p-4 text-xs text-base-content/80 space-y-2">
              <p className="font-semibold ">Demo Credientials</p>
              <div>
                <p>Email: greenmousedev+admin@gmail.com</p>
                <p>Password: admin124</p>
              </div>
            </section>
          </div>
        </form>
      </div>
    </div>
  );
}

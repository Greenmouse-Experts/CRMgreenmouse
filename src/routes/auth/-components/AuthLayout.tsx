import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Home, Lock, Truck, Users, type LucideIcon } from "lucide-react";

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

interface AuthLayoutProps {
  children: ReactNode;
  icon?: LucideIcon;
  title?: string;
  subtitle?: ReactNode;
  topRight?: ReactNode;
  maxWidth?: string;
  brandFooterText?: string;
}

export default function AuthLayout({
  children,
  icon: Icon,
  title,
  subtitle,
  topRight,
  maxWidth = "max-w-md",
  brandFooterText = "Your workspace starts here",
}: AuthLayoutProps) {
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
            <Link
              to="/home"
              className="text-2xl font-extrabold tracking-tight inline-block"
            >
              <span className="text-indigo-300">KI</span>
              <span>NOVIA</span>
              <span className="text-indigo-300">.</span>
            </Link>
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
                const AppIcon = app.icon;
                return (
                  <div
                    key={app.title}
                    className="bg-white text-base-content rounded-xl px-4 py-3.5 flex items-center justify-between gap-4 shadow-sm"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <AppIcon className="size-5" />
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
              <span>{brandFooterText}</span>
            </span>
            <span className="font-medium tracking-wider">KINOVIA / 2026</span>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="bg-base-100 rounded-2xl border border-base-200 p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
          <div className="flex items-center justify-between lg:justify-end gap-4">
            <Link
              to="/home"
              className="lg:hidden text-xl font-extrabold tracking-tight text-base-content"
            >
              <span className="text-primary">KI</span>NOVIA
              <span className="text-primary">.</span>
            </Link>
            {topRight && <div className="ml-auto">{topRight}</div>}
          </div>

          <div className={`${maxWidth} w-full mx-auto my-auto py-8 space-y-6`}>
            {(Icon || title || subtitle) && (
              <div className="space-y-3">
                {Icon && (
                  <div className="size-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Icon className="size-5" />
                  </div>
                )}
                {(title || subtitle) && (
                  <div className="space-y-1">
                    {title && (
                      <h2 className="text-3xl font-bold text-base-content tracking-tight">
                        {title}
                        <span className="text-primary">.</span>
                      </h2>
                    )}
                    {subtitle && (
                      <p className="text-sm text-base-content/70">{subtitle}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {children}
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

import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import AdminDashStats from "./-components/AdminDashStats";
import AdminFinanceTrend from "./-components/AdminFinance";
import {
  PlanInsights,
  TenantAndSupport,
  TenantGrowth,
} from "./-components/AdminInsights";

export const Route = createFileRoute("/admin/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [months, setMonths] = useState<3 | 6 | 12>(12);

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4 py-2">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ShieldCheck className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              Control Center
            </h1>
            <p className="text-xs text-base-content/65">
              Kinovia CRM platform analytics · Super Admin
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/tenants"
            className="hidden rounded-lg bg-base-100 px-3 py-2 text-sm text-base-content/70 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary md:inline-flex"
          >
            Browse tenants
          </Link>
          <div
            className="flex rounded-lg bg-base-100 p-1 text-xs font-semibold"
            role="group"
            aria-label="Chart time range"
          >
            {([3, 6, 12] as const).map((period) => (
              <button
                key={period}
                type="button"
                aria-pressed={months === period}
                onClick={() => setMonths(period)}
                className={`rounded-md px-3 py-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-primary ${months === period ? "bg-primary text-primary-content" : "text-base-content/70 hover:bg-base-200"}`}
              >
                {period}M
              </button>
            ))}
          </div>
        </div>
      </div>
      <AdminDashStats />
      <AdminFinanceTrend months={months} />
      <TenantGrowth months={months} />
      <PlanInsights />
      <TenantAndSupport />
    </div>
  );
}

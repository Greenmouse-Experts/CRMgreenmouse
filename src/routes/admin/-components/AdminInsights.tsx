import { Link } from "@tanstack/react-router";
import { Activity, ArrowUpRight, TriangleAlert } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  useAdminEngagement,
  useAdminPlanDistribution,
  useAdminTenants,
  useAdminTenantStats,
} from "@/api/adminApi";

const card = "min-w-0 rounded-xl bg-base-100 p-5 shadow-sm sm:p-6";
const sampleGrowth = [
  { month: "Nov", active: 8, new: 2 },
  { month: "Dec", active: 9, new: 1 },
  { month: "Jan", active: 9, new: 1 },
  { month: "Feb", active: 10, new: 2 },
  { month: "Mar", active: 11, new: 1 },
  { month: "Apr", active: 11, new: 2 },
  { month: "May", active: 12, new: 1 },
  { month: "Jun", active: 13, new: 2 },
  { month: "Jul", active: 13, new: 1 },
  { month: "Aug", active: 15, new: 2 },
  { month: "Sep", active: 16, new: 2 },
  { month: "Oct", active: 17, new: 1 },
];
const samplePlans = [
  { name: "Starter", paying: 4, revenue: 412500, costs: 347514 },
  { name: "Growth", paying: 7, revenue: 2115000, costs: 1514456 },
  { name: "Business", paying: 2, revenue: 1440837, costs: 1249905 },
  { name: "Enterprise", paying: 5, revenue: 9208325, costs: 8065772 },
];
const sampleTickets = [
  {
    id: "SUP-2381",
    title: "Invoice PDF export failing",
    tenant: "Riverstone Bank",
    priority: "High",
  },
  {
    id: "SUP-2379",
    title: "Role permissions for Accounts",
    tenant: "Crest Pharma",
    priority: "Medium",
  },
  {
    id: "SUP-2374",
    title: "Bulk import customers CSV",
    tenant: "Kora Fashion",
    priority: "Low",
  },
  {
    id: "SUP-2370",
    title: "Payment declined on renewal",
    tenant: "Oasis Hotels",
    priority: "High",
  },
];
const planColors = ["#007047", "#3b82f6", "#f59e0b", "#a855f7", "#e11d48"];
const money = (value: number) => `₦${value.toLocaleString("en-NG")}`;

function SampleLabel() {
  return (
    <span className="rounded-md bg-base-200 px-2 py-1 text-[11px] font-semibold text-base-content/70">
      Example data
    </span>
  );
}

export function TenantGrowth({ months }: { months: 3 | 6 | 12 }) {
  const stats = useAdminTenantStats();
  const engagement = useAdminEngagement();
  return (
    <section className={card} aria-labelledby="tenant-growth-title">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 id="tenant-growth-title" className="text-base font-semibold">
            Tenant growth
          </h2>
          <p className="mt-1 text-xs text-base-content/65">
            Monthly sign-ups chart is illustrative · {months}M
          </p>
        </div>
        <SampleLabel />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Active", stats.data?.active, "text-primary"],
          ["Trial", stats.data?.trial, "text-info"],
          ["Suspended", stats.data?.suspended, "text-warning-content"],
          ["Dormant", engagement.data?.dormantTenants, "text-error"],
        ].map(([label, value, color]) => (
          <div key={label} className="rounded-lg bg-base-200 p-3">
            <p className="text-xs text-base-content/65">{label}</p>
            <p className={`mt-1 text-lg font-bold tabular-nums ${color}`}>
              {stats.isPending || engagement.isPending
                ? "…"
                : value == null
                  ? "—"
                  : Number(value).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
      {(stats.isError || engagement.isError) && (
        <p role="alert" className="mt-2 text-xs text-error">
          Some live tenant counts could not be loaded.
        </p>
      )}
      <div
        className="mt-5 h-56"
        role="img"
        aria-label="Illustrative monthly active tenant and new signup trends"
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={sampleGrowth.slice(-months)}
            margin={{ top: 5, right: 10, left: -30, bottom: 0 }}
          >
            <CartesianGrid
              vertical={false}
              stroke="var(--color-base-300)"
              strokeDasharray="3 4"
            />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              fontSize={11}
            />
            <YAxis tickLine={false} axisLine={false} fontSize={11} />
            <Tooltip
              contentStyle={{
                background: "var(--color-base-100)",
                border: "1px solid var(--color-base-300)",
                borderRadius: 8,
              }}
            />
            <Area
              type="monotone"
              dataKey="active"
              name="Active (example)"
              stroke="#007047"
              fill="#007047"
              fillOpacity={0.12}
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="new"
              name="New (example)"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.12}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export function PlanInsights() {
  const plans = useAdminPlanDistribution();
  const distribution = (plans.data ?? []).map((plan) => ({ ...plan }));
  const total = distribution.reduce((sum, plan) => sum + plan.tenantCount, 0);
  const sums = samplePlans.reduce(
    (acc, plan) => ({
      paying: acc.paying + plan.paying,
      revenue: acc.revenue + plan.revenue,
      costs: acc.costs + plan.costs,
    }),
    { paying: 0, revenue: 0, costs: 0 },
  );
  return (
    <section
      className="grid gap-6 xl:grid-cols-3"
      aria-label="Subscription plans"
    >
      <div className={card}>
        <h2 className="text-base font-semibold">Plan mix</h2>
        <p className="mt-1 text-xs text-base-content/65">
          Share of tenants by subscription plan
        </p>
        {plans.isPending ? (
          <p className="py-16 text-center text-sm" role="status">
            Loading plans…
          </p>
        ) : plans.isError ? (
          <p className="py-16 text-center text-sm text-error" role="alert">
            Could not load plan distribution.
          </p>
        ) : !distribution.length || !total ? (
          <p className="py-16 text-center text-sm text-base-content/65">
            No plan distribution available yet.
          </p>
        ) : (
          <>
            <div
              className="mt-4 h-48"
              role="img"
              aria-label="Tenant share by subscription plan"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distribution}
                    dataKey="tenantCount"
                    nameKey="planName"
                    innerRadius="55%"
                    outerRadius="85%"
                    paddingAngle={2}
                  >
                    {distribution.map((plan, index) => (
                      <Cell
                        key={plan.planId || plan.planName}
                        fill={planColors[index % planColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value} tenants`, "Count"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="mt-3 space-y-2 text-sm">
              {distribution.map((plan, index) => (
                <li
                  key={plan.planId || plan.planName}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor: planColors[index % planColors.length],
                      }}
                    />{" "}
                    <span className="truncate">{plan.planName}</span>
                  </span>
                  <span className="shrink-0 font-semibold tabular-nums">
                    {plan.tenantCount}{" "}
                    <span className="font-normal text-base-content/65">
                      ({Math.round((plan.tenantCount / total) * 100)}%)
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
      <div className={`${card} xl:col-span-2`}>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold">
              Subscription plan performance
            </h2>
            <p className="mt-1 text-xs text-base-content/65">
              Example revenue and cost allocation · 12M
            </p>
          </div>
          <SampleLabel />
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[540px] text-sm tabular-nums">
            <thead className="text-left text-xs uppercase tracking-wide text-base-content/65">
              <tr>
                <th scope="col" className="pb-3">
                  Plan
                </th>
                <th scope="col" className="pb-3 text-right">
                  Paying tenants
                </th>
                <th scope="col" className="pb-3 text-right">
                  Revenue
                </th>
                <th scope="col" className="pb-3 text-right">
                  Costs
                </th>
                <th scope="col" className="pb-3 text-right">
                  Profit
                </th>
              </tr>
            </thead>
            <tbody>
              {samplePlans.map((plan) => (
                <tr key={plan.name} className="border-t border-base-200">
                  <th scope="row" className="py-3 text-left font-medium">
                    {plan.name}
                  </th>
                  <td className="text-right">{plan.paying}</td>
                  <td className="text-right">{money(plan.revenue)}</td>
                  <td className="text-right">{money(plan.costs)}</td>
                  <td className="text-right font-semibold text-primary">
                    {money(plan.revenue - plan.costs)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t border-base-300 font-semibold">
              <tr>
                <th scope="row" className="pt-3 text-left">
                  Total
                </th>
                <td className="pt-3 text-right">{sums.paying}</td>
                <td className="pt-3 text-right">{money(sums.revenue)}</td>
                <td className="pt-3 text-right">{money(sums.costs)}</td>
                <td className="pt-3 text-right">
                  {money(sums.revenue - sums.costs)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </section>
  );
}

export function TenantAndSupport() {
  const tenants = useAdminTenants();
  const recent = [...(tenants.data ?? [])]
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .slice(0, 6);
  const atRisk = (tenants.data ?? [])
    .filter(
      (tenant) =>
        tenant.status === "suspended" ||
        tenant.subscriptionStatus === "expired",
    )
    .slice(0, 5);
  return (
    <section
      className="grid gap-6 xl:grid-cols-2"
      aria-label="Tenants and support"
    >
      <div className={card}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold">Recent tenants</h2>
            <p className="mt-1 text-xs text-base-content/65">
              Latest businesses on the platform
            </p>
          </div>
          <Link
            to="/admin/tenants"
            className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary hover:underline focus-visible:ring-2 focus-visible:ring-primary"
          >
            View all <ArrowUpRight className="size-4" />
          </Link>
        </div>
        {tenants.isPending ? (
          <p className="py-12 text-center text-sm" role="status">
            Loading tenants…
          </p>
        ) : tenants.isError ? (
          <p role="alert" className="py-12 text-center text-sm text-error">
            Could not load tenants.
          </p>
        ) : !recent.length ? (
          <p className="py-12 text-center text-sm text-base-content/65">
            No tenants yet.
          </p>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-base-content/65">
                <tr>
                  <th scope="col" className="pb-3">
                    Tenant
                  </th>
                  <th scope="col" className="pb-3">
                    Plan
                  </th>
                  <th scope="col" className="pb-3">
                    Status
                  </th>
                  <th scope="col" className="pb-3 text-right">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody>
                {recent.map((tenant) => (
                  <tr key={tenant.id} className="border-t border-base-200">
                    <td className="py-3">
                      <div className="font-medium">
                        {tenant.companyName || "Unnamed business"}
                      </div>
                      <div className="max-w-48 truncate text-xs text-base-content/65">
                        {tenant.email}
                      </div>
                    </td>
                    <td>{tenant.subscriptionPlan?.name || "—"}</td>
                    <td>
                      <span
                        className={`badge badge-sm ${tenant.subscriptionStatus === "active" ? "badge-success badge-soft" : tenant.subscriptionStatus === "trial" ? "badge-info badge-soft" : "badge-ghost"}`}
                      >
                        {tenant.subscriptionStatus || "—"}
                      </span>
                    </td>
                    <td className="text-right text-xs tabular-nums text-base-content/70">
                      {tenant.createdAt &&
                      !Number.isNaN(Date.parse(tenant.createdAt))
                        ? new Date(tenant.createdAt).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className="space-y-6">
        <div className={card}>
          <h2 className="text-base font-semibold">At-risk tenants</h2>
          <p className="mt-1 text-xs text-base-content/65">
            Suspended accounts or expired subscriptions
          </p>
          {tenants.isPending ? (
            <p className="py-8 text-sm" role="status">
              Loading tenants…
            </p>
          ) : tenants.isError ? (
            <p className="py-8 text-sm text-error" role="alert">
              Could not load tenant status.
            </p>
          ) : !atRisk.length ? (
            <p className="py-8 text-sm text-base-content/65">
              No suspended or expired tenants.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-base-200 text-sm">
              {atRisk.map((tenant) => (
                <li
                  key={tenant.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-3"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <TriangleAlert
                      className="size-4 shrink-0 text-warning"
                      aria-hidden="true"
                    />
                    <span className="truncate">
                      {tenant.companyName || tenant.email}
                    </span>
                  </span>
                  <span className="text-xs text-base-content/65">
                    {tenant.status === "suspended"
                      ? "Suspended"
                      : "Subscription expired"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className={card}>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold">Support queue</h2>
              <p className="mt-1 text-xs text-base-content/65">
                Illustrative support tickets
              </p>
            </div>
            <SampleLabel />
          </div>
          <ul className="mt-4 divide-y divide-base-200 text-sm">
            {sampleTickets.map((ticket) => (
              <li
                key={ticket.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{ticket.title}</p>
                  <p className="text-xs text-base-content/65">
                    {ticket.id} · {ticket.tenant}
                  </p>
                </div>
                <span
                  className={`badge badge-sm shrink-0 ${ticket.priority === "High" ? "badge-error badge-soft" : ticket.priority === "Medium" ? "badge-warning badge-soft" : "badge-ghost"}`}
                >
                  {ticket.priority}
                </span>
              </li>
            ))}
          </ul>
          <Link
            to="/admin/support"
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline focus-visible:ring-2 focus-visible:ring-primary"
          >
            Open support <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </div>
      <p className="flex items-center gap-2 text-xs text-base-content/65 xl:col-span-2">
        <Activity className="size-4" /> Live metrics are shown where available.
        Example data is not from your account.
      </p>
    </section>
  );
}

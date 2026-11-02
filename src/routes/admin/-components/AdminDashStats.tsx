import { Link } from "@tanstack/react-router";
import { useAdminPlatformOverview, useAdminTenantStats } from "@/api/adminApi";

export default function AdminDashStats() {
  const {
    data: overview,
    isPending: overviewLoading,
    isError: overviewError,
  } = useAdminPlatformOverview();
  const {
    data: tenantStats,
    isPending: tenantLoading,
    isError: tenantError,
  } = useAdminTenantStats();
  const number = (value?: number) =>
    value == null ? "—" : value.toLocaleString();
  const cards = [
    {
      title: "Total revenue",
      value: "₦13.2M",
      subtitle: "Example data · subscription receipts · 12M",
      to: "/admin/subscription",
    },
    {
      title: "Current MRR",
      value: overviewLoading
        ? "…"
        : overviewError
          ? "—"
          : overview?.mrr == null
            ? "—"
            : `₦${number(overview.mrr)}`,
      subtitle: "Contracted monthly recurring revenue",
      to: "/admin/subscription",
    },
    {
      title: "Total tenants",
      value: tenantLoading
        ? "…"
        : tenantError
          ? "—"
          : number(tenantStats?.total ?? overview?.totalTenants),
      subtitle: "Registered businesses",
      to: "/admin/tenants",
    },
    {
      title: "Active tenants",
      value: tenantLoading
        ? "…"
        : tenantError
          ? "—"
          : number(tenantStats?.active ?? overview?.activeTenants),
      subtitle: "Currently active accounts",
      to: "/admin/tenants",
    },
  ];

  return (
    <section
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      aria-label="Platform metrics"
    >
      {cards.map((card) => (
        <Link
          key={card.title}
          to={card.to}
          className="block rounded-xl bg-base-100 p-5 shadow-sm transition-colors hover:bg-base-200/70 focus-visible:ring-2 focus-visible:ring-primary"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-base-content/65">
            {card.title}
          </p>
          <p className="mt-2 text-2xl font-bold tabular-nums text-base-content">
            {card.value}
          </p>
          <p className="mt-1 text-xs text-base-content/65">{card.subtitle}</p>
        </Link>
      ))}
    </section>
  );
}

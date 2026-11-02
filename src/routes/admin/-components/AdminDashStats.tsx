import { Link } from "@tanstack/react-router";
import { useDashboardStats } from "@/api/adminApi";

export default function AdminDashStats() {
  const { data: stats, isPending, isError, refetch } = useDashboardStats();
  const cards = [
    {
      title: "Total income",
      value: stats?.totalIncome,
      change: stats?.incomeChange,
      currency: true,
      to: "/admin/accounts/income-expenses",
    },
    {
      title: "Total expenses",
      value: stats?.totalExpenses,
      change: stats?.expenseChange,
      currency: true,
      to: "/admin/accounts/income-expenses",
    },
    {
      title: "Total customers",
      value: stats?.totalCustomers,
      change: stats?.customerChange,
      currency: false,
      to: "/admin/contacts/customers",
    },
    {
      title: "Total invoices",
      value: stats?.totalInvoices,
      change: stats?.invoiceChange,
      currency: false,
      to: "/admin/accounts/invoices",
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
            {isPending
              ? "…"
              : isError || card.value == null
                ? "—"
                : `${card.currency ? "₦" : ""}${card.value.toLocaleString("en-NG")}`}
          </p>
          <p className="mt-1 text-xs tabular-nums">
            {isPending ? (
              <span className="text-base-content/65">Loading change…</span>
            ) : isError || card.change == null ? (
              <span className="text-base-content/65">Change unavailable</span>
            ) : (
              <span
                className={`font-semibold ${card.change > 0 ? "text-success" : card.change < 0 ? "text-error" : "text-base-content/65"}`}
              >
                {card.change > 0 ? "+" : ""}
                {card.change.toLocaleString("en-NG", {
                  maximumFractionDigits: 1,
                })}
                % change
              </span>
            )}
          </p>
        </Link>
      ))}
      {isError && (
        <div
          role="alert"
          className="text-sm text-error sm:col-span-2 xl:col-span-4"
        >
          Dashboard stats could not be loaded.{" "}
          <button
            type="button"
            className="underline underline-offset-2"
            onClick={() => void refetch()}
          >
            Try again
          </button>
        </div>
      )}
    </section>
  );
}

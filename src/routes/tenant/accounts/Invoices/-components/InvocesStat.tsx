import { useInvoiceStats, type InvoiceStatsData } from "@/api/financeApi";

type StatCard = { title: string; count: number; amount?: number; color: string };

function statValue(value: InvoiceStatsData[keyof InvoiceStatsData]) {
  if (typeof value === "number") return { count: value };
  if (value && typeof value === "object") return value;
  return undefined;
}

export default function InvoicesStat() {
  const statsQuery = useInvoiceStats();

  if (statsQuery.isPending) {
    return <div className="flex min-h-24 items-center justify-center" role="status"><span className="loading loading-spinner loading-sm" /><span className="sr-only">Loading invoice statistics</span></div>;
  }
  if (statsQuery.isError) {
    return <div className="flex items-center gap-3 text-sm text-error">Could not load invoice statistics.<button type="button" className="btn btn-ghost btn-sm" onClick={() => statsQuery.refetch()}>Retry</button></div>;
  }

  const data = statsQuery.data;
  const cards: StatCard[] = [];
  const total = data?.totalInvoices ?? data?.total;
  if (typeof total === "number") {
    cards.push({ title: "Total Invoices", count: total, color: "text-primary" });
  }
  const statusFields = [
    { key: "paid", title: "Paid Invoices", color: "text-success" },
    { key: "pending", title: "Pending Invoices", color: "text-warning" },
    { key: "sent", title: "Sent Invoices", color: "text-info" },
    { key: "overdue", title: "Overdue Invoices", color: "text-error" },
    { key: "draft", title: "Draft Invoices", color: "text-base-content" },
  ] as const;
  for (const field of statusFields) {
    const value = statValue(data?.[field.key]);
    if (value && typeof value.count === "number") {
      cards.push({ title: field.title, count: value.count, amount: value.total, color: field.color });
    }
  }

  if (cards.length === 0) return null;
  return (
    <div className="stats stats-vertical lg:stats-horizontal w-full shadow-sm">
      {cards.map((card) => (
        <div className="stat bg-base-100" key={card.title}>
          <div className="stat-title text-sm">{card.title}</div>
          <div className={`stat-value mt-1 text-2xl font-semibold ${card.color}`}>{card.count.toLocaleString()}</div>
          {typeof card.amount === "number" && <div className="stat-desc mt-1">Amount: {card.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>}
        </div>
      ))}
    </div>
  );
}

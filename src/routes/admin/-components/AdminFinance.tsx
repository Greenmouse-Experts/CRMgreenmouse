import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartNoAxesCombined, RefreshCw } from "lucide-react";
import { useAdminTenants, useAdminTenantRevenueTrend } from "@/api/adminApi";

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const monthLabel = (value: string) => {
  const match = /^(?:\d{4}[-/])?(\d{1,2})(?:[-/].*)?$/.exec(value);
  const number = match ? Number(match[1]) : NaN;
  return number >= 1 && number <= 12 ? monthNames[number - 1] : value;
};
const compactNumber = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});
function formatAmount(value: number, currency?: string) {
  if (currency && /^[A-Z]{3}$/.test(currency)) {
    try {
      return new Intl.NumberFormat("en", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(value);
    } catch {
      /* Fall back to a plain number for unknown currency codes. */
    }
  }
  return new Intl.NumberFormat("en", { maximumFractionDigits: 0 }).format(
    value,
  );
}

export default function AdminFinanceTrend() {
  const [tenantId, setTenantId] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const tenantsQuery = useAdminTenants();
  const tenants = Array.isArray(tenantsQuery.data) ? tenantsQuery.data : [];
  const selectedTenantId = tenantId || tenants[0]?.id || "";
  const reportQuery = useAdminTenantRevenueTrend(selectedTenantId, year);
  const report = reportQuery.data;
  const months = report?.months ?? [];
  const invoicedTotal = months.reduce((sum, month) => sum + month.invoiced, 0);
  const receivedTotal = months.reduce((sum, month) => sum + month.received, 0);
  const years = Array.from(
    { length: 5 },
    (_, index) => new Date().getFullYear() - index,
  );

  return (
    <section
      className="overflow-hidden rounded-2xl border border-base-200 bg-base-100"
      aria-labelledby="tenant-revenue-title"
    >
      <div className="flex flex-col gap-4 border-b border-base-200 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ChartNoAxesCombined className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2
              id="tenant-revenue-title"
              className="text-lg font-semibold text-base-content"
            >
              Revenue trend
            </h2>
            <p className="mt-0.5 text-sm text-base-content/70">
              Monthly invoiced and received amounts for one tenant.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 sm:justify-end">
          <label className="sr-only" htmlFor="revenue-tenant">
            Tenant
          </label>
          <select
            id="revenue-tenant"
            className="select select-bordered min-w-0 flex-1 sm:w-48 sm:flex-none"
            value={selectedTenantId}
            onChange={(event) => setTenantId(event.target.value)}
            disabled={
              tenantsQuery.isPending || tenantsQuery.isError || !tenants.length
            }
          >
            {!tenants.length && (
              <option value="">
                {tenantsQuery.isPending ? "Loading tenants..." : "No tenants"}
              </option>
            )}
            {tenants.map((tenant) => (
              <option key={tenant.id} value={tenant.id}>
                {tenant.companyName || tenant.email}
              </option>
            ))}
          </select>
          <label className="sr-only" htmlFor="revenue-year">
            Year
          </label>
          <select
            id="revenue-year"
            className="select select-bordered w-26"
            value={year}
            onChange={(event) => setYear(Number(event.target.value))}
          >
            {years.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>
      {tenantsQuery.isError ? (
        <div className="px-6 py-12 text-center" role="alert">
          <p className="font-medium">Tenants could not be loaded.</p>
          <button
            type="button"
            className="btn btn-outline btn-sm mt-3"
            onClick={() => tenantsQuery.refetch()}
          >
            <RefreshCw className="size-4" /> Try again
          </button>
        </div>
      ) : tenantsQuery.isPending ? (
        <div
          className="flex min-h-76 items-center justify-center"
          role="status"
        >
          <span className="loading loading-spinner text-primary" />
          <span className="sr-only">Loading tenants</span>
        </div>
      ) : !tenants.length ? (
        <div className="px-6 py-12 text-center">
          <p className="font-medium">No tenants to report on yet.</p>
          <Link
            to="/admin/tenants"
            className="link link-primary mt-2 inline-block text-sm"
          >
            View tenants
          </Link>
        </div>
      ) : reportQuery.isPending ? (
        <div
          className="flex min-h-76 items-center justify-center"
          role="status"
        >
          <span className="loading loading-spinner text-primary" />
          <span className="sr-only">Loading revenue trend</span>
        </div>
      ) : reportQuery.isError ? (
        <div className="px-6 py-12 text-center" role="alert">
          <p className="font-medium">Revenue trend could not be loaded.</p>
          <p className="mt-1 text-sm text-base-content/70">
            {reportQuery.error.message}
          </p>
          <button
            type="button"
            className="btn btn-outline btn-sm mt-3"
            onClick={() => reportQuery.refetch()}
          >
            <RefreshCw className="size-4" /> Try again
          </button>
        </div>
      ) : !months.length ? (
        <div className="px-6 py-12 text-center">
          <p className="font-medium">No revenue activity for {year}.</p>
          <p className="mt-1 text-sm text-base-content/70">
            Choose another tenant or year to see a trend.
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-x-8 gap-y-4 border-b border-base-200 px-5 py-4 sm:px-6">
            <div>
              <p className="text-xs font-medium text-base-content/70">
                Invoiced
              </p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-base-content">
                {formatAmount(invoicedTotal, report?.currency)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-base-content/70">
                Received
              </p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-base-content">
                {formatAmount(receivedTotal, report?.currency)}
              </p>
            </div>
            {report?.outstandingTotal !== undefined && (
              <div>
                <p className="text-xs font-medium text-base-content/70">
                  Outstanding
                </p>
                <p className="mt-1 text-xl font-semibold tabular-nums text-base-content">
                  {formatAmount(report.outstandingTotal, report.currency)}
                </p>
              </div>
            )}
          </div>
          <div className="px-3 pb-5 pt-5 sm:px-6">
            <div className="mb-4 flex flex-wrap items-center gap-5 px-2 text-xs font-medium text-base-content/70">
              <span className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-emerald-600" />{" "}
                Invoiced
              </span>
              <span className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-blue-600" /> Received
              </span>
              {report?.currency && (
                <span className="ml-auto">{report.currency}</span>
              )}
            </div>
            <div
              className="h-72 w-full sm:h-80"
              role="img"
              aria-label={`Monthly invoiced and received amounts for ${year}`}
            >
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={months.map((month) => ({
                    ...month,
                    label: monthLabel(month.month),
                  }))}
                  margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
                  accessibilityLayer
                >
                  <CartesianGrid
                    vertical={false}
                    stroke="var(--color-base-300)"
                    strokeDasharray="3 4"
                  />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "var(--color-base-content)", fontSize: 12 }}
                    tickMargin={12}
                  />
                  <YAxis
                    width={58}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "var(--color-base-content)", fontSize: 12 }}
                    tickFormatter={(value: number) =>
                      compactNumber.format(value)
                    }
                  />
                  <Tooltip
                    formatter={(value, name) => [
                      formatAmount(Number(value), report?.currency),
                      String(name),
                    ]}
                    labelFormatter={(label) => `${label} ${year}`}
                    contentStyle={{
                      backgroundColor: "var(--color-base-100)",
                      border: "1px solid var(--color-base-300)",
                      borderRadius: 12,
                      color: "var(--color-base-content)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="invoiced"
                    name="Invoiced"
                    stroke="#059669"
                    fill="#059669"
                    fillOpacity={0.13}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="received"
                    name="Received"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <table className="sr-only">
              <caption>Revenue trend by month for {year}</caption>
              <thead>
                <tr>
                  <th scope="col">Month</th>
                  <th scope="col">Invoiced</th>
                  <th scope="col">Received</th>
                </tr>
              </thead>
              <tbody>
                {months.map((month, index) => (
                  <tr key={`${month.month}-${index}`}>
                    <th scope="row">{monthLabel(month.month)}</th>
                    <td>{formatAmount(month.invoiced, report?.currency)}</td>
                    <td>{formatAmount(month.received, report?.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}

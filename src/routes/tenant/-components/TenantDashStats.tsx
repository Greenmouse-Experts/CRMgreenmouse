import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Clock,
  FileText,
  ReceiptText,
  UsersRound,
  Wallet,
} from "lucide-react";
import { useDashboardStats } from "@/api/tenantApi";
import { useInvoiceRevenueReport } from "@/api/reportsApi";
import QueryCompLayout from "@/components/layout/QueryCompLayout";

const formatNumber = (value: number) => new Intl.NumberFormat().format(value);
const formatMoney = (value: number) => `₦${formatNumber(value)}`;

export default function TenantDashStats() {
  const query = useDashboardStats();

  const debtsQuery = useInvoiceRevenueReport({ currency: "NGN" });
  return (
    <QueryCompLayout query={query}>
      {(stats) => {
        const cards = [
          {
            title: "Total Income",
            value:
              stats.totalIncome == null ? "—" : formatMoney(stats.totalIncome),
            change: stats.incomeChange,
            linkLabel: "View income",
            icon: Wallet,
            to: "/tenant/accounts/income-expenses",
            accent: "bg-primary/10 text-primary",
          },
          {
            title: "Total Expenses",
            value:
              stats.totalExpenses == null
                ? "—"
                : formatMoney(stats.totalExpenses),
            change: stats.expenseChange,
            linkLabel: "View expenses",
            icon: ReceiptText,
            to: "/tenant/accounts/income-expenses",
            accent: "bg-warning/10 text-warning",
          },
          {
            title: "Total Customers",
            value: formatNumber(stats.totalCustomers),
            change: stats.customerChange,
            linkLabel: "View customers",
            icon: UsersRound,
            to: "/tenant/contacts/customers",
            accent: "bg-info/10 text-info",
          },
          // {
          //   title: "Products",
          //   value: formatNumber(stats.totalProducts),
          //   change: stats.totalProductsChange,
          //   linkLabel: "View products",
          //   icon: Package,
          //   to: "/staff/products",
          //   accent: "bg-primary/10 text-primary",
          // },
          // {
          //   title: "Services",
          //   value: formatNumber(stats.totalServices),
          //   change: stats.totalServicesChange,
          //   linkLabel: "View services",
          //   icon: ShoppingBag,
          //   to: "/staff/products/service",
          //   accent: "bg-info/10 text-info",
          // },
          {
            title: "Total Debts",
            value: debtsQuery.isLoading
              ? "…"
              : debtsQuery.data
                ? formatMoney(debtsQuery.data.outstandingTotal)
                : "—",
            linkLabel: "View Debts",
            icon: Clock,
            to: "/tenant/accounts/Invoices",
            accent: "bg-warning/10 text-warning",
          },
          {
            title: "Total Invoices",
            value: formatNumber(stats.totalInvoices),
            change: stats.invoiceChange,
            linkLabel: "View invoices",
            icon: FileText,
            to: "/tenant/accounts/Invoices",
            accent: "bg-primary/10 text-primary",
          },
          // {
          //   title: "Team Members",
          //   value: formatNumber(stats.totalStaffs),
          //   linkLabel: "View team",
          //   icon: Users,
          //   to: "/staff/users",
          //   accent: "bg-info/10 text-info",
          // },
        ];

        return (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.title}
                  to={card.to}
                  className="card border border-base-200 bg-base-100 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="card-body gap-3 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className={`rounded-xl p-2.5 ${card.accent}`}>
                        <Icon className="size-5" aria-hidden="true" />
                      </div>
                    </div>
                    <div>
                      <p className="text-base font-semibold tabular-nums text-base-content">
                        {card.value}
                      </p>
                      <p className="text-xs font-semibold text-base-content/70">
                        {card.title}
                      </p>
                      {card.change != null && Number.isFinite(card.change) && (
                        <p
                          className={`mt-1 text-xs font-semibold tabular-nums ${card.change === 0 ? "text-base-content/70" : (card.title === "Total Expenses" ? card.change < 0 : card.change > 0) ? "text-success" : "text-error"}`}
                        >
                          {card.change > 0 ? "+" : ""}
                          {card.change.toLocaleString("en-NG", {
                            maximumFractionDigits: 1,
                          })}
                          % change
                        </p>
                      )}
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-medium ${card.accent} !bg-transparent`}
                    >
                      {card.linkLabel}
                      <ArrowRight className="!size-3" aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        );
      }}
    </QueryCompLayout>
  );
}

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
import { useExpensesReport, useInvoiceRevenueReport, useRevenueReport } from "@/api/reportsApi";
import QueryCompLayout from "@/components/layout/QueryCompLayout";

const formatNumber = (value: number) => new Intl.NumberFormat().format(value);
const formatMoney = (value: number) => `₦${formatNumber(value)}`;

export default function TenantDashStats() {
  const query = useDashboardStats();
  const revenueQuery = useRevenueReport();
  const expensesQuery = useExpensesReport();
  const debtsQuery = useInvoiceRevenueReport({ currency: "NGN" });

  return (
    <QueryCompLayout query={query}>
      {(stats) => {
        const cards = [
          {
            title: "Total Income",
            value: revenueQuery.data ? formatMoney(revenueQuery.data.total) : "—",
            linkLabel: "View income",
            icon: Wallet,
            to: "/tenant/accounts/income-expenses",
            accent: "bg-primary/10 text-primary",
          },
          {
            title: "Total Expenses",
            value: expensesQuery.data ? formatMoney(expensesQuery.data.total) : "—",
            linkLabel: "View expenses",
            icon: ReceiptText,
            to: "/tenant/accounts/income-expenses",
            accent: "bg-warning/10 text-warning",
          },
          {
            title: "Total Customers",
            value: formatNumber(stats.totalCustomers),
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

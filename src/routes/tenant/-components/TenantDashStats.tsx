import { Link } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  FileText,
  ReceiptText,
  UsersRound,
  Wallet,
} from "lucide-react";
import { useDashboardStats } from "@/api/tenantApi";
import QueryCompLayout from "@/components/layout/QueryCompLayout";

const formatNumber = (value: number) => new Intl.NumberFormat().format(value);
const formatMoney = (value: number) => `₦${formatNumber(value)}`;

const previousMonth = new Date();
previousMonth.setMonth(previousMonth.getMonth() - 1);
const comparisonLabel = `vs ${previousMonth.toLocaleString("en-NG", { month: "long" })}`;

export default function TenantDashStats() {
  const query = useDashboardStats();

  return (
    <QueryCompLayout query={query}>
      {(stats) => {
        const cards = [
          {
            title: "Total income",
            value:
              stats.totalIncome == null ? "—" : formatMoney(stats.totalIncome),
            change: stats.incomeChange,
            linkLabel: "View income",
            icon: Wallet,
            to: "/tenant/accounts/income-expenses",
          },
          {
            title: "Total expenses",
            value:
              stats.totalExpenses == null
                ? "—"
                : formatMoney(stats.totalExpenses),
            change: stats.expenseChange,
            linkLabel: "View expenses",
            icon: ReceiptText,
            to: "/tenant/accounts/income-expenses",
          },
          {
            title: "Total customers",
            value: formatNumber(stats.totalCustomers),
            allTime: true,
            linkLabel: "View customers",
            icon: UsersRound,
            to: "/tenant/contacts/customers",
          },
          {
            title: "Total invoices",
            value: formatNumber(stats.totalInvoices),
            change: stats.invoiceChange,
            linkLabel: "View invoices",
            icon: FileText,
            to: "/tenant/accounts/Invoices",
          },
        ];

        return (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => {
              const Icon = card.icon;
              const change = "change" in card ? card.change : undefined;
              const isGood =
                change != null &&
                (card.title === "Total expenses" ? change < 0 : change > 0);
              const changeColor =
                change == null || change === 0
                  ? "text-base-content/50"
                  : isGood
                    ? "text-success"
                    : "text-error";

              return (
                <Link
                  key={card.title}
                  to={card.to}
                  className="card rounded-2xl border border-base-200 bg-base-100 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="card-body gap-3 p-5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-base-content/60">
                        {card.title}
                      </p>
                      <Icon
                        className="size-5 shrink-0 text-base-content/40"
                        aria-hidden="true"
                      />
                    </div>

                    <p className="text-2xl font-bold tabular-nums text-base-content">
                      {card.value}
                    </p>

                    {"allTime" in card && card.allTime ? (
                      <p className="text-sm text-base-content/50">All time</p>
                    ) : (
                      change != null &&
                      Number.isFinite(change) && (
                        <p className="flex items-center gap-1 text-sm">
                          {change !== 0 &&
                            (change < 0 ? (
                              <ArrowDown
                                className={`size-3.5 ${changeColor}`}
                                aria-hidden="true"
                              />
                            ) : (
                              <ArrowUp
                                className={`size-3.5 ${changeColor}`}
                                aria-hidden="true"
                              />
                            ))}
                          <span
                            className={`font-semibold tabular-nums ${changeColor}`}
                          >
                            {Math.abs(change).toLocaleString("en-NG", {
                              maximumFractionDigits: 1,
                            })}
                            %
                          </span>
                          <span className="text-base-content/50">
                            {comparisonLabel}
                          </span>
                        </p>
                      )
                    )}

                    <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                      {card.linkLabel}
                      <ArrowRight className="size-3.5" aria-hidden="true" />
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

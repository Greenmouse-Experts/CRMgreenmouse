import SimpleContainer from "@/components/SimpleContainer";
import CustomTable, { type columnType } from "@/components/tables/CustomTable";
import { Link } from "@tanstack/react-router";
import { useTransactions, type Transaction } from "@/api/financeApi";
import QueryCompLayout from "@/components/layout/QueryCompLayout";

export default function AdminRecents() {
  const query = useTransactions();

  const columns: columnType[] = [
    {
      key: "date",
      label: "Date",
      render: (value: string) => (
        <span className="text-xs text-base-content/70">
          {value ? new Date(value).toLocaleDateString() : "—"}
        </span>
      ),
    },
    {
      key: "description",
      label: "Description",
      render: (value: string, item: Transaction) => (
        <div>
          <div className="font-semibold text-sm text-base-content">
            {value || "Transaction"}
          </div>
          {item.category && (
            <div className="text-xs text-base-content/60">{item.category}</div>
          )}
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (value: string) => {
        const isIncome = (value || "").toLowerCase() === "income";
        return (
          <span
            className={`badge badge-sm font-medium ${
              isIncome ? "badge-success badge-soft" : "badge-error badge-soft"
            }`}
          >
            {value || "General"}
          </span>
        );
      },
    },
    {
      key: "amount",
      label: "Amount",
      render: (value: number, item: Transaction) => {
        const isIncome = (item.type || "").toLowerCase() === "income";
        const val = Math.abs(Number(value) || 0);
        return (
          <span
            className={`font-bold text-sm ${
              isIncome ? "text-success" : "text-error"
            }`}
          >
            {isIncome ? "+" : "-"}$
            {val.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => {
        const status = (value || "Completed").toLowerCase();
        return (
          <span
            className={`badge badge-sm ${
              status === "completed" || status === "approved"
                ? "badge-success text-success-content"
                : status === "pending"
                  ? "badge-warning text-warning-content"
                  : "badge-error text-error-content"
            }`}
          >
            {value || "Completed"}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <SimpleContainer
        title="Recent Transactions"
        actions={
          <Link
            to="/tenant/accounts/transactions"
            className="btn btn-primary btn-sm"
          >
            View All Transactions
          </Link>
        }
      >
        <QueryCompLayout query={query}>
          {(transactions) => {
            const recent = (transactions || []).slice(0, 5);
            return <CustomTable ring={false} data={recent} columns={columns} />;
          }}
        </QueryCompLayout>
      </SimpleContainer>
    </div>
  );
}

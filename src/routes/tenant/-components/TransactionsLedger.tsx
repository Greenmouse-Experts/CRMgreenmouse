import { useState, useRef, useMemo } from "react";
import CustomTable from "@/components/tables/CustomTable";
import SimpleContainer from "@/components/SimpleContainer";
import ContainerRow from "@/components/ContainerRow";
import SearchBar from "@/components/Searchbar";
import type { Actions } from "@/components/tables/pop-up";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import PageLoader from "@/components/layout/PageLoader";
import { useTransactions, type Transaction } from "@/api/financeApi";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Activity,
  CreditCard,
  Filter,
} from "lucide-react";

interface TransactionsLedgerProps {
  title?: string;
  limit?: number;
  showHeaderMetrics?: boolean;
}

export default function TransactionsLedger({
  title = "Financial Transactions Ledger",
  limit,
  showHeaderMetrics = true,
}: TransactionsLedgerProps) {
  const query = useTransactions();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const detailsModalRef = useRef<ModalHandle>(null);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const handleOpenDetails = (tx: Transaction) => {
    setSelectedTx(tx);
    detailsModalRef.current?.open();
  };

  const transactionsList: Transaction[] = query.data || [];

  const totalInflow = useMemo(() => {
    return transactionsList
      .filter((tx) => tx.amount > 0)
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [transactionsList]);

  const totalOutflow = useMemo(() => {
    return transactionsList
      .filter((tx) => tx.amount < 0)
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  }, [transactionsList]);

  const netCashflow = totalInflow - totalOutflow;

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return transactionsList.filter((tx) => {
      // Type filter
      if (typeFilter === "inflow" && tx.amount <= 0) return false;
      if (typeFilter === "outflow" && tx.amount >= 0) return false;

      // Status filter
      if (
        statusFilter !== "all" &&
        tx.status?.toLowerCase() !== statusFilter.toLowerCase()
      ) {
        return false;
      }

      // Search term
      if (!term) return true;
      return (
        tx.description?.toLowerCase().includes(term) ||
        tx.type?.toLowerCase().includes(term) ||
        tx.status?.toLowerCase().includes(term) ||
        tx.category?.toLowerCase().includes(term) ||
        tx.id?.toLowerCase().includes(term)
      );
    });
  }, [transactionsList, search, typeFilter, statusFilter]);

  const displayedList = limit ? filtered.slice(0, limit) : filtered;

  const columns = [
    {
      key: "date",
      label: "Date & Time",
      render: (value: any) => (
        <span className="text-sm text-base-content/80 font-medium">
          {value
            ? new Date(value).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "—"}
        </span>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (val: any, item: Transaction) => {
        const isPositive = item.amount >= 0;
        return (
          <div className="flex items-center gap-2">
            <div
              className={`size-8 rounded-lg flex items-center justify-center ${
                isPositive
                  ? "bg-success/10 text-success"
                  : "bg-error/10 text-error"
              }`}
            >
              {isPositive ? (
                <ArrowDownLeft className="size-4" />
              ) : (
                <ArrowUpRight className="size-4" />
              )}
            </div>
            <span className="font-semibold text-sm text-base-content capitalize">
              {val || (isPositive ? "Inflow" : "Outflow")}
            </span>
          </div>
        );
      },
    },
    {
      key: "amount",
      label: "Amount",
      render: (val: any) => {
        const amt = Number(val || 0);
        const isPositive = amt >= 0;
        return (
          <span
            className={`font-bold text-sm ${
              isPositive ? "text-success" : "text-error"
            }`}
          >
            {isPositive ? "+" : "-"}₦{Math.abs(amt).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        );
      },
    },
    {
      key: "description",
      label: "Description / Memo",
      render: (val: any, item: Transaction) => (
        <div>
          <div className="font-medium text-base-content text-sm">
            {val || "Transaction"}
          </div>
          {item.category && (
            <span className="badge badge-sm badge-ghost mt-0.5">
              {item.category}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (status: string) => {
        const s = status?.toLowerCase();
        let badgeClass = "badge-warning text-white";
        if (s === "completed" || s === "success" || s === "approved") {
          badgeClass = "badge-success text-white";
        } else if (s === "failed" || s === "rejected") {
          badgeClass = "badge-error text-white";
        }

        return (
          <span
            className={`badge badge-sm font-semibold capitalize ${badgeClass}`}
          >
            {status || "Completed"}
          </span>
        );
      },
    },
  ];

  const actions: Actions<Transaction>[] = [
    {
      key: "view",
      label: "View Details",
      action: (item) => handleOpenDetails(item),
    },
  ];

  return (
    <div className="space-y-6">
      {showHeaderMetrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card bg-base-100 border border-base-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-base-content/60 uppercase">
                  Total Records
                </p>
                <h3 className="text-2xl font-bold text-base-content mt-1">
                  {transactionsList.length}
                </h3>
              </div>
              <div className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/20">
                <Activity className="size-5" />
              </div>
            </div>
          </div>
          <div className="card bg-base-100 border border-base-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-base-content/60 uppercase">
                  Total Inflow
                </p>
                <h3 className="text-2xl font-bold text-success mt-1">
                  +₦{totalInflow.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </h3>
              </div>
              <div className="p-3 rounded-xl bg-success/10 text-success border border-success/20">
                <ArrowDownLeft className="size-5" />
              </div>
            </div>
          </div>
          <div className="card bg-base-100 border border-base-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-base-content/60 uppercase">
                  Total Outflow
                </p>
                <h3 className="text-2xl font-bold text-error mt-1">
                  -₦{totalOutflow.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </h3>
              </div>
              <div className="p-3 rounded-xl bg-error/10 text-error border border-error/20">
                <ArrowUpRight className="size-5" />
              </div>
            </div>
          </div>
          <div className="card bg-base-100 border border-base-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-base-content/60 uppercase">
                  Net Cashflow
                </p>
                <h3
                  className={`text-2xl font-bold mt-1 ${
                    netCashflow >= 0 ? "text-success" : "text-error"
                  }`}
                >
                  {netCashflow >= 0 ? "+" : "-"}₦
                  {Math.abs(netCashflow).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </h3>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
                <CreditCard className="size-5" />
              </div>
            </div>
          </div>
        </div>
      )}

      <SimpleContainer
        title={
          <div className="flex items-center gap-2">
            <span>{title}</span>
            {transactionsList.length > 0 && (
              <span className="badge badge-sm badge-ghost font-normal">
                {filtered.length}
              </span>
            )}
          </div>
        }
      >
        <ContainerRow>
          <div className="flex flex-wrap items-center justify-between gap-3 w-full">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search memo, category, type, ID..."
              className="w-full sm:w-72"
            />
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 text-sm text-base-content/70">
                <Filter className="size-4" />
                <span>Filters:</span>
              </div>
              <select
                className="select select-sm select-bordered"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="inflow">Inflow Only</option>
                <option value="outflow">Outflow Only</option>
              </select>
              <select
                className="select select-sm select-bordered"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </ContainerRow>

        <PageLoader
          query={query}
          emptyState={{
            title: "No Transactions Found",
            description:
              "All incoming sales, invoice receipts, and expense recordings will appear here automatically.",
          }}
        >
          {() => (
            <CustomTable
              ring={false}
              data={displayedList}
              columns={columns}
              actions={actions}
            />
          )}
        </PageLoader>
      </SimpleContainer>

      {/* Transaction Details Modal */}
      <Modal ref={detailsModalRef} title="Transaction Details">
        {selectedTx && (
          <div className="space-y-4 p-2">
            <div className="flex items-center gap-4 p-4 bg-base-200/50 rounded-2xl">
              <div
                className={`size-14 rounded-2xl flex items-center justify-center ${
                  selectedTx.amount >= 0
                    ? "bg-success/10 text-success"
                    : "bg-error/10 text-error"
                }`}
              >
                {selectedTx.amount >= 0 ? (
                  <ArrowDownLeft className="size-7" />
                ) : (
                  <ArrowUpRight className="size-7" />
                )}
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-base-content">
                  {selectedTx.description || "Transaction"}
                </h4>
                <div className="flex items-center gap-2">
                  <span className="badge badge-sm badge-outline">
                    {selectedTx.type}
                  </span>
                  <span
                    className={`badge badge-sm font-semibold capitalize ${
                      selectedTx.status?.toLowerCase() === "completed" ||
                      selectedTx.status?.toLowerCase() === "success"
                        ? "badge-success text-white"
                        : "badge-warning text-white"
                    }`}
                  >
                    {selectedTx.status || "Completed"}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 bg-base-200/40 rounded-xl">
                <span className="text-xs text-base-content/60 block font-medium">
                  Amount
                </span>
                <span
                  className={`font-bold text-lg ${
                    selectedTx.amount >= 0 ? "text-success" : "text-error"
                  }`}
                >
                  {selectedTx.amount >= 0 ? "+" : "-"}₦
                  {Math.abs(Number(selectedTx.amount || 0)).toLocaleString(
                    undefined,
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    },
                  )}
                </span>
              </div>
              <div className="p-3 bg-base-200/40 rounded-xl">
                <span className="text-xs text-base-content/60 block font-medium">
                  Date
                </span>
                <span className="font-semibold text-base-content">
                  {selectedTx.date
                    ? new Date(selectedTx.date).toLocaleString()
                    : "—"}
                </span>
              </div>
              <div className="p-3 bg-base-200/40 rounded-xl">
                <span className="text-xs text-base-content/60 block font-medium">
                  Category
                </span>
                <span className="font-semibold text-base-content">
                  {selectedTx.category || "General"}
                </span>
              </div>
              <div className="p-3 bg-base-200/40 rounded-xl">
                <span className="text-xs text-base-content/60 block font-medium">
                  Reference ID
                </span>
                <span className="font-mono text-xs text-base-content/70 truncate block">
                  {selectedTx.id}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => detailsModalRef.current?.close()}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

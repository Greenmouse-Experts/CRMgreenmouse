import { useState, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import CustomTable from "@/components/tables/CustomTable";
import SimpleContainer from "@/components/SimpleContainer";
import PageHeader from "@/components/Headers/PageHeader";
import ContainerRow from "@/components/ContainerRow";
import { useSearch } from "@/stores/data";
import type { Actions } from "@/components/tables/pop-up";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import PageLoader from "@/components/layout/PageLoader";
import { useTransactions, type Transaction } from "@/api/financeApi";
import { ArrowUpRight, ArrowDownLeft, Activity, CreditCard } from "lucide-react";

export const Route = createFileRoute("/admin/accounts/transactions/")({
  component: RouteComponent,
});

function RouteComponent() {
  const query = useTransactions();
  const searchProps = useSearch();

  const detailsModalRef = useRef<ModalHandle>(null);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const handleOpenDetails = (tx: Transaction) => {
    setSelectedTx(tx);
    detailsModalRef.current?.open();
  };

  const transactionsList = query.data || [];
  const searchTerm = searchProps.search?.toLowerCase() || "";
  const filtered = transactionsList.filter((tx) => {
    if (!searchTerm) return true;
    return (
      tx.description?.toLowerCase().includes(searchTerm) ||
      tx.type?.toLowerCase().includes(searchTerm) ||
      tx.status?.toLowerCase().includes(searchTerm) ||
      tx.category?.toLowerCase().includes(searchTerm) ||
      tx.id?.toLowerCase().includes(searchTerm)
    );
  });

  const totalInflow = transactionsList
    .filter((tx) => tx.amount > 0)
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalOutflow = transactionsList
    .filter((tx) => tx.amount < 0)
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  const netCashflow = totalInflow - totalOutflow;

  const columns = [
    {
      key: "date",
      label: "Date & Time",
      render: (value: any) => (
        <span className="text-xs text-base-content/80 font-medium">
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
      label: "Transaction Type",
      render: (val: any, item: Transaction) => {
        const isPositive = item.amount >= 0;
        return (
          <div className="flex items-center gap-2">
            <div
              className={`size-7 rounded-lg flex items-center justify-center ${
                isPositive
                  ? "bg-success/10 text-success"
                  : "bg-error/10 text-error"
              }`}
            >
              {isPositive ? (
                <ArrowDownLeft className="size-3.5" />
              ) : (
                <ArrowUpRight className="size-3.5" />
              )}
            </div>
            <span className="font-semibold text-xs text-base-content capitalize">
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
            {isPositive ? "+" : "-"}₦{Math.abs(amt).toLocaleString()}
          </span>
        );
      },
    },
    {
      key: "description",
      label: "Description / Memo",
      render: (val: any, item: Transaction) => (
        <div>
          <div className="font-medium text-base-content text-xs">{val || "Transaction"}</div>
          {item.category && (
            <span className="badge badge-xs badge-ghost mt-0.5">
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
          <span className={`badge badge-sm font-semibold capitalize ${badgeClass}`}>
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
      <PageHeader
        title="Transactions Ledger"
        description="Audit company movements, debits, credits, and processed receipts"
      />

      <PageLoader
        query={query}
        showSuccessState={true}
        emptyState={{
          title: "No Transactions Found",
          description: "All financial transactions and movements will be automatically recorded here.",
        }}
      >
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="card bg-base-100/70 backdrop-blur-md border border-base-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-base-content/60 uppercase">
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
          <div className="card bg-base-100/70 backdrop-blur-md border border-base-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-base-content/60 uppercase">
                  Total Inflow
                </p>
                <h3 className="text-2xl font-bold text-success mt-1">
                  +₦{totalInflow.toLocaleString()}
                </h3>
              </div>
              <div className="p-3 rounded-xl bg-success/10 text-success border border-success/20">
                <ArrowDownLeft className="size-5" />
              </div>
            </div>
          </div>
          <div className="card bg-base-100/70 backdrop-blur-md border border-base-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-base-content/60 uppercase">
                  Total Outflow
                </p>
                <h3 className="text-2xl font-bold text-error mt-1">
                  -₦{totalOutflow.toLocaleString()}
                </h3>
              </div>
              <div className="p-3 rounded-xl bg-error/10 text-error border border-error/20">
                <ArrowUpRight className="size-5" />
              </div>
            </div>
          </div>
          <div className="card bg-base-100/70 backdrop-blur-md border border-base-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-base-content/60 uppercase">
                  Net Cash Position
                </p>
                <h3 className="text-2xl font-bold text-base-content mt-1">
                  ₦{netCashflow.toLocaleString()}
                </h3>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
                <CreditCard className="size-5" />
              </div>
            </div>
          </div>
        </div>

        <SimpleContainer title="Financial Records">
          <ContainerRow searchProps={searchProps} showSearch={true} />
          <CustomTable
            data={filtered}
            columns={columns}
            actions={actions}
          />
        </SimpleContainer>
      </PageLoader>

      {/* Details Modal */}
      <Modal ref={detailsModalRef} title="Transaction Record Details">
        {selectedTx && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-base-200/50 rounded-xl">
              <div
                className={`size-14 rounded-xl flex items-center justify-center ${
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
              <div>
                <h4 className="text-lg font-bold text-base-content">
                  {selectedTx.description}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="badge badge-sm badge-outline">
                    {selectedTx.type}
                  </span>
                  <span
                    className={`badge badge-sm ${
                      selectedTx.status === "Completed"
                        ? "badge-success text-white"
                        : "badge-warning text-white"
                    }`}
                  >
                    {selectedTx.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-base-200/30 rounded-lg">
                <span className="text-xs text-base-content/60 block">
                  Amount
                </span>
                <span
                  className={`font-bold text-lg ${
                    selectedTx.amount >= 0 ? "text-success" : "text-error"
                  }`}
                >
                  {selectedTx.amount >= 0 ? "+" : "-"}₦
                  {Math.abs(Number(selectedTx.amount || 0)).toLocaleString()}
                </span>
              </div>
              <div className="p-3 bg-base-200/30 rounded-lg">
                <span className="text-xs text-base-content/60 block">Date</span>
                <span className="font-semibold text-base-content">
                  {selectedTx.date
                    ? new Date(selectedTx.date).toLocaleString()
                    : "—"}
                </span>
              </div>
              <div className="p-3 bg-base-200/30 rounded-lg">
                <span className="text-xs text-base-content/60 block">
                  Category
                </span>
                <span className="font-semibold text-base-content">
                  {selectedTx.category || "General"}
                </span>
              </div>
              <div className="p-3 bg-base-200/30 rounded-lg">
                <span className="text-xs text-base-content/60 block">
                  Reference ID
                </span>
                <span className="font-mono text-xs text-base-content/70">
                  {selectedTx.id}
                </span>
              </div>
            </div>

            <div className="modal-action">
              <button
                type="button"
                className="btn btn-primary"
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

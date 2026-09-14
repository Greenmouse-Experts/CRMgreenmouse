import { useState, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import ContainerRow from "@/components/ContainerRow";
import SimpleContainer from "@/components/SimpleContainer";
import PageHeader from "@/components/Headers/PageHeader";
import { useSearch } from "@/stores/data";
import CustomTable from "@/components/tables/CustomTable";
import type { Actions } from "@/components/tables/pop-up";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import PageLoader from "@/components/layout/PageLoader";
import { useTransactions, type Transaction } from "@/api/financeApi";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";

export const Route = createFileRoute("/admin/transactions/")({
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

  const columns = [
    {
      key: "date",
      label: "Date",
      render: (val: any) => (
        <span className="text-xs text-base-content/80 font-medium">
          {val ? new Date(val).toLocaleDateString() : "—"}
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
      key: "description",
      label: "Description",
      render: (val: any) => (
        <span className="text-xs font-medium text-base-content">{val}</span>
      ),
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
        description="Review all recorded transactions, deposits, and transfers"
      />

      <PageLoader
        query={query}
        showSuccessState={true}
        emptyState={{
          title: "No Transactions Found",
          description: "All transactions will be logged here.",
        }}
      >
        <SimpleContainer title="Transaction History">
          <ContainerRow searchProps={searchProps} showSearch={true} />
          <CustomTable
            data={filtered}
            columns={columns}
            actions={actions}
          />
        </SimpleContainer>
      </PageLoader>

      {/* Details Modal */}
      <Modal ref={detailsModalRef} title="Transaction Details">
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
                  <span className="badge badge-sm badge-success text-white">
                    {selectedTx.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-base-200/30 rounded-lg">
                <span className="text-xs text-base-content/60 block">Amount</span>
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
                  {selectedTx.date ? new Date(selectedTx.date).toLocaleString() : "—"}
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

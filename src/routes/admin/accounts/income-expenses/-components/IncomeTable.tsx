import { useState, useRef } from "react";
import CustomTable from "@/components/tables/CustomTable";
import type { Actions } from "@/components/tables/pop-up";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import QueryCompLayout from "@/components/layout/QueryCompLayout";
import {
  useIncomeRecords,
  useUpdateIncome,
  useDeleteIncome,
  useUpdateIncomeStatus,
  type IncomeRecord,
} from "@/api/financeApi";
import { toast } from "sonner";
import { TrendingUp, CheckCircle, Clock, XCircle } from "lucide-react";

interface IncomeTableProps {
  searchTerm?: string;
}

export default function IncomeTable({ searchTerm = "" }: IncomeTableProps) {
  const query = useIncomeRecords();
  const updateIncome = useUpdateIncome();
  const deleteIncome = useDeleteIncome();
  const updateStatus = useUpdateIncomeStatus();

  const editModalRef = useRef<ModalHandle>(null);
  const detailsModalRef = useRef<ModalHandle>(null);

  const [selectedIncome, setSelectedIncome] = useState<IncomeRecord | null>(null);
  const [form, setForm] = useState({
    amount: 0,
    type: "Salary",
    source: "",
    description: "",
    status: "Pending",
  });

  const handleOpenEdit = (income: IncomeRecord) => {
    setSelectedIncome(income);
    setForm({
      amount: Number(income.amount) || 0,
      type: income.type || "Salary",
      source: income.source || "",
      description: income.description || "",
      status: income.status || "Pending",
    });
    editModalRef.current?.open();
  };

  const handleOpenDetails = (income: IncomeRecord) => {
    setSelectedIncome(income);
    detailsModalRef.current?.open();
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncome) return;
    try {
      await updateIncome.mutateAsync({
        id: selectedIncome.id,
        amount: Number(form.amount),
        type: form.type,
        source: form.source,
        description: form.description,
        status: form.status,
      });
      toast.success("Income record updated successfully");
      editModalRef.current?.close();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update income");
    }
  };

  const handleApprove = async (income: IncomeRecord) => {
    try {
      await updateStatus.mutateAsync({ id: income.id, status: "Approved" });
      toast.success("Income marked as Approved");
    } catch (err: any) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (income: IncomeRecord) => {
    if (!confirm(`Are you sure you want to delete this income record for ₦${income.amount}?`)) return;
    try {
      await deleteIncome.mutateAsync(income.id);
      toast.success("Income deleted successfully");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete income");
    }
  };

  const incomeList = query.data || [];
  const term = searchTerm.toLowerCase();
  const filtered = incomeList.filter((item) => {
    if (!term) return true;
    return (
      item.source?.toLowerCase().includes(term) ||
      item.type?.toLowerCase().includes(term) ||
      item.description?.toLowerCase().includes(term) ||
      item.status?.toLowerCase().includes(term)
    );
  });

  const columns = [
    {
      key: "date",
      label: "Date",
      render: (value: any, item: IncomeRecord) => {
        const d = value || item.createdAt;
        return (
          <span className="text-xs text-base-content/80 font-medium">
            {d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—"}
          </span>
        );
      },
    },
    {
      key: "source",
      label: "Source & Description",
      render: (_: any, item: IncomeRecord) => (
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-success/10 flex items-center justify-center text-success">
            <TrendingUp className="size-4" />
          </div>
          <div>
            <div className="font-semibold text-base-content">{item.source || "Direct Revenue"}</div>
            <div className="text-xs text-base-content/50 line-clamp-1">{item.description || item.type}</div>
          </div>
        </div>
      ),
    },
    {
      key: "type",
      label: "Category",
      render: (val: any) => (
        <span className="badge badge-sm badge-outline font-medium">
          {val || "General"}
        </span>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      render: (value: any) => (
        <span className="font-bold text-success text-sm">
          +₦{Number(value || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => {
        const isApproved = value?.toLowerCase() === "approved" || value?.toLowerCase() === "received";
        const isPending = value?.toLowerCase() === "pending";
        return (
          <span
            className={`badge badge-sm font-semibold ${
              isApproved
                ? "badge-success text-white"
                : isPending
                ? "badge-warning text-white"
                : "badge-error text-white"
            }`}
          >
            {value || "Pending"}
          </span>
        );
      },
    },
  ];

  const actions: Actions<IncomeRecord>[] = [
    {
      key: "view",
      label: "View Details",
      action: (item) => handleOpenDetails(item),
    },
    {
      key: "approve",
      label: "Approve Income",
      action: (item) => handleApprove(item),
    },
    {
      key: "edit",
      label: "Edit Income",
      action: (item) => handleOpenEdit(item),
    },
    {
      key: "delete",
      label: "Delete",
      action: (item) => handleDelete(item),
    },
  ];

  return (
    <div className="space-y-4">
      <QueryCompLayout query={query}>
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-base-content/60 bg-base-100 rounded-box border border-base-200">
            No income records recorded yet.
          </div>
        ) : (
          <CustomTable columns={columns} data={filtered} actions={actions} />
        )}
      </QueryCompLayout>

      {/* Edit Income Modal */}
      <Modal ref={editModalRef} title="Edit Income Record">
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-base-content/70">
                Amount (₦) *
              </label>
              <input
                type="number"
                required
                min="0"
                className="input input-bordered w-full mt-1"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-base-content/70">
                Type / Category
              </label>
              <select
                className="select select-bordered w-full mt-1"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="Salary">Salary</option>
                <option value="Sales">Sales</option>
                <option value="Grant">Grant</option>
                <option value="Commission">Commission</option>
                <option value="Investment">Investment</option>
                <option value="Bonus">Bonus</option>
                <option value="Rental Income">Rental Income</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-base-content/70">
              Source *
            </label>
            <input
              type="text"
              required
              className="input input-bordered w-full mt-1"
              value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-base-content/70">
              Status
            </label>
            <select
              className="select select-bordered w-full mt-1"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-base-content/70">
              Description
            </label>
            <textarea
              className="textarea textarea-bordered w-full mt-1"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => editModalRef.current?.close()}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={updateIncome.isPending}
            >
              {updateIncome.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Details Modal */}
      <Modal ref={detailsModalRef} title="Income Record Details">
        {selectedIncome && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-base-200/50 rounded-xl">
              <div className="size-14 rounded-xl bg-success/10 flex items-center justify-center text-success">
                <TrendingUp className="size-7" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-base-content">
                  {selectedIncome.source || "Income Record"}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="badge badge-sm badge-outline">
                    {selectedIncome.type}
                  </span>
                  <span
                    className={`badge badge-sm ${
                      selectedIncome.status === "Approved"
                        ? "badge-success text-white"
                        : "badge-warning text-white"
                    }`}
                  >
                    {selectedIncome.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-base-200/30 rounded-lg">
                <span className="text-xs text-base-content/60 block">Amount</span>
                <span className="font-bold text-success text-lg">
                  ₦{Number(selectedIncome.amount || 0).toLocaleString()}
                </span>
              </div>
              <div className="p-3 bg-base-200/30 rounded-lg">
                <span className="text-xs text-base-content/60 block">Date</span>
                <span className="font-semibold text-base-content">
                  {selectedIncome.date || selectedIncome.createdAt
                    ? new Date(selectedIncome.date || selectedIncome.createdAt!).toLocaleDateString()
                    : "—"}
                </span>
              </div>
            </div>

            {selectedIncome.description && (
              <div>
                <span className="text-xs font-semibold text-base-content/70 block mb-1">
                  Description
                </span>
                <p className="text-sm text-base-content/80 p-3 bg-base-200/30 rounded-lg">
                  {selectedIncome.description}
                </p>
              </div>
            )}

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

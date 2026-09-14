import { useState, useRef } from "react";
import CustomTable from "@/components/tables/CustomTable";
import type { Actions } from "@/components/tables/pop-up";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import QueryCompLayout from "@/components/layout/QueryCompLayout";
import {
  useExpenseRecords,
  useUpdateExpense,
  useDeleteExpense,
  useUpdateExpenseStatus,
  type ExpenseRecord,
} from "@/api/financeApi";
import { toast } from "sonner";
import { TrendingDown, CheckCircle, XCircle } from "lucide-react";

interface ExpenseTableProps {
  searchTerm?: string;
}

export default function ExpenseTable({ searchTerm = "" }: ExpenseTableProps) {
  const query = useExpenseRecords();
  const updateExpense = useUpdateExpense();
  const deleteExpense = useDeleteExpense();
  const updateStatus = useUpdateExpenseStatus();

  const editModalRef = useRef<ModalHandle>(null);
  const detailsModalRef = useRef<ModalHandle>(null);

  const [selectedExpense, setSelectedExpense] = useState<ExpenseRecord | null>(null);
  const [form, setForm] = useState({
    amount: 0,
    category: "Software",
    paidTo: "",
    description: "",
    status: "Pending",
  });

  const handleOpenEdit = (expense: ExpenseRecord) => {
    setSelectedExpense(expense);
    setForm({
      amount: Number(expense.amount) || 0,
      category: expense.category || "Software",
      paidTo: expense.paidTo || "",
      description: expense.description || "",
      status: expense.status || "Pending",
    });
    editModalRef.current?.open();
  };

  const handleOpenDetails = (expense: ExpenseRecord) => {
    setSelectedExpense(expense);
    detailsModalRef.current?.open();
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExpense) return;
    try {
      await updateExpense.mutateAsync({
        id: selectedExpense.id,
        amount: Number(form.amount),
        category: form.category,
        paidTo: form.paidTo,
        description: form.description,
        status: form.status,
      });
      toast.success("Expense record updated successfully");
      editModalRef.current?.close();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update expense");
    }
  };

  const handleApprove = async (expense: ExpenseRecord) => {
    try {
      await updateStatus.mutateAsync({ id: expense.id, status: "Approved" });
      toast.success("Expense marked as Approved");
    } catch (err: any) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (expense: ExpenseRecord) => {
    if (!confirm(`Are you sure you want to delete this expense record for ₦${expense.amount}?`)) return;
    try {
      await deleteExpense.mutateAsync(expense.id);
      toast.success("Expense deleted successfully");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete expense");
    }
  };

  const expenseList = query.data || [];
  const term = searchTerm.toLowerCase();
  const filtered = expenseList.filter((item) => {
    if (!term) return true;
    return (
      item.paidTo?.toLowerCase().includes(term) ||
      item.category?.toLowerCase().includes(term) ||
      item.description?.toLowerCase().includes(term) ||
      item.status?.toLowerCase().includes(term)
    );
  });

  const columns = [
    {
      key: "date",
      label: "Date",
      render: (value: any, item: ExpenseRecord) => {
        const d = value || item.createdAt;
        return (
          <span className="text-xs text-base-content/80 font-medium">
            {d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—"}
          </span>
        );
      },
    },
    {
      key: "paidTo",
      label: "Recipient & Purpose",
      render: (_: any, item: ExpenseRecord) => (
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-error/10 flex items-center justify-center text-error">
            <TrendingDown className="size-4" />
          </div>
          <div>
            <div className="font-semibold text-base-content">{item.paidTo || "Vendor Payment"}</div>
            <div className="text-xs text-base-content/50 line-clamp-1">{item.description || item.category}</div>
          </div>
        </div>
      ),
    },
    {
      key: "category",
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
        <span className="font-bold text-error text-sm">
          -₦{Number(value || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => {
        const isApproved = value?.toLowerCase() === "approved";
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

  const actions: Actions<ExpenseRecord>[] = [
    {
      key: "view",
      label: "View Details",
      action: (item) => handleOpenDetails(item),
    },
    {
      key: "approve",
      label: "Approve Expense",
      action: (item) => handleApprove(item),
    },
    {
      key: "edit",
      label: "Edit Expense",
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
            No expense records recorded yet.
          </div>
        ) : (
          <CustomTable columns={columns} data={filtered} actions={actions} />
        )}
      </QueryCompLayout>

      {/* Edit Expense Modal */}
      <Modal ref={editModalRef} title="Edit Expense Record">
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
                Category
              </label>
              <select
                className="select select-bordered w-full mt-1"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="Travel">Travel</option>
                <option value="Software">Software & Subscriptions</option>
                <option value="Office Supplies">Office Supplies</option>
                <option value="Meals">Meals & Entertainment</option>
                <option value="Utilities">Utilities & Rent</option>
                <option value="Marketing">Marketing & Ads</option>
                <option value="Insurance">Insurance</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-base-content/70">
              Paid To (Vendor / Staff) *
            </label>
            <input
              type="text"
              required
              className="input input-bordered w-full mt-1"
              value={form.paidTo}
              onChange={(e) => setForm({ ...form, paidTo: e.target.value })}
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
              disabled={updateExpense.isPending}
            >
              {updateExpense.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Details Modal */}
      <Modal ref={detailsModalRef} title="Expense Record Details">
        {selectedExpense && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-base-200/50 rounded-xl">
              <div className="size-14 rounded-xl bg-error/10 flex items-center justify-center text-error">
                <TrendingDown className="size-7" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-base-content">
                  {selectedExpense.paidTo || "Expense Record"}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="badge badge-sm badge-outline">
                    {selectedExpense.category}
                  </span>
                  <span
                    className={`badge badge-sm ${
                      selectedExpense.status === "Approved"
                        ? "badge-success text-white"
                        : "badge-warning text-white"
                    }`}
                  >
                    {selectedExpense.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-base-200/30 rounded-lg">
                <span className="text-xs text-base-content/60 block">Amount</span>
                <span className="font-bold text-error text-lg">
                  -₦{Number(selectedExpense.amount || 0).toLocaleString()}
                </span>
              </div>
              <div className="p-3 bg-base-200/30 rounded-lg">
                <span className="text-xs text-base-content/60 block">Date</span>
                <span className="font-semibold text-base-content">
                  {selectedExpense.date || selectedExpense.createdAt
                    ? new Date(selectedExpense.date || selectedExpense.createdAt!).toLocaleDateString()
                    : "—"}
                </span>
              </div>
            </div>

            {selectedExpense.description && (
              <div>
                <span className="text-xs font-semibold text-base-content/70 block mb-1">
                  Description
                </span>
                <p className="text-sm text-base-content/80 p-3 bg-base-200/30 rounded-lg">
                  {selectedExpense.description}
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

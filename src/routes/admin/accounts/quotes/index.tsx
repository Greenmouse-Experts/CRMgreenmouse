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
import {
  useQuotes,
  useQuoteStats,
  useCreateQuote,
  useUpdateQuote,
  useDeleteQuote,
  useUpdateQuoteStatus,
  type Quote,
} from "@/api/salesApi";
import { PlusCircleIcon, FileText, CheckCircle2, Clock, DollarSign } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/accounts/quotes/")({
  component: RouteComponent,
});

function RouteComponent() {
  const query = useQuotes();
  const statsQuery = useQuoteStats();
  const createQuote = useCreateQuote();
  const updateQuote = useUpdateQuote();
  const deleteQuote = useDeleteQuote();
  const updateStatus = useUpdateQuoteStatus();
  const searchProps = useSearch();

  const addModalRef = useRef<ModalHandle>(null);
  const editModalRef = useRef<ModalHandle>(null);
  const detailsModalRef = useRef<ModalHandle>(null);

  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [form, setForm] = useState({
    clientName: "",
    amount: 0,
    description: "",
    date: new Date().toISOString().split("T")[0],
    status: "pending",
  });

  const handleOpenAdd = () => {
    setForm({
      clientName: "",
      amount: 0,
      description: "",
      date: new Date().toISOString().split("T")[0],
      status: "pending",
    });
    addModalRef.current?.open();
  };

  const handleOpenEdit = (quote: Quote) => {
    setSelectedQuote(quote);
    setForm({
      clientName: quote.clientName || "",
      amount: Number(quote.amount) || 0,
      description: quote.description || "",
      date: quote.date || new Date().toISOString().split("T")[0],
      status: quote.status || "pending",
    });
    editModalRef.current?.open();
  };

  const handleOpenDetails = (quote: Quote) => {
    setSelectedQuote(quote);
    detailsModalRef.current?.open();
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clientName.trim()) {
      toast.error("Client name is required");
      return;
    }
    if (form.amount <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }
    try {
      await createQuote.mutateAsync(form);
      toast.success("Quote generated successfully");
      addModalRef.current?.close();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create quote");
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuote) return;
    try {
      await updateQuote.mutateAsync({
        id: selectedQuote.id,
        ...form,
      });
      toast.success("Quote updated successfully");
      editModalRef.current?.close();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update quote");
    }
  };

  const handleSetStatus = async (quote: Quote, status: "accepted" | "rejected") => {
    try {
      await updateStatus.mutateAsync({ id: quote.id, status });
      toast.success(`Quote marked as ${status}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update status");
    }
  };

  const handleDelete = async (quote: Quote) => {
    if (!confirm(`Are you sure you want to delete quote for "${quote.clientName}"?`)) return;
    try {
      await deleteQuote.mutateAsync(quote.id);
      toast.success("Quote deleted successfully");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete quote");
    }
  };

  const quotesList = query.data || [];
  const searchTerm = searchProps.search?.toLowerCase() || "";
  const filteredQuotes = quotesList.filter((q) => {
    if (!searchTerm) return true;
    return (
      q.clientName?.toLowerCase().includes(searchTerm) ||
      q.description?.toLowerCase().includes(searchTerm) ||
      q.status?.toLowerCase().includes(searchTerm)
    );
  });

  const totalQuotes = statsQuery.data?.total ?? quotesList.length;
  const acceptedQuotes =
    statsQuery.data?.accepted ??
    quotesList.filter((q) => q.status?.toLowerCase() === "accepted").length;
  const pendingQuotes =
    statsQuery.data?.pending ??
    quotesList.filter((q) => q.status?.toLowerCase() === "pending").length;
  const pipelineValue =
    statsQuery.data?.totalAmount ??
    quotesList.reduce((sum, q) => sum + (Number(q.amount) || 0), 0);

  const columns = [
    {
      key: "clientName",
      label: "Client / Recipient",
      render: (_: any, item: Quote) => (
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
            <FileText className="size-4" />
          </div>
          <div>
            <span className="font-semibold text-base-content block">
              {item.clientName}
            </span>
            <span className="text-xs text-base-content/50 line-clamp-1">
              {item.description || "No proposal summary"}
            </span>
          </div>
        </div>
      ),
    },
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
      key: "amount",
      label: "Quoted Amount",
      render: (val: any) => (
        <span className="font-bold text-base-content">
          ₦{Number(val || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (status: string) => {
        const s = status?.toLowerCase();
        let badgeClass = "badge-warning text-white";
        if (s === "accepted") badgeClass = "badge-success text-white";
        else if (s === "rejected") badgeClass = "badge-error text-white";

        return (
          <span className={`badge badge-sm font-semibold capitalize ${badgeClass}`}>
            {status || "Pending"}
          </span>
        );
      },
    },
  ];

  const actions: Actions<Quote>[] = [
    {
      key: "view",
      label: "View Details",
      action: (item) => handleOpenDetails(item),
    },
    {
      key: "accept",
      label: "Mark Accepted",
      action: (item) => handleSetStatus(item, "accepted"),
    },
    {
      key: "reject",
      label: "Mark Rejected",
      action: (item) => handleSetStatus(item, "rejected"),
    },
    {
      key: "edit",
      label: "Edit Quote",
      action: (item) => handleOpenEdit(item),
    },
    {
      key: "delete",
      label: "Delete",
      action: (item) => handleDelete(item),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quotes & Estimates"
        description="Issue professional proposals, track bids, and close opportunities"
      >
        <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">
          <PlusCircleIcon className="size-4" /> Create Quote
        </button>
      </PageHeader>

      <PageLoader
        query={query}
        showSuccessState={true}
        emptyState={{
          title: "No Quotes Found",
          description: "Generate quotes and estimates for prospective clients.",
          actionText: "Create Quote",
          onAction: handleOpenAdd,
        }}
      >
        {/* Quick Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="card bg-base-100/70 backdrop-blur-md border border-base-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-base-content/60 uppercase">
                  Total Quotes
                </p>
                <h3 className="text-2xl font-bold text-base-content mt-1">
                  {totalQuotes}
                </h3>
              </div>
              <div className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/20">
                <FileText className="size-5" />
              </div>
            </div>
          </div>
          <div className="card bg-base-100/70 backdrop-blur-md border border-base-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-base-content/60 uppercase">
                  Accepted
                </p>
                <h3 className="text-2xl font-bold text-base-content mt-1">
                  {acceptedQuotes}
                </h3>
              </div>
              <div className="p-3 rounded-xl bg-success/10 text-success border border-success/20">
                <CheckCircle2 className="size-5" />
              </div>
            </div>
          </div>
          <div className="card bg-base-100/70 backdrop-blur-md border border-base-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-base-content/60 uppercase">
                  Pending Review
                </p>
                <h3 className="text-2xl font-bold text-base-content mt-1">
                  {pendingQuotes}
                </h3>
              </div>
              <div className="p-3 rounded-xl bg-warning/10 text-warning border border-warning/20">
                <Clock className="size-5" />
              </div>
            </div>
          </div>
          <div className="card bg-base-100/70 backdrop-blur-md border border-base-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-base-content/60 uppercase">
                  Pipeline Value
                </p>
                <h3 className="text-2xl font-bold text-base-content mt-1">
                  ₦{pipelineValue.toLocaleString()}
                </h3>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
                <DollarSign className="size-5" />
              </div>
            </div>
          </div>
        </div>

        <SimpleContainer title="Quotes Directory">
          <ContainerRow searchProps={searchProps} showSearch={true} />
          <CustomTable
            data={filteredQuotes}
            columns={columns}
            actions={actions}
          />
        </SimpleContainer>
      </PageLoader>

      {/* Add Quote Modal */}
      <Modal ref={addModalRef} title="Generate New Quote">
        <form onSubmit={handleSaveAdd} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-base-content/70">
              Client / Organization Name *
            </label>
            <input
              type="text"
              required
              className="input input-bordered w-full mt-1"
              placeholder="e.g. Acme Corporation"
              value={form.clientName}
              onChange={(e) => setForm({ ...form, clientName: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-base-content/70">
                Amount (₦) *
              </label>
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                className="input input-bordered w-full mt-1"
                placeholder="0.00"
                value={form.amount || ""}
                onChange={(e) =>
                  setForm({ ...form, amount: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-base-content/70">
                Proposal Date
              </label>
              <input
                type="date"
                className="input input-bordered w-full mt-1"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-base-content/70">
              Initial Status
            </label>
            <select
              className="select select-bordered w-full mt-1"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-base-content/70">
              Scope of Work / Description
            </label>
            <textarea
              className="textarea textarea-bordered w-full mt-1"
              rows={3}
              placeholder="Outline services, scope, terms and delivery milestones..."
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>

          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => addModalRef.current?.close()}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={createQuote.isPending}
            >
              {createQuote.isPending ? "Generating..." : "Generate Quote"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Quote Modal */}
      <Modal ref={editModalRef} title="Edit Quote">
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-base-content/70">
              Client / Organization Name *
            </label>
            <input
              type="text"
              required
              className="input input-bordered w-full mt-1"
              value={form.clientName}
              onChange={(e) => setForm({ ...form, clientName: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-base-content/70">
                Amount (₦) *
              </label>
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                className="input input-bordered w-full mt-1"
                value={form.amount}
                onChange={(e) =>
                  setForm({ ...form, amount: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-base-content/70">
                Proposal Date
              </label>
              <input
                type="date"
                className="input input-bordered w-full mt-1"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
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
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
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
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
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
              disabled={updateQuote.isPending}
            >
              {updateQuote.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Details Modal */}
      <Modal ref={detailsModalRef} title="Quote Proposal Details">
        {selectedQuote && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-base-200/50 rounded-xl">
              <div className="size-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <FileText className="size-7" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-base-content">
                  {selectedQuote.clientName}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="badge badge-sm capitalize font-semibold">
                    {selectedQuote.status || "Pending"}
                  </span>
                  <span className="text-xs text-base-content/60">
                    Date: {selectedQuote.date || selectedQuote.createdAt ? new Date(selectedQuote.date || selectedQuote.createdAt!).toLocaleDateString() : "—"}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-base-200/30 rounded-lg">
              <span className="text-xs text-base-content/60 block">Quoted Amount</span>
              <span className="font-bold text-primary text-2xl mt-1 block">
                ₦{Number(selectedQuote.amount || 0).toLocaleString()}
              </span>
            </div>

            {selectedQuote.description && (
              <div>
                <span className="text-xs font-semibold text-base-content/70 block mb-1">
                  Scope & Details
                </span>
                <p className="text-sm text-base-content/80 p-3 bg-base-200/30 rounded-lg">
                  {selectedQuote.description}
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

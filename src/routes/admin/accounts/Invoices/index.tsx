import { useState, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import InvoicesStat from "./-components/InvocesStat";
import SimpleContainer from "@/components/SimpleContainer";
import CustomTable from "@/components/tables/CustomTable";
import PageHeader from "@/components/Headers/PageHeader";
import type { Actions } from "@/components/tables/pop-up";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import PageLoader from "@/components/layout/PageLoader";
import ContainerRow from "@/components/ContainerRow";
import { useSearch } from "@/stores/data";
import {
  useInvoices,
  useInvoiceStats,
  useDeleteInvoice,
  useMarkInvoicePaid,
  useSendInvoice,
  type Invoice,
} from "@/api/financeApi";
import { PlusCircleIcon, FileText, Send, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/accounts/Invoices/")({
  component: RouteComponent,
});

function RouteComponent() {
  const query = useInvoices();
  const statsQuery = useInvoiceStats();
  const deleteInvoice = useDeleteInvoice();
  const markPaid = useMarkInvoicePaid();
  const sendInvoice = useSendInvoice();
  const searchProps = useSearch();

  const detailsModalRef = useRef<ModalHandle>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const handleOpenDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    detailsModalRef.current?.open();
  };

  const handleMarkPaid = async (invoice: Invoice) => {
    try {
      await markPaid.mutateAsync(invoice.id);
      toast.success(`Invoice marked as paid`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to mark invoice as paid");
    }
  };

  const handleSendInvoice = async (invoice: Invoice) => {
    try {
      await sendInvoice.mutateAsync(invoice.id);
      toast.success(`Invoice marked as sent to customer`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to mark invoice as sent");
    }
  };

  const handleDelete = async (invoice: Invoice) => {
    const num = invoice.invoiceNumber || invoice.id.slice(0, 8);
    if (!confirm(`Are you sure you want to delete invoice #${num}?`)) return;
    try {
      await deleteInvoice.mutateAsync(invoice.id);
      toast.success("Invoice deleted successfully");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete invoice");
    }
  };

  const invoicesList = query.data || [];
  const searchTerm = searchProps.search?.toLowerCase() || "";
  const filteredInvoices = invoicesList.filter((inv) => {
    if (!searchTerm) return true;
    const clientName = inv.contact
      ? `${inv.contact.firstName} ${inv.contact.lastName}`
      : "";
    return (
      inv.invoiceNumber?.toLowerCase().includes(searchTerm) ||
      clientName.toLowerCase().includes(searchTerm) ||
      inv.status?.toLowerCase().includes(searchTerm) ||
      inv.billingAddress?.toLowerCase().includes(searchTerm)
    );
  });

  const columns = [
    {
      key: "invoiceNumber",
      label: "Invoice #",
      render: (val: any, item: Invoice) => (
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
            <FileText className="size-4" />
          </div>
          <div>
            <span className="font-semibold text-base-content block">
              {val || `INV-${item.id.slice(0, 8).toUpperCase()}`}
            </span>
            <span className="text-xs text-base-content/50">
              {item.items?.length || 0} line items
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      label: "Customer / Client",
      render: (val: any, item: Invoice) => (
        <div>
          <div className="font-medium text-base-content">
            {val ? `${val.firstName} ${val.lastName}` : "Direct Client"}
          </div>
          <div className="text-xs text-base-content/50">{val?.email || item.billingAddress || "—"}</div>
        </div>
      ),
    },
    {
      key: "issuedDate",
      label: "Dates",
      render: (val: any, item: Invoice) => (
        <div className="text-xs space-y-0.5">
          <div className="text-base-content/80">
            Issued: {val ? new Date(val).toLocaleDateString() : "—"}
          </div>
          <div className="text-base-content/50">
            Due: {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : "—"}
          </div>
        </div>
      ),
    },
    {
      key: "total",
      label: "Amount",
      render: (val: any, item: Invoice) => {
        const computed =
          val ??
          item.items?.reduce(
            (s, it) => s + (Number(it.unitPrice) || 0) * (Number(it.qty) || 1),
            0
          );
        return (
          <span className="font-bold text-base-content">
            {item.currency || "₦"}{Number(computed || 0).toLocaleString()}
          </span>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (status: string) => {
        const s = status?.toLowerCase();
        let badgeClass = "badge-ghost";
        if (s === "paid") badgeClass = "badge-success text-white";
        else if (s === "sent" || s === "pending") badgeClass = "badge-info text-white";
        else if (s === "overdue") badgeClass = "badge-error text-white";
        else if (s === "draft") badgeClass = "badge-warning text-white";

        return (
          <span className={`badge badge-sm font-semibold capitalize ${badgeClass}`}>
            {status || "Draft"}
          </span>
        );
      },
    },
  ];

  const actions: Actions<Invoice>[] = [
    {
      key: "view",
      label: "View Details",
      action: (item) => handleOpenDetails(item),
    },
    {
      key: "send",
      label: "Mark as Sent",
      action: (item) => handleSendInvoice(item),
    },
    {
      key: "paid",
      label: "Mark as Paid",
      action: (item) => handleMarkPaid(item),
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
        title="Invoices Management"
        description="Track client billing, invoices issuance, and payment settlements"
      >
        <Link to="/admin/accounts/Invoices/add" className="btn btn-primary btn-sm">
          <PlusCircleIcon className="size-4" /> Create Invoice
        </Link>
      </PageHeader>

      <PageLoader
        query={query}
        showSuccessState={true}
        emptyState={{
          title: "No Invoices Found",
          description: "Get started by creating your first client invoice.",
          actionText: "Create Invoice",
          onAction: () => {},
        }}
      >
        <InvoicesStat
          invoices={invoicesList}
          statsData={statsQuery.data}
        />

        <SimpleContainer title="Invoices Directory">
          <ContainerRow searchProps={searchProps} showSearch={true} />
          <CustomTable
            data={filteredInvoices}
            columns={columns}
            actions={actions}
          />
        </SimpleContainer>
      </PageLoader>

      {/* View Details Modal */}
      <Modal ref={detailsModalRef} title="Invoice Summary & Breakdown">
        {selectedInvoice && (
          <div className="space-y-5">
            <div className="flex items-center justify-between p-4 bg-base-200/50 rounded-xl">
              <div>
                <span className="text-xs text-base-content/60 font-semibold uppercase">
                  Invoice Number
                </span>
                <h3 className="text-xl font-bold text-base-content">
                  {selectedInvoice.invoiceNumber ||
                    `INV-${selectedInvoice.id.slice(0, 8).toUpperCase()}`}
                </h3>
              </div>
              <span className="badge badge-lg capitalize font-semibold">
                {selectedInvoice.status || "Draft"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-base-200/30 rounded-lg">
                <span className="text-base-content/60 block">Billed To:</span>
                <span className="font-semibold text-base-content text-sm block mt-0.5">
                  {selectedInvoice.contact
                    ? `${selectedInvoice.contact.firstName} ${selectedInvoice.contact.lastName}`
                    : "Direct Client"}
                </span>
                <span className="text-base-content/50">
                  {selectedInvoice.contact?.email || selectedInvoice.billingAddress || "—"}
                </span>
              </div>
              <div className="p-3 bg-base-200/30 rounded-lg">
                <span className="text-base-content/60 block">Payment Dates:</span>
                <span className="text-base-content block mt-0.5">
                  Issued:{" "}
                  {selectedInvoice.issuedDate
                    ? new Date(selectedInvoice.issuedDate).toLocaleDateString()
                    : "—"}
                </span>
                <span className="text-base-content block">
                  Due:{" "}
                  {selectedInvoice.dueDate
                    ? new Date(selectedInvoice.dueDate).toLocaleDateString()
                    : "—"}
                </span>
              </div>
            </div>

            {/* Line Items */}
            <div>
              <span className="text-xs font-semibold text-base-content/70 block mb-2">
                Line Items
              </span>
              <div className="border border-base-200 rounded-lg overflow-hidden">
                <table className="table table-xs w-full">
                  <thead className="bg-base-200/50">
                    <tr>
                      <th>Description</th>
                      <th className="text-center">Qty</th>
                      <th className="text-right">Rate</th>
                      <th className="text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.items?.map((it, idx) => (
                      <tr key={idx}>
                        <td className="font-medium">{it.description}</td>
                        <td className="text-center">{it.qty}</td>
                        <td className="text-right">
                          ₦{Number(it.unitPrice).toLocaleString()}
                        </td>
                        <td className="text-right font-semibold">
                          ₦{(it.qty * it.unitPrice).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <div className="text-right space-y-1 text-sm">
                <div className="text-base-content/70">
                  Tax: ₦{Number(selectedInvoice.tax || 0).toLocaleString()}
                </div>
                {selectedInvoice.discount ? (
                  <div className="text-base-content/70">
                    Discount: -₦{Number(selectedInvoice.discount).toLocaleString()}
                  </div>
                ) : null}
                <div className="text-lg font-bold text-primary">
                  Total: ₦
                  {Number(
                    selectedInvoice.total ||
                      selectedInvoice.items?.reduce(
                        (s, it) => s + it.qty * it.unitPrice,
                        0
                      ) ||
                      0
                  ).toLocaleString()}
                </div>
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

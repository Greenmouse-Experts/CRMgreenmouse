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
  useOrders,
  useOrderStats,
  useCreateOrder,
  useDeleteOrder,
  useUpdateOrderStatus,
  type Order,
} from "@/api/salesApi";
import { useCustomers } from "@/api/crmApi";
import { useProducts } from "@/api/catalogApi";
import {
  PlusCircleIcon,
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/orders/")({
  component: RouteComponent,
});

interface OrderItemInput {
  productId: string;
  qty: number;
  unitPrice: number;
}

function RouteComponent() {
  const query = useOrders();
  const statsQuery = useOrderStats();
  const createOrder = useCreateOrder();
  const deleteOrder = useDeleteOrder();
  const updateStatus = useUpdateOrderStatus();
  const { data: customers = [] } = useCustomers();
  const { data: products = [] } = useProducts();
  const searchProps = useSearch();

  const addModalRef = useRef<ModalHandle>(null);
  const detailsModalRef = useRef<ModalHandle>(null);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [form, setForm] = useState({
    contactId: "",
    status: "pending",
    paymentStatus: "unpaid",
    currency: "NGN",
    discount: 0,
    tax: 0,
    notes: "",
  });

  const [orderItems, setOrderItems] = useState<OrderItemInput[]>([
    { productId: "", qty: 1, unitPrice: 0 },
  ]);

  const handleOpenAdd = () => {
    setForm({
      contactId: "",
      status: "pending",
      paymentStatus: "unpaid",
      currency: "NGN",
      discount: 0,
      tax: 0,
      notes: "",
    });
    setOrderItems([{ productId: "", qty: 1, unitPrice: 0 }]);
    addModalRef.current?.open();
  };

  const handleOpenDetails = (order: Order) => {
    setSelectedOrder(order);
    detailsModalRef.current?.open();
  };

  const handleProductSelect = (idx: number, productId: string) => {
    const prod = products.find((p) => p.id === productId);
    const next = [...orderItems];
    next[idx] = {
      ...next[idx],
      productId,
      unitPrice: prod ? Number(prod.price) || 0 : 0,
    };
    setOrderItems(next);
  };

  const updateItemRow = (idx: number, field: "qty" | "unitPrice", val: number) => {
    const next = [...orderItems];
    next[idx] = {
      ...next[idx],
      [field]: Number(val) || 0,
    };
    setOrderItems(next);
  };

  const addItemRow = () => {
    setOrderItems([...orderItems, { productId: "", qty: 1, unitPrice: 0 }]);
  };

  const removeItemRow = (idx: number) => {
    if (orderItems.length <= 1) return;
    setOrderItems(orderItems.filter((_, i) => i !== idx));
  };

  const subtotal = orderItems.reduce(
    (acc, it) => acc + (it.qty || 0) * (it.unitPrice || 0),
    0
  );
  const calculatedTotal = Math.max(0, subtotal + Number(form.tax) - Number(form.discount));

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = orderItems.filter((it) => it.productId && it.qty > 0);
    if (validItems.length === 0) {
      toast.error("Please add at least one product with quantity to the order");
      return;
    }
    try {
      await createOrder.mutateAsync({
        contactId: form.contactId || undefined,
        status: form.status,
        paymentStatus: form.paymentStatus,
        currency: form.currency,
        discount: Number(form.discount),
        tax: Number(form.tax),
        notes: form.notes,
        items: validItems,
      });
      toast.success("Order created successfully");
      addModalRef.current?.close();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create order");
    }
  };

  const handleSetStatus = async (order: Order, status: string) => {
    try {
      await updateStatus.mutateAsync({ id: order.id, status });
      toast.success(`Order status updated to ${status}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update status");
    }
  };

  const handleDelete = async (order: Order) => {
    const num = order.orderNumber || order.id.slice(0, 8);
    if (!confirm(`Are you sure you want to cancel / delete order #${num}?`)) return;
    try {
      await deleteOrder.mutateAsync(order.id);
      toast.success("Order deleted successfully");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete order");
    }
  };

  const ordersList = query.data || [];
  const searchTerm = searchProps.search?.toLowerCase() || "";
  const filteredOrders = ordersList.filter((ord) => {
    if (!searchTerm) return true;
    const clientName = ord.contact
      ? `${ord.contact.firstName} ${ord.contact.lastName}`
      : "";
    return (
      ord.orderNumber?.toLowerCase().includes(searchTerm) ||
      ord.id?.toLowerCase().includes(searchTerm) ||
      clientName.toLowerCase().includes(searchTerm) ||
      ord.status?.toLowerCase().includes(searchTerm)
    );
  });

  const totalOrders = statsQuery.data?.total ?? ordersList.length;
  const pendingOrders =
    statsQuery.data?.pending ??
    ordersList.filter((o) => o.status?.toLowerCase() === "pending").length;
  const processingOrders =
    statsQuery.data?.processing ??
    ordersList.filter((o) => o.status?.toLowerCase() === "processing").length;
  const completedOrders =
    statsQuery.data?.completed ??
    ordersList.filter((o) => o.status?.toLowerCase() === "completed").length;

  const columns = [
    {
      key: "orderNumber",
      label: "Order #",
      render: (val: any, item: Order) => (
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
            <ShoppingBag className="size-4" />
          </div>
          <div>
            <span className="font-semibold text-base-content block">
              {val || `ORD-${item.id.slice(0, 8).toUpperCase()}`}
            </span>
            <span className="text-xs text-base-content/50">
              {item.items?.length || 0} line item(s)
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      label: "Customer",
      render: (val: any) => (
        <div>
          <span className="font-medium text-base-content text-xs">
            {val ? `${val.firstName} ${val.lastName}` : "Direct Customer"}
          </span>
          {val?.email && (
            <span className="text-xs text-base-content/50 block">
              {val.email}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "total",
      label: "Order Value",
      render: (val: any, item: Order) => {
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
      key: "paymentStatus",
      label: "Payment",
      render: (val: any) => {
        const isPaid = val?.toLowerCase() === "paid";
        return (
          <span
            className={`badge badge-sm font-semibold capitalize ${
              isPaid ? "badge-success text-white" : "badge-ghost"
            }`}
          >
            {val || "unpaid"}
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
        if (s === "completed") badgeClass = "badge-success text-white";
        else if (s === "processing") badgeClass = "badge-info text-white";
        else if (s === "cancelled") badgeClass = "badge-error text-white";

        return (
          <span className={`badge badge-sm font-semibold capitalize ${badgeClass}`}>
            {status || "Pending"}
          </span>
        );
      },
    },
  ];

  const actions: Actions<Order>[] = [
    {
      key: "view",
      label: "View Details",
      action: (item) => handleOpenDetails(item),
    },
    {
      key: "processing",
      label: "Mark Processing",
      action: (item) => handleSetStatus(item, "processing"),
    },
    {
      key: "complete",
      label: "Mark Completed",
      action: (item) => handleSetStatus(item, "completed"),
    },
    {
      key: "cancel",
      label: "Cancel Order",
      action: (item) => handleSetStatus(item, "cancelled"),
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
        title="Sales Orders"
        description="Fulfill client orders, track logistics, and manage fulfillment"
      >
        <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">
          <PlusCircleIcon className="size-4" /> Create Order
        </button>
      </PageHeader>

      <PageLoader
        query={query}
        showSuccessState={true}
        emptyState={{
          title: "No Orders Found",
          description: "New customer and retail orders will appear here.",
          actionText: "Create Order",
          onAction: handleOpenAdd,
        }}
      >
        {/* Quick Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="card bg-base-100/70 backdrop-blur-md border border-base-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-base-content/60 uppercase">
                  Total Orders
                </p>
                <h3 className="text-2xl font-bold text-base-content mt-1">
                  {totalOrders}
                </h3>
              </div>
              <div className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/20">
                <ShoppingBag className="size-5" />
              </div>
            </div>
          </div>
          <div className="card bg-base-100/70 backdrop-blur-md border border-base-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-base-content/60 uppercase">
                  Pending
                </p>
                <h3 className="text-2xl font-bold text-warning mt-1">
                  {pendingOrders}
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
                  Processing
                </p>
                <h3 className="text-2xl font-bold text-info mt-1">
                  {processingOrders}
                </h3>
              </div>
              <div className="p-3 rounded-xl bg-info/10 text-info border border-info/20">
                <Truck className="size-5" />
              </div>
            </div>
          </div>
          <div className="card bg-base-100/70 backdrop-blur-md border border-base-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-base-content/60 uppercase">
                  Completed
                </p>
                <h3 className="text-2xl font-bold text-success mt-1">
                  {completedOrders}
                </h3>
              </div>
              <div className="p-3 rounded-xl bg-success/10 text-success border border-success/20">
                <CheckCircle2 className="size-5" />
              </div>
            </div>
          </div>
        </div>

        <SimpleContainer title="Orders Log">
          <ContainerRow searchProps={searchProps} showSearch={true} />
          <CustomTable
            data={filteredOrders}
            columns={columns}
            actions={actions}
          />
        </SimpleContainer>
      </PageLoader>

      {/* Add Order Modal */}
      <Modal ref={addModalRef} title="Create Sales Order">
        <form onSubmit={handleSaveAdd} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-base-content/70">
                Customer / Contact
              </label>
              <select
                className="select select-bordered w-full mt-1"
                value={form.contactId}
                onChange={(e) =>
                  setForm({ ...form, contactId: e.target.value })
                }
              >
                <option value="">Select a customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.firstName} {c.lastName} ({c.email})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-base-content/70">
                Payment Status
              </label>
              <select
                className="select select-bordered w-full mt-1"
                value={form.paymentStatus}
                onChange={(e) =>
                  setForm({ ...form, paymentStatus: e.target.value })
                }
              >
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
                <option value="partial">Partial</option>
              </select>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <label className="text-xs font-semibold text-base-content/70 block mb-1">
              Order Items *
            </label>
            <div className="space-y-2 border border-base-200 p-3 rounded-lg bg-base-200/20">
              {orderItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <select
                    className="select select-bordered select-sm flex-1"
                    required
                    value={item.productId}
                    onChange={(e) => handleProductSelect(idx, e.target.value)}
                  >
                    <option value="">Select Product...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (₦{Number(p.price).toLocaleString()})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    className="input input-bordered input-sm w-20 text-center"
                    placeholder="Qty"
                    value={item.qty}
                    onChange={(e) =>
                      updateItemRow(idx, "qty", Number(e.target.value))
                    }
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="input input-bordered input-sm w-28 text-right"
                    placeholder="Price"
                    value={item.unitPrice || ""}
                    onChange={(e) =>
                      updateItemRow(idx, "unitPrice", Number(e.target.value))
                    }
                  />
                  {orderItems.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs text-error"
                      onClick={() => removeItemRow(idx)}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addItemRow}
                className="btn btn-outline btn-xs gap-1 mt-1"
              >
                <Plus className="size-3.5" /> Add Row
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-base-content/70">
                Discount (₦)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="input input-bordered w-full mt-1"
                value={form.discount || ""}
                onChange={(e) =>
                  setForm({ ...form, discount: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-base-content/70">
                Tax (₦)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="input input-bordered w-full mt-1"
                value={form.tax || ""}
                onChange={(e) =>
                  setForm({ ...form, tax: Number(e.target.value) })
                }
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-base-content/70">
              Delivery Notes / Instructions
            </label>
            <textarea
              className="textarea textarea-bordered w-full mt-1"
              rows={2}
              placeholder="e.g. Deliver before end of week..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          <div className="flex justify-between items-center p-3 bg-base-200/50 rounded-lg text-sm">
            <span className="font-semibold text-base-content/70">
              Calculated Total:
            </span>
            <span className="text-lg font-bold text-primary">
              ₦{calculatedTotal.toLocaleString()}
            </span>
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
              disabled={createOrder.isPending}
            >
              {createOrder.isPending ? "Creating..." : "Create Order"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Details Modal */}
      <Modal ref={detailsModalRef} title="Order Breakdown">
        {selectedOrder && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-base-200/50 rounded-xl">
              <div>
                <span className="text-xs text-base-content/60 font-semibold uppercase">
                  Order Number
                </span>
                <h3 className="text-xl font-bold text-base-content">
                  {selectedOrder.orderNumber ||
                    `ORD-${selectedOrder.id.slice(0, 8).toUpperCase()}`}
                </h3>
              </div>
              <span className="badge badge-lg capitalize font-semibold">
                {selectedOrder.status || "Pending"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-base-200/30 rounded-lg">
                <span className="text-base-content/60 block">Customer:</span>
                <span className="font-semibold text-base-content text-sm block mt-0.5">
                  {selectedOrder.contact
                    ? `${selectedOrder.contact.firstName} ${selectedOrder.contact.lastName}`
                    : "Direct Client"}
                </span>
                <span className="text-base-content/50">
                  {selectedOrder.contact?.email || "—"}
                </span>
              </div>
              <div className="p-3 bg-base-200/30 rounded-lg">
                <span className="text-base-content/60 block">
                  Payment Status:
                </span>
                <span className="font-semibold text-base-content text-sm block mt-0.5 capitalize">
                  {selectedOrder.paymentStatus || "Unpaid"}
                </span>
                <span className="text-base-content/50">
                  Created:{" "}
                  {selectedOrder.createdAt
                    ? new Date(selectedOrder.createdAt).toLocaleDateString()
                    : "—"}
                </span>
              </div>
            </div>

            {/* Line Items */}
            <div>
              <span className="text-xs font-semibold text-base-content/70 block mb-2">
                Order Items
              </span>
              <div className="border border-base-200 rounded-lg overflow-hidden">
                <table className="table table-xs w-full">
                  <thead className="bg-base-200/50">
                    <tr>
                      <th>Product</th>
                      <th className="text-center">Qty</th>
                      <th className="text-right">Unit Price</th>
                      <th className="text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items?.map((it, idx) => (
                      <tr key={idx}>
                        <td className="font-medium">
                          {it.product?.name || `Item ${idx + 1}`}
                        </td>
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

            {selectedOrder.notes && (
              <div>
                <span className="text-xs font-semibold text-base-content/70 block mb-1">
                  Notes
                </span>
                <p className="text-xs text-base-content/80 p-3 bg-base-200/30 rounded-lg">
                  {selectedOrder.notes}
                </p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <div className="text-right text-base font-bold text-primary">
                Total: ₦
                {Number(
                  selectedOrder.total ||
                    selectedOrder.items?.reduce(
                      (s, it) => s + it.qty * it.unitPrice,
                      0
                    ) ||
                    0
                ).toLocaleString()}
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

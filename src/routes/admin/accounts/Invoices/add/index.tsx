import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useForm, FormProvider } from "react-hook-form";
import SimpleInput from "@/components/inputs/SimpleInput";
import SimpleTitle from "@/components/SimpleTitle";
import FormWrapper from "@/components/forms/FormWrapper";
import LocalSelect from "@/components/inputs/LocalSelect";
import { useCreateInvoice } from "@/api/financeApi";
import { useCustomers } from "@/api/crmApi";
import { toast } from "sonner";
import { Plus, Trash2, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/admin/accounts/Invoices/add/")({
  component: RouteComponent,
});

interface FormValues {
  issuedDate: string;
  dueDate: string;
  contactId: string;
  billingAddress: string;
  currency: string;
}

interface ItemRow {
  description: string;
  qty: number;
  unitPrice: number;
}

function RouteComponent() {
  const navigate = useNavigate();
  const createInvoice = useCreateInvoice();
  const { data: customers = [] } = useCustomers();

  const [items, setItems] = useState<ItemRow[]>([
    { description: "", qty: 1, unitPrice: 0 },
  ]);
  const [taxPercent, setTaxPercent] = useState<number>(7.5);
  const [discount, setDiscount] = useState<number>(0);

  const methods = useForm<FormValues>({
    defaultValues: {
      issuedDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
      currency: "NGN",
      contactId: "",
      billingAddress: "",
    },
  });

  const addItem = () => {
    setItems([...items, { description: "", qty: 1, unitPrice: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof ItemRow, value: any) => {
    const next = [...items];
    next[index] = {
      ...next[index],
      [field]: field === "description" ? value : Number(value) || 0,
    };
    setItems(next);
  };

  const subtotal = items.reduce(
    (acc, it) => acc + (it.qty || 0) * (it.unitPrice || 0),
    0
  );
  const taxAmount = (subtotal * (taxPercent || 0)) / 100;
  const grandTotal = Math.max(0, subtotal + taxAmount - discount);

  const onSubmit = async (data: FormValues) => {
    const validItems = items.filter((it) => it.description.trim() && it.qty > 0);
    if (validItems.length === 0) {
      toast.error("Please add at least one line item with a description and price");
      return;
    }

    try {
      await createInvoice.mutateAsync({
        issuedDate: data.issuedDate,
        dueDate: data.dueDate,
        contactId: data.contactId || undefined,
        billingAddress: data.billingAddress,
        items: validItems,
        currency: data.currency || "NGN",
        tax: taxAmount,
        discount: Number(discount) || 0,
        status: "draft",
      });
      toast.success("Invoice created successfully");
      navigate({ to: "/admin/accounts/Invoices" });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create invoice");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Link to="/admin/accounts/Invoices" className="btn btn-ghost btn-sm btn-circle">
          <ArrowLeft className="size-5" />
        </Link>
        <SimpleTitle title={"Create New Invoice"} />
      </div>

      <section className="p-6 bg-base-100/80 backdrop-blur-md shadow-sm border border-base-200 rounded-box">
        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <div className="grid md:grid-cols-2 gap-6">
              <FormWrapper title="Invoice Timeline">
                <SimpleInput
                  label="Issued Date *"
                  type="date"
                  {...methods.register("issuedDate", {
                    required: "Issued Date is required",
                  })}
                />
                <SimpleInput
                  label="Due Date *"
                  type="date"
                  {...methods.register("dueDate", {
                    required: "Due Date is required",
                  })}
                />
              </FormWrapper>

              <FormWrapper title="Client & Billing Information">
                <LocalSelect
                  label="Customer / Client"
                  {...methods.register("contactId")}
                >
                  <option value="">Select a customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName} ({c.email})
                    </option>
                  ))}
                </LocalSelect>
                <SimpleInput
                  label="Billing Address"
                  placeholder="Enter billing address"
                  {...methods.register("billingAddress")}
                />
              </FormWrapper>
            </div>

            <FormWrapper title="Items & Breakdown" className="w-full">
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr className="bg-base-200/50">
                      <th>DESCRIPTION *</th>
                      <th className="text-center w-28">QTY</th>
                      <th className="text-right w-36">UNIT PRICE (₦)</th>
                      <th className="text-right w-36">SUBTOTAL</th>
                      <th className="w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((row, idx) => {
                      const rowTotal = (row.qty || 0) * (row.unitPrice || 0);
                      return (
                        <tr key={idx}>
                          <td>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Cloud Architecture Consulting"
                              className="input input-bordered input-sm w-full"
                              value={row.description}
                              onChange={(e) =>
                                updateItem(idx, "description", e.target.value)
                              }
                            />
                          </td>
                          <td className="text-center">
                            <input
                              type="number"
                              min="1"
                              className="input input-bordered input-sm w-20 text-center"
                              value={row.qty}
                              onChange={(e) =>
                                updateItem(idx, "qty", e.target.value)
                              }
                            />
                          </td>
                          <td className="text-right">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                              className="input input-bordered input-sm w-32 text-right"
                              value={row.unitPrice || ""}
                              onChange={(e) =>
                                updateItem(idx, "unitPrice", e.target.value)
                              }
                            />
                          </td>
                          <td className="text-right font-semibold text-base-content">
                            ₦{rowTotal.toLocaleString()}
                          </td>
                          <td className="text-center">
                            {items.length > 1 && (
                              <button
                                type="button"
                                className="btn btn-ghost btn-xs text-error"
                                onClick={() => removeItem(idx)}
                              >
                                <Trash2 className="size-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <button
                type="button"
                onClick={addItem}
                className="btn btn-outline btn-sm gap-2 mt-3"
              >
                <Plus className="size-4" /> Add Item Line
              </button>
            </FormWrapper>

            <div className="flex flex-col md:flex-row justify-end items-end gap-6 pt-4 border-t border-base-200">
              <div className="w-full md:w-80 space-y-3 bg-base-200/40 p-4 rounded-xl">
                <div className="flex justify-between text-sm">
                  <span className="text-base-content/70">Subtotal:</span>
                  <span className="font-semibold text-base-content">
                    ₦{subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-base-content/70">VAT / Tax (%):</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    className="input input-bordered input-xs w-20 text-right"
                    value={taxPercent}
                    onChange={(e) => setTaxPercent(Number(e.target.value))}
                  />
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-base-content/70">Discount (₦):</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="input input-bordered input-xs w-28 text-right"
                    value={discount || ""}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                  />
                </div>
                <div className="divider my-1"></div>
                <div className="flex justify-between text-base font-bold text-base-content">
                  <span>Grand Total:</span>
                  <span className="text-primary text-lg">
                    ₦{grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={createInvoice.isPending}
              >
                {createInvoice.isPending ? "Generating..." : "Generate Invoice"}
              </button>
              <Link to="/admin/accounts/Invoices" className="btn btn-ghost">
                Cancel
              </Link>
            </div>
          </form>
        </FormProvider>
      </section>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useForm, FormProvider } from "react-hook-form";
import SimpleInput from "@/components/inputs/SimpleInput";
import ActionButton from "@/components/buttons/ActionButton";
import SimpleTitle from "@/components/SimpleTitle";
import FormWrapper from "@/components/forms/FormWrapper";
import LocalSelect from "@/components/inputs/LocalSelect";

export const Route = createFileRoute("/admin/accounts/Invoices/add/")({
  component: RouteComponent,
});
interface FormValues {
  invoiceNumber: string;
  issuedDate: string;
  dueDate: string;
  customerId: string;
  status: string;
  billingAddress: string;
}

function RouteComponent() {
  const methods = useForm<FormValues>({
    defaultValues: {
      issuedDate: new Date().toISOString().split("T")[0],
    },
  });
  const onSubmit = (data: FormValues) => console.log(data);

  return (
    <div className="">
      <SimpleTitle title={"Create New Invoice"} backBtn></SimpleTitle>
      <section className="p-4 bg-base-100 shadow rounded-box py-8 space-y-4">
        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(onSubmit)}
            className="space-y-4 grid md:grid-cols-2 gap-4"
          >
            <FormWrapper title="Invoice Details">
              <SimpleInput
                label="Invoice Number"
                placeholder="e.g. MAG 2541420"
                {...methods.register("invoiceNumber", {
                  required: "Invoice Number is required",
                })}
              />
              <SimpleInput
                label="Issued Date"
                type="date"
                {...methods.register("issuedDate", {
                  required: "Issued Date is required",
                })}
              />
              <SimpleInput
                label="Due Date"
                type="date"
                {...methods.register("dueDate", {
                  required: "Due Date is required",
                })}
              />
            </FormWrapper>

            <FormWrapper title="Billing Information">
              <LocalSelect
                label="Select Customer"
                {...methods.register("customerId")}
              >
                <option value="">Select a customer</option>
                <option value="1">Sajib Rahman</option>
                <option value="2">John Doe</option>
              </LocalSelect>
              <SimpleInput
                label="Billing Address"
                placeholder="Enter billing address"
                {...methods.register("billingAddress")}
              />
            </FormWrapper>

            <FormWrapper title="Items & Totals" className="md:col-span-2">
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>ITEM</th>
                      <th className="text-center">QTY</th>
                      <th className="text-right">RATE</th>
                      <th className="text-right">AMOUNT</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <input
                          type="text"
                          placeholder="Item name"
                          className="input input-bordered input-sm w-full"
                        />
                      </td>
                      <td className="text-center">
                        <input
                          type="number"
                          defaultValue="1"
                          className="input input-bordered input-sm w-20 text-center"
                        />
                      </td>
                      <td className="text-right">
                        <input
                          type="number"
                          placeholder="0.00"
                          className="input input-bordered input-sm w-24 text-right"
                        />
                      </td>
                      <td className="text-right font-bold">$0.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <button
                type="button"
                className="btn btn-link text-success p-0 h-auto min-h-0"
              >
                + Add Item
              </button>
            </FormWrapper>

            <div className="md:col-span-2 flex justify-end">
              <div className="w-full md:w-1/3 space-y-2">
                <div className="flex justify-between">
                  <span className="font-bold">Subtotal</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold">Tax (%)</span>
                  <input
                    type="number"
                    className="input input-bordered input-sm w-20 text-right"
                    defaultValue="0"
                  />
                </div>
                <div className="divider my-1"></div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>$0.00</span>
                </div>
              </div>
            </div>

            <ActionButton
              type="submit"
              title="Create Invoice"
              className="btn btn-primary md:col-span-2"
            />
          </form>
        </FormProvider>
      </section>
    </div>
  );
}

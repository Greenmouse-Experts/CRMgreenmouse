import { createFileRoute } from "@tanstack/react-router";
import CustomTable, {
  type columnType,
} from "../../../components/tables/CustomTable";
import SimpleContainer from "../../../components/SimpleContainer";
import { faker } from "@faker-js/faker";
import PageHeader from "@/components/Headers/PageHeader";
import ContainerRow from "@/components/ContainerRow";
import { useSearch } from "@/stores/data";
import ActionButton from "@/components/buttons/ActionButton";
import { useModal } from "@/store/modals";
import Modal from "@/components/modals/DialogModal";
import SimpleInput from "@/components/inputs/SimpleInput";
import { FormProvider, useForm } from "react-hook-form";
import LocalSelect from "@/components/inputs/LocalSelect";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/orders/")({
  component: RouteComponent,
});

const render_status = (
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled",
) => {
  switch (status) {
    case "Pending":
      return <span className="badge-info badge ring badge-soft">Pending</span>;
    case "Processing":
      return (
        <span className="badge-warning badge ring badge-soft">Processing</span>
      );
    case "Shipped":
      return (
        <span className="badge-primary badge ring badge-soft">Shipped</span>
      );
    case "Delivered":
      return (
        <span className="badge-success badge ring badge-soft">Delivered</span>
      );
    case "Cancelled":
      return (
        <span className="badge-error badge ring badge-soft">Cancelled</span>
      );
  }
};

function RouteComponent() {
  const generateOrders = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      id: faker.string.alphanumeric(8).toUpperCase(),
      customer: faker.person.fullName(),
      date: faker.date.recent().toLocaleDateString(),
      total: faker.commerce.price({ min: 20, max: 2000, dec: 2 }),
      items: faker.number.int({ min: 1, max: 10 }),
      status: faker.helpers.arrayElement([
        "Pending",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
      ]),
    }));
  };

  const orders = generateOrders(20);

  const columns = [
    { key: "id", label: "Order ID" },
    { key: "customer", label: "Customer" },
    { key: "date", label: "Date" },
    { key: "items", label: "Items" },
    { key: "total", label: "Total Amount" },
    {
      key: "status",
      label: "Status",
      render: (value) => render_status(value),
    },
  ] satisfies columnType[];

  const searchProps = useSearch();
  const modal = useModal();

  const methods = useForm();
  const onSubmit = (data: any) => {
    console.log(data);
    modal.closeModal();
    toast.success("Order created successfully");
  };

  return (
    <>
      <Modal ref={modal.ref} title="Create New Order">
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
            <SimpleInput
              label="Customer Name"
              {...methods.register("customer", {
                required: "Customer is required",
              })}
            />
            <SimpleInput
              label="Order Date"
              type="date"
              {...methods.register("date", { required: "Date is required" })}
            />
            <SimpleInput
              label="Total Amount"
              type="number"
              step="0.01"
              {...methods.register("total", {
                required: "Total is required",
                min: { value: 0.01, message: "Amount must be positive" },
              })}
            />
            <LocalSelect
              label="Status"
              {...methods.register("status", {
                required: "Status is required",
              })}
            >
              <option value="">Select Status</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </LocalSelect>
            <div className="modal-action">
              <button
                type="button"
                className="btn"
                onClick={() => modal.closeModal()}
              >
                Close
              </button>
              <button type="submit" className="btn btn-primary">
                Create Order
              </button>
            </div>
          </form>
        </FormProvider>
      </Modal>
      <PageHeader title="Orders">
        <ActionButton onClick={() => modal.showModal()}>
          Create Order
        </ActionButton>
      </PageHeader>
      <SimpleContainer title="Order Management">
        <ContainerRow searchProps={searchProps} showSearch />
        <CustomTable data={orders} columns={columns} />
      </SimpleContainer>
    </>
  );
}

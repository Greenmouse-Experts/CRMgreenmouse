import { createFileRoute } from "@tanstack/react-router";
import CustomTable, {
  type columnType,
} from "../../../../components/tables/CustomTable";
import SimpleContainer from "../../../../components/SimpleContainer";
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

export const Route = createFileRoute("/admin/accounts/transactions/")({
  component: RouteComponent,
});

const render_status = (status: "Pending" | "Failed" | "Completed") => {
  switch (status) {
    case "Pending":
      return <span className="badge-info badge ring badge-soft">Pending</span>;
    case "Failed":
      return <span className="badge-error badge ring badge-soft ">Failed</span>;
    case "Completed":
      return (
        <span className="badge-success badge ring badge-soft">Completed</span>
      );
  }
};
function RouteComponent() {
  const generateTransactions = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      id: faker.string.uuid(),
      date: faker.date.past().toLocaleDateString(),
      type: faker.helpers.arrayElement([
        "Deposit",
        "Withdrawal",
        "Transfer",
        "Payment",
      ]),
      amount: faker.finance.amount({ min: 10, max: 1000, dec: 2 }),
      description: faker.finance.transactionDescription(),
      status: faker.helpers.arrayElement(["Completed", "Pending", "Failed"]),
    }));
  };

  const transactions = generateTransactions(20);

  const columns = [
    { key: "date", label: "Date" },
    { key: "type", label: "Type" },
    { key: "amount", label: "Amount" },
    { key: "description", label: "Description" },
    {
      key: "status",
      label: "Status",
      render: (value, item) => {
        return render_status(value);
      },
    },
  ] satisfies columnType[];
  const searchProps = useSearch();
  const modal = useModal();

  const methods = useForm();
  const onSubmit = (data: any) => {
    console.log(data);
    // Here you would typically handle the form submission, e.g., send data to an API
    modal.closeModal();
    toast.success("Transaction added successfully");
  };

  return (
    <>
      <Modal ref={modal.ref} title="Add Transaction">
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
            <SimpleInput
              label="Date"
              type="date"
              {...methods.register("date", { required: "Date is required" })}
            />
            <LocalSelect
              label="Type"
              {...methods.register("type", { required: "Type is required" })}
            >
              <option value="">Select Type</option>
              <option value="Deposit">Deposit</option>
              <option value="Withdrawal">Withdrawal</option>
              <option value="Transfer">Transfer</option>
              <option value="Payment">Payment</option>
            </LocalSelect>
            <SimpleInput
              label="Amount"
              type="number"
              step="0.01"
              {...methods.register("amount", {
                required: "Amount is required",
                min: { value: 0.01, message: "Amount must be positive" },
              })}
            />
            <SimpleInput
              label="Description"
              {...methods.register("description", {
                required: "Description is required",
              })}
            />
            <LocalSelect
              label="Status"
              {...methods.register("status", {
                required: "Status is required",
              })}
            >
              <option value="">Select Status</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </LocalSelect>
            <div className="modal-action">
              <button
                type="button"
                className="btn"
                onClick={() => modal.hideModal()}
              >
                Close
              </button>
              <button type="submit" className="btn btn-primary">
                Add Transaction
              </button>
            </div>
          </form>
        </FormProvider>
      </Modal>
      <PageHeader title="Transactions">
        <ActionButton onClick={() => modal.showModal()}>
          Add Transaction
        </ActionButton>
      </PageHeader>
      <SimpleContainer title="Transactions">
        <ContainerRow searchProps={searchProps} showSearch />
        <CustomTable data={transactions} columns={columns} />
      </SimpleContainer>
    </>
  );
}

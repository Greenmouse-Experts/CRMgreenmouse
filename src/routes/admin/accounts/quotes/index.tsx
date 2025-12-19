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

export const Route = createFileRoute("/admin/accounts/quotes/")({
  component: RouteComponent,
});

const render_status = (status: "Pending" | "Accepted" | "Rejected") => {
  switch (status) {
    case "Pending":
      return <span className="badge-info badge ring badge-soft">Pending</span>;
    case "Rejected":
      return (
        <span className="badge-error badge ring badge-soft ">Rejected</span>
      );
    case "Accepted":
      return (
        <span className="badge-success badge ring badge-soft">Accepted</span>
      );
  }
};
function RouteComponent() {
  const generateQuotes = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      id: faker.string.uuid(),
      date: faker.date.past().toLocaleDateString(),
      client: faker.person.fullName(),
      amount: faker.finance.amount({ min: 100, max: 5000, dec: 2 }),
      description: faker.lorem.sentence(),
      status: faker.helpers.arrayElement(["Accepted", "Pending", "Rejected"]),
    }));
  };

  const quotes = generateQuotes(20);

  const columns = [
    { key: "date", label: "Date" },
    { key: "client", label: "Client" },
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
    modal.closeModal();
    toast.success("Quote added successfully");
  };

  return (
    <>
      <Modal ref={modal.ref} title="Add Quote">
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
            <SimpleInput
              label="Date"
              type="date"
              {...methods.register("date", { required: "Date is required" })}
            />
            <SimpleInput
              label="Client Name"
              {...methods.register("client", {
                required: "Client name is required",
              })}
            />
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
              <option value="Accepted">Accepted</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
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
                Add Quote
              </button>
            </div>
          </form>
        </FormProvider>
      </Modal>
      <PageHeader title="Quotes">
        <ActionButton onClick={() => modal.showModal()}>Add Quote</ActionButton>
      </PageHeader>
      <SimpleContainer title="Quotes">
        <ContainerRow searchProps={searchProps} showSearch />
        <CustomTable data={quotes} columns={columns} />
      </SimpleContainer>
    </>
  );
}

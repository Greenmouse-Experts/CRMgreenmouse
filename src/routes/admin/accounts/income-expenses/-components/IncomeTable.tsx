import CustomTable from "@/components/tables/CustomTable";
import { faker } from "@faker-js/faker";
import { type Actions } from "@/components/tables/pop-up";
import { useModal } from "@/helpers/modals";
import Modal from "@/components/modals/DialogModal";
import SimpleInput from "@/components/inputs/SimpleInput";
import SimpleTextArea from "@/components/inputs/SimpleTextArea";
import { useState } from "react";

export default function Incometable() {
  const editModal = useModal();
  const [selectedIncome, setSelectedIncome] = useState<any>(null);

  const columns = [
    { key: "id", label: "ID" },
    {
      key: "date",
      label: "Date",
      render: (value: string) =>
        new Intl.DateTimeFormat("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }).format(new Date(value)),
    },
    {
      key: "amount",
      label: "Amount",
      render: (value: number) =>
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(value),
    },
    { key: "type", label: "Type" },
    { key: "source", label: "Source" },
    {
      key: "status",
      label: "Status",
      render: (value: string) => (
        <span
          className={` badge badge-soft ring ring-current/50 text-xs font-bold badge-sm ${
            value === "Received"
              ? "badge-success"
              : value === "Pending"
                ? "badge-warning"
                : "badge-error"
          }`}
        >
          {value}
        </span>
      ),
    },
    { key: "description", label: "Description" },
  ];

  const data = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    date: faker.date.past().toISOString(),
    amount: faker.finance.amount({ min: 500, max: 5000, dec: 2 }),
    type: faker.helpers.arrayElement([
      "Salary",
      "Freelance",
      "Investment",
      "Bonus",
      "Rental Income",
    ]),
    source: faker.company.name(),
    status: faker.helpers.arrayElement(["Pending", "Received", "Overdue"]),
    description: faker.lorem.sentence({ min: 5, max: 15 }),
  }));

  const actions: Actions[] = [
    {
      key: "view",
      label: "View Details",
      action: (item: any) =>
        alert(
          `Viewing income ${item.id}\nDescription: ${item.description}\nAmount: $${item.amount}`,
        ),
    },
    {
      key: "edit",
      label: "Edit Income",
      action: (item: any) => {
        setSelectedIncome(item);
        editModal.showModal();
      },
    },
    {
      key: "delete",
      label: "Delete Income",
      action: (item: any) =>
        confirm(`Are you sure you want to delete income ${item.id}?`) &&
        alert(`Income ${item.id} deleted!`),
    },
  ];

  return (
    <div className="">
      <CustomTable columns={columns} data={data} actions={actions} />

      <Modal ref={editModal.ref} title="Edit Income">
        <div className="space-y-4">
          <SimpleInput
            label="Amount"
            type="number"
            defaultValue={selectedIncome?.amount}
          />
          <SimpleInput
            label="Type"
            type="text"
            defaultValue={selectedIncome?.type}
          />
          <SimpleTextArea
            label="Description"
            defaultValue={selectedIncome?.description}
          />
          <div className="flex gap-2">
            <span className="font-semibold fieldset-label">Status</span>{" "}
            <input
              type="checkbox"
              className="toggle"
              defaultChecked={selectedIncome?.status === "Received"}
            />
          </div>
          <button
            className="btn btn-primary btn-block"
            onClick={() => editModal.ref.current?.close()}
          >
            Update Income
          </button>
        </div>
      </Modal>
    </div>
  );
}

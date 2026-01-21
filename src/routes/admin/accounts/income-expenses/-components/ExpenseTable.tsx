import CustomTable from "@/components/tables/CustomTable";
import { faker } from "@faker-js/faker";
import { type Actions } from "@/components/tables/pop-up";
import { useModal } from "@/helpers/modals";
import Modal from "@/components/modals/DialogModal";
import SimpleInput from "@/components/inputs/SimpleInput";
import SimpleTextArea from "@/components/inputs/SimpleTextArea";
import { useState } from "react";

export default function ExpenseTable() {
  const editModal = useModal();
  const [selectedExpense, setSelectedExpense] = useState<any>(null);

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
    { key: "category", label: "Category" },
    {
      key: "status",
      label: "Status",
      render: (value: string) => (
        <span
          className={`badge badge-soft ring ring-current/50 text-xs font-bold badge-sm ${
            value === "Approved"
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
    { key: "paidBy", label: "Paid To" },
    { key: "description", label: "Description" },
  ];

  const data = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    date: faker.date.past().toISOString(), // Store as ISO string for consistent date parsing
    amount: faker.finance.amount({ min: 100, max: 1000, dec: 2 }),
    category: faker.helpers.arrayElement([
      "Travel",
      "Office Supplies",
      "Software",
      "Meals",
      "Utilities",
      "Marketing",
    ]),
    status: faker.helpers.arrayElement(["Pending", "Approved", "Rejected"]),
    paidBy: faker.person.fullName(),
    description: faker.lorem.sentence({ min: 5, max: 15 }),
  }));

  const actions: Actions[] = [
    {
      key: "view",
      label: "View Details",
      action: (item: any) =>
        alert(
          `Viewing expense ${item.id}\nDescription: ${item.description}\nAmount: $${item.amount}`,
        ),
    },
    {
      key: "edit",
      label: "Edit Expense",
      action: (item: any) => {
        setSelectedExpense(item);
        editModal.showModal();
      },
    },
    {
      key: "delete",
      label: "Delete Expense",
      action: (item: any) =>
        confirm(`Are you sure you want to delete expense ${item.id}?`) &&
        alert(`Expense ${item.id} deleted!`),
    },
  ];

  return (
    <div className="">
      <CustomTable columns={columns} data={data} actions={actions} />

      <Modal ref={editModal.ref} title="Edit Expense">
        <div className="space-y-4">
          <SimpleInput
            label="Amount"
            type="number"
            defaultValue={selectedExpense?.amount}
          />
          <SimpleInput
            label="Category"
            type="text"
            defaultValue={selectedExpense?.category}
          />
          <SimpleTextArea
            label="Description"
            defaultValue={selectedExpense?.description}
          />
          <div className="flex gap-2">
            <span className="font-semibold fieldset-label">Status</span>{" "}
            <select
              className="select select-sm select-bordered"
              defaultValue={selectedExpense?.status}
            >
              <option>Pending</option>
              <option>Approved</option>
              <option>Rejected</option>
            </select>
          </div>
          <button
            className="btn btn-primary btn-block"
            onClick={() => editModal.ref.current?.close()}
          >
            Update Expense
          </button>
        </div>
      </Modal>
    </div>
  );
}

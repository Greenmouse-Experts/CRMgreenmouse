import CustomTable from "@/components/tables/CustomTable";
import { faker } from "@faker-js/faker";
import { type Actions } from "@/components/tables/pop-up";

export default function ExpenseTable() {
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
          className={`badge badge-soft ring ring-current/50 text-xs badge-sm ${
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
    { key: "paidBy", label: "Paid By" },
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
      action: (item: any) => alert(`Editing expense ${item.id}`),
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
    </div>
  );
}

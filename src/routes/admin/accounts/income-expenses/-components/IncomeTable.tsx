import CustomTable from "@/components/tables/CustomTable";
import { faker } from "@faker-js/faker";
import { type Actions } from "@/components/tables/pop-up";

export default function Incometable() {
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
          className={`badge ${
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
    date: faker.date.past().toISOString(), // Store as ISO string for consistent date parsing
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
      action: (item: any) => alert(`Editing income ${item.id}`),
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
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import ContainerRow from "@/components/ContainerRow";
import SimpleContainer from "@/components/SimpleContainer";
import { useSearch } from "@/stores/data";
import CustomTable from "@/components/tables/CustomTable";
import { faker } from "@faker-js/faker";
import { PlusCircleIcon } from "lucide-react";

export const Route = createFileRoute("/admin/transactions/")({
  component: RouteComponent,
});

function RouteComponent() {
  const transactions = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    customerName: faker.person.fullName(),
    amount: faker.commerce.price(),
    date: faker.date.past().toLocaleDateString(),
    status: faker.helpers.arrayElement(["Completed", "Pending", "Failed"]),
  }));

  const columns = [
    { key: "id", label: "ID" },
    { key: "customerName", label: "Customer Name" },
    { key: "amount", label: "Amount" },
    { key: "date", label: "Date" },
    { key: "status", label: "Status" },
  ];

  const actions = [
    {
      key: "view",
      label: "View",
      action: (item: any) => console.log("View", item),
    },
    {
      key: "refund",
      label: "Refund",
      action: (item: any) => console.log("Refund", item),
    },
  ];

  const props = useSearch();
  return (
    <div>
      <SimpleContainer
        title="Transactions"
        actions={
          <>
            <button className="btn btn-sm btn-primary">
              <PlusCircleIcon /> Create Transaction
            </button>
          </>
        }
      >
        {props.search}
        <ContainerRow
          searchProps={props}
          showSearch={true}
          // actions={
          //   <>
          //     <ExportOptions
          //       position="left"
          //       options={[
          //         {
          //           name: "export as pdf",
          //           action: () => console.log("yes"),
          //         },
          //       ]}
          //     />
          //   </>
          // }
        />
        <CustomTable data={transactions} columns={columns} actions={actions} />
      </SimpleContainer>
    </div>
  );
}

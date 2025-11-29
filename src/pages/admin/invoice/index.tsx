import ContainerRow from "@/components/ContainerRow";
import SimpleContainer from "@/components/SimpleContainer";
import { useSearch } from "@/stores/data";
import { PlusCircleIcon } from "lucide-react";
import CustomTable from "@/components/tables/CustomTable";
import { faker } from "@faker-js/faker";

export default function index() {
  const props = useSearch();

  const generateFakeInvoices = (count: number) => {
    const invoices = [];
    for (let i = 0; i < count; i++) {
      invoices.push({
        id: faker.string.uuid(),
        invoiceNumber: faker.finance.accountNumber(8),
        clientName: faker.company.name(),
        amount: faker.finance.amount({ min: 100, max: 5000, dec: 2 }),
        status: faker.helpers.arrayElement(["Paid", "Pending", "Overdue"]),
        issueDate: faker.date.past().toLocaleDateString(),
        dueDate: faker.date.future().toLocaleDateString(),
      });
    }
    return invoices;
  };

  const invoiceData = generateFakeInvoices(10);

  const invoiceColumns = [
    { key: "invoiceNumber", label: "Invoice Number" },
    { key: "clientName", label: "Client Name" },
    { key: "amount", label: "Amount" },
    { key: "status", label: "Status" },
    { key: "issueDate", label: "Issue Date" },
    { key: "dueDate", label: "Due Date" },
  ];

  const invoiceActions = [
    {
      key: "view",
      label: "View",
      action: (item: any) => console.log("View invoice:", item),
    },
    {
      key: "edit",
      label: "Edit",
      action: (item: any) => console.log("Edit invoice:", item),
    },
    {
      key: "delete",
      label: "Delete",
      action: (item: any) => console.log("Delete invoice:", item),
    },
  ];

  return (
    <div>
      <SimpleContainer
        title="Invoice"
        actions={
          <>
            <button className="btn btn-primary">
              <PlusCircleIcon /> Create Invoice
            </button>
          </>
        }
      >
        {props.search}
        <ContainerRow searchProps={props} />
        <CustomTable
          data={invoiceData}
          columns={invoiceColumns}
          actions={invoiceActions}
        />
      </SimpleContainer>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import InvoicesStat from "./-components/InvocesStat";
import SimpleContainer from "@/components/SimpleContainer";
import CustomTable from "@/components/tables/CustomTable";
import { faker } from "@faker-js/faker";
import ActionButton from "@/components/buttons/ActionButton";
import PopUp, { type Actions } from "@/components/tables/pop-up"; // Import PopUp and its Actions type
import { Star } from "lucide-react"; // Import Star icon for the 'Number' column

// Define the type for an invoice, inspired by the image
interface Invoice {
  number: string; // e.g., INV842002
  isStarred: boolean; // For the star icon next to the number
  status: "Draft" | "Paid" | "Overdue" | "Pending"; // Status values from image
  date: Date; // Date object for easier formatting
  customer: {
    name: string;
    avatar: string; // URL for customer avatar
  };
  total: number; // Total amount, e.g., 152.00
  amountDue: number; // Amount due, e.g., 0.00
}

// Function to generate a single fake invoice
const generateFakeInvoice = (): Invoice => {
  const total = parseFloat(faker.finance.amount({ min: 45, max: 840, dec: 2 }));
  const status = faker.helpers.arrayElement([
    "Paid",
    "Pending",
    "Overdue",
    "Draft",
  ]);
  let amountDue = 0;

  if (status === "Paid" || status === "Draft") {
    amountDue = 0;
  } else if (status === "Pending" || status === "Overdue") {
    // Generate amountDue that could be 0, full total, or a partial amount
    const dueOptions = [
      0,
      total,
      parseFloat(faker.finance.amount({ min: 1, max: total, dec: 2 })),
    ];
    amountDue = faker.helpers.arrayElement(dueOptions);
  }

  // Ensure amountDue does not exceed total
  amountDue = Math.min(amountDue, total);

  return {
    number: `INV84${faker.string.numeric({ length: 4, exclude: ["0000"] })}`, // Unique-ish invoice number
    isStarred: faker.datatype.boolean(0.15), // 15% chance to be starred
    status: status,
    date: faker.date.recent({ days: 30 }), // Dates within the last 30 days
    customer: {
      name: faker.person.fullName(),
      avatar: faker.image.avatar(),
    },
    total: total,
    amountDue: parseFloat(amountDue.toFixed(2)),
  };
};

// Generate an array of fake invoices
const fakeInvoices: Invoice[] = faker.helpers.multiple(generateFakeInvoice, {
  count: 15, // Increased count to match the visual density of the image
});

export const Route = createFileRoute("/admin/accounts/Invoices/")({
  component: RouteComponent,
});

function RouteComponent() {
  // Define columns for the CustomTable, matching the image
  const invoiceColumns = [
    {
      key: "number",
      label: "Number",
      render: (value: string, item: Invoice) => (
        <div className="flex items-center gap-2">
          {item.isStarred && (
            <Star className="h-4 w-4 fill-current text-warning" />
          )}
          <span>{value}</span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value: "Draft" | "Paid" | "Overdue" | "Pending") => {
        let badgeClass = "";
        switch (value) {
          case "Paid":
            badgeClass = "badge-success text-success-content";
            break;
          case "Overdue":
            badgeClass = "badge-error text-error-content";
            break;
          case "Draft":
            badgeClass = "badge-info "; // Softer look for draft
            break;
          case "Pending":
          default:
            badgeClass = "badge-warning ";
            break;
        }
        return (
          <span
            className={`${badgeClass} badge badge-soft ring ring-current/50 text-xs badge-sm font-bold `}
          >
            {value}
          </span>
        );
      },
    },
    {
      key: "date",
      label: "Date",
      render: (value: Date) => {
        const day = value.getDate();
        const month = value.toLocaleString("en-US", { month: "short" });
        const year = value.getFullYear();

        // Function to get day suffix (st, nd, rd, th)
        const getDaySuffix = (d: number) => {
          if (d > 3 && d < 21) return "th";
          switch (d % 10) {
            case 1:
              return "st";
            case 2:
              return "nd";
            case 3:
              return "rd";
            default:
              return "th";
          }
        };
        return `${day}${getDaySuffix(day)} ${month} ${year}`;
      },
    },
    {
      key: "customer",
      label: "Customer",
      render: (value: { name: string; avatar: string }) => (
        <div className="flex items-center gap-2">
          <div className="avatar">
            <div className="mask mask-squircle w-8 h-8">
              {" "}
              {/* mask-squircle for circular avatars */}
              <img
                src={value.avatar}
                alt={value.name}
                className="object-cover"
              />
            </div>
          </div>
          <span>{value.name}</span>
        </div>
      ),
    },
    {
      key: "total",
      label: "Total",
      render: (value: number) => `${value.toFixed(2)} US$`, // Format as currency
    },
    {
      key: "amountDue",
      label: "Amount Due",
      render: (value: number) => `${value.toFixed(2)} US$`, // Format as currency
    },
  ];

  // Define actions for the PopUp component, matching the three dots in the image
  const invoiceActions: Actions[] = [
    {
      key: "view",
      label: "View Details",
      action: (item: any) => console.log("View invoice:", item.number),
    },
    {
      key: "edit",
      label: "Edit Invoice",
      action: (item: any) => console.log("Edit invoice:", item.number),
    },
    {
      key: "download",
      label: "Download PDF",
      action: (item: any) => console.log("Download invoice:", item.number),
    },
    {
      key: "delete",
      label: "Delete",
      action: (item: any) => console.log("Delete invoice:", item.number),
    },
  ];

  return (
    <div className="space-y-4">
      <InvoicesStat />
      <SimpleContainer
        title="Invoices"
        actions={
          <>
            <ActionButton className="btn btn-sm btn-primary">
              Add Invoice
            </ActionButton>
          </>
        }
      >
        <CustomTable
          ring={false} // Match the subtle border in the image
          data={fakeInvoices}
          columns={invoiceColumns}
          actions={invoiceActions} // Pass actions to enable the three-dot menu
        />
      </SimpleContainer>
    </div>
  );
}

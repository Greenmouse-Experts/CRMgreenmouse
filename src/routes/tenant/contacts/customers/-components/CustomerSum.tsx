import SummaryCard from "@/components/SummaryCard";
import SummaryGrid from "@/components/SummaryGrid";

const customers = [
  {
    title: "Total Customers",
    value: 100,
  },
  {
    title: "Active Customers",
    value: 80,
  },
  {
    title: "Inactive Customers",
    value: 20,
  },
];

export default function CustomerSummary() {
  return (
    <div className="">
      <SummaryGrid>
        {customers.map((customer) => (
          <SummaryCard item={customer} />
        ))}
      </SummaryGrid>
    </div>
  );
}

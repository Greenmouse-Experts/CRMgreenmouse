import SummaryCard from "@/components/SummaryCard";
import SummaryGrid from "@/components/SummaryGrid";

const customers = [
  {
    title: "Total Users",
    value: 100,
  },
  {
    title: "Active Users",
    value: 80,
  },
  {
    title: "Inactive Users",
    value: 20,
  },
];

export default function UserSummary() {
  return (
    <div>
      <SummaryGrid>
        {customers.map((customer) => (
          <SummaryCard item={customer} />
        ))}
      </SummaryGrid>
    </div>
  );
}

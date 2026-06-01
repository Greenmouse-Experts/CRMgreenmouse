import SummaryCard from "@/components/SummaryCard";
import SummaryGrid from "@/components/SummaryGrid";

const customers = [
  {
    title: "Total Staffs",
    value: 100,
  },
  {
    title: "Active Staffs",
    value: 80,
  },
  {
    title: "Inactive Staffs",
    value: 20,
  },
];

export default function UserSummary() {
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

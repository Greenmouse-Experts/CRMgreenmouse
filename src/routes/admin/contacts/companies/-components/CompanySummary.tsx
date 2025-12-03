import SummaryCard from "@/components/SummaryCard";
import SummaryGrid from "@/components/SummaryGrid";

const companies = [
  {
    title: "Total Companies",
    value: 100,
  },
  {
    title: "Active Companies",
    value: 80,
  },
  {
    title: "Inactive Companies",
    value: 20,
  },
];
export default function CompanySummary() {
  return (
    <div>
      <SummaryGrid>
        {companies.map((item) => (
          <SummaryCard item={item} />
        ))}
      </SummaryGrid>
    </div>
  );
}

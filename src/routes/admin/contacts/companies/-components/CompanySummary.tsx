import SummaryCard from "@/components/SummaryCard";
import SummaryGrid from "@/components/SummaryGrid";
import { useCompanies } from "@/api/crmApi";

export default function CompanySummary() {
  const { data: companies = [] } = useCompanies();

  const total = companies.length;

  const summary = [
    {
      title: "Total Companies",
      value: total,
    },
    {
      title: "With Website",
      value: companies.filter((c) => !!c.website).length,
    },
    {
      title: "With Phone",
      value: companies.filter((c) => !!c.workPhone).length,
    },
  ];

  return (
    <div>
      <SummaryGrid>
        {summary.map((item, index) => (
          <SummaryCard key={index} item={item} />
        ))}
      </SummaryGrid>
    </div>
  );
}

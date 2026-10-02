import SummaryCard from "@/components/SummaryCard";
import SummaryGrid from "@/components/SummaryGrid";
import { useAdminCrossContacts } from "@/api/adminApi";

export default function CustomerSummary() {
  const { data: customers = [] } = useAdminCrossContacts();

  const total = customers.length;

  const summary = [
    {
      title: "Total Customers",
      value: total,
    },
    {
      title: "New This Month",
      value: customers.filter((c: any) => {
        if (!c.createdAt) return false;
        const d = new Date(c.createdAt);
        const now = new Date();
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      }).length,
    },
    {
      title: "With Phone Numbers",
      value: customers.filter((c: any) => !!c.workPhone || !!c.cellPhone)
        .length,
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

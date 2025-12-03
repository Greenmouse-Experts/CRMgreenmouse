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
          <div key={customer.title} className="bg-base-100">
            <div className="stat">
              <div className="stat-title">{customer.title}</div>
              <div className="stat-value">{customer.value}</div>
            </div>
          </div>
        ))}
      </SummaryGrid>
    </div>
  );
}

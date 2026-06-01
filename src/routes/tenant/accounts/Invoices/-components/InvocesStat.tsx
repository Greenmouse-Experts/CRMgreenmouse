export default function InvoicesStat() {
  const totalInvoices = Math.floor(Math.random() * 500) + 100;
  const paidInvoices = Math.floor(Math.random() * totalInvoices);
  const pendingInvoices = totalInvoices - paidInvoices;
  const totalAmount = Math.random() * 100000 + 5000;
  const paidAmount = Math.random() * totalAmount;
  const pendingAmount = totalAmount - paidAmount;

  const stats = [
    {
      title: "Total Invoices",
      value: totalInvoices,
      desc: "All time",
      figureClass: "text-primary",
      svgPath: "M13 16h-1v-4h-1m1-4h.01M12 21a9 9 0 110-18 9 9 0 010 18z",
    },
    {
      title: "Paid Invoices",
      value: paidInvoices,
      desc: `Total amount: $${paidAmount.toFixed(2)}`,
      figureClass: "text-secondary",
      svgPath: "M13 10V3L4 14h7v7l9-11h-7z",
    },
    {
      title: "Pending Invoices",
      value: pendingInvoices,
      desc: `Total amount: $${pendingAmount.toFixed(2)}`,
      figureClass: "text-accent",
      svgPath:
        "M12 6V4m0 2a2 0 100 4m0-4a2 0 110 4m-6 8a2 0 100-4m0 4a2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 0 100-4m0 4a2 0 110-4m0 4v2m0-6V4",
    },
  ];

  return (
    <div className="stats *:bg-base-100 stats-vertical lg:stats-horizontal shadow-sm w-full">
      {stats.map((stat, index) => (
        <div className="stat" key={index}>
          <div className={`stat-figure ${stat.figureClass} bg-base-100`}></div>
          <div className="stat-title">{stat.title}</div>
          <div className="stat-value ">{stat.value}</div>
          <div className="stat-desc">{stat.desc}</div>
        </div>
      ))}
    </div>
  );
}

export default function InvoicesStat() {
  const totalInvoices = Math.floor(Math.random() * 500) + 100;
  const paidInvoices = Math.floor(Math.random() * totalInvoices);
  const pendingInvoices = totalInvoices - paidInvoices;
  const totalAmount = (Math.random() * 100000 + 5000).toFixed(2);
  const paidAmount = (Math.random() * parseFloat(totalAmount)).toFixed(2);
  const pendingAmount = (
    parseFloat(totalAmount) - parseFloat(paidAmount)
  ).toFixed(2);

  return (
    <div className="stats *:bg-base-100 stats-vertical lg:stats-horizontal shadow-sm w-full">
      <div className="stat">
        <div className="stat-figure text-primary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="inline-block w-8 h-8 stroke-current"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M12 21a9 9 0 110-18 9 9 0 010 18z"
            ></path>
          </svg>
        </div>
        <div className="stat-title">Total Invoices</div>
        <div className="stat-value text-primary">{totalInvoices}</div>
        <div className="stat-desc">All time</div>
      </div>

      <div className="stat">
        <div className="stat-figure text-secondary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="inline-block w-8 h-8 stroke-current"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            ></path>
          </svg>
        </div>
        <div className="stat-title">Paid Invoices</div>
        <div className="stat-value text-secondary">{paidInvoices}</div>
        <div className="stat-desc">Total amount: ${paidAmount}</div>
      </div>

      <div className="stat">
        <div className="stat-figure text-accent">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="inline-block w-8 h-8 stroke-current"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
            ></path>
          </svg>
        </div>
        <div className="stat-title">Pending Invoices</div>
        <div className="stat-value text-accent">{pendingInvoices}</div>
        <div className="stat-desc">Total amount: ${pendingAmount}</div>
      </div>
    </div>
  );
}

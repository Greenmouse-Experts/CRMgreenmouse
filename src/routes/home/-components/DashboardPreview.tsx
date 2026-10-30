import { Bell, Boxes, ChartNoAxesCombined, ChevronDown, CircleHelp, CreditCard, FileText, LayoutDashboard, Package, Settings, ShoppingBag, Users } from "lucide-react";

const navigation = [
  [LayoutDashboard, "Dashboard"], [ShoppingBag, "Orders"], [Users, "Users"],
  [Users, "Contacts"], [Package, "Products"], [CreditCard, "Accounts"],
  [Boxes, "Subscription"], [CircleHelp, "Support"], [Bell, "Notifications"], [Settings, "Settings"],
] as const;

const metrics = [
  { label: "Total Income", value: "₦10,496,730", change: "+19,673%" },
  { label: "Total Expenses", value: "₦2,374,000", change: "+2,079%" },
  { label: "Total Customers", value: "4" },
  { label: "Total Invoices", value: "10" },
];

export default function DashboardPreview() {
  return (
    <div id="dashboard-preview" className="flex min-w-0 scroll-mt-24 overflow-hidden rounded-2xl bg-base-100 shadow-2xl shadow-primary/10" aria-label="Preview of the Kinova staff dashboard">
      <aside className="hidden w-44 shrink-0 border-r border-base-300 bg-base-200/60 p-3 md:block [&_nav]:space-y-1 [&_nav_div]:flex [&_nav_div]:items-center [&_nav_div]:gap-2 [&_nav_div]:rounded-lg [&_nav_div]:px-3 [&_nav_div]:py-2 [&_nav_div]:text-xs [&_nav_div]:text-base-content/60">
        <div className="mb-5 flex items-center gap-2 px-1 text-sm"><span className="grid size-9 place-items-center rounded-xl bg-primary text-lg font-bold text-primary-content">K</span><b>Kinova</b></div>
        <nav aria-label="Dashboard preview modules">
          {navigation.map(([Icon, label], index) => <div className={index === 0 ? "bg-primary/10! text-primary! font-semibold" : ""} key={label}><Icon size={15} /><span>{label}</span></div>)}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">
        <div className="flex h-11 items-center justify-between border-b border-base-300 px-5 text-xs font-semibold"><span>Staff Dashboard</span><span className="flex items-center gap-3 text-base-content/50"><Bell size={15} /><span className="grid size-6 place-items-center rounded-full bg-primary/10 text-[9px] font-bold text-primary">JD</span></span></div>
        <div className="bg-base-200/30 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3 [&_div]:flex [&_div]:flex-col [&_div_span]:text-sm [&_div_span]:font-bold [&_small]:mt-1 [&_small]:text-[10px] [&_small]:text-base-content/50"><div><span>Overview</span><small>Here is what is happening with your business.</small></div><span className="flex items-center gap-1 rounded-md border border-base-300 bg-base-100 px-2 py-1 text-[10px]">This month <ChevronDown size={12} /></span></div>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-3">
            {metrics.map((metric) => <div className="flex min-w-0 flex-col rounded-xl bg-base-100 p-3 shadow-sm [&_small]:text-[10px] [&_small]:text-base-content/50 [&_strong]:mt-2 [&_strong]:truncate [&_strong]:text-sm [&_strong]:font-bold sm:[&_strong]:text-lg [&>span]:mt-1 [&>span]:text-[10px] [&>span]:text-primary" key={metric.label}><small>{metric.label}</small><strong>{metric.value}</strong>{metric.change && <span>{metric.change}</span>}</div>)}
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-[1.4fr_1fr]">
            <div className="min-w-0 rounded-xl bg-base-100 p-3 shadow-sm [&>b]:text-xs"><div className="flex flex-wrap items-center justify-between gap-1 [&_b]:text-xs [&_span]:text-[9px] [&_span]:text-base-content/50"><b>Monthly cash flow trend</b><span>Income&nbsp; ● &nbsp;Expenses&nbsp; ●</span></div><svg className="h-auto w-full" viewBox="0 0 400 160" role="img" aria-label="Illustrative income and expense trends"><path d="M0 130H400M0 90H400M0 50H400" stroke="#e9eeeb" strokeWidth="1"/><path d="M0 120 C45 115 55 105 90 110 S150 80 190 90 S255 45 300 55 S355 40 400 20" fill="none" stroke="#047857" strokeWidth="3"/><path d="M0 145 C50 130 60 138 100 125 S165 130 200 116 S260 120 300 103 S360 108 400 86" fill="none" stroke="#e5ab4b" strokeWidth="2.5"/></svg><div className="flex justify-between text-[9px] text-base-content/40"><span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span></div></div>
            <div className="min-w-0 rounded-xl bg-base-100 p-3 shadow-sm [&>b]:text-xs"><b>Category performance</b>{[["Training", "92%"], ["Websites", "16%"], ["Mobile App", "12%"], ["Brand", "10%"], ["Support", "8%"]].map(([name, width]) => <div className="mt-3 grid grid-cols-[55px_1fr] items-center gap-2 text-[9px] text-base-content/60 [&>div]:h-1.5 [&>div]:rounded-full [&>div]:bg-base-200 [&_i]:block [&_i]:h-full [&_i]:rounded-full [&_i]:bg-primary" key={name}><span>{name}</span><div><i style={{ width }} /></div></div>)}</div>
          </div>
          <div className="mt-3 flex gap-3 [&_span]:flex [&_span]:flex-1 [&_span]:items-center [&_span]:gap-2 [&_span]:rounded-xl [&_span]:bg-base-100 [&_span]:p-3 [&_span]:text-[10px] [&_span]:font-semibold"><span><FileText size={15} /> Invoices</span><span><ChartNoAxesCombined size={15} /> Reports</span></div>
        </div>
      </div>
    </div>
  );
}

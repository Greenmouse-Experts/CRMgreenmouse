const groups = [
  { title: "Product", links: ["Dashboard", "Contacts", "Products", "Accounts", "Orders", "Subscription"] },
  { title: "Workspace", links: ["Users & Roles", "Support", "Notifications", "Settings"] },
  { title: "Finance", links: ["Income", "Expenses", "Invoices", "Quotes", "Analysis", "Transactions"] },
];

export default function LandingFooter() {
  return (
    <footer className="border-t border-base-300 bg-base-200/60 py-14">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <div className="[&>p]:mt-5 [&>p]:max-w-xs [&>p]:text-sm [&>p]:leading-relaxed [&>p]:text-base-content/70"><a className="flex items-center gap-2.5 text-xl font-bold tracking-tight [&_strong]:text-primary" href="#top"><span className="grid size-9 place-items-center rounded-xl bg-primary text-lg font-bold text-primary-content">K</span><span>Kinova <strong>CRM</strong></span></a><p>The all-in-one CRM for running sales, finance and customer relationships — together, in real time.</p></div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 [&_h4]:font-bold [&_ul]:mt-4 [&_ul]:space-y-3 [&_li]:text-sm [&_li]:text-base-content/70">{groups.map((group) => <div key={group.title}><h4>{group.title}</h4><ul>{group.links.map((link) => <li key={link}>{link}</li>)}</ul></div>)}</div>
        </div>
        <div className="mt-14 flex flex-wrap justify-between gap-2 border-t border-base-300 pt-6 text-xs text-base-content/60"><span>© 2026 Kinova CRM. All rights reserved.</span><span>Built for growing businesses.</span></div>
      </div>
    </footer>
  );
}

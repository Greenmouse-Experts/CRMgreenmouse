import { Bell, Boxes, CircleHelp, CreditCard, LayoutDashboard, Package, Settings, ShoppingBag, Users } from "lucide-react";

const features = [
  { icon: LayoutDashboard, title: "Dashboard", text: "Income, expenses, customers and invoices — the pulse of your business on one screen.", wide: true },
  { icon: ShoppingBag, title: "Orders", text: "Follow every order from placement to fulfilment without leaving your dashboard." },
  { icon: Users, title: "Users", text: "Add your team, assign roles, and control exactly what each person can see and do." },
  { icon: Users, title: "Contacts", text: "A single directory of every customer, company, and engagement history." },
  { icon: Package, title: "Products", text: "Manage everything you sell — physical products and service offerings — in one catalogue." },
  { icon: CreditCard, title: "Accounts", text: "Your complete financial control room: track every naira in and out, send invoices and quotes, and analyse performance.", wide: true },
  { icon: Boxes, title: "Subscription", text: "Recurring plans and renewals handled automatically, so revenue never slips." },
  { icon: CircleHelp, title: "Support", text: "Respond to customer requests and keep a full record of every conversation." },
  { icon: Bell, title: "Notifications", text: "Instant alerts for payments, orders, and activities that matter to you." },
  { icon: Settings, title: "Settings", text: "Tailor Kinova to the way your business actually works." },
];

export default function Features() {
  return (
    <section id="features" className="scroll-mt-20 py-20 sm:py-24 bg-base-200/60">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center [&>span]:text-sm [&>span]:font-semibold [&>span]:uppercase [&>span]:tracking-widest [&>span]:text-primary [&_h2]:mt-3 [&_h2]:text-3xl [&_h2]:font-extrabold [&_h2]:tracking-tight sm:[&_h2]:text-4xl [&_p]:mt-4 [&_p]:text-base-content/70">
          <span>Everything included</span>
          <h2>One platform. Every part of your business.</h2>
          <p>Kinova comes with all the modules you need on day one — connected, not bolted on.</p>
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, text, wide }) => (
            <article className={wide ? "group flex flex-col rounded-2xl bg-base-100 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl [&_h3]:mt-4 [&_h3]:text-lg [&_h3]:font-bold [&_p]:mt-2 [&_p]:leading-relaxed [&_p]:text-base-content/70 lg:col-span-2" : "group flex flex-col rounded-2xl bg-base-100 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl [&_h3]:mt-4 [&_h3]:text-lg [&_h3]:font-bold [&_p]:mt-2 [&_p]:leading-relaxed [&_p]:text-base-content/70"} key={title}>
              <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-content"><Icon size={22} strokeWidth={1.8} /></span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

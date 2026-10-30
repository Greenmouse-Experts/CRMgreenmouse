import { Check, CreditCard, ShieldCheck, TrendingUp } from "lucide-react";

const points = [
  "Know your income and expenses the moment they change",
  "Assign staff and roles with precise permissions",
  "Track customers, companies and engagement history",
  "Send quotes and invoices, and record payments instantly",
];

const highlights = [
  { icon: TrendingUp, label: "Real-time", title: "Finance at a glance", text: "Income, expenses, debts and cash-flow trends update the moment they happen — no spreadsheets, no guesswork." },
  { icon: ShieldCheck, label: "Roles", title: "Built for teams", text: "Give every staff member their own login with the exact permissions they need — nothing more, nothing less." },
  { icon: CreditCard, label: "End-to-end", title: "From quote to cash", text: "Send a quote, convert it to an invoice, record the payment and track the transaction — all in one flow." },
];

export default function Benefits() {
  return (
    <section id="why-kinova" className="scroll-mt-20 py-20 sm:py-24 bg-base-100">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 grid gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-center lg:gap-16">
        <div className="[&_h2]:mt-3 [&_h2]:text-3xl [&_h2]:font-extrabold [&_h2]:tracking-tight sm:[&_h2]:text-4xl [&>p]:mt-4 [&>p]:text-base-content/70 [&_ul]:mt-8 [&_ul]:space-y-3 [&_li]:flex [&_li]:items-start [&_li]:gap-3 [&_li_span]:mt-0.5 [&_li_span]:grid [&_li_span]:size-5 [&_li_span]:shrink-0 [&_li_span]:place-items-center [&_li_span]:rounded-full [&_li_span]:bg-primary/10 [&_li_span]:text-primary">
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">Why Kinova</span>
          <h2>Clarity and control, every single day</h2>
          <p>Most businesses juggle spreadsheets, notebooks and disconnected tools. Kinova replaces all of that with one system your whole team can trust.</p>
          <ul>{points.map((point) => <li key={point}><span><Check size={14} /></span>{point}</li>)}</ul>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 [&>article:last-child]:sm:col-span-2">
          {highlights.map(({ icon: Icon, label, title, text }) => <article className="rounded-2xl bg-base-200/70 p-6 [&_small]:mt-5 [&_small]:block [&_small]:text-xs [&_small]:font-semibold [&_small]:uppercase [&_small]:tracking-widest [&_small]:text-primary [&_h3]:mt-1 [&_h3]:text-lg [&_h3]:font-bold [&_p]:mt-2 [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-base-content/70" key={title}>
            <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary"><Icon size={22} /></span>
            <small>{label}</small>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>)}
        </div>
      </div>
    </section>
  );
}

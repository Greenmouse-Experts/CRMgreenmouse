import { ArrowRight, ChartNoAxesCombined, Sparkles } from "lucide-react";
import DashboardPreview from "./DashboardPreview";

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-base-100">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-2 lg:gap-16">
        <div className="[&_h1]:mt-5 [&_h1]:max-w-[12ch] [&_h1]:text-4xl [&_h1]:font-extrabold [&_h1]:leading-[1.1] [&_h1]:tracking-tight sm:[&_h1]:text-5xl lg:[&_h1]:text-6xl [&_h1_em]:not-italic [&_h1_em]:text-primary [&>p]:mt-6 [&>p]:max-w-xl [&>p]:text-lg [&>p]:leading-relaxed [&>p]:text-base-content/70">
          <span className="badge badge-outline badge-primary h-auto gap-2 rounded-full bg-primary/5 px-3 py-2 text-xs font-semibold"><Sparkles size={14} /> All-in-one business management</span>
          <h1>Run your entire business from <em>one dashboard</em></h1>
          <p>Kinova CRM brings your customers, products, invoicing, expenses, orders, subscriptions and support together — so you always know exactly how your business is performing, in real time.</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a className="btn px-8 btn-primary" href="/auth/register">Get Started Free <ArrowRight size={17} /></a>
            <a className="btn px-8 btn-outline" href="#dashboard-preview"><ChartNoAxesCombined size={17} /> See it in action</a>
          </div>
          <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4 [&_dt]:text-2xl [&_dt]:font-bold [&_dt]:text-primary [&_dd]:text-sm [&_dd]:text-base-content/65">
            <div><dt>10+</dt><dd>Business modules</dd></div>
            <div><dt>Live</dt><dd>Real-time reports</dd></div>
            <div><dt>Ready</dt><dd>Multi-currency</dd></div>
          </dl>
        </div>
        <DashboardPreview />
      </div>
    </section>
  );
}

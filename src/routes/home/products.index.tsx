import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, House, Truck } from "lucide-react";
import HomeNav from "./-components/HomeNav";
import LandingFooter from "./-components/LandingFooter";
import SupportTicketSection from "./-components/SupportTicketSection";

export const Route = createFileRoute("/home/products/")({
  component: RouteComponent,
});

const upcomingProducts = [
  {
    title: "Logistics/E-commerce",
    description:
      "Planned tools for coordinating deliveries, managing movement, and keeping operational updates in view.",
    icon: Truck,
    image: "/products_page/logistics.png",
    alt: "Logistics and e-commerce product preview",
  },
  {
    title: "Estate Management App",
    description:
      "A connected mobile experience for managing properties, resident requests, maintenance, and estate operations with greater ease.",
    icon: House,
    image: "/products_page/estate.png",
    alt: "Estate management app preview",
  },
];

function RouteComponent() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-[#5958ed]/20 selection:text-[#5958ed]">
      <HomeNav />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Featured product */}
        <section className="pt-12 sm:pt-16">
          <p className="mb-4 text-sm font-semibold text-[#5958ed]">
            Our featured software
          </p>

          <div className="relative overflow-hidden rounded-3xl bg-[#0f0d34] px-6 py-10 sm:px-10 sm:py-12 lg:px-12">
            <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-8">
              {/* Copy */}
              <div className="lg:col-span-5 space-y-6">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/80">
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                  Available now
                </span>

                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
                  Kinovia CRM
                </p>

                <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-[52px]">
                  Every customer.
                  <br />
                  Every opportunity.
                  <br />
                  <span className="text-[#a9a6f5]">One clear view.</span>
                </h1>

                <p className="max-w-md text-sm leading-relaxed text-white/70 sm:text-base">
                  Keep customer details, conversations, and sales opportunities
                  organized in one workspace, so your team can stay focused on
                  what matters.
                </p>
              </div>

              {/* Preview */}
              <div className="lg:col-span-7">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
                  Inside Kinovia / CRM
                </p>
                <div className="overflow-hidden rounded-2xl border border-white/10">
                  <img
                    src="/products_page/hero_img.png"
                    alt="Kinovia CRM workspace on a tablet"
                    className="h-auto w-full"
                    loading="eager"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* More products */}
        <section className="py-16 sm:py-20">
          <div className="mb-10 grid gap-4 sm:mb-12 lg:grid-cols-2 lg:items-end">
            <h2 className="text-3xl font-medium leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-[44px]">
              More software
              <br />
              products <span className="text-[#5958ed]">to work with</span>
            </h2>
            <p className="max-w-sm text-sm leading-relaxed text-slate-500 sm:text-base lg:justify-self-end">
              Beyond customer relationships, KINOVIA is exploring tools to bring
              greater clarity to how businesses move goods and sell online.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {upcomingProducts.map((product) => {
              const Icon = product.icon;
              return (
                <article
                  key={product.title}
                  className="group relative overflow-hidden rounded-2xl border border-[#e8e7fa] bg-gradient-to-b from-[#f9f9ff] to-[#f0f0fd] p-7 transition-all duration-300 hover:-translate-y-1 hover:border-[#cfcdfb] hover:shadow-xl hover:shadow-[#5958ed]/10"
                >
                  <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-500">
                    Upcoming
                  </span>

                  <div className="mt-6 flex items-start justify-between gap-6">
                    <div className="max-w-[15rem] space-y-4">
                      <span className="inline-grid size-11 place-items-center rounded-xl border border-[#e4e3fb] bg-white text-[#5958ed]">
                        <Icon className="size-5" />
                      </span>
                      <h3 className="text-xl font-bold text-slate-900">
                        {product.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-slate-600">
                        {product.description}
                      </p>
                    </div>

                    <img
                      src={product.image}
                      alt={product.alt}
                      className="hidden w-52 shrink-0 sm:block"
                      loading="lazy"
                    />
                  </div>

                  <div className="mt-6 flex items-center gap-2">
                    <Link
                      to="/home/contact-us"
                      className="text-sm font-semibold text-[#5958ed] hover:text-[#4b4ad4]"
                    >
                      Ask about {product.title.split("/")[0]}
                    </Link>
                    <Link
                      to="/home/contact-us"
                      aria-label={`Ask about ${product.title}`}
                      className="grid size-6 place-items-center rounded-full border border-slate-300 text-slate-500 transition-colors group-hover:border-[#5958ed] group-hover:bg-[#5958ed] group-hover:text-white"
                    >
                      <ArrowUpRight className="size-3.5" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Closing CTA */}
        <section className="pb-16 sm:pb-20">
          <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-[#e8e7fa] bg-[#f7f7ff] p-6 sm:flex-row sm:items-center sm:p-8">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900">
                Want to shape what we build next?
              </h2>
              <p className="text-sm text-slate-600">
                Tell us how your business moves goods, sells online, or manages
                property.
              </p>
            </div>
            <Link
              to="/home/contact-us"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#5958ed] px-5 py-3 text-sm font-semibold text-white shadow-md shadow-[#5958ed]/25 transition-all hover:bg-[#4b4ad4]"
            >
              <span>Talk to us</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      </main>
      <SupportTicketSection />

      <LandingFooter />
    </div>
  );
}

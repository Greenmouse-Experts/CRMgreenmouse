import { ArrowUpRight, Contact, Network, Truck } from "lucide-react";

const solutions = [
  {
    number: "01",
    tag: "CUSTOMER RELATIONSHIPS",
    title: "CRM",
    description:
      "Keep customer information, conversations and opportunities organized in one reliable workspace.",
    icon: Contact,
    href: "/auth/register",
  },
  {
    number: "02",
    tag: "CONNECTED WORKFLOWS",
    title: "Ent-Ext App",
    description:
      "Connect internal teams and external users through a more streamlined application experience.",
    icon: Network,
    href: "/auth/register",
  },
  {
    number: "03",
    tag: "CUSTOMER RELATIONSHIPS",
    title: "Logistics",
    description:
      "Improve visibility across deliveries, coordination and the movement of goods.",
    icon: Truck,
    href: "/auth/register",
  },
];

export default function SolutionsGrid() {
  return (
    <section id="solutions" className="relative py-16 sm:py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center space-y-3 mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-medium tracking-tight text-slate-900 leading-tight">
            Three solutions. <br />
            One <span className="text-[#5958ed] italic ">connected</span>{" "}
            experience.
          </h2>
          <p className=" sm:text-base text-slate-600 font-normal max-w-lg mx-auto">
            Start with the tool you need today. Each one shares information with
            the others.
          </p>
        </div>

        {/* 3 Solutions Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {solutions.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.title}
                href={item.href}
                className="group relative flex flex-col justify-between rounded-2xl border border-[#e8e7fa] bg-gradient-to-b from-[#f9f9ff] to-[#f0f0fd] p-7 transition-all duration-300 hover:-translate-y-1 hover:border-[#cfcdfb] hover:shadow-xl hover:shadow-[#5958ed]/10"
              >
                <div className="space-y-6">
                  {/* Icon Box */}
                  <div className="inline-flex size-11 items-center justify-center rounded-xl bg-white text-[#5958ed] shadow-xs border border-[#e4e3fb] group-hover:scale-105 transition-transform">
                    <Icon className="size-5" />
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2.5">
                    <h3 className="text-xl font-bold text-slate-900">
                      {item.title}
                    </h3>
                    <p className=" sm: text-slate-600 leading-relaxed font-normal">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Bottom Tag & Circular Arrow */}
                <div className="pt-8 mt-4 border-t border-[#e6e4f8] flex items-center justify-between">
                  <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                    {item.number} / {item.tag}
                  </span>
                  <div className="grid size-7 place-items-center rounded-full border border-slate-300 bg-white/70 text-slate-600 transition-colors group-hover:border-[#5958ed] group-hover:bg-[#5958ed] group-hover:text-white">
                    <ArrowUpRight className="size-3.5" />
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

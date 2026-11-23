import { Check } from "lucide-react";

const BENEFITS = [
  "Track key numbers at a glance",
  "Spot trends before they become problems",
  "Share one clear source of truth across teams",
];

export default function TogetherInOnePlace() {
  return (
    <section
      id="platform"
      className="bg-[#f4f5fa] py-16 sm:py-24 overflow-hidden"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Outer Highlight Card */}
        <div className="rounded-3xl border border-white bg-gradient-to-br from-white via-white to-[#eceefb] p-6 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.15)] sm:p-10 lg:p-14">
          {/* Badge */}
          <span className="inline-flex items-center gap-2 rounded-full bg-[#5958ed]/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5958ed]">
            <span
              className="size-1.5 rounded-full bg-[#5958ed]"
              aria-hidden="true"
            />
            Product highlights
          </span>

          <h2 className="mt-6 text-3xl sm:text-4xl lg:text-[44px] font-medium tracking-tight text-slate-900 leading-tight">
            Clear views. Better decisions.
          </h2>

          <p className="mt-4 max-w-2xl text-sm sm:text-base text-slate-500 leading-relaxed font-normal">
            Stay on top of what matters with a clearer view of your business.
            From customer activity and sales performance to team progress and
            daily operations, KINOVIA brings your essential information
            together, helping you spot opportunities and make smarter decisions.
          </p>

          {/* Inner Feature Card */}
          <div className="mt-10 rounded-2xl border border-slate-200/70 bg-white/70 p-6 sm:p-10">
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
              {/* Left: Copy & Benefits */}
              <div>
                <h3 className="text-2xl sm:text-3xl font-medium tracking-tight text-slate-900 leading-snug">
                  A clear view of your business performance in real time.
                </h3>

                <p className="mt-4 text-sm sm:text-base text-slate-500 leading-relaxed font-normal">
                  Monitor customer activity, team output, service requests, and
                  sales signals from one connected workspace. KINOVIA gives your
                  team a quick, readable snapshot of what matters most.
                </p>

                <ul className="mt-6 space-y-3.5">
                  {BENEFITS.map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <Check className="size-4 shrink-0 text-emerald-500 stroke-[3]" />
                      <span className="text-sm sm:text-[15px] font-medium text-slate-700">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Right: Performance Chart Graphic */}
              <div>
                <img
                  src="/homepage/chart.png"
                  alt="Performance overview chart showing monthly revenue trend"
                  className="w-full h-auto"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

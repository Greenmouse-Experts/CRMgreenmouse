import {
  Users,
  BarChart3,
  UsersRound,
  CheckSquare,
  PieChart,
} from "lucide-react";

const capabilities = [
  { label: "Customer Management", icon: Users },
  { label: "Sales Pipeline", icon: BarChart3 },
  { label: "Team & Employees", icon: UsersRound },
  { label: "Operations & Tasks", icon: CheckSquare },
  { label: "Reports & Insights", icon: PieChart },
];

export default function AllInOneSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#f7f5ff] via-white to-[#f2edff] py-16 sm:py-24">
      {/* Soft corner glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 size-[420px] rounded-full bg-[#ded5ff]/50 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -right-24 size-[420px] rounded-full bg-[#e8e0ff]/50 blur-3xl"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: intro card */}
          <div className="relative z-10 rounded-3xl border border-[#e3dbfb] bg-white/85 p-8 shadow-[0_20px_60px_-25px_rgba(89,88,237,0.35)] backdrop-blur-sm sm:p-10">
            <span className="text-2xl font-black tracking-tight text-slate-900">
              <span className="text-[#5958ed]">K</span>INOVIA
              <span className="text-[#5958ed]">.</span>
            </span>

            <h2 className="mt-8 text-3xl font-semibold leading-[1.15] tracking-tight text-slate-900 sm:text-4xl">
              Manage your entire
              <br />
              business. All in one
              <br />
              place.
            </h2>

            <p className="mt-5 max-w-md text-sm leading-relaxed text-slate-600 sm:text-base">
              KINOVIA CRM helps you manage customers, sales, operations, people,
              and reporting in one connected workspace.
            </p>
          </div>

          {/* Right: connected capability cards */}
          <div className="relative">
            {/* Fan-out connector lines (desktop only) */}
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-0 hidden h-full w-full lg:block"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {[10, 30, 50, 70, 90].map((y) => (
                <path
                  key={y}
                  d={`M 0 50 C 35 50, 45 ${y}, 100 ${y}`}
                  fill="none"
                  stroke="#5958ed"
                  strokeOpacity="0.55"
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>

            <div className="relative z-10 space-y-3">
              {capabilities.map(({ label, icon: Icon }) => (
                <div
                  key={label}
                  className="flex items-center gap-4 rounded-2xl border border-[#e6dffa] bg-white/95 px-4 py-3.5 shadow-[0_10px_30px_-18px_rgba(89,88,237,0.5)] transition-transform duration-200 hover:-translate-y-0.5 sm:px-5 sm:py-4"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#efe8ff] text-[#5958ed] sm:size-11">
                    <Icon className="size-5" />
                  </span>
                  <span className="text-sm font-semibold text-slate-800 sm:text-base">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { useCallback, useLayoutEffect, useRef, useState } from "react";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const sourceRef = useRef<HTMLDivElement>(null);
  const targetRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [paths, setPaths] = useState<string[]>([]);

  // Draw connector curves from the intro card's right edge to each
  // capability card's left edge, using measured pixel positions.
  const updatePaths = useCallback(() => {
    const container = containerRef.current;
    const source = sourceRef.current;
    if (!container || !source) return;

    const c = container.getBoundingClientRect();
    if (c.width === 0) return;

    const s = source.getBoundingClientRect();
    const sx = s.right - c.left;
    const sy = s.top + s.height / 2 - c.top;

    setPaths(
      targetRefs.current.map((el) => {
        if (!el) return "";
        const t = el.getBoundingClientRect();
        const tx = t.left - c.left;
        const ty = t.top + t.height / 2 - c.top;
        const bend = (tx - sx) / 2;
        return `M ${sx} ${sy} C ${sx + bend} ${sy}, ${tx - bend} ${ty}, ${tx} ${ty}`;
      }),
    );
  }, []);

  useLayoutEffect(() => {
    updatePaths();
    const observer = new ResizeObserver(updatePaths);
    if (containerRef.current) observer.observe(containerRef.current);
    window.addEventListener("resize", updatePaths);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updatePaths);
    };
  }, [updatePaths]);

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
        <div
          ref={containerRef}
          className="relative grid items-center gap-12 lg:grid-cols-12 lg:gap-8"
        >
          {/* Fan-out connector lines (desktop only) */}
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 hidden h-full w-full lg:block"
          >
            {paths.map(
              (d, i) =>
                d && (
                  <path
                    key={i}
                    d={d}
                    fill="none"
                    stroke="#5958ed"
                    strokeOpacity="0.55"
                    strokeWidth="1.5"
                  />
                ),
            )}
          </svg>

          {/* Left: intro card */}
          <div
            ref={sourceRef}
            className="relative z-10 rounded-3xl border border-[#e3dbfb] bg-white/85 p-8 shadow-[0_20px_60px_-25px_rgba(89,88,237,0.35)] backdrop-blur-sm sm:p-10 lg:col-span-5"
          >
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
          <div className="relative z-10 space-y-3 lg:col-span-5 lg:col-start-8">
            {capabilities.map(({ label, icon: Icon }, idx) => (
              <div
                key={label}
                ref={(el) => {
                  targetRefs.current[idx] = el;
                }}
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
    </section>
  );
}

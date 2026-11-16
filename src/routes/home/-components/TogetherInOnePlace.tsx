import { Check, ArrowRight } from "lucide-react";

export default function TogetherInOnePlace() {
  const benefits = [
    "Keep key workflows within reach",
    "Give teams a clearer view of daily operations",
    "Create easier ways to serve customers",
  ];

  return (
    <section id="platform" className="py-16 sm:py-24 bg-white overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left Graphic */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative w-full max-w-lg transition-transform duration-300 hover:scale-[1.01]">
              <img
                src="/homepage/section_3.png"
                alt="Bring business tools together"
                className="w-full h-auto drop-shadow-xl rounded-2xl"
                loading="lazy"
              />
            </div>
          </div>

          {/* Right Content */}
          <div className="lg:col-span-6 space-y-6">
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-medium tracking-tight text-slate-900 leading-tight">
              Bring your business tools <br />
              together in one place.
            </h2>

            <p className=" sm:text-base text-slate-600 leading-relaxed font-normal">
              From managing customer relationships and service requests to
              coordinating logistics and online sales, KINOVIA brings three
              essential business solutions into one connected experience. Give
              your team a clearer way to organize information, respond to
              customers, and keep everyday work moving.
            </p>

            {/* Checkmark List */}
            <ul className="space-y-3.5 pt-1">
              {benefits.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <div className="grid size-5 place-items-center rounded-full bg-emerald-100 text-emerald-600 shrink-0">
                    <Check className="size-3 stroke-[3]" />
                  </div>
                  <span className=" sm:text-[15px] font-medium text-slate-700">
                    {item}
                  </span>
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <div className="pt-4">
              <a
                href="#solutions"
                className="inline-flex items-center gap-2 rounded-xl bg-[#5958ed] px-6 py-3.5  font-semibold text-white shadow-md shadow-[#5958ed]/25 transition-all hover:bg-[#4b4ad4] hover:shadow-lg"
              >
                <span>Discover our solutions</span>
                <ArrowRight className="size-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

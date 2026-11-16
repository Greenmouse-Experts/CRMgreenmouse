import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white pt-8 pb-16 lg:pt-16 lg:pb-24">
      {/* Background Graphic Layer */}
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-top bg-no-repeat opacity-90"
        style={{
          backgroundImage: "url('/homepage/hero_bg.png')",
          backgroundSize: "100% auto",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Left Text Column */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-[62px] font-extrabold tracking-tight text-slate-900 leading-[1.12]">
              One platform. <br />
              More ways to <br />
              <span className="text-[#5958ed] italic font-serif">grow.</span>
            </h1>

            <p className="max-w-xl text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              Manage customer relationships, connect your teams, coordinate
              logistics, support online sales, and handle service requests with
              KINOVIA&apos;s suite of business solutions.
            </p>

            <div className="pt-2">
              <a
                href="#solutions"
                className="inline-flex items-center gap-2 rounded-xl bg-[#5958ed] px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-[#5958ed]/25 transition-all hover:bg-[#4b4ad4] hover:shadow-lg hover:shadow-[#5958ed]/35"
              >
                <span>Explore our products</span>
                <ArrowRight className="size-4" />
              </a>
            </div>
          </div>

          {/* Right Floating Dashboard Preview Image */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-xl transition-transform duration-300 hover:scale-[1.01]">
              <img
                src="/homepage/hero.png"
                alt="Kinovia Overview Dashboard Preview"
                className="w-full h-auto drop-shadow-2xl"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

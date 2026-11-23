import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white pt-12 pb-0 lg:pt-20">
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
        {/* Centered Text Block */}
        <div className="mx-auto max-w-3xl space-y-6 text-center">
          <h1 className="text-5xl font-semibold leading-[1.1] tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
            One platform. <br />
            More ways to <span className="text-[#5958ed]">grow.</span>
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-lg text-slate-500 leading-relaxed font-normal">
            Manage customer relationships, connect your teams, coordinate
            logistics, support online sales, and handle service requests with
            KINOVIA&apos;s suite of business solutions.
          </p>

          <div className="pt-2">
            <a
              href="#solutions"
              className="inline-flex items-center gap-2 rounded-xl bg-[#5958ed] px-6 py-3.5 font-semibold text-white shadow-md shadow-[#5958ed]/25 transition-all hover:bg-[#4b4ad4] hover:shadow-lg hover:shadow-[#5958ed]/35"
            >
              <span>Explore our products</span>
              <ArrowRight className="size-4" />
            </a>
          </div>
        </div>

        {/* Dashboard Preview — full-width, fades out at the bottom */}
        <div className="mt-12 lg:mt-16">
          <img
            src="/homepage/new_hero_img.png"
            alt="KINOVIA CRM tenant dashboard preview"
            className="w-full h-auto mask-b-from-1%"
            loading="eager"
          />
        </div>
      </div>
    </section>
  );
}

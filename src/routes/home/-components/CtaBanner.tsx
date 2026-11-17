import { ArrowRight } from "lucide-react";

export default function CtaBanner() {
  return (
    <section className="relative overflow-hidden bg-[#5758ed] py-20 sm:py-28 text-white text-center">
      {/* Background Banner Image */}
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-cover bg-center opacity-95 mix-blend-overlay"
        style={{
          backgroundImage: "url('/blue_bg.png')",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">
        <h2 className="text-3xl sm:text-5xl lg:text-[56px] font-medium tracking-tight leading-[1.12]">
          Smarter tools. <br />
          Stronger connections. <br />
          Better business.
        </h2>

        <p className=" sm:text-lg text-white/90 font-normal max-w-xl mx-auto">
          Discover what connected tools can do for your business.
        </p>

        <div className="pt-4">
          <a href="#support" className="btn btn-lg text-primary">
            <span>Talk to us</span>
            <ArrowRight className="size-4 " />
          </a>
        </div>
      </div>
    </section>
  );
}

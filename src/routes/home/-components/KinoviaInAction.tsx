import { ArrowRight } from "lucide-react";

export default function KinoviaInAction() {
  return (
    <section id="showcase" className="py-16 sm:py-24 bg-white overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="mx-auto max-w-2xl text-center space-y-3 mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-medium tracking-tight text-slate-900 leading-tight">
            See KINOVIA <span className="text-[#5958ed]">in action.</span>
          </h2>
          <p className=" sm:text-base text-slate-600 font-normal max-w-lg mx-auto">
            Go beyond the feature list. Take a closer look at the software
            experience designed to make everyday business feel more connected.
          </p>
        </div>

        {/* Dark Showcase Container */}
        <div className="relative rounded-3xl bg-[#0e1329] p-8 sm:p-12 lg:p-14 text-white shadow-2xl border border-white/5 overflow-hidden">
          {/* Subtle Corner Markers */}
          <div className="absolute top-4 left-4 size-5 border-t border-l border-white/20" />
          <div className="absolute top-4 right-4 size-5 border-t border-r border-white/20" />
          <div className="absolute bottom-4 left-4 size-5 border-b border-l border-white/20" />
          <div className="absolute bottom-4 right-4 size-5 border-b border-r border-white/20" />

          {/* Background Ambient Glow */}
          <div className="pointer-events-none absolute -right-20 -bottom-20 size-96 rounded-full bg-[#5958ed]/15 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 -top-20 size-96 rounded-full bg-[#5958ed]/10 blur-3xl" />

          <div className="relative z-10 grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
            {/* Left Content */}
            <div className="lg:col-span-5 space-y-6 text-left">
              <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold tracking-wider text-slate-300 uppercase border border-white/10">
                FEATURED PRODUCT: CRM
              </span>

              <h3 className="text-3xl sm:text-4xl font-medium tracking-tight leading-tight">
                Your customers. <br />
                Your pipeline. <br />
                <span className="text-[#a5a4f7]">One clear view.</span>
              </h3>

              <p className=" sm:text-base text-slate-300/80 leading-relaxed font-normal">
                Get a feel for KINOVIA CRM, a single workspace concept for
                managing contacts, following opportunities, and seeing the work
                that matters.
              </p>

              <div className="pt-2">
                <a
                  href="/auth/register"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#5958ed] px-6 py-3.5  font-semibold text-white shadow-md shadow-[#5958ed]/30 transition-all hover:bg-[#4b4ad4] hover:shadow-lg"
                >
                  <span>Ask about Kinovia CRM</span>
                  <ArrowRight className="size-4" />
                </a>
              </div>
            </div>

            {/* Right Tablet Mockup Container */}
            <div className="lg:col-span-7 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-xl rounded-2xl border border-white/10 bg-[#161c38]/80 p-3 sm:p-5 shadow-inner backdrop-blur-xs">
                {/* Top Badge */}
                <div className="mb-3 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-0.5 text-[9px] font-bold tracking-wider text-slate-300 uppercase">
                    <span className="size-1 rounded-full bg-[#5958ed]" />
                    KINOVIA CRM PREVIEW
                  </span>
                </div>

                {/* Tablet Display Image */}
                <div className="overflow-hidden rounded-xl bg-slate-900 border border-white/10 shadow-2xl">
                  <img
                    src="/homepage/see_kinovia.png"
                    alt="Kinovia CRM Tablet Preview"
                    className="w-full h-auto object-cover transform transition-transform duration-500 hover:scale-[1.02]"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

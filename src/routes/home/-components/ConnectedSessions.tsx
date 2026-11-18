import { useState, useEffect, useRef } from "react";
import {
  Users,
  BarChart3,
  ClipboardList,
  Building2,
  Wrench,
  CreditCard,
  Truck,
  ShoppingBag,
  ArrowUpRight,
} from "lucide-react";

interface SolutionSession {
  id: string;
  tabLabel: string;
  headline: {
    line1: string;
    line2: string;
    line3: string;
  };
  description: string;
  bullets: {
    icon: React.ReactNode;
    text: string;
  }[];
  buttonText: string;
  buttonHref: string;
  imageSrc: string;
  imageAlt: string;
}

const SESSIONS: SolutionSession[] = [
  {
    id: "crm",
    tabLabel: "CRM",
    headline: {
      line1: "Your customers.",
      line2: "Your pipeline.",
      line3: "One clear view.",
    },
    description:
      "Keep customer records, conversations, and sales opportunities connected in one workspace so your team can see what matters and act with confidence.",
    bullets: [
      {
        icon: <Users className="size-4" />,
        text: "Organised contacts and customer history",
      },
      {
        icon: <BarChart3 className="size-4" />,
        text: "Sales pipeline and opportunity tracking",
      },
      {
        icon: <ClipboardList className="size-4" />,
        text: "Activities, tasks and follow-ups in view",
      },
    ],
    buttonText: "Ask about KINOVIA CRM",
    buttonHref: "/home/products",
    imageSrc: "/homepage/experiences/crm.png",
    imageAlt: "Kinovia CRM software tablet preview",
  },
  {
    id: "estate",
    tabLabel: "Estate Management App",
    headline: {
      line1: "Manage properties.",
      line2: "Support residents.",
      line3: "Stay in control.",
    },
    description:
      "Make everyday estate management easier to understand, from occupancy and resident requests to maintenance updates and payments.",
    bullets: [
      {
        icon: <Building2 className="size-4" />,
        text: "Properties and unit management",
      },
      {
        icon: <Wrench className="size-4" />,
        text: "Maintenance and service requests",
      },
      {
        icon: <CreditCard className="size-4" />,
        text: "Payments and service charges",
      },
    ],
    buttonText: "Enquire about Estate App",
    buttonHref: "/home/products",
    imageSrc: "/homepage/experiences/estate_management.png",
    imageAlt: "Kinovia Estate Management mobile preview",
  },
  {
    id: "logistics",
    tabLabel: "Logistics / E-commerce",
    headline: {
      line1: "Track orders.",
      line2: "Coordinate deliveries.",
      line3: "Keep business moving.",
    },
    description:
      "Explore a product direction where shipping updates, digital sales and fulfilment activity are easier to follow in one operational view.",
    bullets: [
      {
        icon: <Truck className="size-4" />,
        text: "Delivery and shipment visibility",
      },
      {
        icon: <ShoppingBag className="size-4" />,
        text: "E-commerce order management",
      },
      {
        icon: <BarChart3 className="size-4" />,
        text: "Fulfilment and operations reporting",
      },
    ],
    buttonText: "Enquire about Logistics",
    buttonHref: "/home/products",
    imageSrc: "/homepage/experiences/logistics.png",
    imageAlt: "Kinovia Logistics and E-commerce operations overview",
  },
];

export default function ConnectedSessions() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const activeSession = SESSIONS[activeIndex];

  // Optional auto-rotation (every 8 seconds when not hovered)
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SESSIONS.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + SESSIONS.length) % SESSIONS.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % SESSIONS.length);
  };

  // Touch swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
    touchStartX.current = null;
  };

  return (
    <section
      id="solutions"
      className="py-16 sm:py-24 bg-white overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center space-y-4 mb-10 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-medium tracking-tight text-slate-900 leading-tight">
            Three solutions. <br />
            One{" "}
            <span className="text-[#5958ed] italic font-serif">
              connected
            </span>{" "}
            experience.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-normal max-w-xl mx-auto leading-relaxed">
            Start with the tool you need today. Each one shares information with
            the others.
          </p>

          {/* Pill Tabs */}
          <div className="pt-2 flex justify-center">
            <div className="inline-flex items-center gap-1.5 p-1 rounded-full bg-slate-100/90 border border-slate-200/80 shadow-2xs">
              {SESSIONS.map((session, idx) => {
                const isActive = idx === activeIndex;
                return (
                  <button
                    key={session.id}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    className={`rounded-full px-4 sm:px-5 py-2 text-xs sm:text-[13px] font-semibold transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-[#0e1329] text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-950 hover:bg-white/60"
                    }`}
                  >
                    {session.tabLabel}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Carousel Showcase Card */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className=" relative text-white"
        >
          <img
            className="absolute  inset-0 w-full h-full"
            src={"/homepage/experiences/new_dark_bg.png"}
            alt=""
          />

          {/* Background Ambient Glows */}
          {/*<div className="pointer-events-none absolute -right-20 -bottom-20 size-96 rounded-full bg-[#5958ed]/15 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 -top-20 size-96 rounded-full bg-[#5958ed]/10 blur-3xl" />*/}

          {/* Navigation Chevron Buttons (Desktop) */}

          {/* Slide Content */}
          <div className="relative z-10 p-6 sm:p-10 lg:p-14">
            <div
              key={activeSession.id}
              className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12 animate-in fade-in duration-300"
            >
              {/* Left Column: Copy & Features */}
              <div className="lg:col-span-5 space-y-6 text-left">
                <h3 className="text-3xl sm:text-4xl lg:text-[42px] font-medium tracking-tight leading-[1.15]">
                  {activeSession.headline.line1} <br />
                  {activeSession.headline.line2} <br />
                  <span className="text-[#a5a4f7]">
                    {activeSession.headline.line3}
                  </span>
                </h3>

                <p className="text-sm sm:text-base text-slate-300/80 leading-relaxed font-normal">
                  {activeSession.description}
                </p>

                {/* 3 Bullet Features */}
                <div className="space-y-3.5 pt-1">
                  {activeSession.bullets.map((bullet, bIdx) => (
                    <div
                      key={bIdx}
                      className="flex items-center gap-3 text-slate-200"
                    >
                      <div className="flex size-9 items-center justify-center rounded-xl bg-white/10 text-slate-200 border border-white/10 shrink-0">
                        {bullet.icon}
                      </div>
                      <span className="text-xs sm:text-sm font-medium">
                        {bullet.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <div className="pt-3">
                  <a
                    href={activeSession.buttonHref}
                    className="inline-flex items-center gap-3 rounded-full bg-white px-6 py-3 text-xs sm:text-sm font-semibold text-slate-900 shadow-lg hover:bg-slate-100 transition-all group"
                  >
                    <span>{activeSession.buttonText}</span>
                    <span className="grid size-5 place-items-center rounded-full bg-[#5958ed] text-white transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                      <ArrowUpRight className="size-3.5 stroke-[2.5]" />
                    </span>
                  </a>
                </div>
              </div>

              {/* Right Column: Visual Preview Graphic */}
              <div className="lg:col-span-7 flex justify-center items-center">
                <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl transition-transform duration-300 hover:scale-[1.01]">
                  <img
                    src={activeSession.imageSrc}
                    alt={activeSession.imageAlt}
                    className="w-full h-auto object-contain drop-shadow-2xl"
                    loading="eager"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="relative z-10 flex justify-center items-center gap-2 pb-6 pt-2">
            {SESSIONS.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all duration-200 rounded-full cursor-pointer ${
                  idx === activeIndex
                    ? "w-8 h-2 bg-[#5958ed]"
                    : "w-2 h-2 bg-white/30 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

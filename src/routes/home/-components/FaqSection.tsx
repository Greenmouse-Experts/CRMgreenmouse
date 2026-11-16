import { useState } from "react";
import { Plus, Minus } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    question: "What is KINOVIA?",
    answer:
      "KINOVIA is presented here as a connected digital product ecosystem spanning CRM, applications, logistics, e-commerce and service requests. Final product positioning can be updated to match the business offering.",
  },
  {
    question: "Which solutions does KINOVIA offer?",
    answer:
      "KINOVIA provides three core interconnected pillars: Kinovia CRM for managing leads, deals, contacts and sales pipelines; Ent-Ext App for bridging internal operations with client-facing portals; and Logistics for monitoring delivery timelines, cargo dispatches, and warehouse operations.",
  },
  {
    question: "Can I ask about a specific product?",
    answer:
      "Yes! You can select any product in our support ticket above or schedule a demo directly with our product specialists to see specific workflows tailored to your sector.",
  },
  {
    question: "How do I submit a support ticket?",
    answer:
      "Fill out the ticket form above with your email, select the product or inquiry type, and submit your message. Our support staff will immediately assign it and notify you via email.",
  },
  {
    question: "How can I get started with KINOVIA?",
    answer:
      "Getting started takes less than 2 minutes. Click 'Get Started' or 'Explore our products' to create your workspace, invite your team, and configure your first pipeline.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 sm:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left Title & Subtitle */}
          <div className="lg:col-span-5 space-y-4 text-left">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Frequently <br />
              asked questions.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal max-w-md">
              Answers to a few common questions about KINOVIA and its product
              ecosystem.
            </p>
          </div>

          {/* Right Accordion List */}
          <div className="lg:col-span-7 space-y-3.5">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={faq.question}
                  className="rounded-2xl border border-[#e8e7fa] bg-[#f5f5fe] transition-colors overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => toggle(index)}
                    className="flex w-full items-center justify-between p-5 sm:p-6 text-left transition hover:bg-[#ededfc]"
                  >
                    <span className="text-sm sm:text-base font-bold text-slate-900 pr-4">
                      {faq.question}
                    </span>
                    <div className="grid size-6 place-items-center rounded-full bg-white text-[#5958ed] shrink-0 shadow-2xs">
                      {isOpen ? (
                        <Minus className="size-3.5 stroke-[2.5]" />
                      ) : (
                        <Plus className="size-3.5 stroke-[2.5]" />
                      )}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-xs sm:text-sm text-slate-600 leading-relaxed pt-1 border-t border-[#e8e7fa]/60">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

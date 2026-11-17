import { useState } from "react";
import { Plus, Minus } from "lucide-react";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    id: "what-is-kinovia",
    question: "What is KINOVIA?",
    answer:
      "KINOVIA is presented here as a connected digital product ecosystem spanning CRM, applications, logistics, e-commerce and service requests. Final product positioning can be updated to match the business offering.",
  },
  {
    id: "solutions-offered",
    question: "Which solutions does KINOVIA offer?",
    answer:
      "The five areas featured are CRM, Ent-Ext App, Logistics, E-commerce and Service Request.",
  },
  {
    id: "specific-product",
    question: "Can I ask about a specific product?",
    answer:
      "Yes. Use the support section to specify the product you need help with and include a short description of your request.",
  },
  {
    id: "submit-ticket",
    question: "How do I submit a support ticket?",
    answer:
      "Complete the ticket form with your contact details, select the relevant product and describe your request. The live version will need a connected ticket management system to deliver it.",
  },
  {
    id: "get-started",
    question: "How can I get started with KINOVIA?",
    answer:
      "Use the contact or support section to make an inquiry. Onboarding and account setup instructions can be added once confirmed by the KINOVIA team.",
  },
];

export default function FaqSection() {
  const [openIds, setOpenIds] = useState<Set<string>>(
    new Set(["what-is-kinovia"]),
  );

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <section
      id="faq"
      className="relative py-20 sm:py-28 bg-white overflow-hidden"
    >
      {/* Background Dot Pattern */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #d9cdf5 1px, transparent 0)",
          backgroundSize: "22px 22px",
          maskImage:
            "radial-gradient(ellipse at center, black 35%, transparent 80%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          {/* Left: Section Header */}
          <div className="lg:col-span-4 ">
            <div className="space-y-4 ">
              <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-medium tracking-tight text-slate-900 leading-tight">
                Frequently <br className="hidden sm:inline" />
                asked questions.
              </h2>
              <p className="text-sm sm:text-base text-slate-600 font-normal max-w-sm">
                Answers to a few common questions about KINOVIA and its product
                ecosystem.
              </p>
            </div>
          </div>

          {/* Right: FAQ Accordion List */}
          <div className="lg:col-span-8">
            <div className="space-y-4">
              {faqs.map((faq) => {
                const isOpen = openIds.has(faq.id);
                return (
                  <div
                    key={faq.id}
                    className="rounded-2xl border border-[#dfd5fa] bg-[#efe8ff] p-5 sm:p-6 transition-all duration-200"
                  >
                    <button
                      type="button"
                      onClick={() => toggle(faq.id)}
                      aria-expanded={isOpen}
                      className="flex w-full items-start justify-between text-left cursor-pointer group"
                    >
                      <span className="text-sm sm:text-[15px] font-bold text-slate-900 pr-4 leading-snug">
                        {faq.question}
                      </span>
                      <span className="text-[#5958ed] shrink-0 pt-0.5 transition-transform group-hover:scale-110">
                        {isOpen ? (
                          <Minus className="size-4 stroke-[2.5]" />
                        ) : (
                          <Plus className="size-4 stroke-[2.5]" />
                        )}
                      </span>
                    </button>

                    {isOpen && (
                      <p className="mt-3 text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal animate-in fade-in duration-200">
                        {faq.answer}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

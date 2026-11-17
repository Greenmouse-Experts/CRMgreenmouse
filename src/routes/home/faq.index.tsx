import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Minus, Plus, Search } from "lucide-react";
import HomeNav from "./-components/HomeNav";
import SupportTicketSection from "./-components/SupportTicketSection";
import LandingFooter from "./-components/LandingFooter";

export const Route = createFileRoute("/home/faq/")({
  component: RouteComponent,
});

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
      "The five featured areas are CRM, Ent-Ext App, Logistics, E-commerce and Service Request.",
  },
  {
    id: "specific-product",
    question: "Can I ask about a specific product?",
    answer:
      "Yes. Use the support section to specify the product you need help with, and include a short description of your request so the right person can pick it up.",
  },
  {
    id: "submit-ticket",
    question: "How do I submit a support ticket?",
    answer:
      "Complete the support form with your contact details, select the relevant product, and describe your request. The live version will need a connected ticket managing system to deliver it.",
  },
  {
    id: "get-started",
    question: "How can I get started with KINOVIA?",
    answer:
      "Use the contact or support section to make an enquiry. Onboarding and account setup instructions can be added once confirmed by the KINOVIA team.",
  },
  {
    id: "solutions-to-explore",
    question: "Which KINOVIA solutions can I explore?",
    answer:
      "You can explore three product areas: CRM, Estate Management App, and Logistics. For e-commerce, CRM is the core offering, while the other two are presented as product concepts. Visit the Solutions page to see the connections.",
  },
  {
    id: "crm-features",
    question: "What can I manage with KINOVIA CRM?",
    answer:
      "The CRM experience is centred around customer contact, sales opportunities, follow-ups, and visibility into team activities. The product team can confirm the feature hierarchy and flow in your version.",
  },
  {
    id: "business-sizes",
    question: "Is KINOVIA designed for businesses of different sizes?",
    answer:
      "The products are designed for businesses of different sizes, with the right fit decided on your premises and needs. Contact KINOVIA to discuss your use case and solution options.",
  },
  {
    id: "estate-management-app",
    question: "What is the Estate Management App?",
    answer:
      "It's a product concept for property administration and property operations, with complete property information, maintenance requests, and appointment tracking. The final feature set is subject to confirmation in the release planning.",
  },
  {
    id: "logistics-ecommerce",
    question: "What will Logistics / E-commerce help businesses do?",
    answer:
      "The concept is to integrate inventory, order history, fulfillment, and commerce activity in a connected workspace. Specific capabilities and availability will be confirmed as the product develops.",
  },
];

function RouteComponent() {
  const [query, setQuery] = useState("");
  const [openIds, setOpenIds] = useState<Set<string>>(
    new Set([faqs[0].id]),
  );

  const filteredFaqs = faqs.filter((faq) => {
    const term = query.trim().toLowerCase();
    if (!term) return true;
    return (
      faq.question.toLowerCase().includes(term) ||
      faq.answer.toLowerCase().includes(term)
    );
  });

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
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-[#5958ed]/20 selection:text-[#5958ed]">
      <HomeNav />

      <main>
        {/* FAQ Hero + Search */}
        <section className="relative overflow-hidden bg-white pb-14 sm:pb-20">
          <div
            className="pointer-events-none absolute inset-0 z-0 bg-top bg-no-repeat opacity-90"
            style={{
              backgroundImage: "url('/homepage/hero_bg.png')",
              backgroundSize: "100% auto",
            }}
            aria-hidden="true"
          />

          <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-4 text-center">
              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-semibold tracking-tight leading-tight text-slate-900">
                Frequently Asked
                <br />
                <span className="text-[#5958ed]">Questions</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-600 font-normal max-w-xl mx-auto leading-relaxed">
                Find what you need to know about KINOVIA, explore our product
                suite, and get the right help when you need it.
              </p>
            </div>

            <form
              onSubmit={(e) => e.preventDefault()}
              className="mx-auto mt-10 flex max-w-xl items-center gap-2 rounded-full border border-slate-200 bg-white p-2 pl-4 shadow-md"
            >
              <Search className="size-5 shrink-0 text-slate-400" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for a question or topic..."
                aria-label="Search FAQs"
                className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-full bg-[#5958ed] px-5 py-2 text-xs font-semibold text-white transition hover:bg-[#4b4ad4]"
              >
                Search FAQ
              </button>
            </form>
          </div>
        </section>

        {/* FAQ Accordion List */}
        <section className="bg-white pb-20 sm:pb-28">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            {filteredFaqs.length > 0 ? (
              <div className="space-y-3">
                {filteredFaqs.map((faq) => {
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
            ) : (
              <p className="text-center text-sm text-slate-600">
                No questions found for &ldquo;{query}&rdquo;. Try a different
                search term.
              </p>
            )}
          </div>
        </section>

        {/* Support Ticket Section */}
        <SupportTicketSection />
      </main>

      <LandingFooter />
    </div>
  );
}

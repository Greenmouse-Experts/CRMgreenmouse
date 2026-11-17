import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Headphones,
  Mail,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import HomeNav from "./-components/HomeNav";
import LandingFooter from "./-components/LandingFooter";

export const Route = createFileRoute("/home/contact-us/")({
  component: RouteComponent,
});

const enquiryTypes = [
  "General enquiry",
  "Product support",
  "Partnership",
  "Feedback",
  "Other",
];

function RouteComponent() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    enquiry: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.email.trim()) {
      toast.error("Please provide your name and email.");
      return;
    }
    if (!form.enquiry) {
      toast.error("Please select an enquiry type.");
      return;
    }
    if (!form.message.trim()) {
      toast.error("Please tell us a little about what you need.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success("Message sent! We'll get back to you shortly.");
    }, 600);
  };

  const resetForm = () => {
    setSubmitted(false);
    setForm({ fullName: "", email: "", enquiry: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-[#5958ed]/20 selection:text-[#5958ed]">
      <HomeNav />

      <div className="relative overflow-hidden">
        {/* Background Graphic Layer */}
        <div
          className="pointer-events-none absolute inset-0 z-0 bg-top bg-no-repeat opacity-90"
          style={{
            backgroundImage: "url('/homepage/hero_bg.png')",
            backgroundSize: "100% auto",
          }}
          aria-hidden="true"
        />

        <main className="container mx-auto relative z-10 max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          {/* Page Heading */}
          <div className="mx-auto max-w-2xl text-center space-y-4 mb-14 sm:mb-20">
            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-semibold tracking-tight leading-tight text-slate-900">
              Let&apos;s <span className="text-[#5958ed]">get in touch.</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              Have a question about KINOVIA or one of our solutions? Share
              what&apos;s on your mind and we&apos;ll help you find the right
              next step.
            </p>
          </div>

          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            {/* Left Column: Help Information */}
            <div className="lg:col-span-5 space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-tight text-slate-900">
                  We&apos;re here to help
                  <br />
                  you connect.
                </h2>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal max-w-md">
                  From general enquiries to product-related questions, tell us
                  what you need. We&apos;re always happy to hear from you.
                </p>
              </div>

              <div className="space-y-4">
                {/* General Enquiries */}
                <a
                  href="mailto:hello@kinovia.com"
                  className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#efe8ff] text-[#5958ed]">
                    <Mail className="size-5" />
                  </span>
                  <span className="space-y-1">
                    <span className="block font-bold text-slate-900">
                      General enquiries
                    </span>
                    <span className="block text-sm text-slate-600 leading-relaxed">
                      Learn more about KINOVIA and the solutions available to
                      your business.
                    </span>
                  </span>
                </a>

                {/* Product Support */}
                <a
                  href="#support"
                  className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#efe8ff] text-[#5958ed]">
                    <Headphones className="size-5" />
                  </span>
                  <span className="space-y-1">
                    <span className="block font-bold text-slate-900">
                      Product support
                    </span>
                    <span className="block text-sm text-slate-600 leading-relaxed">
                      Already need assistance with a product? Submit a support
                      ticket with the details.
                    </span>
                  </span>
                </a>
              </div>
            </div>

            {/* Right Column: Message Form */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl border border-slate-100 bg-white p-6 sm:p-9 shadow-xl">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="space-y-1">
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                      Send us a message
                    </h3>
                    <p className="text-sm text-slate-600">
                      Fill out the form below to get started.
                    </p>
                  </div>
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#efe8ff] text-[#5958ed]">
                    <MessageCircle className="size-5" />
                  </span>
                </div>

                {submitted ? (
                  <div className="py-12 text-center space-y-4">
                    <div className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                      <CheckCircle2 className="size-8" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-900">
                      Message received!
                    </h4>
                    <p className="text-sm text-slate-600 max-w-sm mx-auto">
                      Thanks for reaching out. We&apos;ve sent a confirmation to{" "}
                      <span className="font-semibold text-slate-900">
                        {form.email}
                      </span>
                      . We&apos;ll be in touch shortly.
                    </p>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="btn btn-sm btn-ghost text-[#5958ed] font-semibold"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5 pt-5">
                    {/* Row 1: Full name & Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5 text-left">
                        <label
                          htmlFor="fullName"
                          className="block font-semibold text-slate-700"
                        >
                          Full name
                        </label>
                        <input
                          id="fullName"
                          type="text"
                          placeholder="Enter your full name"
                          value={form.fullName}
                          onChange={(e) =>
                            setForm({ ...form, fullName: e.target.value })
                          }
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-[#5958ed] focus:bg-white focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5 text-left">
                        <label
                          htmlFor="email"
                          className="block font-semibold text-slate-700"
                        >
                          Email address
                        </label>
                        <input
                          id="email"
                          type="email"
                          placeholder="you@company.com"
                          value={form.email}
                          onChange={(e) =>
                            setForm({ ...form, email: e.target.value })
                          }
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-[#5958ed] focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Enquiry type */}
                    <div className="space-y-1.5 text-left">
                      <label
                        htmlFor="enquiry"
                        className="block font-semibold text-slate-700"
                      >
                        What is your enquiry about?
                      </label>
                      <select
                        id="enquiry"
                        value={form.enquiry}
                        onChange={(e) =>
                          setForm({ ...form, enquiry: e.target.value })
                        }
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-700 transition focus:border-[#5958ed] focus:bg-white focus:outline-none"
                      >
                        <option value="">Select an enquiry type</option>
                        {enquiryTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Message */}
                    <div className="space-y-1.5 text-left">
                      <label
                        htmlFor="message"
                        className="block font-semibold text-slate-700"
                      >
                        Your message
                      </label>
                      <textarea
                        id="message"
                        rows={5}
                        placeholder="Tell us a little about what you need..."
                        value={form.message}
                        onChange={(e) =>
                          setForm({ ...form, message: e.target.value })
                        }
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 text-sm text-slate-900 transition focus:border-[#5958ed] focus:bg-white focus:outline-none resize-none"
                      />
                    </div>

                    {/* Submit */}
                    <div className="pt-1">
                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#5958ed] py-3.5 text-sm font-semibold text-white shadow-md shadow-[#5958ed]/25 transition-all hover:bg-[#4b4ad4] hover:shadow-lg disabled:opacity-70"
                      >
                        <span>{loading ? "Sending..." : "Send message"}</span>
                        <ArrowRight className="size-4" />
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      <LandingFooter />
    </div>
  );
}

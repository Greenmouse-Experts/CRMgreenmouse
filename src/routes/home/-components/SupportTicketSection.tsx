import { useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function SupportTicketSection() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    product: "",
    subject: "",
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
    if (!form.message.trim()) {
      toast.error("Please describe your request.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success("Support ticket submitted! Our team will follow up shortly.");
    }, 600);
  };

  return (
    <section id="support" className="relative py-20 sm:py-28 bg-[#0f162e] text-white overflow-hidden">
      {/* Background Subtle Dot Pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-15"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left Text & Timeline */}
          <div className="lg:col-span-5 space-y-8 text-left">
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                Tell us what <br />
                you need.
              </h2>
              <p className="text-sm sm:text-base text-slate-300/80 leading-relaxed max-w-md font-normal">
                Questions about the products, or help with one you already use?
                Send one message and the right person will pick it up.
              </p>
            </div>

            {/* Stepper Indicator */}
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-2.5">
                <div className="grid size-6 place-items-center rounded-full bg-[#5958ed] text-xs font-bold text-white">
                  1
                </div>
                <span className="text-xs font-medium text-slate-300">
                  Describe your request
                </span>
              </div>

              <div className="h-px w-8 bg-slate-600" />

              <div className="flex items-center gap-2.5">
                <div className="grid size-6 place-items-center rounded-full bg-slate-700 text-xs font-bold text-slate-300">
                  2
                </div>
                <span className="text-xs font-medium text-slate-400">
                  Our team follows up
                </span>
              </div>
            </div>
          </div>

          {/* Right White Card Form */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl bg-white p-7 sm:p-10 shadow-2xl text-slate-800 border border-slate-100">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6">
                Submit a support ticket
              </h3>

              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle2 className="size-8" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">
                    Ticket received!
                  </h4>
                  <p className="text-sm text-slate-600 max-w-sm mx-auto">
                    We&apos;ve logged your ticket and sent a confirmation to{" "}
                    <span className="font-semibold text-slate-900">
                      {form.email}
                    </span>
                    . An advisor will get in touch shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setForm({
                        fullName: "",
                        email: "",
                        product: "",
                        subject: "",
                        message: "",
                      });
                    }}
                    className="btn btn-sm btn-ghost text-xs text-[#5958ed] font-semibold"
                  >
                    Submit another request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Row 1: Full name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 text-left">
                      <label className="text-xs font-semibold text-slate-700">
                        Full name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Your name"
                        value={form.fullName}
                        onChange={(e) =>
                          setForm({ ...form, fullName: e.target.value })
                        }
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-[#5958ed] focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="text-xs font-semibold text-slate-700">
                        Email address
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="you@company.com"
                        value={form.email}
                        onChange={(e) =>
                          setForm({ ...form, email: e.target.value })
                        }
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-[#5958ed] focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Row 2: Product & Subject */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 text-left">
                      <label className="text-xs font-semibold text-slate-700">
                        Product
                      </label>
                      <select
                        value={form.product}
                        onChange={(e) =>
                          setForm({ ...form, product: e.target.value })
                        }
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-700 transition focus:border-[#5958ed] focus:bg-white focus:outline-none"
                      >
                        <option value="">Select a product</option>
                        <option value="Kinovia CRM">KINOVIA CRM</option>
                        <option value="Ent-Ext App">Ent-Ext App</option>
                        <option value="Logistics">Logistics</option>
                        <option value="General Inquiry">General Inquiry</option>
                      </select>
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="text-xs font-semibold text-slate-700">
                        Subject
                      </label>
                      <input
                        type="text"
                        placeholder="What is this about?"
                        value={form.subject}
                        onChange={(e) =>
                          setForm({ ...form, subject: e.target.value })
                        }
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-[#5958ed] focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Row 3: Message textarea */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-semibold text-slate-700">
                      Tell us more
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Describe your issue or question..."
                      value={form.message}
                      onChange={(e) =>
                        setForm({ ...form, message: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 text-sm text-slate-900 transition focus:border-[#5958ed] focus:bg-white focus:outline-none resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
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
      </div>
    </section>
  );
}

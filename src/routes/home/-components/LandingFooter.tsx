import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function LandingFooter() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }
    toast.info("Thanks for your interest — newsletter signup isn't connected yet.");
    setEmail("");
  };

  return (
    <footer className="border-t border-slate-100 bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Brand / intro */}
          <div>
            <Link to="/" className="inline-flex items-center gap-1">
              <span className="text-xl font-black tracking-tight text-slate-900">
                <span className="text-[#5958ed]">K</span>INOVIA
                <span className="text-[#5958ed]">.</span>
              </span>
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-slate-500">
              Business solutions for better customer relationships, connected
              operations, and digital commerce.
            </p>
          </div>

          {/* Newsletter */}
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Stay in the loop.
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Get occasional product news and updates from KINOVIA.
            </p>
            <form
              onSubmit={handleSubscribe}
              className="mt-5 flex flex-col gap-3 sm:flex-row"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                aria-label="Email address"
                className="input input-bordered h-12 w-full flex-1 rounded-xl border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#5958ed] focus:bg-white"
              />
              <button
                type="submit"
                className="btn h-12 shrink-0 gap-2 rounded-xl border-0 bg-[#5958ed] px-6 text-sm font-semibold text-white shadow-sm shadow-[#5958ed]/25 hover:bg-[#4b4ad4]"
              >
                Subscribe
                <ArrowRight className="size-4" />
              </button>
            </form>
          </div>
        </div>

        <div className="my-10 border-t border-slate-200" />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <nav className="flex flex-wrap items-center gap-6 text-sm font-medium text-slate-600">
            <Link to="/" className="hover:text-slate-950 transition-colors">
              Home
            </Link>
            <a
              href="/home#solutions"
              className="hover:text-slate-950 transition-colors"
            >
              Products
            </a>
            <Link
              to="/home/faq"
              className="hover:text-slate-950 transition-colors"
            >
              FAQ
            </Link>
            <Link
              to="/home/contact-us"
              className="hover:text-slate-950 transition-colors"
            >
              Contact Us
            </Link>
          </nav>
          <p className="text-xs text-slate-400">
            © 2026 KINOVIA. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

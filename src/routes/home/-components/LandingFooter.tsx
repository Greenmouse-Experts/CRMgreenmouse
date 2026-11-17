import { Link } from "@tanstack/react-router";

export default function LandingFooter() {
  return (
    <footer className="border-t border-slate-100 bg-white py-8 sm:py-10">
      <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Brand/Logo */}
        <Link to="/" className="flex items-center gap-1">
          <span className="text-xl font-black tracking-tight text-slate-900">
            KINOVIA<span className="text-[#5958ed]">.</span>
          </span>
        </Link>

        {/* Links */}
        <nav className="flex items-center gap-6  sm: font-medium text-slate-600">
          <a href="#" className="hover:text-slate-950 transition-colors">
            Home
          </a>
          <a
            href="/home/faq"
            className="hover:text-slate-950 transition-colors"
          >
            FAQs
          </a>
          <a href="#support" className="hover:text-slate-950 transition-colors">
            Contact Us
          </a>
        </nav>
      </div>
    </footer>
  );
}

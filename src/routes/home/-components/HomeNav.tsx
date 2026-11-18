import { Link, useLocation } from "@tanstack/react-router";
import { Menu, X, ArrowRight, LayoutDashboard } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/store/authStore";

export default function HomeNav() {
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const [user] = useAuth();
  const location = useLocation();
  const pathname = location.pathname;

  const dash_route = user?.user.userType.includes("admin")
    ? "/admin"
    : "/tenant";

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Contact us", href: "/home/contact-us" },
    { name: "FAQs", href: "/home/faq" },
  ] as const;

  const isLinkActive = (href: string) => {
    if (href === "/") {
      return pathname === "/" || pathname === "/home" || pathname === "/home/";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header
      ref={navRef}
      className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/85 backdrop-blur-md"
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Brand/Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-black tracking-tight text-slate-900">
            KINOVIA<span className="text-primary">.</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const active = isLinkActive(link.href);
            return (
              <Link
                key={link.name}
                to={link.href}
                className={`font-medium transition-colors ${
                  active
                    ? "text-primary font-semibold"
                    : "text-slate-600 hover:text-slate-950"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          {user ? (
            <Link
              to={dash_route}
              className="btn bg-primary text-white hover:bg-[#4d4ce0] border-0 rounded-full px-5 font-medium gap-1.5 shadow-sm"
            >
              <LayoutDashboard className="size-4" />
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/auth/login"
                search={{ email: "" }}
                className="btn btn-ghost font-medium text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-full px-4"
              >
                Sign In
              </Link>
              <Link
                to="/auth/register"
                className="btn btn-sm bg-primary text-white hover:bg-[#4d4ce0] border-0 rounded-full px-5 font-semibold gap-1.5 shadow-sm shadow-primary/20"
              >
                Get Started
                <ArrowRight className="size-3.5" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden btn btn-ghost btn-circle btn-sm text-slate-700"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-b border-slate-100 bg-white px-4 py-6 shadow-xl space-y-4">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => {
              const active = isLinkActive(link.href);
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`text-base font-medium px-2 py-1 transition-colors ${
                    active
                      ? "text-primary font-semibold"
                      : "text-slate-700 hover:text-slate-950"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
            {user ? (
              <Link
                to={dash_route}
                onClick={() => setIsOpen(false)}
                className="btn bg-primary text-white hover:bg-[#4d4ce0] border-0 rounded-full w-full justify-center"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  search={{ email: "" }}
                  onClick={() => setIsOpen(false)}
                  className="btn btn-outline border-slate-300 text-slate-700 rounded-full w-full"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth/register"
                  onClick={() => setIsOpen(false)}
                  className="btn bg-primary text-white hover:bg-[#4d4ce0] border-0 rounded-full w-full justify-center"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import HomeNav from "./-components/HomeNav";
import Hero from "./-components/Hero";
import ConnectedSessions from "./-components/ConnectedSessions";
import TogetherInOnePlace from "./-components/TogetherInOnePlace";
import AllInOneSection from "./-components/AllInOneSection";
import SupportTicketSection from "./-components/SupportTicketSection";
import FaqSection from "./-components/FaqSection";
import CtaBanner from "./-components/CtaBanner";
import LandingFooter from "./-components/LandingFooter";

export const Route = createFileRoute("/home/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-[#5958ed]/20 selection:text-[#5958ed]">
      {/* Navigation Bar */}
      <HomeNav />

      <main>
        {/* Section 1: Hero */}
        <Hero />

        {/* Section 2: Three Solutions. One Connected Experience (Interactive Carousel) */}
        <ConnectedSessions />

        {/* Section 3: Bring Your Business Tools Together In One Place */}
        <TogetherInOnePlace />

        {/* Section 4: Manage your entire business — all in one place */}
        <AllInOneSection />

        {/* Section 5: Tell us what you need / Support ticket */}
        <SupportTicketSection />

        {/* Section 6: Frequently asked questions */}
        <FaqSection />

        {/* Section 7: Smarter tools banner */}
        <CtaBanner />
      </main>

      {/* Section 8: Footer */}
      <LandingFooter />
    </div>
  );
}

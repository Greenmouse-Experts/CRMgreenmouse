import { createFileRoute } from "@tanstack/react-router";
import HomeNav from "./-components/HomeNav";
import Hero from "./-components/Hero";
import Features from "./-components/Features";
import Benefits from "./-components/Benefits";
import LandingFooter from "./-components/LandingFooter";

export const Route = createFileRoute("/home/")({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      <HomeNav />
      <main>
        <Hero />
        <Features />
        <Benefits />
        <section id="get-started" className="scroll-mt-20 py-20 sm:py-24 pt-0">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-16 text-center text-primary-content sm:px-12 [&_h2]:mx-auto [&_h2]:max-w-2xl [&_h2]:text-3xl [&_h2]:font-extrabold [&_h2]:tracking-tight sm:[&_h2]:text-4xl [&_p]:mx-auto [&_p]:mt-4 [&_p]:max-w-xl [&_p]:text-primary-content/80">
              <h2>Ready to see your whole business in one place?</h2>
              <p>
                Set up Kinova CRM in minutes. Add your team, import your
                customers, and start tracking everything that matters — today.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3 justify-center">
                <a
                  className="btn px-8 border-0 bg-base-100 text-primary hover:bg-base-200"
                  href="/auth/register"
                >
                  Start with Kinova CRM <span aria-hidden="true">→</span>
                </a>
                <a
                  className="btn px-8 border-primary-content/40 bg-transparent text-primary-content hover:bg-primary-content/10"
                  href="#features"
                >
                  Explore features
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}

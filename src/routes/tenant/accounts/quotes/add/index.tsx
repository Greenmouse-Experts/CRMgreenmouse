import { createFileRoute } from "@tanstack/react-router";
import SimpleTitle from "@/components/SimpleTitle";
import QuoteForm from "../-components/QuoteForm";

export const Route = createFileRoute("/tenant/accounts/quotes/add/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      <SimpleTitle title="Create Quote" backBtn />
      <QuoteForm />
    </div>
  );
}

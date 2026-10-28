import { createFileRoute } from "@tanstack/react-router";
import SimpleTitle from "@/components/SimpleTitle";
import PageLoader from "@/components/layout/PageLoader";
import { useQuote } from "@/api/salesApi";
import QuoteForm from "../-components/QuoteForm";

export const Route = createFileRoute("/tenant/accounts/quotes/$id/edit")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const query = useQuote(id);

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      <SimpleTitle title="Edit Quote" backBtn />
      <PageLoader query={query}>
        {query.data && <QuoteForm key={query.data.id} quote={query.data} />}
      </PageLoader>
    </div>
  );
}

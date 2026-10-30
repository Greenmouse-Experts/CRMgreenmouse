import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import CustomTable, { type columnType } from "@/components/tables/CustomTable";
import type { Actions } from "@/components/tables/pop-up";
import SimpleContainer from "@/components/SimpleContainer";
import PageHeader from "@/components/Headers/PageHeader";
import ContainerRow from "@/components/ContainerRow";
import PageLoader from "@/components/layout/PageLoader";
import { useSearch } from "@/stores/data";
import { useQuotes, useDeleteQuote, type Quote } from "@/api/salesApi";

export const Route = createFileRoute("/tenant/accounts/quotes/")({
  component: RouteComponent,
});

const getErrorMessage = (error: unknown, fallback: string) => {
  const message = (error as { response?: { data?: { message?: string | string[] } } })
    ?.response?.data?.message;
  return (Array.isArray(message) ? message.join(". ") : message) || fallback;
};

const formatAmount = (amount: number) =>
  Number(amount || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const renderStatus = (status: string) => {
  const normalized = (status || "draft").toLowerCase();
  const color =
    normalized === "accepted"
      ? "badge-success"
      : normalized === "rejected" || normalized === "expired"
        ? "badge-error"
        : normalized === "draft"
          ? "badge-ghost"
          : "badge-info";

  return (
    <span className={`badge badge-sm badge-soft font-medium capitalize ${color}`}>
      {normalized.replaceAll("_", " ")}
    </span>
  );
};

function RouteComponent() {
  const navigate = useNavigate();
  const searchProps = useSearch();
  const [status, setStatus] = useState("all");
  const query = useQuotes({
    search: searchProps.search?.trim() || undefined,
    status: status === "all" ? undefined : status,
  });
  const deleteQuote = useDeleteQuote();
  const quotes = query.data ?? [];

  const handleDelete = async (quote: Quote) => {
    if (!window.confirm(`Delete quote for "${quote.clientName}"?`)) return;
    try {
      await deleteQuote.mutateAsync(quote.id);
      toast.success("Quote deleted.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete quote."));
    }
  };

  const columns: columnType<Quote>[] = [
    {
      key: "quoteNumber",
      label: "Quote #",
      render: (value: string, quote: Quote) => (
        <span className="font-medium">{value || `#${quote.id.slice(0, 8)}`}</span>
      ),
    },
    {
      key: "date",
      label: "Date",
      render: (value: string, quote: Quote) => (
        <span className="text-sm text-base-content/70">
          {value || quote.createdAt
            ? new Date(value || quote.createdAt!).toLocaleDateString()
            : "—"}
        </span>
      ),
    },
    {
      key: "clientName",
      label: "Client",
      render: (value: string) => (
        <span className="font-medium text-base-content">{value || "—"}</span>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      render: (value: number) => (
        <span className="tabular-nums font-medium">{formatAmount(value)}</span>
      ),
    },
    {
      key: "expiresAt",
      label: "Expires",
      render: (value: string) => (
        <span className="text-sm text-base-content/70">
          {value ? new Date(value).toLocaleDateString() : "—"}
        </span>
      ),
    },
    {
      key: "description",
      label: "Description",
      render: (value: string) => (
        <span className="block max-w-xs truncate text-sm text-base-content/70" title={value || ""}>
          {value || "—"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => renderStatus(value),
    },
  ];

  const actions: Actions<Quote>[] = [
    {
      key: "edit",
      label: "Edit Quote",
      action: (quote) =>
        navigate({
          to: "/tenant/accounts/quotes/$id/edit",
          params: { id: quote.id },
        }),
    },
    {
      key: "delete",
      label: "Delete Quote",
      render: () => <span className="font-medium text-error">Delete Quote</span>,
      action: handleDelete,
    },
  ];

  return (
    <>
      <PageHeader title="Quotes" description="Create and manage customer quotes.">
        <Link to="/tenant/accounts/quotes/add" className="btn btn-primary btn-sm">
          Add Quote
        </Link>
      </PageHeader>
      <SimpleContainer title={<>Quotes {query.data && `(${query.data.length})`}</>}>
        <ContainerRow searchProps={searchProps} showSearch searchPlaceholder="Search client or quote number...">
          <select
            className="select select-bordered select-sm"
            aria-label="Filter quotes by status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="expired">Expired</option>
            <option value="converted_to_invoice">Converted to invoice</option>
          </select>
        </ContainerRow>
        <PageLoader
          query={query}
          emptyState={{
            title: status === "all" && !searchProps.search ? "No Quotes Yet" : "No matching quotes",
            description: status === "all" && !searchProps.search
              ? "Create a quote to start tracking proposals for your customers."
              : "Try a different search or status.",
            ...(status === "all" && !searchProps.search
              ? { actionText: "Add Quote", onAction: () => navigate({ to: "/tenant/accounts/quotes/add" }) }
              : {}),
          }}
        >
          {() =>
            quotes.length > 0 ? (
              <CustomTable data={quotes} columns={columns} actions={actions} ring={false} />
            ) : (
              <div className="rounded-b-box border border-base-200 bg-base-100 px-4 py-10 text-center text-sm text-base-content/70">
                No quotes match these filters.
              </div>
            )
          }
        </PageLoader>
      </SimpleContainer>
    </>
  );
}

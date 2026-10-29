import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Layers, Plus } from "lucide-react";
import { toast } from "sonner";
import { useAdminTicketModules, useCreateAdminTicketModule } from "@/api/adminSupportApi";
import PageHeader from "@/components/Headers/PageHeader";

export const Route = createFileRoute("/admin/support/modules/")({
  component: RouteComponent,
});

function RouteComponent() {
  const modulesQuery = useAdminTicketModules();
  const createModule = useCreateAdminTicketModule();
  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const moduleLabel = label.trim();
    const moduleValue = value.trim().toLowerCase();
    if (!moduleLabel || !/^[a-z][a-z0-9_-]*$/.test(moduleValue)) {
      toast.error("Enter a name and a key using lowercase letters, numbers, hyphens, or underscores.");
      return;
    }
    if (modulesQuery.data?.some((module) => module.value === moduleValue)) {
      toast.error("That module key already exists.");
      return;
    }
    try {
      await createModule.mutateAsync({ value: moduleValue, label: moduleLabel });
      setLabel("");
      setValue("");
      toast.success("Support module created.");
    } catch (error: any) {
      const message = error?.response?.data?.message;
      toast.error(Array.isArray(message) ? message.join(". ") : message || "Could not create support module.");
    }
  };

  return (
    <section className="mx-auto max-w-5xl space-y-5 pb-10">
      <Link to="/admin/support" className="btn btn-ghost btn-sm -ml-2">
        <ArrowLeft className="size-4" /> Support tickets
      </Link>
      <PageHeader title="Support modules" description="Organize the areas tenants can choose when they create a ticket." />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,1.2fr)]">
        <form onSubmit={submit} className="space-y-4 rounded-box bg-base-100 p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Create module</h2>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Display name</span>
            <input className="input input-bordered w-full" value={label} onChange={(event) => setLabel(event.target.value)} placeholder="e.g. Invoices" required maxLength={80} />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Module key</span>
            <input className="input input-bordered w-full" value={value} onChange={(event) => setValue(event.target.value)} placeholder="e.g. invoices" required maxLength={80} pattern="[a-zA-Z][a-zA-Z0-9_-]*" />
          </label>
          <p className="text-xs text-base-content/70">The key is saved with tickets and should stay stable.</p>
          <button className="btn btn-primary" type="submit" disabled={createModule.isPending}>
            {createModule.isPending ? <span className="loading loading-spinner loading-sm" /> : <Plus className="size-4" />}
            Create module
          </button>
        </form>
        <div className="rounded-box bg-base-100 shadow-sm">
          <h2 className="border-b border-base-200 p-5 text-lg font-semibold">Available modules</h2>
          {modulesQuery.isPending ? (
            <div className="flex min-h-40 items-center justify-center" role="status"><span className="loading loading-spinner" /><span className="sr-only">Loading support modules</span></div>
          ) : modulesQuery.isError ? (
            <div className="space-y-3 p-5 text-sm"><p>Could not load modules.</p><button type="button" className="btn btn-outline btn-sm" onClick={() => modulesQuery.refetch()}>Try again</button></div>
          ) : !modulesQuery.data?.length ? (
            <div className="flex min-h-40 flex-col items-center justify-center gap-2 p-5 text-center text-sm text-base-content/70"><Layers className="size-7" /><p>No support modules yet.</p></div>
          ) : (
            <ul className="divide-y divide-base-200">
              {modulesQuery.data.map((module) => (
                <li key={module.value} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
                  <span className="font-medium">{module.label}</span>
                  <code className="text-xs text-base-content/70">{module.value}</code>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

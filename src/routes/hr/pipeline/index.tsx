import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/Headers/PageHeader";
import PageLoader from "@/components/layout/PageLoader";
import {
  usePipelineStages,
  usePipelineItems,
  usePipelineSummary,
  useCreatePipelineItem,
  useMovePipelineItem,
  type PipelineItem,
} from "@/api/pipelineApi";
import CustomTable from "@/components/tables/CustomTable";
import { Plus, Clock, Users, Calendar, Gift } from "lucide-react";
import { extract_message } from "@/helpers/errors";
import { toast } from "sonner";
import StatCard from "@/components/StatCard";

export const Route = createFileRoute("/hr/pipeline/")({
  component: RouteComponent,
});

function RouteComponent() {
  // Server state
  const stagesQuery = usePipelineStages();
  const itemsQuery = usePipelineItems();
  const summaryQuery = usePipelineSummary();

  const createMutation = useCreatePipelineItem();
  const moveMutation = useMovePipelineItem();

  // Local view state
  const [editingItem, setEditingItem] = useState<PipelineItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<PipelineItem | null>(null);
  const [stageFilter, setStageFilter] = useState<string | undefined>(undefined);

  // Filter items by stage
  const filteredItems = useMemo(() => {
    const all = itemsQuery.data ?? [];
    const itemsWithStage = all.map((it) => ({
      ...it,
      _stageName: it.stageName || (it.stageId ? `Stage ${it.stageId}` : "Unknown"),
    }));
    if (!stageFilter) return itemsWithStage;
    return itemsWithStage.filter(
      (it2) => it2.stageId === stageFilter || it2.stageName === stageFilter,
    );
  }, [itemsQuery.data, stageFilter]);

  // Stage options for filter
  const stageOptions = useMemo(() => {
    const stages = stagesQuery.data ?? [];
    return stages.map((s) => ({
      id: s.id,
      name: s.name || "Unknown Stage",
    }));
  }, [stagesQuery.data]);

  const handleCreateItem = async (payload: {
    name: string;
    email?: string;
    phone?: string;
    stageId: string;
    source?: string;
  }) => {
    await toast.promise(
      createMutation.mutateAsync(payload),
      {
        loading: "Creating pipeline item...",
        success: "Pipeline item created",
        error: (error) => extract_message(error),
      },
    );
  };

  const handleMoveItem = async ({
    id,
    toStageId,
  }: {
    id: string;
    toStageId: string;
  }) => {
    await toast.promise(
      moveMutation.mutateAsync({ id, toStageId }),
      {
        loading: "Moving pipeline item...",
        success: "Pipeline item moved",
        error: (error) => extract_message(error),
      },
    );
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="HR Pipeline"
        description="Track staff candidates and applicants through hiring stages."
      >
        <button
          type="button"
          className="btn btn-sm bg-primary text-white hover:bg-primary/90 border-0 rounded-xl px-4 font-medium gap-1.5 shadow-sm shadow-primary/20"
        >
          <Plus className="size-4" />
          <span>Add to pipeline</span>
        </button>
      </PageHeader>

      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total in Pipeline"
          value={
            <div className="text-2xl font-bold text-primary">
              {summaryQuery.data?.total ?? 0}
            </div>
          }
          desc="Total candidates/applicants across all stages"
          icon={<Plus className="size-4" />}
          variant="primary"
        />
        <StatCard
          title="Open Positions"
          value={
            <div className="text-2xl font-bold text-success">
              {summaryQuery.data?.byStage?.["Open"] ?? 0}
            </div>
          }
          desc="Candidates ready for hire"
          icon={<Users className="size-4" />}
          variant="success"
        />
        <StatCard
          title="Interviewing"
          value={
            <div className="text-2xl font-bold text-warning">
              {summaryQuery.data?.byStage?.["Interview"] ?? 0}
            </div>
          }
          desc="Candidates in interview stage"
          icon={<Calendar className="size-4" />}
          variant="warning"
        />
        <StatCard
          title="Offers Out"
          value={
            <div className="text-2xl font-bold text-info">
              {summaryQuery.data?.byStage?.["Offer"] ?? 0}
            </div>
          }
          desc="Candidates with offers"
          icon={<Gift className="size-4" />}
          variant="info"
        />
      </div>

      {/* Pipeline filter */}
      <div className="card-bg rounded-lg p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            onChange={(e) => setStageFilter(e.target.value)}
            className="flex-1 rounded-border border-input bg-background p-2.5 text-sm shadow-sm"
          >
            <option value="">All Stages</option>
            {stageOptions.map((stage) => (
              <option key={stage.id} value={stage.id}>
                {stage.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setStageFilter(undefined)}
            className="px-3 py-1.5 rounded-sm bg-primary/10 text-primary hover:bg-primary/20 text-sm font-medium"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Pipeline items table */}
      <PageLoader
        query={itemsQuery}
        emptyState={{
          title: "No pipeline items yet",
          description:
            "Add candidates or applicants to the pipeline to track their progress.",
          actionText: "Add to pipeline",
          onAction: () => setEditingItem(null),
        }}
      >
        {(itemsQuery.data ?? []).length > 0 ? (
          <div className="overflow-x-auto">
            <CustomTable
              columns={[
                {
                  key: "name",
                  label: "Name",
                  render: (_, it) => {
                    const displayName =
                      it.name ||
                      `${it.firstName ?? ""} ${it.lastName ?? ""}`.trim() ||
                      it.email ||
                      it.id;
                    return (
                      <div
                        className="font-medium cursor-pointer hover:text-primary"
                        onClick={() => setSelectedItem(it as PipelineItem)}
                      >
                        {displayName}
                      </div>
                    );
                  },
                },
              ]}
              data={filteredItems}
            />
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📊</div>
            <h3 className="text-lg font-medium text-muted-foreground">
              No pipeline items yet
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Add candidates or applicants to start tracking your pipeline.
            </p>
          </div>
        )}
      </PageLoader>

      {/* Create/Edit Modal */}
      <dialog>
        <form
          className="p-6 space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!editingItem) {
              const target = e.target as HTMLFormElement;
              await handleCreateItem({
                name: (target.elements.namedItem("name") as HTMLInputElement)?.value ?? "",
                email: (target.elements.namedItem("email") as HTMLInputElement)?.value || undefined,
                phone: (target.elements.namedItem("phone") as HTMLInputElement)?.value || undefined,
                stageId: (target.elements.namedItem("stageId") as HTMLSelectElement)?.value ?? "",
                source: (target.elements.namedItem("source") as HTMLInputElement)?.value || undefined,
              });
            } else {
              const target = e.target as HTMLFormElement;
              await handleMoveItem({
                id: editingItem.id,
                toStageId: (target.elements.namedItem("stageId") as HTMLSelectElement)?.value ?? "",
              });
              setEditingItem(null);
            }
          }}
        >
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">Name / Candidate Name</label>
            <input
              name="name"
              type="text"
              required
              className="rounded-border border-input bg-background p-2.5 text-sm shadow-sm"
              defaultValue={editingItem?.name ?? ""}
            />
            <label className="text-sm font-medium">Email</label>
            <input
              name="email"
              type="email"
              className="rounded-border border-input bg-background p-2.5 text-sm shadow-sm"
              defaultValue={editingItem?.email ?? ""}
            />
            <label className="text-sm font-medium">Phone</label>
            <input
              name="phone"
              type="tel"
              className="rounded-border border-input bg-background p-2.5 text-sm shadow-sm"
              defaultValue={editingItem?.phone ?? ""}
            />
            <label className="text-sm font-medium">Stage</label>
            <select
              name="stageId"
              className="rounded-border border-input bg-background p-2.5 text-sm shadow-sm"
            >
              <option value="">Select stage</option>
              {stageOptions.map((stage) => (
                <option
                  key={stage.id}
                  value={stage.id}
                  selected={editingItem?.stageId === stage.id}
                >
                  {stage.name}
                </option>
              ))}
            </select>
            <label className="text-sm font-medium">Source</label>
            <input
              name="source"
              type="text"
              placeholder="e.g., Job Board, Referral, LinkedIn"
              className="rounded-border border-input bg-background p-2.5 text-sm shadow-sm"
              defaultValue={editingItem?.source ?? ""}
            />
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 btn btn-sm bg-primary text-white hover:bg-primary/90 border-0 rounded-xl px-4 font-medium gap-1.5 shadow-sm shadow-primary/20"
              >
                {editingItem ? "Update Stage" : "Add to Pipeline"}
              </button>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="flex-1 btn btn-sm outline-button px-4 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </dialog>

      {/* Selected item detail */}
      {selectedItem && (
        <div className="pt-6">
          <PageHeader
            title="Pipeline Item Detail"
            description={`${selectedItem.name || "Candidate"} — Progress tracking`}
          >
            <button
              type="button"
              className="absolute right-4 top-4 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 p-2"
            >
              ⓧ
            </button>
          </PageHeader>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-primary/5">
              <p className="font-medium">{selectedItem.name || "Unknown"}</p>
              <p className="text-sm text-muted-foreground">
                {selectedItem.email || selectedItem.phone
                  ? "Contact: " + (selectedItem.email ? selectedItem.email : selectedItem.phone)
                  : "No contact info"}
              </p>
              <p className="text-sm text-muted-foreground">Source: {selectedItem.source || "Not specified"}</p>
            </div>
            <StatCard
              title="Current Stage"
              value={selectedItem.stageName || "Unknown"}
              desc="Pipeline stage"
              icon={<Clock className="size-4" />}
              variant="primary"
            />
            <div>
              <button
                title="Move to another stage"
                className="btn btn-sm bg-primary text-white hover:bg-primary/90 border-0 rounded-xl px-4 font-medium gap-1.5 shadow-sm shadow-primary/20"
                onClick={() => setEditingItem(selectedItem)}
              >
                <Plus className="size-3" /> Move stage
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/Headers/PageHeader";
import PageLoader from "@/components/layout/PageLoader";
import StatCard from "@/components/StatCard";
import CustomTable, { type columnType } from "@/components/tables/CustomTable";
import {
  normalizeKanbanColumns,
  reorderStageIds,
  useDeletePipeline,
  useDeletePipelineDeal,
  useDeletePipelineStage,
  useMarkDealLost,
  useMarkDealWon,
  useMoveDealStage,
  usePipeline,
  usePipelineDeals,
  usePipelineKanban,
  usePipelines,
  useReorderPipelineStages,
  type Pipeline,
  type PipelineDeal,
  type PipelineStage,
} from "@/api/pipelineApi";
import { extract_message } from "@/helpers/errors";
import { toast } from "sonner";
import {
  CheckCircle2,
  CircleDollarSign,
  Kanban,
  Layers,
  List,
  Pencil,
  Plus,
  Search,
  Trash2,
  TrendingUp,
  XCircle,
} from "lucide-react";
import PipelineKanbanBoard from "./-components/PipelineKanbanBoard";
import PipelineStagesManager from "./-components/PipelineStagesManager";
import {
  DealFormModal,
  DeleteConfirmModal,
  PipelineFormModal,
  StageFormModal,
} from "./-components/PipelineModals";

export const Route = createFileRoute("/hr/pipeline/")({
  component: RouteComponent,
});

type ActiveTab = "kanban" | "deals" | "stages";

type DeleteTarget =
  | { kind: "pipeline"; item: Pipeline }
  | { kind: "stage"; item: PipelineStage }
  | { kind: "deal"; item: PipelineDeal }
  | null;

const formatMoney = (value: number, currency = "NGN") => {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value || 0);
  } catch {
    return `${currency} ${(value || 0).toLocaleString()}`;
  }
};

function RouteComponent() {
  const pipelinesQuery = usePipelines();
  const pipelines = pipelinesQuery.data ?? [];

  const [selectedPipelineId, setSelectedPipelineId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<ActiveTab>("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modal state
  const [isPipelineModalOpen, setIsPipelineModalOpen] = useState(false);
  const [editingPipeline, setEditingPipeline] = useState<Pipeline | null>(null);

  const [isStageModalOpen, setIsStageModalOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<PipelineStage | null>(null);

  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<PipelineDeal | null>(null);
  const [defaultDealStageId, setDefaultDealStageId] = useState<string>("");

  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);

  // Keep selectedPipelineId valid as pipelines load or get deleted
  useEffect(() => {
    if (pipelines.length === 0) {
      if (selectedPipelineId) setSelectedPipelineId("");
      return;
    }
    const stillExists = pipelines.some((p) => p.id === selectedPipelineId);
    if (!stillExists) {
      setSelectedPipelineId(pipelines[0].id);
    }
  }, [pipelines, selectedPipelineId]);

  const activePipelineSummary =
    pipelines.find((p) => p.id === selectedPipelineId) ?? pipelines[0] ?? null;

  const pipelineDetailQuery = usePipeline(activePipelineSummary?.id);
  const activePipeline = pipelineDetailQuery.data ?? activePipelineSummary;
  const activeStages = useMemo(
    () => [...(activePipeline?.stages ?? [])].sort((a, b) => a.order - b.order),
    [activePipeline?.stages],
  );

  const kanbanQuery = usePipelineKanban(activePipeline?.id, activeStages);
  const dealsQuery = usePipelineDeals(
    activePipeline?.id ? { pipelineId: activePipeline.id } : undefined,
  );

  const deletePipelineMutation = useDeletePipeline();
  const deleteStageMutation = useDeletePipelineStage();
  const deleteDealMutation = useDeletePipelineDeal();
  const reorderStagesMutation = useReorderPipelineStages();
  const moveDealMutation = useMoveDealStage();
  const markWonMutation = useMarkDealWon();
  const markLostMutation = useMarkDealLost();

  const isMutating =
    deletePipelineMutation.isPending ||
    deleteStageMutation.isPending ||
    deleteDealMutation.isPending ||
    reorderStagesMutation.isPending ||
    moveDealMutation.isPending ||
    markWonMutation.isPending ||
    markLostMutation.isPending;

  // Combine deals from /deals and kanban columns cleanly
  const allPipelineDeals = useMemo(() => {
    const listDeals = dealsQuery.data ?? [];
    if (listDeals.length > 0) return listDeals;
    return (kanbanQuery.data ?? []).flatMap((col) => col.deals);
  }, [dealsQuery.data, kanbanQuery.data]);

  const filteredDeals = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allPipelineDeals.filter((deal) => {
      if (statusFilter !== "all" && deal.status !== statusFilter) return false;
      if (!q) return true;
      return (
        deal.name.toLowerCase().includes(q) ||
        (deal.notes ?? "").toLowerCase().includes(q) ||
        (deal.stageName ?? "").toLowerCase().includes(q)
      );
    });
  }, [allPipelineDeals, searchQuery, statusFilter]);

  const filteredKanbanColumns = useMemo(() => {
    const baseColumns =
      kanbanQuery.data && kanbanQuery.data.length > 0
        ? kanbanQuery.data
        : normalizeKanbanColumns({ deals: allPipelineDeals }, activeStages);

    const dealIds = new Set(filteredDeals.map((d) => d.id));
    const hasFilter = searchQuery.trim() !== "" || statusFilter !== "all";

    return baseColumns.map((col) => {
      const deals = hasFilter
        ? col.deals.filter((d) => dealIds.has(d.id))
        : col.deals;
      const totalValue = deals.reduce((sum, d) => sum + d.value, 0);
      return { ...col, deals, totalValue };
    });
  }, [
    kanbanQuery.data,
    allPipelineDeals,
    activeStages,
    filteredDeals,
    searchQuery,
    statusFilter,
  ]);

  const stageNameLookup = useMemo(() => {
    const map: Record<string, PipelineStage> = {};
    for (const s of activeStages) {
      map[s.id] = s;
    }
    return map;
  }, [activeStages]);

  const totalPipelineValue = useMemo(
    () => allPipelineDeals.reduce((sum, d) => sum + (d.value || 0), 0),
    [allPipelineDeals],
  );
  const wonDealsCount = useMemo(
    () => allPipelineDeals.filter((d) => d.status === "won").length,
    [allPipelineDeals],
  );
  const primaryCurrency = allPipelineDeals[0]?.currency || "NGN";

  const handleReorderStages = async (fromIndex: number, toIndex: number) => {
    if (!activePipeline?.id) return;
    const stageIds = reorderStageIds(activeStages, fromIndex, toIndex);
    await toast.promise(
      reorderStagesMutation.mutateAsync({
        pipelineId: activePipeline.id,
        stageIds,
      }),
      {
        loading: "Reordering stages...",
        success: "Stage order updated",
        error: (err) => extract_message(err),
      },
    ).unwrap();
  };

  const handleMoveDeal = async (dealId: string, stageId: string) => {
    await toast.promise(moveDealMutation.mutateAsync({ id: dealId, stageId }), {
      loading: "Moving deal...",
      success: "Deal moved to stage",
      error: (err) => extract_message(err),
    });
  };

  const handleMarkWon = async (dealId: string) => {
    await toast.promise(markWonMutation.mutateAsync(dealId), {
      loading: "Marking deal as won...",
      success: "Deal marked as won",
      error: (err) => extract_message(err),
    });
  };

  const handleMarkLost = async (dealId: string) => {
    await toast.promise(markLostMutation.mutateAsync(dealId), {
      loading: "Marking deal as lost...",
      success: "Deal marked as lost",
      error: (err) => extract_message(err),
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.kind === "pipeline") {
        await toast.promise(
          deletePipelineMutation.mutateAsync(deleteTarget.item.id),
          {
            loading: "Deleting pipeline...",
            success: "Pipeline deleted",
            error: (err) => extract_message(err),
          },
        ).unwrap();
      } else if (deleteTarget.kind === "stage" && activePipeline?.id) {
        await toast.promise(
          deleteStageMutation.mutateAsync({
            pipelineId: activePipeline.id,
            stageId: deleteTarget.item.id,
          }),
          {
            loading: "Deleting stage...",
            success: "Stage deleted",
            error: (err) => extract_message(err),
          },
        ).unwrap();
      } else if (deleteTarget.kind === "deal") {
        await toast.promise(
          deleteDealMutation.mutateAsync(deleteTarget.item.id),
          {
            loading: "Deleting deal...",
            success: "Deal deleted",
            error: (err) => extract_message(err),
          },
        ).unwrap();
      }
      setDeleteTarget(null);
    } catch {
      // toast.promise handles error display
    }
  };

  const dealColumns: columnType<PipelineDeal>[] = [
    {
      key: "name",
      label: "Deal",
      render: (_, deal) => (
        <div>
          <div className="font-semibold text-base-content">{deal.name}</div>
          {deal.notes && (
            <div className="text-xs text-base-content/60 truncate max-w-xs">
              {deal.notes}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "stageId",
      label: "Stage",
      render: (_, deal) => {
        const stage = stageNameLookup[deal.stageId];
        return (
          <div className="flex items-center gap-2">
            <span
              className="size-2.5 rounded-full shrink-0"
              style={{ backgroundColor: stage?.color || "#3B82F6" }}
            />
            <span className="text-sm font-medium">
              {stage?.name || deal.stageName || "Unknown Stage"}
            </span>
          </div>
        );
      },
    },
    {
      key: "value",
      label: "Value",
      render: (_, deal) => (
        <span className="font-semibold text-primary">
          {formatMoney(deal.value, deal.currency)}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (_, deal) => {
        const badgeClass =
          deal.status === "won"
            ? "badge-success"
            : deal.status === "lost"
              ? "badge-error"
              : deal.status === "on_hold"
                ? "badge-warning"
                : "badge-info";
        return (
          <span className={`badge badge-sm capitalize ${badgeClass}`}>
            {deal.status.replace("_", " ")}
          </span>
        );
      },
    },
    {
      key: "expectedCloseDate",
      label: "Expected Close",
      render: (_, deal) =>
        deal.expectedCloseDate
          ? String(deal.expectedCloseDate).slice(0, 10)
          : "—",
    },
    {
      key: "action",
      label: "Actions",
      render: (_, deal) => (
        <div
          className="flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          {deal.status !== "won" && (
            <button
              type="button"
              disabled={isMutating}
              onClick={() => handleMarkWon(deal.id)}
              className="btn btn-ghost btn-xs text-success"
              title="Mark Won"
            >
              <CheckCircle2 className="size-4" />
            </button>
          )}
          {deal.status !== "lost" && (
            <button
              type="button"
              disabled={isMutating}
              onClick={() => handleMarkLost(deal.id)}
              className="btn btn-ghost btn-xs text-error"
              title="Mark Lost"
            >
              <XCircle className="size-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setEditingDeal(deal);
              setDefaultDealStageId(deal.stageId);
              setIsDealModalOpen(true);
            }}
            className="btn btn-ghost btn-xs"
            title="Edit deal"
          >
            <Pencil className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget({ kind: "deal", item: deal })}
            className="btn btn-ghost btn-xs text-error"
            title="Delete deal"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Pipelines"
        description="Manage deal pipelines, configure ordered stages, and track opportunities on your Kanban board."
      >
        <button
          type="button"
          onClick={() => {
            setEditingPipeline(null);
            setIsPipelineModalOpen(true);
          }}
          className="btn btn-sm btn-outline border-base-300 rounded-xl px-4 font-medium gap-1.5"
        >
          <Plus className="size-4" />
          <span>New Pipeline</span>
        </button>

        {activePipeline && (
          <button
            type="button"
            onClick={() => {
              if (activeStages.length === 0) {
                setEditingStage(null);
                setIsStageModalOpen(true);
                toast.info("Add a stage before creating a deal");
                return;
              }
              setEditingDeal(null);
              setDefaultDealStageId(activeStages[0]?.id ?? "");
              setIsDealModalOpen(true);
            }}
            className="btn btn-sm bg-primary text-white hover:bg-primary/90 border-0 rounded-xl px-4 font-medium gap-1.5 shadow-sm shadow-primary/20"
          >
            <Plus className="size-4" />
            <span>Add Deal</span>
          </button>
        )}
      </PageHeader>

      <PageLoader
        query={pipelinesQuery}
        loadingText="Loading pipelines..."
        emptyState={{
          title: "No pipelines yet",
          description:
            "Create your first pipeline and add stages to track deals from qualification to close.",
          actionText: "Create Pipeline",
          onAction: () => {
            setEditingPipeline(null);
            setIsPipelineModalOpen(true);
          },
        }}
      >
        {() => (
          <div className="space-y-6">
            {/* Pipeline Selector Bar */}
            <div className="card bg-base-100 border border-base-200 shadow-sm p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {pipelines.map((p) => {
                    const isSelected = p.id === activePipeline?.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedPipelineId(p.id)}
                        className={`btn btn-sm rounded-xl gap-2 ${
                          isSelected
                            ? "bg-primary text-white border-0 hover:bg-primary/90"
                            : "btn-ghost bg-base-200/60 hover:bg-base-200"
                        }`}
                      >
                        <span>{p.name}</span>
                        {!p.isActive && (
                          <span className="badge badge-xs badge-warning">
                            Inactive
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {activePipeline && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingStage(null);
                        setIsStageModalOpen(true);
                      }}
                      className="btn btn-xs btn-outline border-base-300 rounded-lg gap-1"
                    >
                      <Plus className="size-3.5" />
                      Add Stage
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPipeline(activePipeline);
                        setIsPipelineModalOpen(true);
                      }}
                      className="btn btn-xs btn-ghost btn-square"
                      title="Edit pipeline"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDeleteTarget({
                          kind: "pipeline",
                          item: activePipeline,
                        })
                      }
                      className="btn btn-xs btn-ghost btn-square text-error"
                      title="Delete pipeline"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {activePipeline?.description && (
                <p className="text-sm text-base-content/70">
                  {activePipeline.description}
                </p>
              )}
            </div>

            {/* Summary KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Pipelines"
                value={pipelines.length}
                variant="primary"
                icon={<Kanban className="size-5" />}
              />
              <StatCard
                title="Configured Stages"
                value={activeStages.length}
                variant="info"
                icon={<Layers className="size-5" />}
              />
              <StatCard
                title="Pipeline Deals"
                value={`${allPipelineDeals.length} (${wonDealsCount} won)`}
                variant="success"
                icon={<TrendingUp className="size-5" />}
              />
              <StatCard
                title="Total Deal Value"
                value={formatMoney(totalPipelineValue, primaryCurrency)}
                variant="warning"
                icon={<CircleDollarSign className="size-5" />}
              />
            </div>

            {/* View Tabs & Filters */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 card bg-base-100 border border-base-200 shadow-sm p-3.5">
              <div className="tabs tabs-box bg-base-200/70 p-1 rounded-xl w-fit">
                <button
                  type="button"
                  onClick={() => setActiveTab("kanban")}
                  className={`tab tab-sm rounded-lg gap-1.5 ${
                    activeTab === "kanban"
                      ? "tab-active bg-base-100 font-semibold shadow-xs"
                      : ""
                  }`}
                >
                  <Kanban className="size-4" />
                  Kanban Board
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("deals")}
                  className={`tab tab-sm rounded-lg gap-1.5 ${
                    activeTab === "deals"
                      ? "tab-active bg-base-100 font-semibold shadow-xs"
                      : ""
                  }`}
                >
                  <List className="size-4" />
                  Deals Table
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("stages")}
                  className={`tab tab-sm rounded-lg gap-1.5 ${
                    activeTab === "stages"
                      ? "tab-active bg-base-100 font-semibold shadow-xs"
                      : ""
                  }`}
                >
                  <Layers className="size-4" />
                  Stages ({activeStages.length})
                </button>
              </div>

              {activeTab !== "stages" && (
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="size-4 text-base-content/50 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search deals..."
                      className="input input-sm input-bordered w-full pl-9 rounded-xl"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="select select-sm select-bordered rounded-xl"
                  >
                    <option value="all">All Statuses</option>
                    <option value="open">Open</option>
                    <option value="won">Won</option>
                    <option value="lost">Lost</option>
                    <option value="on_hold">On Hold</option>
                  </select>
                </div>
              )}
            </div>

            {/* Active Tab Content */}
            {activeTab === "kanban" && (
              <PipelineKanbanBoard
                columns={filteredKanbanColumns}
                stages={activeStages}
                isBusy={isMutating}
                onAddStage={() => {
                  setEditingStage(null);
                  setIsStageModalOpen(true);
                }}
                onEditStage={(stage) => {
                  setEditingStage(stage);
                  setIsStageModalOpen(true);
                }}
                onMoveStageOrder={handleReorderStages}
                onAddDealInStage={(stageId) => {
                  setEditingDeal(null);
                  setDefaultDealStageId(stageId);
                  setIsDealModalOpen(true);
                }}
                onEditDeal={(deal) => {
                  setEditingDeal(deal);
                  setDefaultDealStageId(deal.stageId);
                  setIsDealModalOpen(true);
                }}
                onDeleteDeal={(deal) =>
                  setDeleteTarget({ kind: "deal", item: deal })
                }
                onMoveDeal={handleMoveDeal}
                onMarkWon={handleMarkWon}
                onMarkLost={handleMarkLost}
              />
            )}

            {activeTab === "deals" &&
              (filteredDeals.length > 0 ? (
                <CustomTable
                  columns={dealColumns}
                  data={filteredDeals}
                  onRowClick={(deal) => {
                    setEditingDeal(deal);
                    setDefaultDealStageId(deal.stageId);
                    setIsDealModalOpen(true);
                  }}
                />
              ) : (
                <div className="card bg-base-100 border border-base-200 p-10 text-center space-y-3">
                  <h3 className="text-lg font-semibold text-base-content">
                    No deals match the current filters
                  </h3>
                  <p className="text-sm text-base-content/60">
                    Adjust your search/status filter or add a new deal to this
                    pipeline.
                  </p>
                </div>
              ))}

            {activeTab === "stages" && (
              <PipelineStagesManager
                stages={activeStages}
                isBusy={isMutating}
                onAddStage={() => {
                  setEditingStage(null);
                  setIsStageModalOpen(true);
                }}
                onEditStage={(stage) => {
                  setEditingStage(stage);
                  setIsStageModalOpen(true);
                }}
                onDeleteStage={(stage) =>
                  setDeleteTarget({ kind: "stage", item: stage })
                }
                onReorder={handleReorderStages}
              />
            )}
          </div>
        )}
      </PageLoader>

      {/* Modals */}
      <PipelineFormModal
        isOpen={isPipelineModalOpen}
        onClose={() => {
          setIsPipelineModalOpen(false);
          setEditingPipeline(null);
        }}
        editingPipeline={editingPipeline}
        onSuccess={(saved) => {
          if (saved?.id) setSelectedPipelineId(saved.id);
        }}
      />

      {activePipeline?.id && (
        <>
          <StageFormModal
            isOpen={isStageModalOpen}
            onClose={() => {
              setIsStageModalOpen(false);
              setEditingStage(null);
            }}
            pipelineId={activePipeline.id}
            editingStage={editingStage}
          />

          <DealFormModal
            isOpen={isDealModalOpen}
            onClose={() => {
              setIsDealModalOpen(false);
              setEditingDeal(null);
            }}
            pipelineId={activePipeline.id}
            stages={activeStages}
            defaultStageId={defaultDealStageId}
            editingDeal={editingDeal}
          />
        </>
      )}

      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        isPending={isMutating}
        title={
          deleteTarget?.kind === "pipeline"
            ? "Delete Pipeline"
            : deleteTarget?.kind === "stage"
              ? "Delete Stage"
              : "Delete Deal"
        }
        description={
          deleteTarget?.kind === "pipeline"
            ? `Are you sure you want to delete "${deleteTarget.item.name}"? This action cannot be undone.`
            : deleteTarget?.kind === "stage"
              ? `Are you sure you want to delete stage "${deleteTarget.item.name}"?`
              : deleteTarget?.kind === "deal"
                ? `Are you sure you want to delete deal "${deleteTarget.item.name}"?`
                : ""
        }
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

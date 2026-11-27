import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Pencil,
  Plus,
  Trash2,
  XCircle,
} from "lucide-react";
import type {
  PipelineDeal,
  PipelineKanbanColumn,
  PipelineStage,
} from "@/api/pipelineApi";

interface PipelineKanbanBoardProps {
  columns: PipelineKanbanColumn[];
  stages: PipelineStage[];
  onAddStage: () => void;
  onEditStage: (stage: PipelineStage) => void;
  onMoveStageOrder: (fromIndex: number, toIndex: number) => void;
  onAddDealInStage: (stageId: string) => void;
  onEditDeal: (deal: PipelineDeal) => void;
  onDeleteDeal: (deal: PipelineDeal) => void;
  onMoveDeal: (dealId: string, stageId: string) => void;
  onMarkWon: (dealId: string) => void;
  onMarkLost: (dealId: string) => void;
  isBusy?: boolean;
}

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

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case "won":
      return "badge-success text-success-content";
    case "lost":
      return "badge-error text-error-content";
    case "on_hold":
      return "badge-warning text-warning-content";
    default:
      return "badge-info text-info-content";
  }
};

export default function PipelineKanbanBoard({
  columns,
  stages,
  onAddStage,
  onEditStage,
  onMoveStageOrder,
  onAddDealInStage,
  onEditDeal,
  onDeleteDeal,
  onMoveDeal,
  onMarkWon,
  onMarkLost,
  isBusy = false,
}: PipelineKanbanBoardProps) {
  if (columns.length === 0) {
    return (
      <div className="card bg-base-100 border border-base-200 p-10 text-center space-y-3">
        <h3 className="text-lg font-semibold text-base-content">
          No stages configured for this pipeline
        </h3>
        <p className="text-sm text-base-content/70 max-w-md mx-auto">
          Add stages like Qualified, Proposal Sent, and Closed Won to start
          organizing deals on your Kanban board.
        </p>
        <div>
          <button
            type="button"
            onClick={onAddStage}
            className="btn btn-sm bg-primary text-white hover:bg-primary/90 border-0 rounded-xl px-4 gap-1.5"
          >
            <Plus className="size-4" />
            Add First Stage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 pt-1">
      {columns.map((column, idx) => {
        const { stage, deals, totalValue } = column;
        const primaryCurrency = deals[0]?.currency || "NGN";
        const canMoveLeft = idx > 0;
        const canMoveRight = idx < columns.length - 1;

        return (
          <div
            key={stage.id}
            className="w-80 shrink-0 rounded-2xl bg-base-100 border border-base-200 shadow-sm flex flex-col max-h-[640px]"
          >
            {/* Stage Color Top Bar */}
            <div
              className="h-1.5 rounded-t-2xl"
              style={{ backgroundColor: stage.color || "#3B82F6" }}
            />

            {/* Column Header */}
            <div className="p-3.5 border-b border-base-200 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="size-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: stage.color || "#3B82F6" }}
                  />
                  <h3 className="font-semibold text-sm text-base-content truncate">
                    {stage.name}
                  </h3>
                  {stage.isWon && (
                    <span className="badge badge-xs badge-success">Won</span>
                  )}
                  {stage.isLost && (
                    <span className="badge badge-xs badge-error">Lost</span>
                  )}
                </div>
                <span className="badge badge-sm badge-ghost font-semibold">
                  {deals.length}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-base-content/60">
                <span>{formatMoney(totalValue, primaryCurrency)}</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={!canMoveLeft || isBusy}
                    onClick={() => onMoveStageOrder(idx, idx - 1)}
                    className="btn btn-ghost btn-xs btn-square disabled:opacity-30"
                    title="Move stage left"
                  >
                    <ArrowLeft className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={!canMoveRight || isBusy}
                    onClick={() => onMoveStageOrder(idx, idx + 1)}
                    className="btn btn-ghost btn-xs btn-square disabled:opacity-30"
                    title="Move stage right"
                  >
                    <ArrowRight className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onEditStage(stage)}
                    className="btn btn-ghost btn-xs btn-square"
                    title="Edit stage"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onAddDealInStage(stage.id)}
                    className="btn btn-ghost btn-xs btn-square text-primary"
                    title={`Add deal to ${stage.name}`}
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Deals Container */}
            <div className="p-3 space-y-2.5 flex-1 overflow-y-auto bg-base-200/40 rounded-b-2xl">
              {deals.length === 0 ? (
                <div className="py-10 text-center text-xs text-base-content/50 italic">
                  No deals in this stage
                </div>
              ) : (
                deals.map((deal) => (
                  <div
                    key={deal.id}
                    className="rounded-xl border border-base-200 bg-base-100 p-3 shadow-xs hover:border-primary/40 hover:shadow-md transition-all space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm text-base-content truncate">
                          {deal.name}
                        </p>
                        <p className="text-xs font-semibold text-primary mt-0.5">
                          {formatMoney(deal.value, deal.currency)}
                        </p>
                      </div>
                      <span
                        className={`badge badge-xs capitalize ${getStatusBadgeClass(
                          deal.status,
                        )}`}
                      >
                        {deal.status.replace("_", " ")}
                      </span>
                    </div>

                    {deal.expectedCloseDate && (
                      <div className="flex items-center gap-1.5 text-xs text-base-content/60">
                        <Calendar className="size-3.5" />
                        <span>
                          Close: {String(deal.expectedCloseDate).slice(0, 10)}
                        </span>
                      </div>
                    )}

                    {deal.notes && (
                      <p className="text-xs text-base-content/70 line-clamp-2">
                        {deal.notes}
                      </p>
                    )}

                    {/* Stage Move & Actions */}
                    <div className="pt-2 border-t border-base-200 space-y-2">
                      <select
                        value={deal.stageId}
                        disabled={isBusy}
                        onChange={(e) => {
                          if (e.target.value && e.target.value !== deal.stageId) {
                            onMoveDeal(deal.id, e.target.value);
                          }
                        }}
                        aria-label={`Move ${deal.name} to stage`}
                        className="select select-bordered select-xs w-full rounded-lg"
                      >
                        {stages.map((targetStage) => (
                          <option key={targetStage.id} value={targetStage.id}>
                            {targetStage.name}
                          </option>
                        ))}
                      </select>

                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1">
                          {deal.status !== "won" && (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => onMarkWon(deal.id)}
                              className="btn btn-ghost btn-xs text-success gap-1 px-1.5"
                              title="Mark deal as won"
                            >
                              <CheckCircle2 className="size-3.5" />
                              Won
                            </button>
                          )}
                          {deal.status !== "lost" && (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => onMarkLost(deal.id)}
                              className="btn btn-ghost btn-xs text-error gap-1 px-1.5"
                              title="Mark deal as lost"
                            >
                              <XCircle className="size-3.5" />
                              Lost
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onEditDeal(deal)}
                            className="btn btn-ghost btn-xs btn-square"
                            title="Edit deal"
                          >
                            <Pencil className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteDeal(deal)}
                            className="btn btn-ghost btn-xs btn-square text-error"
                            title="Delete deal"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

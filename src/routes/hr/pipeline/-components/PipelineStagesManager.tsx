import {
  ArrowDown,
  ArrowUp,
  Layers,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import type { PipelineStage } from "@/api/pipelineApi";

interface PipelineStagesManagerProps {
  stages: PipelineStage[];
  onAddStage: () => void;
  onEditStage: (stage: PipelineStage) => void;
  onDeleteStage: (stage: PipelineStage) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  isBusy?: boolean;
}

export default function PipelineStagesManager({
  stages,
  onAddStage,
  onEditStage,
  onDeleteStage,
  onReorder,
  isBusy = false,
}: PipelineStagesManagerProps) {
  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-base-content flex items-center gap-2">
            <Layers className="size-5 text-primary" />
            Pipeline Stages
          </h3>
          <p className="text-sm text-base-content/70">
            Add, edit, delete, or reorder stages for this pipeline.
          </p>
        </div>
        <button
          type="button"
          onClick={onAddStage}
          className="btn btn-sm bg-primary text-white hover:bg-primary/90 border-0 rounded-xl px-4 gap-1.5"
        >
          <Plus className="size-4" />
          Add Stage
        </button>
      </div>

      {stages.length === 0 ? (
        <div className="rounded-xl border border-dashed border-base-300 p-8 text-center space-y-2">
          <p className="font-medium text-base-content">No stages yet</p>
          <p className="text-sm text-base-content/60">
            Create ordered stages so deals can progress through this pipeline.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {stages.map((stage, idx) => (
            <div
              key={stage.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-base-200 bg-base-200/30 px-4 py-3 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="badge badge-sm badge-ghost font-mono">
                  #{idx + 1}
                </span>
                <span
                  className="size-3.5 rounded-full shrink-0 border border-black/10"
                  style={{ backgroundColor: stage.color || "#3B82F6" }}
                />
                <div className="min-w-0">
                  <div className="font-medium text-base-content truncate">
                    {stage.name}
                  </div>
                  <div className="text-xs text-base-content/60 font-mono">
                    {stage.color}
                  </div>
                </div>
                {stage.isWon && (
                  <span className="badge badge-sm badge-success">
                    Won Stage
                  </span>
                )}
                {stage.isLost && (
                  <span className="badge badge-sm badge-error">Lost Stage</span>
                )}
                {!stage.isWon && !stage.isLost && (
                  <span className="badge badge-sm badge-ghost">Standard</span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={idx === 0 || isBusy}
                  onClick={() => onReorder(idx, idx - 1)}
                  className="btn btn-ghost btn-xs btn-square disabled:opacity-30"
                  title="Move stage up"
                >
                  <ArrowUp className="size-4" />
                </button>
                <button
                  type="button"
                  disabled={idx === stages.length - 1 || isBusy}
                  onClick={() => onReorder(idx, idx + 1)}
                  className="btn btn-ghost btn-xs btn-square disabled:opacity-30"
                  title="Move stage down"
                >
                  <ArrowDown className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onEditStage(stage)}
                  className="btn btn-ghost btn-xs btn-square"
                  title="Edit stage"
                >
                  <Pencil className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteStage(stage)}
                  className="btn btn-ghost btn-xs btn-square text-error"
                  title="Delete stage"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

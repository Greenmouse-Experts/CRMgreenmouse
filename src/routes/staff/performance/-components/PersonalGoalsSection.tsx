import { useState } from "react";
import type { TeamGoal } from "@/routes/hr/performance/-components/types";
import { extract_message } from "@/helpers/errors";
import { toast } from "sonner";
import { Check, PencilLine, Target, TrendingUp, X } from "lucide-react";

interface PersonalGoalsSectionProps {
  goals: Array<
    TeamGoal & {
      currentValue?: number;
      targetValue?: number;
      description?: string;
    }
  >;
  onUpdateProgress?: (payload: {
    goalId: string;
    currentValue: number;
    progressNote?: string;
  }) => Promise<void>;
}

export default function PersonalGoalsSection({
  goals,
  onUpdateProgress,
}: PersonalGoalsSectionProps) {
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [currentValueInput, setCurrentValueInput] = useState<string>("");
  const [progressNote, setProgressNote] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "progress-success";
    if (progress >= 60) return "progress-primary";
    if (progress >= 40) return "progress-warning";
    return "progress-error";
  };

  const openEditor = (
    goal: TeamGoal & { currentValue?: number; targetValue?: number },
  ) => {
    setEditingGoalId(goal.id);
    setCurrentValueInput(
      goal.currentValue != null ? String(goal.currentValue) : String(goal.progress),
    );
    setProgressNote("");
  };

  const handleSave = async (goalId: string) => {
    if (!onUpdateProgress) return;
    const numericVal = Number(currentValueInput);
    if (!Number.isFinite(numericVal) || numericVal < 0) {
      toast.error("Please enter a valid numeric progress value");
      return;
    }
    setIsSaving(true);
    try {
      await onUpdateProgress({
        goalId,
        currentValue: numericVal,
        progressNote: progressNote.trim() || undefined,
      });
      toast.success("Goal progress updated");
      setEditingGoalId(null);
      setProgressNote("");
    } catch (err) {
      toast.error(extract_message(err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between gap-2 border-b border-base-200 pb-3">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Target className="size-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-base-content">
              My Goals & KPIs
            </h2>
            <p className="text-xs sm:text-sm text-base-content/80">
              Your assigned objectives, targets, weightings, and completion pace.
            </p>
          </div>
        </div>

        <span className="badge badge-sm badge-ghost font-semibold">
          {goals.length} active
        </span>
      </div>

      {goals.length === 0 ? (
        <div className="py-10 text-center text-base-content/75">
          <Target className="size-8 mx-auto mb-2 opacity-30" />
          <p className="font-medium text-sm">No goals assigned yet</p>
          <p className="text-xs text-base-content/60 mt-0.5">
            Goals assigned to you by your manager or HR for this cycle will
            appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4 pt-1">
          {goals.map((goal) => {
            const isEditing = editingGoalId === goal.id;
            return (
              <div
                key={goal.id}
                className="p-3.5 rounded-xl border border-base-200/80 bg-base-200/30 space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-base-content font-semibold block truncate">
                      {goal.title}
                    </span>
                    {goal.kpi && (
                      <span className="text-xs text-base-content/70 block">
                        Measure: {goal.kpi}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-bold text-primary">
                      {goal.progress}%
                    </span>
                    {onUpdateProgress && !isEditing && (
                      <button
                        type="button"
                        onClick={() => openEditor(goal)}
                        className="btn btn-xs btn-outline rounded-lg gap-1"
                      >
                        <PencilLine className="size-3" />
                        <span>Update</span>
                      </button>
                    )}
                  </div>
                </div>

                <progress
                  className={`progress w-full h-2 ${getProgressColor(goal.progress)}`}
                  value={goal.progress}
                  max="100"
                />

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-base-content/80 pt-0.5">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-1">
                      <TrendingUp className="size-3 text-base-content/70" />
                      Target: <strong>{goal.target || "100%"}</strong>
                    </span>
                    {goal.weight != null && (
                      <span>
                        Weight: <strong>{goal.weight}%</strong>
                      </span>
                    )}
                    {goal.due && (
                      <span>
                        Due: <strong>{goal.due}</strong>
                      </span>
                    )}
                  </div>
                  {goal.category && (
                    <span className="badge badge-sm badge-ghost font-medium">
                      {goal.category}
                    </span>
                  )}
                </div>

                {isEditing && (
                  <div className="pt-2 border-t border-base-200 space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-medium text-base-content/80 block mb-1">
                          Current Value
                        </label>
                        <input
                          type="number"
                          min={0}
                          step="any"
                          value={currentValueInput}
                          onChange={(e) => setCurrentValueInput(e.target.value)}
                          className="input input-sm input-bordered w-full rounded-lg bg-base-100"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-base-content/80 block mb-1">
                          Progress Note (optional)
                        </label>
                        <input
                          type="text"
                          value={progressNote}
                          onChange={(e) => setProgressNote(e.target.value)}
                          placeholder="Milestone completed..."
                          className="input input-sm input-bordered w-full rounded-lg bg-base-100"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditingGoalId(null)}
                        className="btn btn-xs btn-ghost rounded-lg gap-1"
                      >
                        <X className="size-3" />
                        <span>Cancel</span>
                      </button>
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => handleSave(goal.id)}
                        className="btn btn-xs bg-primary text-white hover:bg-primary/90 border-0 rounded-lg gap-1"
                      >
                        <Check className="size-3" />
                        <span>{isSaving ? "Saving..." : "Save progress"}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

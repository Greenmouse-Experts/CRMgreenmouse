import type { TeamGoal } from "./types";
import { Target, TrendingUp } from "lucide-react";

interface TeamGoalsSectionProps {
  goals: TeamGoal[];
}

export default function TeamGoalsSection({ goals }: TeamGoalsSectionProps) {
  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "progress-success";
    if (progress >= 60) return "progress-primary";
    if (progress >= 40) return "progress-warning";
    return "progress-error";
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
              Team goals
            </h2>
            <p className=" text-base-content/80">
              Strategic Q4 objectives, target metrics, and real-time pace.
            </p>
          </div>
        </div>

        <span className="badge badge-sm badge-ghost  font-semibold">
          {goals.length} active
        </span>
      </div>

      <div className="space-y-4 pt-1">
        {goals.map((goal) => {
          return (
            <div
              key={goal.id}
              className="p-3.5 rounded-xl border border-base-200/80 bg-base-200/30 hover:bg-base-200/80 transition-colors space-y-2"
            >
              <div className="flex items-center justify-between  sm:text-sm font-medium">
                <span className="text-base-content font-semibold truncate pr-2">
                  {goal.title}
                </span>
                <span className="font-bold text-primary shrink-0">
                  {goal.progress}%
                </span>
              </div>

              <progress
                className={`progress w-full h-2 ${getProgressColor(goal.progress)}`}
                value={goal.progress}
                max="100"
              />

              <div className="flex flex-wrap items-center justify-between text-[11px] text-base-content/80 pt-0.5">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="size-3 text-base-content/80" />
                  <span>
                    Target: <strong>{goal.target || "100%"}</strong>
                  </span>
                </div>
                {goal.category && (
                  <span className="badge badge-sm badge-ghost font-medium">
                    {goal.category}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

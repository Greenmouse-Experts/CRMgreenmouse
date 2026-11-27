import StatCard from "@/components/StatCard";
import type { AppraisalRecord, TeamGoal } from "@/routes/hr/performance/-components/types";
import { Award, CheckCircle2, Target, TrendingUp } from "lucide-react";

interface PersonalPerformanceStatsProps {
  goals: TeamGoal[];
  appraisals: AppraisalRecord[];
}

export default function PersonalPerformanceStats({
  goals,
  appraisals,
}: PersonalPerformanceStatsProps) {
  const totalWeight = goals.reduce((sum, g) => sum + (Number(g.weight) || 0), 0);
  const avgProgress =
    goals.length > 0
      ? Math.round(
          goals.reduce((sum, g) => sum + (Number(g.progress) || 0), 0) /
            goals.length,
        )
      : 0;

  const completedAppraisals = appraisals.filter(
    (a) => a.status === "Completed",
  ).length;

  const ratedAppraisal = appraisals.find(
    (a) => a.rating && a.rating !== "—",
  );

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <StatCard
        title="My Goals"
        value={goals.length}
        desc={totalWeight > 0 ? `${totalWeight}% total weight` : "Current cycle KPIs"}
        icon={<Target className="size-5" />}
        variant="primary"
      />

      <StatCard
        title="Avg Goal Progress"
        value={
          <div className="flex items-baseline gap-1">
            <span>{avgProgress}</span>
            <span className="font-normal text-base-content/80">%</span>
          </div>
        }
        desc={
          <div className="space-y-1.5 mt-1">
            <progress
              className="progress progress-primary w-full h-1.5"
              value={avgProgress}
              max="100"
            />
          </div>
        }
        icon={<TrendingUp className="size-5" />}
        variant="info"
      />

      <StatCard
        title="Latest Rating"
        value={
          ratedAppraisal ? (
            <div className="flex items-baseline gap-1">
              <span>{ratedAppraisal.rating}</span>
              <span className="text-sm font-normal text-base-content/70">
                / 5.0
              </span>
            </div>
          ) : (
            "—"
          )
        }
        desc={
          ratedAppraisal?.cycle
            ? `${ratedAppraisal.cycle} review`
            : "Awaiting final rating"
        }
        icon={<Award className="size-5" />}
        variant="warning"
      />

      <StatCard
        title="Completed Reviews"
        value={
          <div className="flex items-baseline gap-1">
            <span>{completedAppraisals}</span>
            <span className="text-sm font-normal text-base-content/70">
              / {appraisals.length}
            </span>
          </div>
        }
        desc="Appraisals signed & finalized"
        icon={<CheckCircle2 className="size-5" />}
        variant="success"
      />
    </div>
  );
}

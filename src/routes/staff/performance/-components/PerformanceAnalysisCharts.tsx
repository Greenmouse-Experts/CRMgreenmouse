import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AppraisalRecord, TeamGoal } from "@/routes/hr/performance/-components/types";
import { BarChart3, LineChart as LineChartIcon } from "lucide-react";

interface PerformanceAnalysisChartsProps {
  goals: TeamGoal[];
  appraisals: AppraisalRecord[];
}

export default function PerformanceAnalysisCharts({
  goals,
  appraisals,
}: PerformanceAnalysisChartsProps) {
  const categoryMap = new Map<
    string,
    { total: number; count: number; weight: number }
  >();

  for (const goal of goals) {
    const category = goal.category || "Business";
    const current = categoryMap.get(category) ?? {
      total: 0,
      count: 0,
      weight: 0,
    };
    current.total += Number(goal.progress) || 0;
    current.count += 1;
    current.weight += Number(goal.weight) || 0;
    categoryMap.set(category, current);
  }

  const categoryData = Array.from(categoryMap.entries()).map(
    ([category, info]) => ({
      category,
      progress: info.count > 0 ? Math.round(info.total / info.count) : 0,
      goals: info.count,
    }),
  );

  const reviewScoreData = appraisals
    .map((a, idx) => {
      const selfNum = Number(a.selfScore);
      const managerNum = Number(a.managerScore);
      const finalNum = Number(a.rating);
      return {
        cycle: a.cycle || `Review ${idx + 1}`,
        selfScore: Number.isFinite(selfNum) ? selfNum : 0,
        managerScore: Number.isFinite(managerNum) ? managerNum : 0,
        finalRating: Number.isFinite(finalNum) ? finalNum : 0,
      };
    })
    .filter(
      (item) =>
        item.selfScore > 0 || item.managerScore > 0 || item.finalRating > 0,
    );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Goal Attainment by Category */}
      <div className="card bg-base-100 border border-base-200 shadow-sm p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-2 border-b border-base-200 pb-3">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <BarChart3 className="size-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-base-content">
                Goal Attainment Analysis
              </h2>
              <p className="text-xs text-base-content/75">
                Average completion rate grouped by KPI category
              </p>
            </div>
          </div>
        </div>

        {categoryData.length === 0 ? (
          <div className="h-52 flex flex-col items-center justify-center text-center text-base-content/70">
            <BarChart3 className="size-8 mb-2 opacity-30" />
            <p className="text-sm font-medium">No goal metrics to chart yet</p>
            <p className="text-xs text-base-content/60 mt-0.5">
              Category progress bars will appear once KPIs are assigned in a
              review cycle.
            </p>
          </div>
        ) : (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryData}
                margin={{ top: 8, right: 12, left: -12, bottom: 0 }}
              >
                <CartesianGrid
                  stroke="var(--color-base-300)"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "var(--color-base-content)" }}
                />
                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "var(--color-base-content)" }}
                />
                <Tooltip
                  formatter={(value: any) => [`${value}%`, "Avg Progress"]}
                />
                <Bar
                  dataKey="progress"
                  name="Progress"
                  fill="var(--color-primary)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Review Score Breakdown */}
      <div className="card bg-base-100 border border-base-200 shadow-sm p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-2 border-b border-base-200 pb-3">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-info/10 text-info flex items-center justify-center">
              <LineChartIcon className="size-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-base-content">
                Review Score Comparison
              </h2>
              <p className="text-xs text-base-content/75">
                Self-assessment vs manager rating vs final calibrated score (out
                of 5.0)
              </p>
            </div>
          </div>
        </div>

        {reviewScoreData.length === 0 ? (
          <div className="h-52 flex flex-col items-center justify-center text-center text-base-content/70">
            <LineChartIcon className="size-8 mb-2 opacity-30" />
            <p className="text-sm font-medium">No scored reviews yet</p>
            <p className="text-xs text-base-content/60 mt-0.5">
              Self and manager ratings will compare here as appraisals are
              submitted.
            </p>
          </div>
        ) : (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={reviewScoreData}
                margin={{ top: 8, right: 12, left: -12, bottom: 0 }}
              >
                <CartesianGrid
                  stroke="var(--color-base-300)"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="cycle"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "var(--color-base-content)" }}
                />
                <YAxis
                  domain={[0, 5]}
                  ticks={[0, 1, 2, 3, 4, 5]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "var(--color-base-content)" }}
                />
                <Tooltip />
                <Bar
                  dataKey="selfScore"
                  name="Self Score"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={24}
                />
                <Bar
                  dataKey="managerScore"
                  name="Manager Score"
                  fill="#f59e0b"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={24}
                />
                <Bar
                  dataKey="finalRating"
                  name="Final Rating"
                  fill="var(--color-primary)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

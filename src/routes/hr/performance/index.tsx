import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/Headers/PageHeader";
import ReviewCycleStepper from "./-components/ReviewCycleStepper";
import TeamGoalsSection from "./-components/TeamGoalsSection";
import AppraisalsTable from "./-components/AppraisalsTable";
import AssignGoalModal from "./-components/AssignGoalModal";
import type { AppraisalRecord, TeamGoal } from "./-components/types";
import { Target } from "lucide-react";
import { toast } from "sonner";
import {
  usePerformanceAppraisals,
  usePerformanceCycles,
  usePerformanceGoals,
  useCreatePerformanceGoal,
} from "@/api/performanceApi";

export const Route = createFileRoute("/hr/performance/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [isAssignGoalOpen, setIsAssignGoalOpen] = useState(false);
  const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null);

  const cyclesQuery = usePerformanceCycles();
  const appraisalsQuery = usePerformanceAppraisals();

  const currentCycle =
    cyclesQuery.data?.find((c) => c.id === selectedCycleId) ??
    cyclesQuery.data?.[0] ??
    null;

  const goalsQuery = usePerformanceGoals(currentCycle?.id ?? undefined);

  const createGoal = useCreatePerformanceGoal();

  const appraisals: AppraisalRecord[] = (appraisalsQuery.data ?? []).map(
    (a) => ({
      id: a.id,
      employee: a.employee ?? a.employeeId ?? "Unknown",
      reviewer: a.reviewer ?? "—",
      rating: String(a.rating ?? "—"),
      status: (a.status as AppraisalRecord["status"]) ?? "Pending",
      cycle: a.cycle ?? "",
      selfScore: a.selfScore ? String(a.selfScore) : undefined,
      managerScore: a.managerScore ? String(a.managerScore) : undefined,
    }),
  );

  const teamGoals: TeamGoal[] = (goalsQuery.data ?? []).map((g) => ({
    id: g.id,
    title: g.title,
    progress: g.progress ?? 0,
    assignedTo: g.employeeId,
    cycle: g.cycle ?? currentCycle?.name ?? "",
    category: (g.category as TeamGoal["category"]) ?? "Business",
    kpi: g.measure,
    target: g.targetValue ? String(g.targetValue) : undefined,
    weight: g.weight,
    due: g.dueDate,
  }));

  const handleAssignGoal = async (newGoal: TeamGoal) => {
    if (!currentCycle?.id) {
      toast.error("No review cycle selected.");
      return;
    }
    try {
      await createGoal.mutateAsync({
        cycleId: currentCycle.id,
        employeeId: newGoal.assignedTo ?? "",
        title: newGoal.title,
        category: newGoal.category ?? "Business",
        measure: newGoal.kpi,
        targetValue: newGoal.target ? Number(newGoal.target) : undefined,
        weight: newGoal.weight ?? 20,
        startDate: newGoal.due,
        dueDate: newGoal.due,
      });
      toast.success("Goal assigned");
      setIsAssignGoalOpen(false);
    } catch (error: any) {
      toast.error(error?.message ?? "Failed to assign goal");
    }
  };

  const handleSelectAppraisal = (appraisal: AppraisalRecord) => {
    toast.info(`${appraisal.employee} · ${appraisal.cycle} Review`, {
      description: `Reviewer: ${appraisal.reviewer} · Status: ${appraisal.status} · Rating: ${appraisal.rating}`,
    });
  };

  if (cyclesQuery.isLoading || appraisalsQuery.isLoading) {
    return (
      <div className="space-y-6 pb-12">
        <PageHeader title="Performance" description="Loading review cycle..." />
        <div className="card bg-base-100 border border-base-200 p-12 text-center max-w-lg mx-auto">
          <span className="loading loading-spinner loading-lg mx-auto mb-4" />
          <p className="text-base-content/80">Loading performance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Performance"
        description={
          currentCycle
            ? `${currentCycle.name} review cycle · due ${currentCycle.dueDate}`
            : "No active review cycle"
        }
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAssignGoalOpen(true)}
            disabled={!currentCycle}
            className="btn btn-sm bg-primary text-white hover:bg-primary/90 border-0 rounded-xl px-4 font-medium gap-1.5 shadow-sm shadow-primary/20"
          >
            <Target className="size-4" />
            <span>Assign goal</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedCycleId(null)}
            className={`btn btn-sm btn-ghost ${
              selectedCycleId ? "text-primary-content bg-primary" : ""
            } rounded-xl px-3 py-2`}
          >
            All cycles
          </button>
          {cyclesQuery.data?.map((cycle) => (
            <button
              key={cycle.id}
              type="button"
              onClick={() => setSelectedCycleId(cycle.id)}
              className={`btn btn-sm btn-ghost ${
                selectedCycleId === cycle.id
                  ? "text-primary-content bg-primary"
                  : ""
              } rounded-xl px-3 py-2`}
            >
              {cycle.name}
            </button>
          ))}
        </div>
      </PageHeader>

      {currentCycle && <ReviewCycleStepper currentStepIndex={1} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <TeamGoalsSection goals={teamGoals} />
        <AppraisalsTable
          appraisals={appraisals}
          onSelectAppraisal={handleSelectAppraisal}
        />
      </div>

      <AssignGoalModal
        isOpen={isAssignGoalOpen}
        onClose={() => setIsAssignGoalOpen(false)}
        onAssignGoal={handleAssignGoal}
        cycle={currentCycle}
      />
    </div>
  );
}

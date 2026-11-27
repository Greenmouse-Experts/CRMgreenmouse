import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/Headers/PageHeader";
import ReviewCycleStepper from "@/routes/hr/performance/-components/ReviewCycleStepper";
import PersonalPerformanceStats from "./-components/PersonalPerformanceStats";
import PerformanceAnalysisCharts from "./-components/PerformanceAnalysisCharts";
import PersonalGoalsSection from "./-components/PersonalGoalsSection";
import PersonalAppraisalsSection, {
  type PersonalAppraisalItem,
} from "./-components/PersonalAppraisalsSection";
import AppraisalDetailModal from "./-components/AppraisalDetailModal";
import { useCurrentStaffIdentity } from "../-components/useCurrentStaffIdentity";
import {
  filterPersonalAppraisals,
  filterPersonalGoals,
} from "../-components/staffScoping";
import type { TeamGoal } from "@/routes/hr/performance/-components/types";
import {
  usePerformanceAppraisals,
  usePerformanceCycles,
  usePerformanceGoals,
  useUpdateGoalProgress,
} from "@/api/performanceApi";
import { REVIEW_CYCLE_STEPS } from "@/routes/hr/performance/-components/performanceData";

export const Route = createFileRoute("/staff/performance/")({
  component: RouteComponent,
});

function resolveStepIndex(cycleStatus?: string): number {
  const s = (cycleStatus ?? "").toLowerCase();
  if (!s) return 1;
  if (s.includes("goal")) return 0;
  if (s.includes("self")) return 1;
  if (s.includes("manager")) return 2;
  if (s.includes("calibrat")) return 3;
  if (s.includes("sign") || s.includes("feedback") || s.includes("closed")) {
    return REVIEW_CYCLE_STEPS.length - 1;
  }
  return 1;
}

function RouteComponent() {
  const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null);
  const [selectedAppraisal, setSelectedAppraisal] =
    useState<PersonalAppraisalItem | null>(null);

  const { identity, isLoading: identityLoading } = useCurrentStaffIdentity();
  const cyclesQuery = usePerformanceCycles();
  const appraisalsQuery = usePerformanceAppraisals();
  const updateGoalProgress = useUpdateGoalProgress();

  const cycles = cyclesQuery.data ?? [];
  const currentCycle =
    cycles.find((c) => c.id === selectedCycleId) ?? cycles[0] ?? null;

  const goalsQuery = usePerformanceGoals(currentCycle?.id ?? undefined);

  const personalGoals = useMemo(() => {
    const scoped = filterPersonalGoals(goalsQuery.data ?? [], identity);
    return scoped.map((g) => ({
      id: g.id,
      title: g.title,
      progress: g.progress ?? 0,
      assignedTo: g.employeeId,
      cycle: g.cycle ?? currentCycle?.name ?? "",
      category: (g.category as TeamGoal["category"]) ?? "Business",
      kpi: g.measure,
      target: g.targetValue != null ? String(g.targetValue) : undefined,
      weight: g.weight,
      due: g.dueDate,
      currentValue: g.currentValue,
      targetValue: g.targetValue,
      description: g.description,
    }));
  }, [goalsQuery.data, identity, currentCycle?.name]);

  const personalAppraisals: PersonalAppraisalItem[] = useMemo(() => {
    const scoped = filterPersonalAppraisals(
      appraisalsQuery.data ?? [],
      identity,
    );
    const filteredByCycle = selectedCycleId
      ? scoped.filter(
          (a) =>
            !a.cycle ||
            !currentCycle?.name ||
            a.cycle.toLowerCase() === currentCycle.name.toLowerCase() ||
            a.cycleId === selectedCycleId,
        )
      : scoped;

    return filteredByCycle.map((a) => ({
      id: a.id,
      employee: a.employee ?? identity.fullName,
      reviewer: a.reviewer ?? "Line Manager",
      rating: a.rating != null ? String(a.rating) : "—",
      status: (a.status as PersonalAppraisalItem["status"]) ?? "Pending",
      cycle: a.cycle ?? currentCycle?.name ?? "Current Cycle",
      selfScore: a.selfScore != null ? String(a.selfScore) : undefined,
      managerScore: a.managerScore != null ? String(a.managerScore) : undefined,
      selfAssessment: a.selfAssessment,
      managerComments: a.managerComments,
    }));
  }, [
    appraisalsQuery.data,
    identity,
    selectedCycleId,
    currentCycle?.name,
  ]);

  const handleUpdateGoalProgress = async ({
    goalId,
    currentValue,
    progressNote,
  }: {
    goalId: string;
    currentValue: number;
    progressNote?: string;
  }) => {
    await updateGoalProgress.mutateAsync({
      goalId,
      currentValue,
      progressNote,
    });
  };

  if (identityLoading || cyclesQuery.isLoading || appraisalsQuery.isLoading) {
    return (
      <div className="space-y-6 pb-12">
        <PageHeader
          title="My Performance"
          description="Loading your performance analysis and reviews..."
        />
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
        title="My Performance"
        description={
          currentCycle
            ? `${currentCycle.name} review cycle · due ${currentCycle.dueDate}`
            : "Personal goal attainment, KPI analysis, and appraisal reviews."
        }
      >
        {cycles.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedCycleId(null)}
              className={`btn btn-sm rounded-xl px-3 ${
                selectedCycleId === null
                  ? "bg-primary text-white border-0"
                  : "btn-outline border-base-300"
              }`}
            >
              Latest / All
            </button>
            {cycles.map((cycle) => (
              <button
                key={cycle.id}
                type="button"
                onClick={() => setSelectedCycleId(cycle.id)}
                className={`btn btn-sm rounded-xl px-3 ${
                  selectedCycleId === cycle.id
                    ? "bg-primary text-white border-0"
                    : "btn-outline border-base-300"
                }`}
              >
                {cycle.name}
              </button>
            ))}
          </div>
        )}
      </PageHeader>

      <PersonalPerformanceStats
        goals={personalGoals}
        appraisals={personalAppraisals}
      />

      {currentCycle && (
        <ReviewCycleStepper
          currentStepIndex={resolveStepIndex(currentCycle.status)}
        />
      )}

      <PerformanceAnalysisCharts
        goals={personalGoals}
        appraisals={personalAppraisals}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <PersonalGoalsSection
          goals={personalGoals}
          onUpdateProgress={handleUpdateGoalProgress}
        />
        <PersonalAppraisalsSection
          appraisals={personalAppraisals}
          onSelectAppraisal={(a) => setSelectedAppraisal(a)}
        />
      </div>

      <AppraisalDetailModal
        isOpen={Boolean(selectedAppraisal)}
        onClose={() => setSelectedAppraisal(null)}
        appraisal={selectedAppraisal}
      />
    </div>
  );
}

import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/Headers/PageHeader";
import ReviewCycleStepper from "./-components/ReviewCycleStepper";
import TeamGoalsSection from "./-components/TeamGoalsSection";
import AppraisalsTable from "./-components/AppraisalsTable";
import AssignGoalModal from "./-components/AssignGoalModal";
import {
  INITIAL_TEAM_GOALS,
  INITIAL_APPRAISALS,
} from "./-components/performanceData";
import type { AppraisalRecord, TeamGoal } from "./-components/types";
import { Target } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/hr/performance/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [goals, setGoals] = useState<TeamGoal[]>(INITIAL_TEAM_GOALS);
  const [appraisals] = useState<AppraisalRecord[]>(INITIAL_APPRAISALS);
  const [isAssignGoalOpen, setIsAssignGoalOpen] = useState(false);

  const handleAssignGoal = (newGoal: TeamGoal) => {
    setGoals((prev) => [newGoal, ...prev]);
  };

  const handleSelectAppraisal = (appraisal: AppraisalRecord) => {
    toast.info(`${appraisal.employee} · Q4 Review`, {
      description: `Reviewer: ${appraisal.reviewer} · Status: ${appraisal.status} · Rating: ${appraisal.rating}`,
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header with Action */}
      <PageHeader
        title="Performance"
        description="Q4 2026 review cycle · due 15 Dec"
      >
        <button
          type="button"
          onClick={() => setIsAssignGoalOpen(true)}
          className="btn btn-sm bg-primary text-white hover:bg-primary/90 border-0 rounded-xl px-4 font-medium gap-1.5 shadow-sm shadow-primary/20"
        >
          <Target className="size-4" />
          <span>Assign goal</span>
        </button>
      </PageHeader>

      {/* Review cycle 5-step stepper */}
      <ReviewCycleStepper currentStepIndex={1} />

      {/* Main 2-Column Responsive Grid: Team Goals & Appraisals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Team Goals Column */}
        <TeamGoalsSection goals={goals} />

        {/* Appraisals Column */}
        <AppraisalsTable
          appraisals={appraisals}
          onSelectAppraisal={handleSelectAppraisal}
        />
      </div>

      {/* Assign Goal Modal */}
      <AssignGoalModal
        isOpen={isAssignGoalOpen}
        onClose={() => setIsAssignGoalOpen(false)}
        onAssignGoal={handleAssignGoal}
      />
    </div>
  );
}

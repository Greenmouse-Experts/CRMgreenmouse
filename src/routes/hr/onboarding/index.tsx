import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/Headers/PageHeader";
import PageLoader from "@/components/layout/PageLoader";
import QueryCompLayout from "@/components/layout/QueryCompLayout";
import OnboardingStats from "./-components/OnboardingStats";
import NewHireCards from "./-components/NewHireCards";
import OnboardingChecklist from "./-components/OnboardingChecklist";
import ProbationTracker from "./-components/ProbationTracker";
import ProbationReviewsCard from "./-components/ProbationReviewsCard";
import AddOnboardingModal from "./-components/AddOnboardingModal";
import ReassignTaskModal from "./-components/ReassignTaskModal";
import ExtendProbationModal from "./-components/ExtendProbationModal";
import CompleteReviewModal from "./-components/CompleteReviewModal";
import { PROBATION_STEPS } from "./-components/onboardingData";
import { toChecklistItem, toUiHire } from "./-components/mappers";
import type { ChecklistItem, OnboardingHire } from "./-components/types";
import {
  useCompleteOnboardingTask,
  useCompleteProbationReview,
  useDecideProbation,
  useOnboardingTasks,
  useProbationReviews,
  useReassignOnboardingTask,
  useStartOnboarding,
  type ProbationReview,
} from "@/api/onboardingApi";
import { useEmployees } from "@/api/employeesApi";
import { extract_message } from "@/helpers/auth";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/hr/onboarding/")({
  component: RouteComponent,
});

function RouteComponent() {
  const employeesQuery = useEmployees();

  const startOnboardingMutation = useStartOnboarding();
  const completeTaskMutation = useCompleteOnboardingTask();
  const reassignTaskMutation = useReassignOnboardingTask();
  const completeReviewMutation = useCompleteProbationReview();
  const decideProbationMutation = useDecideProbation();

  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [reassignTask, setReassignTask] = useState<ChecklistItem | null>(null);
  const [isExtendOpen, setIsExtendOpen] = useState(false);
  const [completeReview, setCompleteReview] = useState<ProbationReview | null>(
    null,
  );
  const [probationOverrides, setProbationOverrides] = useState<
    Record<string, number>
  >({});

  const hires = useMemo<OnboardingHire[]>(
    () => (employeesQuery.data ?? []).map(toUiHire),
    [employeesQuery.data],
  );

  const selectedBaseHire =
    hires.find((h) => h.id === selectedEmployeeId) ?? hires[0] ?? null;
  const selectedHireId = selectedBaseHire?.id;

  const tasksQuery = useOnboardingTasks(selectedHireId);
  const reviewsQuery = useProbationReviews(selectedHireId);

  const checklist = useMemo<ChecklistItem[]>(
    () => (tasksQuery.data ?? []).map(toChecklistItem),
    [tasksQuery.data],
  );

  const selectedHire = useMemo<OnboardingHire | null>(() => {
    if (!selectedBaseHire) return null;
    const completed = checklist.filter((i) => i.completed).length;
    const reviewsDone = (reviewsQuery.data ?? []).filter(
      (r) =>
        r.completed || String(r.status ?? "").toLowerCase() === "completed",
    ).length;
    return {
      ...selectedBaseHire,
      progress: checklist.length
        ? Math.round((completed / checklist.length) * 100)
        : 0,
      probationStep:
        probationOverrides[selectedBaseHire.id] ??
        Math.min(reviewsDone, PROBATION_STEPS.length - 1),
    };
  }, [selectedBaseHire, checklist, reviewsQuery.data, probationOverrides]);

  const handleToggleItem = (itemId: string) => {
    toast.promise(completeTaskMutation.mutateAsync({ taskId: itemId }), {
      loading: "Updating task...",
      success: "Onboarding task completed",
      error: (error) => extract_message(error as never),
    });
  };

  const handleReassign = async (taskId: string, assignedTo: string) => {
    try {
      await reassignTaskMutation.mutateAsync({ taskId, assignedTo });
      toast.success("Task reassigned");
      setReassignTask(null);
    } catch (error) {
      toast.error(extract_message(error as never));
    }
  };

  const handleUpdateStep = (hireId: string, stepIndex: number) => {
    setProbationOverrides((prev) => ({
      ...prev,
      [hireId]: Math.min(Math.max(stepIndex, 0), PROBATION_STEPS.length - 1),
    }));
  };

  const handleAdvanceMilestone = (_hireId: string) => {
    const pendingReview = reviewsQuery.data?.find(
      (review) =>
        !review.completed &&
        String(review.status ?? "").toLowerCase() !== "completed",
    );

    if (!pendingReview) {
      toast.info("No pending probation review available to advance.");
      return;
    }

    setCompleteReview(pendingReview);
  };

  const handleCompleteReview = async (reviewId: string, notes: string) => {
    try {
      await completeReviewMutation.mutateAsync({ reviewId, notes });
      toast.success("Probation review completed");
      setCompleteReview(null);
    } catch (error) {
      toast.error(extract_message(error as never));
    }
  };

  const handleConfirmProbation = (hireId: string) => {
    toast.promise(
      decideProbationMutation.mutateAsync({
        employeeId: hireId,
        decision: "confirm",
      }),
      {
        loading: "Confirming probation...",
        success: "Probation confirmed",
        error: (error) => extract_message(error as never),
      },
    );
  };

  const handleExtendProbation = async (values: {
    newEndDate: string;
    reason?: string;
  }) => {
    if (!selectedHireId) return;
    try {
      await decideProbationMutation.mutateAsync({
        employeeId: selectedHireId,
        decision: "extend",
        ...values,
      });
      toast.success("Probation extended");
      setIsExtendOpen(false);
    } catch (error) {
      toast.error(extract_message(error as never));
    }
  };

  const handleStartOnboarding = async (employeeId: string) => {
    try {
      await startOnboardingMutation.mutateAsync(employeeId);
      toast.success("Onboarding started");
      setSelectedEmployeeId(employeeId);
      setIsAddModalOpen(false);
    } catch (error) {
      toast.error(extract_message(error as never));
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Onboarding"
        description="Track every new hire from accepted offer through probation confirmation."
      >
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="btn btn-sm bg-primary text-white hover:bg-primary/90 border-0 rounded-xl px-4 font-medium gap-1.5 shadow-sm shadow-primary/20"
        >
          <UserPlus className="size-4" />
          <span>New Onboarding</span>
        </button>
      </PageHeader>

      <PageLoader
        query={employeesQuery}
        emptyState={{
          title: "No employees yet",
          description: "Add employees before starting an onboarding pipeline.",
          actionText: "Refresh",
          onAction: () => employeesQuery.refetch(),
        }}
      >
        <div className="space-y-6">
          <OnboardingStats hires={hires} />

          <NewHireCards
            hires={hires}
            selectedHireId={selectedHireId ?? ""}
            onSelectHire={setSelectedEmployeeId}
          />

          {selectedHire && (
            <QueryCompLayout query={tasksQuery}>
              <OnboardingChecklist
                hire={selectedHire}
                checklist={checklist}
                onToggleItem={handleToggleItem}
                onReassign={setReassignTask}
              />
            </QueryCompLayout>
          )}

          {selectedHire && (
            <QueryCompLayout query={reviewsQuery}>
              <ProbationTracker
                hire={selectedHire}
                onUpdateStep={handleUpdateStep}
                onAdvance={handleAdvanceMilestone}
                onConfirm={handleConfirmProbation}
                onExtend={() => setIsExtendOpen(true)}
              />
            </QueryCompLayout>
          )}

          {selectedHire && (
            <QueryCompLayout query={reviewsQuery}>
              <ProbationReviewsCard
                hireName={selectedHire.name}
                reviews={reviewsQuery.data ?? []}
                onCompleteReview={setCompleteReview}
              />
            </QueryCompLayout>
          )}
        </div>
      </PageLoader>

      <AddOnboardingModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        employees={employeesQuery.data ?? []}
        onStartOnboarding={handleStartOnboarding}
      />

      <ReassignTaskModal
        isOpen={reassignTask !== null}
        onClose={() => setReassignTask(null)}
        task={reassignTask}
        employees={employeesQuery.data ?? []}
        onReassign={handleReassign}
      />

      <ExtendProbationModal
        isOpen={isExtendOpen}
        onClose={() => setIsExtendOpen(false)}
        hireName={selectedHire?.name ?? "this employee"}
        onExtend={handleExtendProbation}
      />

      <CompleteReviewModal
        isOpen={completeReview !== null}
        onClose={() => setCompleteReview(null)}
        review={completeReview}
        onComplete={handleCompleteReview}
      />
    </div>
  );
}

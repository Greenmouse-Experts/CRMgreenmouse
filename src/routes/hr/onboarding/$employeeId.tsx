import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import PageLoader from "@/components/layout/PageLoader";
import QueryCompLayout from "@/components/layout/QueryCompLayout";
import OnboardingChecklist from "./-components/OnboardingChecklist";
import ProbationTracker from "./-components/ProbationTracker";
import ProbationReviewsCard from "./-components/ProbationReviewsCard";
import ReassignTaskModal from "./-components/ReassignTaskModal";
import ExtendProbationModal from "./-components/ExtendProbationModal";
import CompleteReviewModal from "./-components/CompleteReviewModal";
import { PROBATION_STEPS } from "./-components/onboardingData";
import { toChecklistItem, toUiHire } from "./-components/mappers";
import type { ChecklistItem } from "./-components/types";
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
import {
  ArrowLeft,
  Briefcase,
  Building2,
  CalendarDays,
  Mail,
  Play,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/hr/onboarding/$employeeId")({
  component: OnboardingDetailPage,
});

function OnboardingDetailPage() {
  const { employeeId } = Route.useParams();

  const employeesQuery = useEmployees();
  const tasksQuery = useOnboardingTasks(employeeId);
  const reviewsQuery = useProbationReviews(employeeId);

  const startOnboardingMutation = useStartOnboarding();
  const completeTaskMutation = useCompleteOnboardingTask();
  const reassignTaskMutation = useReassignOnboardingTask();
  const completeReviewMutation = useCompleteProbationReview();
  const decideProbationMutation = useDecideProbation();

  const [reassignTask, setReassignTask] = useState<ChecklistItem | null>(null);
  const [isExtendOpen, setIsExtendOpen] = useState(false);
  const [completeReview, setCompleteReview] = useState<ProbationReview | null>(
    null,
  );
  const [stepOverride, setStepOverride] = useState<number | null>(null);

  const baseHire = useMemo(() => {
    const employee = (employeesQuery.data ?? []).find(
      (e) => e.id === employeeId,
    );
    return employee ? toUiHire(employee) : null;
  }, [employeesQuery.data, employeeId]);

  const checklist = useMemo<ChecklistItem[]>(
    () => (tasksQuery.data ?? []).map(toChecklistItem),
    [tasksQuery.data],
  );

  const hire = useMemo(() => {
    if (!baseHire) return null;
    const completed = checklist.filter((i) => i.completed).length;
    const reviewsDone = (reviewsQuery.data ?? []).filter(
      (r) =>
        r.completed || String(r.status ?? "").toLowerCase() === "completed",
    ).length;
    return {
      ...baseHire,
      progress: checklist.length
        ? Math.round((completed / checklist.length) * 100)
        : 0,
      probationStep:
        stepOverride ??
        Math.min(reviewsDone, PROBATION_STEPS.length - 1),
    };
  }, [baseHire, checklist, reviewsQuery.data, stepOverride]);

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

  const handleAdvanceMilestone = () => {
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

  const handleConfirmProbation = () => {
    toast.promise(
      decideProbationMutation.mutateAsync({
        employeeId,
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
    try {
      await decideProbationMutation.mutateAsync({
        employeeId,
        decision: "extend",
        ...values,
      });
      toast.success("Probation extended");
      setIsExtendOpen(false);
    } catch (error) {
      toast.error(extract_message(error as never));
    }
  };

  const handleStartOnboarding = () => {
    toast.promise(startOnboardingMutation.mutateAsync(employeeId), {
      loading: "Starting onboarding...",
      success: "Onboarding started",
      error: (error) => extract_message(error as never),
    });
  };

  return (
    <div className="space-y-6 pb-12">
      <Link
        to="/hr/onboarding"
        className="inline-flex items-center gap-2 font-medium text-base-content/80 hover:text-primary transition-colors"
      >
        <ArrowLeft className="size-4" />
        <span>Back to Onboarding</span>
      </Link>

      <PageLoader
        query={employeesQuery}
        emptyState={{
          title: "No employees yet",
          description: "Add employees before starting an onboarding pipeline.",
          actionText: "Refresh",
          onAction: () => employeesQuery.refetch(),
        }}
      >
        {!hire ? (
          <div className="card bg-base-100 border border-base-200 p-8 text-center max-w-lg mx-auto my-12 space-y-3">
            <h3 className="font-semibold text-lg text-base-content">
              Employee not found
            </h3>
            <p className="text-base-content/80">
              This onboarding record does not match any employee in the
              directory.
            </p>
            <Link to="/hr/onboarding" className="btn btn-sm btn-primary">
              Back to Onboarding
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Hire summary */}
            <div className="card bg-base-100 border border-base-200 shadow-sm p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-base-content">
                      {hire.name}
                    </h1>
                    <span className="badge badge-sm badge-ghost font-semibold">
                      {hire.progress}% onboarded
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-base-content/80">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Briefcase className="size-3.5 text-primary" />
                      {hire.role}
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <Building2 className="size-3.5 text-info" />
                      {hire.dept}
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <CalendarDays className="size-3.5 text-warning" />
                      Starts {hire.start}
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <Mail className="size-3.5 text-base-content/50" />
                      {hire.email}
                    </span>
                  </div>
                </div>

                {tasksQuery.isSuccess && checklist.length === 0 && (
                  <button
                    type="button"
                    onClick={handleStartOnboarding}
                    disabled={startOnboardingMutation.isPending}
                    className="btn btn-sm bg-primary text-white hover:bg-primary/90 border-0 rounded-xl px-4 gap-1.5 shadow-sm shadow-primary/20 self-start sm:self-auto"
                  >
                    <Play className="size-3.5" />
                    <span>Start Onboarding</span>
                  </button>
                )}
              </div>

              <div className="mt-4 flex items-center gap-3">
                <div className="flex-1 h-2 bg-base-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      hire.progress === 100
                        ? "bg-emerald-500"
                        : hire.progress >= 50
                          ? "bg-primary"
                          : "bg-amber-500"
                    }`}
                    style={{ width: `${hire.progress}%` }}
                  />
                </div>
                <span className="font-bold font-mono text-base-content/80">
                  {hire.progress}%
                </span>
              </div>
            </div>

            <QueryCompLayout query={tasksQuery}>
              <OnboardingChecklist
                hire={hire}
                checklist={checklist}
                onToggleItem={handleToggleItem}
                onReassign={setReassignTask}
              />
            </QueryCompLayout>

            <QueryCompLayout query={reviewsQuery}>
              <ProbationTracker
                hire={hire}
                onUpdateStep={(_hireId, stepIndex) =>
                  setStepOverride(
                    Math.min(
                      Math.max(stepIndex, 0),
                      PROBATION_STEPS.length - 1,
                    ),
                  )
                }
                onAdvance={handleAdvanceMilestone}
                onConfirm={handleConfirmProbation}
                onExtend={() => setIsExtendOpen(true)}
              />
            </QueryCompLayout>

            <QueryCompLayout query={reviewsQuery}>
              <ProbationReviewsCard
                hireName={hire.name}
                reviews={reviewsQuery.data ?? []}
                onCompleteReview={setCompleteReview}
              />
            </QueryCompLayout>
          </div>
        )}
      </PageLoader>

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
        hireName={hire?.name ?? "this employee"}
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

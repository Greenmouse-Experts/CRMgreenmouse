import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/Headers/PageHeader";
import PageLoader from "@/components/layout/PageLoader";
import QueryCompLayout from "@/components/layout/QueryCompLayout";
import OnboardingStats from "./-components/OnboardingStats";
import NewHireCards from "./-components/NewHireCards";
import OnboardingChecklist from "./-components/OnboardingChecklist";
import ProbationTracker from "./-components/ProbationTracker";
import AddOnboardingModal from "./-components/AddOnboardingModal";
import { PROBATION_STEPS } from "./-components/onboardingData";
import type {
  ChecklistItem,
  DepartmentTag,
  OnboardingHire,
} from "./-components/types";
import {
  useCompleteOnboardingTask,
  useCompleteProbationReview,
  useDecideProbation,
  useOnboardingTasks,
  useProbationReviews,
  useStartOnboarding,
  type OnboardingTask,
} from "@/api/onboardingApi";
import { useEmployees, type EmployeeRecord } from "@/api/employeesApi";
import { extract_message } from "@/helpers/auth";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/hr/onboarding/")({
  component: RouteComponent,
});

const UNKNOWN = "—";
const DEPARTMENT_MAP: Record<string, DepartmentTag> = {
  hr: "HR",
  human_resources: "HR",
  it: "IT",
  ict: "IT",
  manager: "Manager",
  payroll: "Payroll",
};

function toUiHire(employee: EmployeeRecord): OnboardingHire {
  const firstName = employee.firstName ?? employee.first_name ?? "";
  const lastName = employee.lastName ?? employee.last_name ?? "";
  const name =
    (employee.name ?? employee.fullName ?? `${firstName} ${lastName}`.trim()) ||
    UNKNOWN;

  const roleName =
    typeof employee.position === "object"
      ? employee.position?.name
      : typeof employee.role === "object"
        ? employee.role?.name
        : (employee.positionName ??
          employee.position_name ??
          employee.jobTitle ??
          employee.position ??
          UNKNOWN);

  const deptName =
    typeof employee.department === "object"
      ? employee.department?.name
      : (employee.departmentName ??
        employee.department_name ??
        employee.department ??
        UNKNOWN);

  const startFormatted = employee.startDate
    ? new Date(employee.startDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : employee.createdAt
      ? new Date(employee.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      : UNKNOWN;

  return {
    id: employee.id,
    name,
    role: roleName,
    dept: deptName,
    email: employee.email ?? UNKNOWN,
    start: startFormatted,
    progress: 0,
    probationStep: 0,
  };
}

function toChecklistItem(raw: OnboardingTask): ChecklistItem {
  const deptKey = String(raw.department ?? raw.dept ?? "hr").toLowerCase();
  const status = String(raw.status ?? "").toLowerCase();

  return {
    id: raw.id,
    dept: DEPARTMENT_MAP[deptKey] ?? "HR",
    text:
      raw.title ?? raw.name ?? raw.text ?? raw.description ?? "Untitled task",
    completed: Boolean(
      raw.completed ??
      raw.isCompleted ??
      (status === "completed" || status === "done"),
    ),
  };
}

function RouteComponent() {
  const employeesQuery = useEmployees();

  const startOnboardingMutation = useStartOnboarding();
  const completeTaskMutation = useCompleteOnboardingTask();
  const completeReviewMutation = useCompleteProbationReview();
  const decideProbationMutation = useDecideProbation();

  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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
    return {
      ...selectedBaseHire,
      progress: checklist.length
        ? Math.round((completed / checklist.length) * 100)
        : 0,
      probationStep:
        probationOverrides[selectedBaseHire.id] ??
        selectedBaseHire.probationStep,
    };
  }, [selectedBaseHire, checklist, probationOverrides]);

  const handleToggleItem = (itemId: string) => {
    toast.promise(completeTaskMutation.mutateAsync({ taskId: itemId }), {
      loading: "Updating task...",
      success: "Onboarding task completed",
      error: (error) => extract_message(error as never),
    });
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

    toast.promise(
      completeReviewMutation.mutateAsync({ reviewId: pendingReview.id }),
      {
        loading: "Completing review...",
        success: "Probation review completed",
        error: (error) => extract_message(error as never),
      },
    );
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
    </div>
  );
}

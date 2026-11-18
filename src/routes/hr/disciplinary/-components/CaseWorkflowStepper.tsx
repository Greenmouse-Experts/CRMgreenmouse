import { Check } from "lucide-react";
import { WORKFLOW_STEPS } from "./disciplinaryData";
import type { WorkflowStep } from "./types";

interface CaseWorkflowStepperProps {
  currentStep?: WorkflowStep;
  activeStepIndex?: number;
  onStepClick?: (step: WorkflowStep) => void;
}

export default function CaseWorkflowStepper({
  currentStep = "Employee response",
  activeStepIndex,
  onStepClick,
}: CaseWorkflowStepperProps) {
  const currentIndex =
    activeStepIndex !== undefined
      ? activeStepIndex
      : WORKFLOW_STEPS.indexOf(currentStep);

  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm p-5 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-base-content">
            Mandatory Due-Process Workflow
          </h2>
          <p className="text-xs text-base-content/60">
            Every formal complaint follows strict fair-hearing and statutory compliance stages.
          </p>
        </div>
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <span className="badge badge-sm badge-outline text-[11px] font-medium text-primary border-primary/30 bg-primary/5">
            Stage {currentIndex + 1} of {WORKFLOW_STEPS.length}
          </span>
        </div>
      </div>

      {/* Stepper Flow */}
      <div className="relative">
        {/* Desktop / Tablet Stepper */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {WORKFLOW_STEPS.map((step, idx) => {
            const isCompleted = idx < currentIndex;
            const isCurrent = idx === currentIndex;

            return (
              <button
                key={step}
                type="button"
                onClick={() => onStepClick?.(step)}
                className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                  isCurrent
                    ? "bg-primary/5 border-primary shadow-xs ring-1 ring-primary/20"
                    : isCompleted
                      ? "bg-base-200/40 border-base-200 text-base-content/80 hover:bg-base-200/70"
                      : "bg-base-100 border-base-200 text-base-content/50 hover:bg-base-200/40"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span
                    className={`inline-flex items-center justify-center size-6 rounded-full text-xs font-bold ${
                      isCurrent
                        ? "bg-primary text-white"
                        : isCompleted
                          ? "bg-emerald-500 text-white"
                          : "bg-base-200 text-base-content/60"
                    }`}
                  >
                    {isCompleted ? <Check className="size-3.5 stroke-[3]" /> : idx + 1}
                  </span>
                  {isCurrent && (
                    <span className="size-2 rounded-full bg-primary animate-ping" />
                  )}
                </div>
                <span
                  className={`text-xs font-semibold leading-tight ${
                    isCurrent
                      ? "text-primary"
                      : isCompleted
                        ? "text-base-content font-medium"
                        : "text-base-content/60 font-normal"
                  }`}
                >
                  {step}
                </span>
                <span className="text-[10px] text-base-content/40 mt-0.5">
                  {isCompleted
                    ? "Completed"
                    : isCurrent
                      ? "In progress"
                      : "Pending"}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

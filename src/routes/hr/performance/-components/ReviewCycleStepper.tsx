import { CheckCircle2, Clock, CircleDot } from "lucide-react";
import { REVIEW_CYCLE_STEPS } from "./performanceData";

interface ReviewCycleStepperProps {
  currentStepIndex?: number;
}

export default function ReviewCycleStepper({
  currentStepIndex = 1, // 0-indexed: 1 = Self assessment
}: ReviewCycleStepperProps) {
  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-base-200 pb-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-base-content">
            Review cycle
          </h2>
          <p className=" text-base-content/80 mt-0.5">
            5-stage evaluation workflow from goal assignment through sign-off.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1  font-semibold text-primary">
          <Clock className="size-3.5" />
          <span>
            Stage {currentStepIndex + 1} of {REVIEW_CYCLE_STEPS.length}:{" "}
            {REVIEW_CYCLE_STEPS[currentStepIndex]}
          </span>
        </div>
      </div>

      {/* Steps visualization */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
        {REVIEW_CYCLE_STEPS.map((step, idx) => {
          const isCompleted = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;

          return (
            <div
              key={step}
              className={`relative flex sm:flex-col items-center gap-3 p-3 rounded-xl border transition-all ${
                isCurrent
                  ? "bg-primary/5 border-primary/80 shadow-xs ring-1 ring-primary/20"
                  : isCompleted
                    ? "bg-emerald-500/5 border-emerald-500/30"
                    : "bg-base-200/80 border-base-200 text-base-content/80"
              }`}
            >
              <div
                className={`size-8 rounded-full flex items-center justify-center  font-bold shrink-0 transition-colors ${
                  isCurrent
                    ? "bg-primary text-white shadow-xs"
                    : isCompleted
                      ? "bg-emerald-600 text-white"
                      : "bg-base-200 text-base-content/80"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="size-4" />
                ) : isCurrent ? (
                  <CircleDot className="size-4 animate-pulse" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>

              <div className="min-w-0 sm:text-center">
                <span className="text-[10px] font-semibold uppercase tracking-wider block opacity-70">
                  Step {idx + 1}
                </span>
                <span
                  className={` font-bold leading-tight block ${
                    isCurrent
                      ? "text-primary"
                      : isCompleted
                        ? "text-base-content"
                        : "text-base-content/80"
                  }`}
                >
                  {step}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

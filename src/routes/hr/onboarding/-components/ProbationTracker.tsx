import type { OnboardingHire } from "./types";
import { PROBATION_STEPS } from "./onboardingData";
import { Check, CalendarCheck, Award, ArrowRight } from "lucide-react";

interface ProbationTrackerProps {
  hire: OnboardingHire;
  onUpdateStep: (hireId: string, stepIndex: number) => void;
  onAdvance: (hireId: string) => void;
  onConfirm: (hireId: string) => void;
}

export default function ProbationTracker({
  hire,
  onUpdateStep,
  onAdvance,
  onConfirm,
}: ProbationTrackerProps) {
  const currentStep = hire.probationStep;

  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm p-4 sm:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-base-content">
            Probation tracker
          </h2>
          <p className=" text-base-content/80">
            Performance checkpoints, evaluation reviews, and employment
            confirmation for {hire.name}
          </p>
        </div>

        <span className="badge badge-sm badge-outline  font-semibold self-start sm:self-auto">
          Current: {PROBATION_STEPS[currentStep] || "Day 1"}
        </span>
      </div>

      {/* Stepper */}
      <div className="relative py-2">
        <div className="overflow-x-auto pb-2">
          <div className="flex items-center min-w-[560px] justify-between relative px-2">
            {/* Connector Lines */}
            <div className="absolute top-4 left-6 right-6 h-0.5 bg-base-300 -z-0" />
            <div
              className="absolute top-4 left-6 h-0.5 bg-primary -z-0 transition-all duration-500"
              style={{
                width: `${(currentStep / (PROBATION_STEPS.length - 1)) * 100}%`,
              }}
            />

            {PROBATION_STEPS.map((step, idx) => {
              const isCompleted = idx < currentStep;
              const isCurrent = idx === currentStep;

              return (
                <button
                  key={step}
                  type="button"
                  onClick={() => onUpdateStep(hire.id, idx)}
                  className="relative z-10 flex flex-col items-center gap-2 group cursor-pointer focus:outline-none"
                >
                  <div
                    className={`size-8 rounded-full flex items-center justify-center font-bold  transition-all duration-200 ${
                      isCompleted
                        ? "bg-primary text-white shadow-xs"
                        : isCurrent
                          ? "bg-primary text-white ring-4 ring-primary/20 shadow-md scale-105"
                          : "bg-base-200 text-base-content/80 border border-base-300 group-hover:border-primary/80"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="size-4 stroke-[3]" />
                    ) : (
                      <span>{idx + 1}</span>
                    )}
                  </div>
                  <span
                    className={` text-center font-medium max-w-[90px] leading-tight ${
                      isCurrent
                        ? "text-primary font-bold"
                        : isCompleted
                          ? "text-base-content"
                          : "text-base-content/80 group-hover:text-base-content/80"
                    }`}
                  >
                    {step}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Milestone Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl bg-base-200/80 p-4 border border-base-200">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <CalendarCheck className="size-4" />
          </div>
          <div>
            <p className=" font-bold text-base-content">
              {currentStep >= 4
                ? `${hire.name} has completed probation milestones`
                : `Next evaluation: ${PROBATION_STEPS[currentStep + 1] || "Confirmation"}`}
            </p>
            <p className="text-[11px] text-base-content/80">
              {currentStep >= 4
                ? "Ready to formalize permanent employment contract."
                : "Schedule check-in with line manager and review 30/80/90-day objectives."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          {currentStep < 4 ? (
            <button
              type="button"
              onClick={() => onAdvance(hire.id)}
              className="btn btn-xs bg-primary text-white hover:bg-primary/90 border-0 rounded-lg px-3 gap-1"
            >
              <span>Advance Milestone</span>
              <ArrowRight className="size-3" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onConfirm(hire.id)}
              className="btn btn-xs bg-emerald-600 text-white hover:bg-emerald-700 border-0 rounded-lg px-3 gap-1"
            >
              <Award className="size-3" />
              <span>Confirm Permanent</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

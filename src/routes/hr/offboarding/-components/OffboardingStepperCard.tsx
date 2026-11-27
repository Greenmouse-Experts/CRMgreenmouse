import {
  Check,
  CheckCircle2,
  ChevronDown,
  ShieldOff,
  UserMinus,
} from "lucide-react";
import { OFFBOARDING_STEPS } from "./offboardingData";
import type { OffboardingCase } from "./types";
import {
  useAcceptOffboardingCase,
  useApproveOffboardingSettlement,
  useAuthorizeOffboardingRevocation,
  useSubmitOffboardingSettlement,
} from "@/api/offboardingApi";
import { extract_message } from "@/helpers/errors";
import { toast } from "sonner";

interface OffboardingStepperCardProps {
  activeCase: OffboardingCase;
  allCases: OffboardingCase[];
  onSelectCase: (caseItem: OffboardingCase) => void;
}

export default function OffboardingStepperCard({
  activeCase,
  allCases,
  onSelectCase,
}: OffboardingStepperCardProps) {
  const acceptCase = useAcceptOffboardingCase();
  const submitSettlement = useSubmitOffboardingSettlement();
  const approveSettlement = useApproveOffboardingSettlement();
  const authorizeRevocation = useAuthorizeOffboardingRevocation();

  const currentStepIndex = Math.max(
    0,
    OFFBOARDING_STEPS.indexOf(activeCase.currentStep),
  );

  const parsedLastDay = activeCase.lastWorkingDay
    ? new Date(activeCase.lastWorkingDay)
    : null;
  const formattedLastDay =
    parsedLastDay && !Number.isNaN(parsedLastDay.getTime())
      ? parsedLastDay.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      : "—";

  const handleAccept = async () => {
    if (!activeCase.id) {
      toast.error("Cannot accept: case ID is missing");
      return;
    }
    try {
      await acceptCase.mutateAsync({ id: activeCase.id });
      toast.success(`Offboarding notice accepted for ${activeCase.employee}`);
    } catch (error) {
      toast.error(extract_message(error));
    }
  };

  const handleAuthorizeRevocation = async () => {
    if (!activeCase.id) {
      toast.error("Cannot authorize revocation: case ID is missing");
      return;
    }
    try {
      await authorizeRevocation.mutateAsync({
        caseId: activeCase.id,
        revokeAt: new Date().toISOString(),
        reason: "Authorized from offboarding pipeline",
      });
      toast.success(`Access revocation authorized for ${activeCase.employee}`);
    } catch (error) {
      toast.error(extract_message(error));
    }
  };

  const handleSettlementAction = async () => {
    if (!activeCase.id) {
      toast.error("Cannot process settlement: case ID is missing");
      return;
    }
    try {
      if (activeCase.settlementStatus === "submitted") {
        await approveSettlement.mutateAsync({ caseId: activeCase.id });
        toast.success(`Final settlement approved for ${activeCase.employee}`);
      } else {
        await submitSettlement.mutateAsync(activeCase.id);
        toast.success(`Final settlement submitted for ${activeCase.employee}`);
      }
    } catch (error) {
      toast.error(extract_message(error));
    }
  };

  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm p-5 sm:p-6 space-y-5">
      {/* Employee Selector & Notice Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-base-200">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-2xl bg-primary/10 text-primary font-bold flex items-center justify-center text-sm shadow-xs">
            {activeCase.employee.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-base-content">
                {activeCase.employee}
              </h2>
              <span className="badge badge-sm badge-outline text-sm font-medium">
                {activeCase.role} · {activeCase.department}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5  font-semibold text-amber-700 border border-amber-200">
                <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                {activeCase.status}
              </span>
            </div>
            <p className=" text-base-content/80 mt-0.5">
              Notice period active · Last working day:{" "}
              <span className="font-semibold text-base-content">
                {formattedLastDay}
              </span>{" "}
              ({activeCase.separationType})
            </p>
          </div>
        </div>

        {/* Switch Case Dropdown & Stage Actions */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {allCases.length > 1 && (
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-sm btn-ghost border border-base-200 rounded-xl px-3 gap-1"
              >
                <UserMinus className="size-4 text-base-content/80" />
                <span className="hidden md:inline">Switch Employee</span>
                <ChevronDown className="size-4 text-base-content/80" />
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content z-20 menu p-2 shadow-lg bg-base-100 rounded-box w-56 border border-base-200 mt-1"
              >
                <li className="menu-title px-2 py-1 text-sm uppercase tracking-wider text-base-content/80">
                  Select offboarding record
                </li>
                {allCases.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => onSelectCase(c)}
                      className={
                        c.id === activeCase.id ? "active font-bold" : ""
                      }
                    >
                      <div className="flex flex-col items-start text-left">
                        <span>{c.employee}</span>
                        <span className="text-sm text-base-content/80">
                          {c.department} · {c.status}
                        </span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeCase.currentStep === "Resignation" && (
            <button
              type="button"
              onClick={handleAccept}
              disabled={acceptCase.isPending}
              className="btn btn-sm bg-primary text-white hover:bg-primary/90 rounded-xl px-3.5 gap-1.5 shadow-sm shadow-primary/20"
            >
              <CheckCircle2 className="size-4" />
              <span>
                {acceptCase.isPending ? "Accepting..." : "Accept Notice"}
              </span>
            </button>
          )}

          {activeCase.status !== "Completed" &&
            activeCase.status !== "Cancelled" && (
              <>
                <button
                  type="button"
                  onClick={handleSettlementAction}
                  disabled={
                    submitSettlement.isPending || approveSettlement.isPending
                  }
                  className="btn btn-sm btn-outline rounded-xl px-3.5 gap-1.5"
                >
                  <span>
                    {activeCase.settlementStatus === "submitted"
                      ? "Approve Settlement"
                      : "Submit Settlement"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleAuthorizeRevocation}
                  disabled={authorizeRevocation.isPending}
                  className="btn btn-sm btn-outline btn-error rounded-xl px-3.5 gap-1.5"
                >
                  <ShieldOff className="size-4" />
                  <span>
                    {authorizeRevocation.isPending
                      ? "Authorizing..."
                      : "Authorize Revocation"}
                  </span>
                </button>
              </>
            )}
        </div>
      </div>

      {/* 8-Step Workflow Horizontal Stepper */}
      <div className="space-y-2">
        <div className="flex items-center justify-between font-semibold text-base-content/80">
          <span className="uppercase tracking-wider text-sm">
            Offboarding Milestone Pipeline
          </span>
          <span className="text-primary font-bold">
            Step {currentStepIndex + 1} of {OFFBOARDING_STEPS.length}:{" "}
            {activeCase.currentStep}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {OFFBOARDING_STEPS.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div
                key={step}
                className={`p-2.5 rounded-xl border flex flex-col items-start text-left transition-all ${
                  isCurrent
                    ? "bg-primary/5 border-primary shadow-xs ring-1 ring-primary/20"
                    : isCompleted
                      ? "bg-base-200/80 border-base-200 text-base-content/80"
                      : "bg-base-100 border-base-200 text-base-content/80"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <span
                    className={`inline-flex items-center justify-center size-5 rounded-full text-sm font-bold ${
                      isCurrent
                        ? "bg-primary text-white"
                        : isCompleted
                          ? "bg-emerald-500 text-white"
                          : "bg-base-200 text-base-content/80"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="size-3 stroke-[3]" />
                    ) : (
                      idx + 1
                    )}
                  </span>
                  {isCurrent && (
                    <span className="size-1.5 rounded-full bg-primary animate-ping" />
                  )}
                </div>
                <span
                  className={`text-sm font-semibold leading-tight line-clamp-1 ${
                    isCurrent
                      ? "text-primary"
                      : isCompleted
                        ? "text-base-content font-medium"
                        : "text-base-content/80 font-normal"
                  }`}
                  title={step}
                >
                  {step}
                </span>
                <span className="text-sm text-base-content/80 mt-0.5">
                  {isCompleted ? "Done" : isCurrent ? "Active" : "Pending"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

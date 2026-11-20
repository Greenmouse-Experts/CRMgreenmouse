import { useRef, useEffect } from "react";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import type { DisciplinaryCase, WorkflowStep } from "./types";
import { WORKFLOW_STEPS } from "./disciplinaryData";
import { ArrowRight, CheckCircle2, FileText, Scale } from "lucide-react";

interface CaseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseItem: DisciplinaryCase | null;
  onAdvanceStep: (id: string, nextStep: WorkflowStep) => void;
  onCloseCase: (id: string) => void;
}

export default function CaseDetailModal({
  isOpen,
  onClose,
  caseItem,
  onAdvanceStep,
  onCloseCase,
}: CaseDetailModalProps) {
  const modalRef = useRef<ModalHandle>(null);

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.open();
    } else {
      modalRef.current?.close();
    }
  }, [isOpen]);

  if (!caseItem) return null;

  const currentStepIdx = WORKFLOW_STEPS.indexOf(caseItem.currentStep);
  const canAdvance =
    currentStepIdx < WORKFLOW_STEPS.length - 1 && caseItem.status !== "Closed";
  const nextStep = canAdvance ? WORKFLOW_STEPS[currentStepIdx + 1] : null;

  return (
    <Modal
      ref={modalRef}
      title={
        <div className="flex items-center gap-2">
          <span>Case {caseItem.id}</span>
          <span className="badge badge-sm badge-outline font-mono ">
            {caseItem.category}
          </span>
        </div>
      }
      maxWidth="max-w-2xl"
      onClose={onClose}
    >
      <div className="space-y-5">
        {/* Top Details Banner */}
        <div className="rounded-xl border border-base-200 bg-base-200/30 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center ">
                {caseItem.employee.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-base-content text-sm">
                  {caseItem.employee}
                </h3>
                <p className="text-[11px] text-base-content/80">
                  {caseItem.department} · Opened on {caseItem.openedDate}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="badge badge-sm badge-ghost ">
                Severity: {caseItem.severity}
              </span>
              <span
                className={`badge badge-sm  font-semibold ${
                  caseItem.status === "Closed"
                    ? "badge-success"
                    : caseItem.status === "Under Review"
                      ? "badge-warning"
                      : "badge-info"
                }`}
              >
                {caseItem.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5  pt-2 border-t border-base-200/80">
            <div>
              <span className="text-base-content/80 block text-[10px]">
                Reported by
              </span>
              <span className="font-semibold text-base-content">
                {caseItem.reporter}
              </span>
            </div>
            <div>
              <span className="text-base-content/80 block text-[10px]">
                Investigator
              </span>
              <span className="font-semibold text-base-content">
                {caseItem.investigator}
              </span>
            </div>
            <div>
              <span className="text-base-content/80 block text-[10px]">
                Interim action
              </span>
              <span className="font-semibold text-base-content">
                {caseItem.interimAction || "None"}
              </span>
            </div>
          </div>
        </div>

        {/* Incident Summary */}
        <div className="space-y-1.5">
          <h4 className=" font-bold uppercase tracking-wider text-base-content/70 flex items-center gap-1.5">
            <FileText className="size-3.5 text-primary" />
            <span>Incident Description</span>
          </h4>
          <div className="p-3.5 rounded-xl border border-base-200 bg-base-100  text-base-content/90 leading-relaxed">
            {caseItem.description}
          </div>
        </div>

        {caseItem.witnesses && (
          <div className="space-y-1">
            <h4 className=" font-bold uppercase tracking-wider text-base-content/70">
              Witnesses
            </h4>
            <p className=" text-base-content/80 p-2 rounded-lg bg-base-200/40 border border-base-200">
              {caseItem.witnesses}
            </p>
          </div>
        )}

        {/* Workflow Progression Stepper Mini */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className=" font-bold uppercase tracking-wider text-base-content/70 flex items-center gap-1.5">
              <Scale className="size-3.5 text-primary" />
              <span>Current Due Process Stage</span>
            </h4>
            <span className="text-[11px] font-semibold text-primary">
              {caseItem.currentStep}
            </span>
          </div>

          <div className="flex items-center gap-1 w-full bg-base-200/80 p-1.5 rounded-xl">
            {WORKFLOW_STEPS.map((s, idx) => {
              const done = idx <= currentStepIdx;
              return (
                <div
                  key={s}
                  title={s}
                  className={`h-2 flex-1 rounded-sm transition-all ${
                    done
                      ? caseItem.status === "Closed"
                        ? "bg-emerald-500"
                        : "bg-primary"
                      : "bg-base-300"
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Actions Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-base-200">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm btn-ghost rounded-xl"
          >
            Close view
          </button>

          <div className="flex items-center gap-2">
            {caseItem.status !== "Closed" && (
              <button
                type="button"
                onClick={() => {
                  onCloseCase(caseItem.id);
                  onClose();
                }}
                className="btn btn-sm btn-outline btn-error rounded-xl gap-1 "
              >
                <CheckCircle2 className="size-3.5" />
                <span>Mark Concluded</span>
              </button>
            )}

            {canAdvance && nextStep && (
              <button
                type="button"
                onClick={() => {
                  onAdvanceStep(caseItem.id, nextStep);
                  onClose();
                }}
                className="btn btn-sm bg-primary text-white hover:bg-primary/90 rounded-xl px-4 gap-1.5 shadow-sm shadow-primary/20 "
              >
                <span>Advance to {nextStep}</span>
                <ArrowRight className="size-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

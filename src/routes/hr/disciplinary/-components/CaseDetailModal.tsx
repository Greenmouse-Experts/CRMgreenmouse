import { useEffect, useRef, useState } from "react";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import type { DisciplinaryCase, WorkflowStep } from "./types";
import { WORKFLOW_STEPS } from "./disciplinaryData";
import {
  useDisciplinaryCaseEvidence,
  useDisciplinaryCaseHistory,
  useUploadDisciplinaryEvidence,
} from "@/api/disciplinaryApi";
import { extract_message } from "@/helpers/errors";
import { toast } from "sonner";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  History,
  Paperclip,
  Scale,
  Upload,
} from "lucide-react";

interface CaseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseItem: DisciplinaryCase | null;
  onAdvanceStep: (
    id: string,
    nextStep: WorkflowStep,
    notes?: string,
  ) => Promise<void>;
  onCloseCase: (id: string, outcome: string) => Promise<void>;
}

const formatActor = (actor: any) => {
  if (!actor) return "System";
  if (typeof actor === "string") return actor;
  const full = `${actor.firstName ?? ""} ${actor.lastName ?? ""}`.trim();
  return full || actor.name || "System";
};

const formatDateTime = (value?: string) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function CaseDetailModal({
  isOpen,
  onClose,
  caseItem,
  onAdvanceStep,
  onCloseCase,
}: CaseDetailModalProps) {
  const modalRef = useRef<ModalHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stageNotes, setStageNotes] = useState("");
  const [showCloseInput, setShowCloseInput] = useState(false);
  const [outcome, setOutcome] = useState("");
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  const evidenceQuery = useDisciplinaryCaseEvidence(caseItem?.id, isOpen);
  const historyQuery = useDisciplinaryCaseHistory(caseItem?.id, isOpen);
  const uploadEvidenceMutation = useUploadDisciplinaryEvidence();

  useEffect(() => {
    if (isOpen) {
      setStageNotes("");
      setShowCloseInput(false);
      setOutcome("");
      modalRef.current?.open();
    } else {
      modalRef.current?.close();
    }
  }, [isOpen]);

  if (!caseItem) return null;

  const currentStepIdx = WORKFLOW_STEPS.indexOf(caseItem.currentStep);
  const canAdvance =
    currentStepIdx >= 0 &&
    currentStepIdx < WORKFLOW_STEPS.length - 1 &&
    caseItem.status !== "Closed";
  const nextStep = canAdvance ? WORKFLOW_STEPS[currentStepIdx + 1] : null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !caseItem) return;
    try {
      await uploadEvidenceMutation.mutateAsync({ id: caseItem.id, file });
      toast.success("Evidence uploaded");
    } catch (error) {
      toast.error(extract_message(error as any));
    } finally {
      e.target.value = "";
    }
  };

  const handleAdvance = async () => {
    if (!nextStep) return;
    setIsSubmittingAction(true);
    try {
      await onAdvanceStep(
        caseItem.id,
        nextStep,
        stageNotes.trim() || undefined,
      );
      onClose();
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleClose = async () => {
    if (!outcome.trim()) {
      toast.error("Please enter the final outcome before closing the case.");
      return;
    }
    setIsSubmittingAction(true);
    try {
      await onCloseCase(caseItem.id, outcome.trim());
      onClose();
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const evidenceList = evidenceQuery.data ?? [];
  const historyList = historyQuery.data ?? [];

  return (
    <Modal
      ref={modalRef}
      title={
        <div className="flex items-center gap-2">
          <span>Case {caseItem.caseCode}</span>
          <span className="badge badge-sm badge-outline font-mono">
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
              <div className="size-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">
                {caseItem.employee.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-base-content text-sm">
                  {caseItem.employee}
                </h3>
                <p className="text-sm text-base-content/80">
                  {caseItem.department} · Opened on {caseItem.openedDate}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="badge badge-sm badge-ghost">
                Severity: {caseItem.severity}
              </span>
              <span
                className={`badge badge-sm font-semibold ${
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

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-base-200/80">
            <div>
              <span className="text-base-content/70 block text-sm">
                Reported by
              </span>
              <span className="font-semibold text-base-content">
                {caseItem.reporter}
              </span>
            </div>
            <div>
              <span className="text-base-content/70 block text-sm">
                Investigator
              </span>
              <span className="font-semibold text-base-content">
                {caseItem.investigator}
              </span>
            </div>
            <div>
              <span className="text-base-content/70 block text-sm">
                Outcome
              </span>
              <span className="font-semibold text-base-content">
                {caseItem.outcome || caseItem.interimAction || "Pending"}
              </span>
            </div>
          </div>
        </div>

        {/* Incident Summary */}
        <div className="space-y-1.5">
          <h4 className="font-bold uppercase tracking-wider text-base-content/80 flex items-center gap-1.5">
            <FileText className="size-4 text-primary" />
            <span>Incident Description</span>
          </h4>
          <div className="p-3.5 rounded-xl border border-base-200 bg-base-100 text-base-content/90 leading-relaxed">
            {caseItem.description}
          </div>
        </div>

        {caseItem.witnesses && (
          <div className="space-y-1">
            <h4 className="font-bold uppercase tracking-wider text-base-content/80">
              Witnesses
            </h4>
            <p className="text-sm text-base-content/80 p-2.5 rounded-lg bg-base-200/80 border border-base-200">
              {caseItem.witnesses}
            </p>
          </div>
        )}

        {/* Workflow Progression Stepper Mini */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-bold uppercase tracking-wider text-base-content/80 flex items-center gap-1.5">
              <Scale className="size-4 text-primary" />
              <span>Current Due Process Stage</span>
            </h4>
            <span className="text-sm font-semibold text-primary">
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

        {/* Evidence Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-bold uppercase tracking-wider text-base-content/80 flex items-center gap-1.5">
              <Paperclip className="size-4 text-primary" />
              <span>Evidence ({evidenceList.length})</span>
            </h4>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileUpload}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadEvidenceMutation.isPending}
                className="btn btn-sm btn-outline rounded-lg gap-1"
              >
                <Upload className="size-3.5" />
                <span>
                  {uploadEvidenceMutation.isPending
                    ? "Uploading..."
                    : "Upload evidence"}
                </span>
              </button>
            </div>
          </div>

          {evidenceQuery.isLoading ? (
            <p className="text-sm text-base-content/70">Loading evidence...</p>
          ) : evidenceList.length === 0 ? (
            <p className="text-sm text-base-content/70">
              No evidence uploaded for this case yet.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {evidenceList.map((item) => {
                const label =
                  item.fileName || item.name || item.url || "Evidence file";
                const link = item.fileUrl || item.url;
                return (
                  <li
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border border-base-200 bg-base-200/40 px-3 py-2 text-sm"
                  >
                    <span className="truncate font-medium">{label}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-base-content/70">
                        {formatDateTime(item.uploadedAt || item.createdAt)}
                      </span>
                      {link && (
                        <a
                          href={link}
                          target="_blank"
                          rel="noreferrer"
                          className="link link-primary font-medium"
                        >
                          View
                        </a>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* History Section */}
        <div className="space-y-2">
          <h4 className="font-bold uppercase tracking-wider text-base-content/80 flex items-center gap-1.5">
            <History className="size-4 text-primary" />
            <span>Case History</span>
          </h4>
          {historyQuery.isLoading ? (
            <p className="text-sm text-base-content/70">Loading history...</p>
          ) : historyList.length === 0 ? (
            <p className="text-sm text-base-content/70">
              No history entries recorded yet.
            </p>
          ) : (
            <ul className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {historyList.map((entry) => (
                <li
                  key={entry.id}
                  className="rounded-lg border border-base-200 bg-base-200/30 px-3 py-2 text-sm space-y-0.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-base-content">
                      {entry.action || entry.stage || "Stage updated"}
                    </span>
                    <span className="text-base-content/70">
                      {formatDateTime(entry.createdAt || entry.timestamp)}
                    </span>
                  </div>
                  {(entry.notes || entry.outcome) && (
                    <p className="text-base-content/80">
                      {entry.notes || entry.outcome}
                    </p>
                  )}
                  <p className="text-base-content/70">
                    By {formatActor(entry.actor || entry.performedBy)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Optional Notes / Outcome Inputs */}
        {canAdvance && !showCloseInput && (
          <div>
            <label className="font-semibold text-base-content/80 mb-1 block">
              Stage transition notes (optional)
            </label>
            <input
              type="text"
              value={stageNotes}
              onChange={(e) => setStageNotes(e.target.value)}
              placeholder={`Notes for advancing to ${nextStep}...`}
              className="input input-bordered input-sm w-full rounded-xl bg-base-200/80"
            />
          </div>
        )}

        {showCloseInput && caseItem.status !== "Closed" && (
          <div className="space-y-2 rounded-xl border border-error/30 bg-error/5 p-3">
            <label className="font-semibold text-base-content mb-1 block">
              Final Case Outcome <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              placeholder="e.g., Written warning issued, No further action, Dismissal..."
              className="input input-bordered input-sm w-full rounded-xl bg-base-100"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCloseInput(false)}
                className="btn btn-sm btn-ghost rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmittingAction}
                onClick={handleClose}
                className="btn btn-sm btn-error text-white rounded-lg"
              >
                {isSubmittingAction ? "Closing..." : "Confirm Close Case"}
              </button>
            </div>
          </div>
        )}

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
            {caseItem.status !== "Closed" && !showCloseInput && (
              <button
                type="button"
                onClick={() => setShowCloseInput(true)}
                className="btn btn-sm btn-outline btn-error rounded-xl gap-1"
              >
                <CheckCircle2 className="size-4" />
                <span>Mark Concluded</span>
              </button>
            )}

            {canAdvance && nextStep && !showCloseInput && (
              <button
                type="button"
                disabled={isSubmittingAction}
                onClick={handleAdvance}
                className="btn btn-sm bg-primary text-white hover:bg-primary/90 rounded-xl px-4 gap-1.5 shadow-sm shadow-primary/20"
              >
                <span>
                  {isSubmittingAction
                    ? "Advancing..."
                    : `Advance to ${nextStep}`}
                </span>
                <ArrowRight className="size-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

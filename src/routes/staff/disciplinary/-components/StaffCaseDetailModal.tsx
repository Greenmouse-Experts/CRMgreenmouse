import { useEffect, useRef } from "react";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import type { DisciplinaryCase } from "@/routes/hr/disciplinary/-components/types";
import { WORKFLOW_STEPS } from "@/routes/hr/disciplinary/-components/disciplinaryData";
import {
  useDisciplinaryCaseEvidence,
  useDisciplinaryCaseHistory,
} from "@/api/disciplinaryApi";
import { Check, FileText, History, Paperclip, Scale } from "lucide-react";

interface StaffCaseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseItem: DisciplinaryCase | null;
}

const formatActor = (actor: any) => {
  if (!actor) return "HR / System";
  if (typeof actor === "string") return actor;
  const full = `${actor.firstName ?? ""} ${actor.lastName ?? ""}`.trim();
  return full || actor.name || "HR / System";
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

export default function StaffCaseDetailModal({
  isOpen,
  onClose,
  caseItem,
}: StaffCaseDetailModalProps) {
  const modalRef = useRef<ModalHandle>(null);

  const evidenceQuery = useDisciplinaryCaseEvidence(caseItem?.id, isOpen);
  const historyQuery = useDisciplinaryCaseHistory(caseItem?.id, isOpen);

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.open();
    } else {
      modalRef.current?.close();
    }
  }, [isOpen]);

  if (!caseItem) return null;

  const currentStepIdx = WORKFLOW_STEPS.indexOf(caseItem.currentStep);
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
            <div>
              <h3 className="font-bold text-base-content text-sm">
                {caseItem.employee}
              </h3>
              <p className="text-sm text-base-content/80">
                Opened on {caseItem.openedDate}
                {caseItem.incidentDate
                  ? ` · Incident date: ${caseItem.incidentDate}`
                  : ""}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="badge badge-sm badge-ghost capitalize">
                Severity: {caseItem.severity}
              </span>
              <span
                className={`badge badge-sm font-semibold ${
                  caseItem.status === "Closed"
                    ? "badge-success"
                    : caseItem.status === "Under Review" ||
                        caseItem.status === "Investigation"
                      ? "badge-warning"
                      : "badge-info"
                }`}
              >
                {caseItem.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-base-200/80 text-sm">
            <div>
              <span className="text-base-content/70 block text-xs">
                Reported by
              </span>
              <span className="font-semibold text-base-content">
                {caseItem.reporter}
              </span>
            </div>
            <div>
              <span className="text-base-content/70 block text-xs">
                Investigator
              </span>
              <span className="font-semibold text-base-content">
                {caseItem.investigator}
              </span>
            </div>
            <div>
              <span className="text-base-content/70 block text-xs">
                Outcome
              </span>
              <span className="font-semibold text-base-content">
                {caseItem.outcome || caseItem.interimAction || "Pending HR review"}
              </span>
            </div>
          </div>
        </div>

        {/* Incident Summary */}
        <div className="space-y-1.5">
          <h4 className="font-bold uppercase tracking-wider text-xs text-base-content/80 flex items-center gap-1.5">
            <FileText className="size-4 text-primary" />
            <span>Incident Summary</span>
          </h4>
          <div className="p-3.5 rounded-xl border border-base-200 bg-base-100 text-sm text-base-content/90 leading-relaxed">
            {caseItem.description || "No additional summary provided."}
          </div>
        </div>

        {caseItem.witnesses && (
          <div className="space-y-1">
            <h4 className="font-bold uppercase tracking-wider text-xs text-base-content/80">
              Witnesses
            </h4>
            <p className="text-sm text-base-content/80 p-2.5 rounded-lg bg-base-200/60 border border-base-200">
              {caseItem.witnesses}
            </p>
          </div>
        )}

        {/* Due Process Stage Stepper */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="font-bold uppercase tracking-wider text-xs text-base-content/80 flex items-center gap-1.5">
              <Scale className="size-4 text-primary" />
              <span>Due-Process Stage Progression</span>
            </h4>
            <span className="text-sm font-semibold text-primary">
              {caseItem.currentStep}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
            {WORKFLOW_STEPS.map((step, idx) => {
              const isCompleted =
                caseItem.status === "Closed" || idx < currentStepIdx;
              const isCurrent =
                caseItem.status !== "Closed" && idx === currentStepIdx;

              return (
                <div
                  key={step}
                  className={`rounded-xl border p-2 text-center text-xs transition-all ${
                    isCurrent
                      ? "border-primary bg-primary/10 text-primary font-bold"
                      : isCompleted
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold"
                        : "border-base-200 bg-base-200/40 text-base-content/60"
                  }`}
                >
                  <div className="flex justify-center mb-1">
                    <span
                      className={`size-5 rounded-full inline-flex items-center justify-center text-[10px] font-bold ${
                        isCurrent
                          ? "bg-primary text-white"
                          : isCompleted
                            ? "bg-emerald-500 text-white"
                            : "bg-base-300 text-base-content/70"
                      }`}
                    >
                      {isCompleted ? <Check className="size-3" /> : idx + 1}
                    </span>
                  </div>
                  <span className="block leading-tight">{step}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Read-only Evidence Section */}
        <div className="space-y-2">
          <h4 className="font-bold uppercase tracking-wider text-xs text-base-content/80 flex items-center gap-1.5">
            <Paperclip className="size-4 text-primary" />
            <span>Supporting Evidence ({evidenceList.length})</span>
          </h4>

          {evidenceQuery.isLoading ? (
            <p className="text-sm text-base-content/70">Loading evidence...</p>
          ) : evidenceList.length === 0 ? (
            <p className="text-sm text-base-content/70">
              No evidence documents attached to this case.
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
                      <span className="text-xs text-base-content/70">
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

        {/* HR Updates / Case History Timeline */}
        <div className="space-y-2">
          <h4 className="font-bold uppercase tracking-wider text-xs text-base-content/80 flex items-center gap-1.5">
            <History className="size-4 text-primary" />
            <span>Status History &amp; HR Updates</span>
          </h4>
          {historyQuery.isLoading ? (
            <p className="text-sm text-base-content/70">Loading updates...</p>
          ) : historyList.length === 0 ? (
            <p className="text-sm text-base-content/70">
              No status transition history recorded yet.
            </p>
          ) : (
            <ul className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
              {historyList.map((entry) => (
                <li
                  key={entry.id}
                  className="rounded-lg border border-base-200 bg-base-200/30 px-3 py-2 text-sm space-y-0.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-base-content">
                      {entry.action || entry.stage || "Status updated"}
                    </span>
                    <span className="text-xs text-base-content/70">
                      {formatDateTime(entry.createdAt || entry.timestamp)}
                    </span>
                  </div>
                  {(entry.notes || entry.outcome) && (
                    <p className="text-base-content/80 text-xs">
                      {entry.notes || entry.outcome}
                    </p>
                  )}
                  <p className="text-xs text-base-content/70">
                    Updated by {formatActor(entry.actor || entry.performedBy)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex justify-end pt-3 border-t border-base-200">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm btn-ghost rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}

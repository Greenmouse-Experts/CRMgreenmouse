import { useEffect, useRef, useState } from "react";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import { CheckCircle2, Archive, EyeOff, Lock, XCircle } from "lucide-react";

export type VacancyLifecycleAction =
  | "approve"
  | "reject"
  | "unpublish"
  | "close"
  | "archive";

interface VacancyActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: VacancyLifecycleAction | null;
  vacancyTitle?: string;
  onConfirm: (reason?: string) => Promise<void> | void;
  isPending?: boolean;
}

const ACTION_CONFIG: Record<
  VacancyLifecycleAction,
  {
    title: string;
    description: string;
    confirmLabel: string;
    buttonClass: string;
    reasonLabel: string;
    reasonPlaceholder: string;
    requireReason: boolean;
  }
> = {
  approve: {
    title: "Approve Vacancy",
    description:
      "Approving this vacancy clears it for publishing to recruitment channels.",
    confirmLabel: "Approve vacancy",
    buttonClass: "bg-primary text-white hover:bg-primary/90 border-0",
    reasonLabel: "Approval note (optional)",
    reasonPlaceholder: "e.g. Budget and headcount verified.",
    requireReason: false,
  },
  reject: {
    title: "Reject Vacancy",
    description:
      "Rejecting returns a negative decision on this requisition. Provide a clear reason for the requester.",
    confirmLabel: "Reject vacancy",
    buttonClass: "btn-error text-white border-0",
    reasonLabel: "Rejection reason *",
    reasonPlaceholder: "Explain why this vacancy requisition is being rejected...",
    requireReason: true,
  },
  unpublish: {
    title: "Unpublish Vacancy",
    description:
      "Remove this vacancy from public job boards while keeping the requisition open internally.",
    confirmLabel: "Unpublish vacancy",
    buttonClass: "btn-warning text-warning-content border-0",
    reasonLabel: "Reason (optional)",
    reasonPlaceholder: "e.g. Reviewing current shortlist before accepting more applications.",
    requireReason: false,
  },
  close: {
    title: "Close Vacancy",
    description:
      "Closing marks this vacancy as filled or no longer accepting applications.",
    confirmLabel: "Close vacancy",
    buttonClass: "btn-error text-white border-0",
    reasonLabel: "Closure reason (optional)",
    reasonPlaceholder: "e.g. Position filled or hiring paused.",
    requireReason: false,
  },
  archive: {
    title: "Archive Vacancy",
    description:
      "Archiving moves this vacancy record out of active hiring operations.",
    confirmLabel: "Archive vacancy",
    buttonClass: "btn-neutral text-white border-0",
    reasonLabel: "Archive reason (optional)",
    reasonPlaceholder: "e.g. Requisition completed for Q4 cycle.",
    requireReason: false,
  },
};

export default function VacancyActionModal({
  isOpen,
  onClose,
  action,
  vacancyTitle,
  onConfirm,
  isPending = false,
}: VacancyActionModalProps) {
  const modalRef = useRef<ModalHandle>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setReason("");
      setError("");
      modalRef.current?.open();
    } else {
      modalRef.current?.close();
    }
  }, [isOpen, action]);

  if (!action) return null;

  const cfg = ACTION_CONFIG[action];

  const renderIcon = () => {
    switch (action) {
      case "approve":
        return <CheckCircle2 className="size-4 text-primary" />;
      case "reject":
        return <XCircle className="size-4 text-error" />;
      case "unpublish":
        return <EyeOff className="size-4 text-amber-600" />;
      case "close":
        return <Lock className="size-4 text-error" />;
      case "archive":
        return <Archive className="size-4 text-base-content/80" />;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cfg.requireReason && !reason.trim()) {
      setError("Please provide a reason before continuing.");
      return;
    }
    setError("");
    await onConfirm(reason.trim() || undefined);
  };

  return (
    <Modal
      ref={modalRef}
      title={
        <div className="flex items-center gap-2">
          {renderIcon()}
          <span>{cfg.title}</span>
        </div>
      }
      maxWidth="max-w-md"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-xl border border-base-200 bg-base-200/40 p-3.5 text-sm space-y-1">
          {vacancyTitle && (
            <p className="font-bold text-base-content">{vacancyTitle}</p>
          )}
          <p className="text-base-content/80">{cfg.description}</p>
        </div>

        <div>
          <label className="font-semibold text-sm text-base-content/80 block mb-1.5">
            {cfg.reasonLabel}
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError("");
            }}
            placeholder={cfg.reasonPlaceholder}
            disabled={isPending}
            className="textarea textarea-bordered w-full rounded-xl bg-base-200/70"
          />
          {error && <p className="text-error text-xs mt-1">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-base-200">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="btn btn-sm btn-ghost rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className={`btn btn-sm rounded-xl px-4 gap-1.5 ${cfg.buttonClass}`}
          >
            {isPending && <span className="loading loading-spinner loading-xs" />}
            <span>{isPending ? "Processing..." : cfg.confirmLabel}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}

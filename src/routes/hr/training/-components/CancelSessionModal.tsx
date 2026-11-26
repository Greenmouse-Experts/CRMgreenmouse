import { useEffect, useRef, useState } from "react";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import { AlertTriangle, XCircle } from "lucide-react";

interface CancelSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionLabel?: string;
  isPending?: boolean;
  onConfirm: (reason: string) => Promise<void> | void;
}

export default function CancelSessionModal({
  isOpen,
  onClose,
  sessionLabel,
  isPending,
  onConfirm,
}: CancelSessionModalProps) {
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
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = reason.trim();
    if (!trimmed) {
      setError("Please provide a reason for cancelling this session.");
      return;
    }
    setError("");
    await onConfirm(trimmed);
  };

  return (
    <Modal
      ref={modalRef}
      title={
        <div className="flex items-center gap-2 text-error">
          <AlertTriangle className="size-5" />
          <span>Cancel Training Session</span>
        </div>
      }
      maxWidth="max-w-md"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-base-content/80">
          {sessionLabel
            ? `Are you sure you want to cancel "${sessionLabel}"? Only scheduled sessions can be cancelled.`
            : "Are you sure you want to cancel this scheduled session?"}
        </p>

        <div>
          <label className="block text-xs font-semibold text-base-content/80 mb-1.5">
            Cancellation reason <span className="text-error">*</span>
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError("");
            }}
            placeholder="e.g. Trainer unavailable, rescheduling to next week..."
            className="textarea textarea-bordered w-full rounded-xl bg-base-200/80 text-sm"
            required
          />
          {error && <p className="text-xs text-error mt-1">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-base-200">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="btn btn-sm btn-ghost rounded-xl"
          >
            Keep session
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="btn btn-sm bg-error text-white hover:bg-error/90 rounded-xl gap-1.5"
          >
            {isPending ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              <XCircle className="size-4" />
            )}
            <span>Cancel session</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}

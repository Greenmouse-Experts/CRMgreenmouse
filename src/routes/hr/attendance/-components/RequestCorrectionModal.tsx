import { useState, useRef, useEffect } from "react";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import SimpleInput from "@/components/inputs/SimpleInput";
import LocalSelect from "@/components/inputs/LocalSelect";
import { CORRECTION_TYPES } from "./attendanceData";
import type { CorrectionRequest } from "./types";
import { toast } from "sonner";
import { Send } from "lucide-react";

interface RequestCorrectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitCorrection: (correction: CorrectionRequest) => void;
}

export default function RequestCorrectionModal({
  isOpen,
  onClose,
  onSubmitCorrection,
}: RequestCorrectionModalProps) {
  const modalRef = useRef<ModalHandle>(null);

  const [form, setForm] = useState({
    employeeName: "Grace Danjuma",
    date: new Date().toISOString().slice(0, 10),
    kind: CORRECTION_TYPES[0] || "Missed clock-in",
    correctIn: "09:00",
    correctOut: "17:00",
    reason: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.open();
    } else {
      modalRef.current?.close();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.employeeName.trim() || !form.reason.trim()) {
      toast.error("Please fill in your name and explanation reason");
      return;
    }

    setIsSubmitting(true);

    try {
      const formattedDate = new Date(form.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      const newCorrection: CorrectionRequest = {
        id: `COR-${Date.now()}`,
        employeeName: form.employeeName.trim(),
        date: formattedDate,
        type: form.kind,
        detail: `${formattedDate} · ${form.kind.toLowerCase()}`,
        status: "Pending",
        correctIn: form.correctIn,
        correctOut: form.correctOut,
        reason: form.reason.trim(),
      };

      onSubmitCorrection(newCorrection);
      toast.success("Correction request submitted", {
        description:
          "Your request has been routed to your line manager for review.",
      });

      setForm({
        employeeName: "Grace Danjuma",
        date: new Date().toISOString().slice(0, 10),
        kind: CORRECTION_TYPES[0] || "Missed clock-in",
        correctIn: "09:00",
        correctOut: "17:00",
        reason: "",
      });
      onClose();
    } catch {
      toast.error("Failed to submit correction");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      ref={modalRef}
      title="Request Attendance Correction"
      maxWidth="max-w-xl"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs text-base-content/60 -mt-1 mb-3">
          Submit corrections for missed punches, adjusted hours, or overtime
          claims for manager approval.
        </p>

        <div>
          <label className="text-xs font-semibold text-base-content/80 mb-1 block">
            Employee name <span className="text-error">*</span>
          </label>
          <SimpleInput
            value={form.employeeName}
            onChange={(e) =>
              setForm((p) => ({ ...p, employeeName: e.target.value }))
            }
            placeholder="Your name"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-base-content/80 mb-1 block">
              Date to correct <span className="text-error">*</span>
            </label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
              className="input input-bordered w-full text-xs rounded-xl bg-base-200/50"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-base-content/80 mb-1 block">
              Correction type
            </label>
            <LocalSelect
              value={form.kind}
              onChange={(e) => setForm((p) => ({ ...p, kind: e.target.value }))}
            >
              {CORRECTION_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </LocalSelect>
          </div>

          <div>
            <label className="text-xs font-semibold text-base-content/80 mb-1 block">
              Correct Clock-in
            </label>
            <input
              type="time"
              value={form.correctIn}
              onChange={(e) =>
                setForm((p) => ({ ...p, correctIn: e.target.value }))
              }
              className="input input-bordered w-full text-xs rounded-xl bg-base-200/50"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-base-content/80 mb-1 block">
              Correct Clock-out
            </label>
            <input
              type="time"
              value={form.correctOut}
              onChange={(e) =>
                setForm((p) => ({ ...p, correctOut: e.target.value }))
              }
              className="input input-bordered w-full text-xs rounded-xl bg-base-200/50"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-base-content/80 mb-1 block">
            Reason <span className="text-error">*</span>
          </label>
          <textarea
            value={form.reason}
            onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
            placeholder="Explain reason for discrepancy or missed punch..."
            rows={3}
            className="textarea textarea-bordered w-full text-xs rounded-xl bg-base-200/50"
            required
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-base-200">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm btn-ghost rounded-xl"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-sm bg-primary text-white hover:bg-primary/90 rounded-xl px-5 gap-1.5 shadow-sm shadow-primary/20"
          >
            <Send className="size-3.5" />
            <span>Submit correction</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}

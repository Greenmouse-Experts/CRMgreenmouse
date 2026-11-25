import { useState, useRef, useEffect } from "react";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import LocalSelect from "@/components/inputs/LocalSelect";
import SimpleInput from "@/components/inputs/SimpleInput";
import type { CreateCorrectionPayload } from "@/api/attendanceApi";
import { CORRECTION_TYPES } from "./attendanceData";
import { toast } from "sonner";
import { Send } from "lucide-react";

interface RequestCorrectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitCorrection: (payload: CreateCorrectionPayload) => Promise<void>;
}

interface CorrectionForm {
  date: string;
  correctionType: string;
  correctIn: string;
  correctOut: string;
  reason: string;
}

const EMPTY_FORM: CorrectionForm = {
  date: new Date().toISOString().slice(0, 10),
  correctionType: CORRECTION_TYPES[0].value,
  correctIn: "09:00",
  correctOut: "17:00",
  reason: "",
};

export default function RequestCorrectionModal({
  isOpen,
  onClose,
  onSubmitCorrection,
}: RequestCorrectionModalProps) {
  const modalRef = useRef<ModalHandle>(null);
  const [form, setForm] = useState<CorrectionForm>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.open();
    } else {
      modalRef.current?.close();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.reason.trim()) {
      toast.error("Please explain the reason for the correction.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitCorrection({
        date: form.date,
        correctionType: form.correctionType,
        correctedClockInAt: `${form.date}T${form.correctIn}:00.000Z`,
        correctedClockOutAt: `${form.date}T${form.correctOut}:00.000Z`,
        reason: form.reason.trim(),
      });
      setForm(EMPTY_FORM);
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
        <p className="text-base-content/80 -mt-1 mb-3">
          Submit corrections for missed punches, adjusted hours, or overtime
          claims for manager approval.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold text-base-content/80 mb-1 block">
              Date to correct <span className="text-error">*</span>
            </label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
              className="input input-bordered w-full rounded-xl bg-base-200/80"
              required
            />
          </div>

          <div>
            <label className="font-semibold text-base-content/80 mb-1 block">
              Correction type
            </label>
            <LocalSelect
              value={form.correctionType}
              onChange={(e) =>
                setForm((p) => ({ ...p, correctionType: e.target.value }))
              }
            >
              {CORRECTION_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </LocalSelect>
          </div>

          <div>
            <label className="font-semibold text-base-content/80 mb-1 block">
              Correct clock-in
            </label>
            <input
              type="time"
              value={form.correctIn}
              onChange={(e) =>
                setForm((p) => ({ ...p, correctIn: e.target.value }))
              }
              className="input input-bordered w-full rounded-xl bg-base-200/80"
            />
          </div>

          <div>
            <label className="font-semibold text-base-content/80 mb-1 block">
              Correct clock-out
            </label>
            <input
              type="time"
              value={form.correctOut}
              onChange={(e) =>
                setForm((p) => ({ ...p, correctOut: e.target.value }))
              }
              className="input input-bordered w-full rounded-xl bg-base-200/80"
            />
          </div>
        </div>

        <SimpleInput
          label="Reason"
          placeholder="Explain the reason for the correction..."
          value={form.reason}
          onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
          required
        />

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
            <span>{isSubmitting ? "Submitting..." : "Submit correction"}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}

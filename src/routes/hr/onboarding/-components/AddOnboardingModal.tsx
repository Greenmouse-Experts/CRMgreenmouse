import { useState, useEffect } from "react";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import LocalSelect from "@/components/inputs/LocalSelect";
import type { StaffMember } from "@/api/tenantApi";
import { useRef } from "react";
import { Send } from "lucide-react";

interface AddOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: StaffMember[];
  onStartOnboarding: (staffId: string) => Promise<void>;
}

export default function AddOnboardingModal({
  isOpen,
  onClose,
  staff,
  onStartOnboarding,
}: AddOnboardingModalProps) {
  const modalRef = useRef<ModalHandle>(null);
  const [selectedStaffId, setSelectedStaffId] = useState("");
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
    if (!selectedStaffId) return;

    setIsSubmitting(true);
    try {
      await onStartOnboarding(selectedStaffId);
      setSelectedStaffId("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      ref={modalRef}
      title="Start Onboarding"
      maxWidth="max-w-xl"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs text-base-content/60 -mt-1 mb-3">
          Choose an existing staff member to start their onboarding pipeline.
        </p>

        {staff.length === 0 ? (
          <p className="text-sm text-base-content/60 py-4 text-center">
            No staff members available. Add staff first.
          </p>
        ) : (
          <div>
            <label className="text-xs font-semibold text-base-content/80 mb-1 block">
              Staff member <span className="text-error">*</span>
            </label>
            <LocalSelect
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              required
            >
              <option value="">Select a staff member</option>
              {staff.map((member) => (
                <option key={member.id} value={member.id}>
                  {`${member.firstName ?? ""} ${member.lastName ?? ""}`.trim() ||
                    member.email}{" "}
                  — {member.email}
                </option>
              ))}
            </LocalSelect>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-base-200">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm btn-ghost rounded-xl"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !selectedStaffId}
            className="btn btn-sm bg-primary text-white hover:bg-primary/90 rounded-xl px-5 gap-1.5 shadow-sm shadow-primary/20"
          >
            <Send className="size-3.5" />
            <span>{isSubmitting ? "Starting..." : "Start Onboarding"}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}

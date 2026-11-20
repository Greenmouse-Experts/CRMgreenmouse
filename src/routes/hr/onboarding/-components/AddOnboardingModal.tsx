import { useState, useEffect } from "react";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import LocalSelect from "@/components/inputs/LocalSelect";
import type { EmployeeRecord } from "@/api/employeesApi";
import { useRef } from "react";
import { Send } from "lucide-react";

interface AddOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees?: EmployeeRecord[];
  staff?: EmployeeRecord[];
  onStartOnboarding: (employeeId: string) => Promise<void>;
}

export default function AddOnboardingModal({
  isOpen,
  onClose,
  employees,
  staff,
  onStartOnboarding,
}: AddOnboardingModalProps) {
  const modalRef = useRef<ModalHandle>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const employeeList = employees ?? staff ?? [];

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.open();
    } else {
      modalRef.current?.close();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeId) return;

    setIsSubmitting(true);
    try {
      await onStartOnboarding(selectedEmployeeId);
      setSelectedEmployeeId("");
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
          Choose an existing employee to start their onboarding pipeline.
        </p>

        {employeeList.length === 0 ? (
          <p className="text-sm text-base-content/60 py-4 text-center">
            No employees available. Add employees first.
          </p>
        ) : (
          <div>
            <label className="text-xs font-semibold text-base-content/80 mb-1 block">
              Employee <span className="text-error">*</span>
            </label>
            <LocalSelect
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              required
            >
              <option value="">Select an employee</option>
              {employeeList.map((member) => {
                const firstName = member.firstName ?? member.first_name ?? "";
                const lastName = member.lastName ?? member.last_name ?? "";
                const fullName =
                  (member.name ??
                    member.fullName ??
                    `${firstName} ${lastName}`.trim()) ||
                  member.email ||
                  member.id;

                return (
                  <option key={member.id} value={member.id}>
                    {fullName}
                    {member.email ? ` — ${member.email}` : ""}
                  </option>
                );
              })}
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
            disabled={isSubmitting || !selectedEmployeeId}
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

import { useState, useRef, useEffect } from "react";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import LocalSelect from "@/components/inputs/LocalSelect";
import { useStaffs } from "@/api/tenantApi";
import { toast } from "sonner";
import { Send } from "lucide-react";

interface ClockInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClockIn: (staffId: string) => Promise<void>;
}

export default function ClockInModal({
  isOpen,
  onClose,
  onClockIn,
}: ClockInModalProps) {
  const modalRef = useRef<ModalHandle>(null);
  const staffQuery = useStaffs();
  const [staffId, setStaffId] = useState("");
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
    if (!staffId) {
      toast.error("Please select a staff member.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onClockIn(staffId);
      setStaffId("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      ref={modalRef}
      title="Clock In"
      maxWidth="max-w-xl"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-base-content/80 -mt-1 mb-3">
          Record the start of today&apos;s shift for the selected staff member.
        </p>

        <div>
          <label className="font-semibold text-base-content/80 mb-1 block">
            Staff member <span className="text-error">*</span>
          </label>
          <LocalSelect
            value={staffId}
            onChange={(e) => setStaffId(e.target.value)}
            required
          >
            <option value="">Select a staff member</option>
            {(staffQuery.data ?? []).map((member) => (
              <option key={member.id} value={member.id}>
                {`${member.firstName ?? ""} ${member.lastName ?? ""}`.trim() ||
                  member.email}
              </option>
            ))}
          </LocalSelect>
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
            disabled={isSubmitting || !staffId}
            className="btn btn-sm bg-primary text-white hover:bg-primary/90 rounded-xl px-5 gap-1.5 shadow-sm shadow-primary/20"
          >
            <Send className="size-3.5" />
            <span>{isSubmitting ? "Clocking in..." : "Clock in now"}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}

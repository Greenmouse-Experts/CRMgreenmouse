import { useEffect, useRef, useState } from "react";
import { Check, Users } from "lucide-react";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import type { StaffOption } from "@/api/employeesApi";

interface LinkToStaffModalProps {
  isOpen: boolean;
  staffs: StaffOption[];
  isLoading: boolean;
  onClose: () => void;
  onAccept: (staff: StaffOption) => void;
}

export default function LinkToStaffModal({
  isOpen,
  staffs,
  isLoading,
  onClose,
  onAccept,
}: LinkToStaffModalProps) {
  const modalRef = useRef<ModalHandle>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedId(null);
      modalRef.current?.open();
    } else {
      modalRef.current?.close();
    }
  }, [isOpen]);

  const handleAccept = () => {
    const staff = staffs.find((s) => s.id === selectedId);
    if (!staff) return;
    onAccept(staff);
  };

  return (
    <Modal
      ref={modalRef}
      title="Link to Staff"
      maxWidth="max-w-md"
      onClose={onClose}
      actions={
        <button
          type="button"
          className="btn btn-sm btn-primary"
          disabled={!selectedId}
          onClick={handleAccept}
        >
          Accept
        </button>
      }
    >
      <div className="space-y-3">
        <p className="text-sm text-base-content/80">
          Choose the staff from the directory — their account opens next.
        </p>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-11 animate-pulse rounded-xl bg-base-200" />
            ))}
          </div>
        ) : staffs.length === 0 ? (
          <p className="text-sm text-base-content/60">
            No staff found in the directory yet.
          </p>
        ) : (
          <div className="max-h-72 space-y-1.5 overflow-y-auto">
            {staffs.map((staff) => {
              const selected = selectedId === staff.id;
              return (
                <button
                  key={staff.id}
                  type="button"
                  onClick={() =>
                    setSelectedId((prev) =>
                      prev === staff.id ? null : staff.id,
                    )
                  }
                  className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors ${
                    selected
                      ? "border-primary bg-primary/10"
                      : "border-base-300 bg-base-100 hover:border-primary/60"
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span
                      className={`flex size-7 shrink-0 items-center justify-center rounded-lg ${
                        selected ? "bg-primary/20" : "bg-primary/10"
                      } text-primary`}
                    >
                      <Users className="size-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-base-content">
                        {staff.name}
                      </span>
                      {staff.email && (
                        <span className="block truncate text-xs text-base-content/60">
                          {staff.email}
                        </span>
                      )}
                    </span>
                  </span>
                  {selected && (
                    <Check className="size-5 shrink-0 text-primary" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}

import { useState, useRef, useEffect } from "react";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import SimpleInput from "@/components/inputs/SimpleInput";
import LocalSelect from "@/components/inputs/LocalSelect";
import { CLEARANCE_DEPARTMENTS } from "./offboardingData";
import type {
  ClearanceDepartment,
  ClearanceItem,
  ClearanceStatus,
} from "./types";
import { toast } from "sonner";
import { Plus } from "lucide-react";

interface AddClearanceItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: string;
  onAddItem: (item: ClearanceItem) => void;
}

export default function AddClearanceItemModal({
  isOpen,
  onClose,
  caseId,
  onAddItem,
}: AddClearanceItemModalProps) {
  const modalRef = useRef<ModalHandle>(null);

  const [form, setForm] = useState({
    department: "IT" as ClearanceDepartment,
    item: "",
    owner: "",
    status: "Pending" as ClearanceStatus,
    dueDate: new Date().toISOString().slice(0, 10),
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.open();
    } else {
      modalRef.current?.close();
    }
  }, [isOpen]);

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.item.trim()) {
      toast.error("Please enter a task or item description");
      return;
    }

    if (!form.owner.trim()) {
      toast.error("Please specify a responsible owner/assignee");
      return;
    }

    setIsSubmitting(true);

    try {
      const newItem: ClearanceItem = {
        id: `CLR-${Date.now().toString().slice(-4)}`,
        caseId,
        department: form.department,
        item: form.item.trim(),
        owner: form.owner.trim(),
        status: form.status,
        dueDate: form.dueDate,
        notes: form.notes.trim() || undefined,
      };

      onAddItem(newItem);
      toast.success("Clearance item added", {
        description: `"${newItem.item}" assigned to ${newItem.owner}.`,
      });

      // Reset
      setForm({
        department: "IT",
        item: "",
        owner: "",
        status: "Pending",
        dueDate: new Date().toISOString().slice(0, 10),
        notes: "",
      });

      onClose();
    } catch {
      toast.error("Failed to add clearance item");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      ref={modalRef}
      title="Add Clearance Task"
      maxWidth="max-w-md"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs text-base-content/60 -mt-1">
          Create an inter-departmental checklist item for asset return or sign-off.
        </p>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-base-content/80 mb-1 block">
              Department <span className="text-error">*</span>
            </label>
            <LocalSelect
              value={form.department}
              onChange={(e) =>
                handleChange("department", e.target.value as ClearanceDepartment)
              }
            >
              {CLEARANCE_DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </LocalSelect>
          </div>

          <div>
            <label className="text-xs font-semibold text-base-content/80 mb-1 block">
              Item / Task Description <span className="text-error">*</span>
            </label>
            <SimpleInput
              value={form.item}
              onChange={(e) => handleChange("item", e.target.value)}
              placeholder="e.g. Return building access card"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-base-content/80 mb-1 block">
              Responsible Owner <span className="text-error">*</span>
            </label>
            <SimpleInput
              value={form.owner}
              onChange={(e) => handleChange("owner", e.target.value)}
              placeholder="e.g. Facilities Lead or IT Admin"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-base-content/80 mb-1 block">
              Due Date
            </label>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => handleChange("dueDate", e.target.value)}
              className="input input-bordered w-full text-xs rounded-xl bg-base-200/50"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-base-content/80 mb-1 block">
              Notes (optional)
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              rows={2}
              placeholder="Asset serial numbers or handover link..."
              className="textarea textarea-bordered w-full text-xs rounded-xl bg-base-200/50"
            />
          </div>
        </div>

        {/* Footer Actions */}
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
            <Plus className="size-3.5" />
            <span>Add task</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}

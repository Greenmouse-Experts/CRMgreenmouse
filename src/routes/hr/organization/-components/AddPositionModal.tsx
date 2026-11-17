import { useState, useRef, useEffect } from "react";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import SimpleInput from "@/components/inputs/SimpleInput";
import LocalSelect from "@/components/inputs/LocalSelect";
import { GRADE_OPTIONS } from "./organizationData";
import type { Department, Position } from "./types";
import { toast } from "sonner";
import { Briefcase, Send } from "lucide-react";

interface AddPositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPosition: (newPos: Position) => void;
  departments: Department[];
}

export default function AddPositionModal({
  isOpen,
  onClose,
  onAddPosition,
  departments,
}: AddPositionModalProps) {
  const modalRef = useRef<ModalHandle>(null);

  const [form, setForm] = useState({
    title: "",
    dept: departments[0]?.name || "Engineering",
    grade: "G3",
    approved: 5,
    filled: 0,
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

    if (!form.title.trim()) {
      toast.error("Please provide a position title");
      return;
    }

    setIsSubmitting(true);

    try {
      const newPos: Position = {
        id: `POS-${Date.now()}`,
        title: form.title.trim(),
        dept: form.dept,
        grade: form.grade,
        approved: Number(form.approved) || 1,
        filled: Number(form.filled) || 0,
      };

      onAddPosition(newPos);
      toast.success("Position created", {
        description: `${newPos.title} (${newPos.grade}) added to ${newPos.dept}.`,
      });

      setForm({
        title: "",
        dept: departments[0]?.name || "Engineering",
        grade: "G3",
        approved: 5,
        filled: 0,
      });
      onClose();
    } catch {
      toast.error("Failed to create position");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal ref={modalRef}>
      <div className="w-full max-w-lg bg-base-100 rounded-2xl shadow-xl overflow-hidden border border-base-200">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-5 border-b border-base-200">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-sm">
              <Briefcase className="size-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-base-content">
                Add job position
              </h3>
              <p className="text-xs text-base-content/60">
                Define a standardized role, pay grade, and target approved headcount.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-base-content/80 mb-1 block">
              Position title <span className="text-error">*</span>
            </label>
            <SimpleInput
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Senior Product Designer"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-base-content/80 mb-1 block">
                Department
              </label>
              <LocalSelect
                value={form.dept}
                onChange={(e) =>
                  setForm((p) => ({ ...p, dept: e.target.value }))
                }
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </LocalSelect>
            </div>

            <div>
              <label className="text-xs font-semibold text-base-content/80 mb-1 block">
                Job grade
              </label>
              <LocalSelect
                value={form.grade}
                onChange={(e) =>
                  setForm((p) => ({ ...p, grade: e.target.value }))
                }
              >
                {GRADE_OPTIONS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </LocalSelect>
            </div>

            <div>
              <label className="text-xs font-semibold text-base-content/80 mb-1 block">
                Approved headcount <span className="text-error">*</span>
              </label>
              <SimpleInput
                type="number"
                value={String(form.approved)}
                onChange={(e) =>
                  setForm((p) => ({ ...p, approved: Number(e.target.value) || 1 }))
                }
                min={1}
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-base-content/80 mb-1 block">
                Currently filled
              </label>
              <SimpleInput
                type="number"
                value={String(form.filled)}
                onChange={(e) =>
                  setForm((p) => ({ ...p, filled: Number(e.target.value) || 0 }))
                }
                min={0}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-base-200">
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
              <span>Create position</span>
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

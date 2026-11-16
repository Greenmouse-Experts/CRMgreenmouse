import { useState, useRef, useEffect } from "react";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import SimpleInput from "@/components/inputs/SimpleInput";
import LocalSelect from "@/components/inputs/LocalSelect";
import type { OnboardingHire } from "./types";
import { toast } from "sonner";
import { UserPlus, Send } from "lucide-react";

interface AddOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddHire: (newHire: OnboardingHire) => void;
}

const DEPARTMENTS = [
  "Sales",
  "Engineering",
  "Finance",
  "Operations",
  "Marketing",
  "Customer Success",
  "HR",
];

export default function AddOnboardingModal({
  isOpen,
  onClose,
  onAddHire,
}: AddOnboardingModalProps) {
  const modalRef = useRef<ModalHandle>(null);

  const [form, setForm] = useState({
    name: "",
    role: "",
    dept: "Engineering",
    start: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10),
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

    if (!form.name.trim() || !form.role.trim()) {
      toast.error("Please provide hire name and job role");
      return;
    }

    setIsSubmitting(true);

    try {
      const formattedStart = new Date(form.start).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
      });

      const newHire: OnboardingHire = {
        id: `HIRE-${Date.now()}`,
        name: form.name.trim(),
        role: form.role.trim(),
        dept: form.dept,
        start: formattedStart,
        progress: 0,
        email: `${form.name.trim().toLowerCase().replace(/\s+/g, ".")}@kinovia.com`,
        probationStep: 0,
      };

      onAddHire(newHire);
      toast.success(`Onboarding initiated for ${newHire.name}`);

      setForm({
        name: "",
        role: "",
        dept: "Engineering",
        start: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10),
      });
      onClose();
    } catch {
      toast.error("Failed to add new hire");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal ref={modalRef}>
      <div className="w-full max-w-lg bg-base-100 rounded-2xl shadow-xl overflow-hidden border border-base-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-5 border-b border-base-200">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-sm">
              <UserPlus className="size-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-base-content">
                Add onboarding hire
              </h3>
              <p className="text-xs text-base-content/60">
                Initiate a new onboarding pipeline and checklist for a confirmed
                employee
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-base-content/80 mb-1 block">
              Full name <span className="text-error">*</span>
            </label>
            <SimpleInput
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Samuel Adekunle"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-base-content/80 mb-1 block">
              Job role <span className="text-error">*</span>
            </label>
            <SimpleInput
              value={form.role}
              onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
              placeholder="e.g. Frontend Engineer"
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
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </LocalSelect>
            </div>

            <div>
              <label className="text-xs font-semibold text-base-content/80 mb-1 block">
                Start date <span className="text-error">*</span>
              </label>
              <input
                type="date"
                value={form.start}
                onChange={(e) =>
                  setForm((p) => ({ ...p, start: e.target.value }))
                }
                className="input input-bordered w-full text-xs rounded-xl bg-base-200/50"
                required
              />
            </div>
          </div>

          {/* Footer */}
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
              <span>Start Onboarding</span>
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

import { useState, useRef, useEffect } from "react";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import SimpleInput from "@/components/inputs/SimpleInput";
import LocalSelect from "@/components/inputs/LocalSelect";
import {
  CASE_CATEGORIES,
  CASE_SEVERITIES,
  EMPLOYEES_LIST,
  INVESTIGATORS,
  INTERIM_ACTIONS,
} from "./disciplinaryData";
import type { CaseCategory, CaseSeverity, DisciplinaryCase } from "./types";
import { toast } from "sonner";
import { FileText, Plus, ShieldAlert } from "lucide-react";

interface OpenCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCase: (newCase: DisciplinaryCase) => void;
  nextCaseNumber?: number;
}

export default function OpenCaseModal({
  isOpen,
  onClose,
  onOpenCase,
  nextCaseNumber = 15,
}: OpenCaseModalProps) {
  const modalRef = useRef<ModalHandle>(null);

  const [form, setForm] = useState({
    emp: EMPLOYEES_LIST[0],
    category: "Policy breach" as CaseCategory,
    date: new Date().toISOString().slice(0, 10),
    severity: "Major" as CaseSeverity,
    reporter: "Grace Danjuma",
    investigator: INVESTIGATORS[0],
    desc: "",
    witnesses: "",
    interim: INTERIM_ACTIONS[0],
    conf: false,
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

    if (!form.desc.trim()) {
      toast.error("Please provide a description of the incident");
      return;
    }

    if (!form.conf) {
      toast.error(
        "You must confirm confidentiality and fair-hearing acknowledgment",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const caseId = `DC-0${nextCaseNumber}`;
      const newCase: DisciplinaryCase = {
        id: caseId,
        employee: form.emp,
        department: "Operations",
        category: form.category,
        severity: form.severity,
        openedDate: new Date(form.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        status: "Under Review",
        currentStep: "Investigation",
        reporter: form.reporter,
        investigator: form.investigator,
        description: form.desc.trim(),
        witnesses: form.witnesses.trim() || undefined,
        interimAction: form.interim,
        dueDate: new Date(Date.now() + 14 * 86400000)
          .toISOString()
          .slice(0, 10),
      };

      onOpenCase(newCase);
      toast.success(`Case ${caseId} opened and assigned`, {
        description: `Assigned to ${newCase.investigator} for preliminary investigation.`,
      });

      // Reset form
      setForm({
        emp: EMPLOYEES_LIST[0],
        category: "Policy breach",
        date: new Date().toISOString().slice(0, 10),
        severity: "Major",
        reporter: "Grace Danjuma",
        investigator: INVESTIGATORS[0],
        desc: "",
        witnesses: "",
        interim: INTERIM_ACTIONS[0],
        conf: false,
      });

      onClose();
    } catch {
      toast.error("Failed to open disciplinary case");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      ref={modalRef}
      title="Open Disciplinary Case"
      maxWidth="max-w-2xl"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs text-base-content/60 -mt-1">
          Restricted to HR. All actions on this case are audited and logged for
          compliance.
        </p>

        {/* Section 1: Incident */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 pb-1 border-b border-base-200">
            <ShieldAlert className="size-3.5 text-primary" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-base-content/70">
              Incident Details
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs font-semibold text-base-content/80 mb-1 block">
                Employee concerned <span className="text-error">*</span>
              </label>
              <LocalSelect
                value={form.emp}
                onChange={(e) => handleChange("emp", e.target.value)}
              >
                {EMPLOYEES_LIST.map((emp) => (
                  <option key={emp} value={emp}>
                    {emp}
                  </option>
                ))}
              </LocalSelect>
            </div>

            <div>
              <label className="text-xs font-semibold text-base-content/80 mb-1 block">
                Category <span className="text-error">*</span>
              </label>
              <LocalSelect
                value={form.category}
                onChange={(e) =>
                  handleChange("category", e.target.value as CaseCategory)
                }
              >
                {CASE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </LocalSelect>
            </div>

            <div>
              <label className="text-xs font-semibold text-base-content/80 mb-1 block">
                Incident date <span className="text-error">*</span>
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => handleChange("date", e.target.value)}
                className="input input-bordered w-full text-xs rounded-xl bg-base-200/50"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-base-content/80 mb-1 block">
                Severity <span className="text-error">*</span>
              </label>
              <LocalSelect
                value={form.severity}
                onChange={(e) =>
                  handleChange("severity", e.target.value as CaseSeverity)
                }
              >
                {CASE_SEVERITIES.map((sev) => (
                  <option key={sev} value={sev}>
                    {sev}
                  </option>
                ))}
              </LocalSelect>
            </div>

            <div>
              <label className="text-xs font-semibold text-base-content/80 mb-1 block">
                Reported by <span className="text-error">*</span>
              </label>
              <LocalSelect
                value={form.reporter}
                onChange={(e) => handleChange("reporter", e.target.value)}
              >
                {EMPLOYEES_LIST.map((emp) => (
                  <option key={emp} value={emp}>
                    {emp}
                  </option>
                ))}
              </LocalSelect>
            </div>

            <div>
              <label className="text-xs font-semibold text-base-content/80 mb-1 block">
                Assigned investigator <span className="text-error">*</span>
              </label>
              <LocalSelect
                value={form.investigator}
                onChange={(e) => handleChange("investigator", e.target.value)}
              >
                {INVESTIGATORS.map((inv) => (
                  <option key={inv} value={inv}>
                    {inv}
                  </option>
                ))}
              </LocalSelect>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-base-content/80 mb-1 block">
                Description of incident <span className="text-error">*</span>
              </label>
              <textarea
                value={form.desc}
                onChange={(e) => handleChange("desc", e.target.value)}
                rows={3}
                placeholder="Specific facts, dates, impacted personnel, or policy sections breached..."
                className="textarea textarea-bordered w-full text-xs rounded-xl bg-base-200/50"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-base-content/80 mb-1 block">
                Witnesses (optional)
              </label>
              <SimpleInput
                value={form.witnesses}
                onChange={(e) => handleChange("witnesses", e.target.value)}
                placeholder="Names, separated by commas"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Evidence & Handling */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 pb-1 border-b border-base-200">
            <FileText className="size-3.5 text-primary" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-base-content/70">
              Evidence & Handling
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-base-content/80 mb-1 block">
                Interim action
              </label>
              <LocalSelect
                value={form.interim}
                onChange={(e) => handleChange("interim", e.target.value)}
              >
                {INTERIM_ACTIONS.map((action) => (
                  <option key={action} value={action}>
                    {action}
                  </option>
                ))}
              </LocalSelect>
            </div>

            <div className="sm:col-span-2 pt-1">
              <label className="label cursor-pointer justify-start gap-2.5 p-3 rounded-xl border border-base-200 bg-base-200/30 hover:bg-base-200/50 transition-colors">
                <input
                  type="checkbox"
                  checked={form.conf}
                  onChange={(e) => handleChange("conf", e.target.checked)}
                  className="checkbox checkbox-sm checkbox-primary rounded"
                  required
                />
                <span className="text-xs text-base-content font-medium leading-tight">
                  I confirm this case is confidential and the employee will be
                  given the right to respond in accordance with HR policy.
                </span>
              </label>
            </div>
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
            <span>Open case</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}

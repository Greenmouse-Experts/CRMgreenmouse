import { useState, useRef, useEffect } from "react";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import SimpleInput from "@/components/inputs/SimpleInput";
import LocalSelect from "@/components/inputs/LocalSelect";
import { EMPLOYEES_SELECTION, SEPARATION_TYPES } from "./offboardingData";
import type { ClearanceItem, OffboardingCase, SeparationType } from "./types";
import { toast } from "sonner";
import { FileText, Plus, UserMinus } from "lucide-react";

interface InitiateOffboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInitiate: (newCase: OffboardingCase, defaultTasks: ClearanceItem[]) => void;
  nextCaseNum: number;
}

export default function InitiateOffboardingModal({
  isOpen,
  onClose,
  onInitiate,
  nextCaseNum,
}: InitiateOffboardingModalProps) {
  const modalRef = useRef<ModalHandle>(null);

  const [form, setForm] = useState({
    employee: EMPLOYEES_SELECTION[2] || "Samuel Adekunle",
    department: "Engineering",
    role: "Software Engineer",
    separationType: "Resignation" as SeparationType,
    resignationDate: new Date().toISOString().slice(0, 10),
    lastWorkingDay: new Date(Date.now() + 30 * 86400000)
      .toISOString()
      .slice(0, 10),
    handoverTo: EMPLOYEES_SELECTION[3] || "Folake Adeleke",
    notes: "",
    confirm: false,
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

    if (!form.confirm) {
      toast.error(
        "Please confirm that separation notice has been acknowledged",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const caseId = `OFF-00${nextCaseNum}`;
      const newCase: OffboardingCase = {
        id: caseId,
        employee: form.employee,
        employeeId: `EMP-0${nextCaseNum + 30}`,
        department: form.department,
        role: form.role,
        separationType: form.separationType,
        resignationDate: form.resignationDate,
        lastWorkingDay: form.lastWorkingDay,
        currentStep: "Handover",
        status: "Notice period",
        handoverTo: form.handoverTo,
        notes: form.notes.trim() || undefined,
      };

      // Generate standard initial clearance checklist
      const defaultTasks: ClearanceItem[] = [
        {
          id: `CLR-${Date.now()}-1`,
          caseId,
          department: "IT",
          item: "Retrieve company laptop & peripherals",
          owner: "IT Admin",
          status: "Pending",
          dueDate: form.lastWorkingDay,
        },
        {
          id: `CLR-${Date.now()}-2`,
          caseId,
          department: "Manager",
          item: `Handover projects & documentation to ${form.handoverTo}`,
          owner: form.handoverTo,
          status: "In Progress",
          dueDate: form.lastWorkingDay,
        },
        {
          id: `CLR-${Date.now()}-3`,
          caseId,
          department: "Finance",
          item: "Final payroll adjustments & benefit balance reconciliation",
          owner: "Payroll",
          status: "Pending",
          dueDate: form.lastWorkingDay,
        },
        {
          id: `CLR-${Date.now()}-4`,
          caseId,
          department: "HR",
          item: "Conduct formal exit interview",
          owner: "Grace Danjuma",
          status: "Scheduled",
          dueDate: form.lastWorkingDay,
        },
        {
          id: `CLR-${Date.now()}-5`,
          caseId,
          department: "IT",
          item: "Revoke SSO, Google Workspace & VPN access at 18:00",
          owner: "IT Security",
          status: "Pending",
          dueDate: form.lastWorkingDay,
        },
      ];

      onInitiate(newCase, defaultTasks);
      toast.success(`Offboarding initiated for ${form.employee}`, {
        description: `Case ${caseId} created with ${defaultTasks.length} clearance tasks.`,
      });

      // Reset
      setForm({
        employee: EMPLOYEES_SELECTION[2] || "Samuel Adekunle",
        department: "Engineering",
        role: "Software Engineer",
        separationType: "Resignation",
        resignationDate: new Date().toISOString().slice(0, 10),
        lastWorkingDay: new Date(Date.now() + 30 * 86400000)
          .toISOString()
          .slice(0, 10),
        handoverTo: EMPLOYEES_SELECTION[3] || "Folake Adeleke",
        notes: "",
        confirm: false,
      });

      onClose();
    } catch {
      toast.error("Failed to initiate offboarding");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      ref={modalRef}
      title="Initiate Offboarding"
      maxWidth="max-w-2xl"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className=" text-base-content/80 -mt-1">
          Initiate exit pipeline, assign clearance milestones, and schedule
          system access revocation.
        </p>

        {/* Section 1: Employee & Separation */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 pb-1 border-b border-base-200">
            <UserMinus className="size-3.5 text-primary" />
            <h4 className=" font-semibold uppercase tracking-wider text-base-content/80">
              Employee & Separation Details
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className=" font-semibold text-base-content/80 mb-1 block">
                Employee <span className="text-error">*</span>
              </label>
              <LocalSelect
                value={form.employee}
                onChange={(e) => handleChange("employee", e.target.value)}
              >
                {EMPLOYEES_SELECTION.map((emp) => (
                  <option key={emp} value={emp}>
                    {emp}
                  </option>
                ))}
              </LocalSelect>
            </div>

            <div>
              <label className=" font-semibold text-base-content/80 mb-1 block">
                Separation Type <span className="text-error">*</span>
              </label>
              <LocalSelect
                value={form.separationType}
                onChange={(e) =>
                  handleChange(
                    "separationType",
                    e.target.value as SeparationType,
                  )
                }
              >
                {SEPARATION_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </LocalSelect>
            </div>

            <div>
              <label className=" font-semibold text-base-content/80 mb-1 block">
                Notice / Resignation Date <span className="text-error">*</span>
              </label>
              <input
                type="date"
                value={form.resignationDate}
                onChange={(e) =>
                  handleChange("resignationDate", e.target.value)
                }
                className="input input-bordered w-full  rounded-xl bg-base-200/80"
                required
              />
            </div>

            <div>
              <label className=" font-semibold text-base-content/80 mb-1 block">
                Last Working Day <span className="text-error">*</span>
              </label>
              <input
                type="date"
                value={form.lastWorkingDay}
                onChange={(e) => handleChange("lastWorkingDay", e.target.value)}
                className="input input-bordered w-full  rounded-xl bg-base-200/80"
                required
              />
            </div>

            <div>
              <label className=" font-semibold text-base-content/80 mb-1 block">
                Handover Colleague <span className="text-error">*</span>
              </label>
              <LocalSelect
                value={form.handoverTo}
                onChange={(e) => handleChange("handoverTo", e.target.value)}
              >
                {EMPLOYEES_SELECTION.map((emp) => (
                  <option key={emp} value={emp}>
                    {emp}
                  </option>
                ))}
              </LocalSelect>
            </div>

            <div>
              <label className=" font-semibold text-base-content/80 mb-1 block">
                Department
              </label>
              <SimpleInput
                value={form.department}
                onChange={(e) => handleChange("department", e.target.value)}
                placeholder="e.g. Engineering"
              />
            </div>

            <div className="sm:col-span-2">
              <label className=" font-semibold text-base-content/80 mb-1 block">
                Notes / Reason for exit
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                rows={2}
                placeholder="Brief summary of resignation or handover agreement..."
                className="textarea textarea-bordered w-full  rounded-xl bg-base-200/80"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Policy & Confirmation */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 pb-1 border-b border-base-200">
            <FileText className="size-3.5 text-primary" />
            <h4 className=" font-semibold uppercase tracking-wider text-base-content/80">
              Compliance Confirmation
            </h4>
          </div>

          <label className="label cursor-pointer justify-start gap-2.5 p-3 rounded-xl border border-base-200 bg-base-200/30 hover:bg-base-200/80 transition-colors">
            <input
              type="checkbox"
              checked={form.confirm}
              onChange={(e) => handleChange("confirm", e.target.checked)}
              className="checkbox checkbox-sm checkbox-primary rounded"
              required
            />
            <span className=" text-base-content font-medium leading-tight">
              I confirm that notice has been acknowledged, records will be
              retained, and system credentials will be scheduled for revocation
              upon final day.
            </span>
          </label>
        </div>

        {/* Action Footer */}
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
            <span>Initiate pipeline</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}

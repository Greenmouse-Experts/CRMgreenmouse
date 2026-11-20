import { useEffect, useRef, useState } from "react";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import LocalSelect from "@/components/inputs/LocalSelect";
import { PAYROLL_CYCLES, PAYROLL_SCOPES } from "./payrollData";
import type { NewPayrollRunForm, PayrollCycle, PayrollRun } from "./types";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

interface NewPayrollRunModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRun: (run: PayrollRun) => void;
}

// Provisional figures from the last settled run, recalculated on approval.
const ESTIMATED_STAFF = 12;
const ESTIMATED_GROSS = 9272000;
const ESTIMATED_DEDUCTIONS = 2222560;

const formatPeriod = (monthValue: string) => {
  if (!monthValue) return "";
  const date = new Date(`${monthValue}-01T00:00:00`);
  return date.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
};

export default function NewPayrollRunModal({
  isOpen,
  onClose,
  onCreateRun,
}: NewPayrollRunModalProps) {
  const modalRef = useRef<ModalHandle>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<NewPayrollRunForm>({
    period: new Date().toISOString().slice(0, 7),
    cycle: "Monthly",
    payDate: "",
    scope: PAYROLL_SCOPES[0],
    notes: "",
  });

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.open();
    } else {
      modalRef.current?.close();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.period || !form.payDate) {
      toast.error("Select a pay period and pay date");
      return;
    }

    setIsSubmitting(true);
    try {
      const run: PayrollRun = {
        id: `PR-${411 + Math.floor(Math.random() * 40)}`,
        period: formatPeriod(form.period),
        cycle: form.cycle,
        payDate: new Date(`${form.payDate}T00:00:00`).toLocaleDateString(
          "en-GB",
          { day: "2-digit", month: "short", year: "numeric" },
        ),
        employees: ESTIMATED_STAFF,
        gross: ESTIMATED_GROSS,
        deductions: ESTIMATED_DEDUCTIONS,
        net: ESTIMATED_GROSS - ESTIMATED_DEDUCTIONS,
        status: "Draft",
        preparedBy: "Grace Danjuma",
        notes: form.notes.trim() || undefined,
      };

      onCreateRun(run);
      toast.success("Payroll run drafted", {
        description: `${run.period} run estimated at ₦${run.gross.toLocaleString()} for ${run.employees} staff.`,
      });

      setForm({
        period: new Date().toISOString().slice(0, 7),
        cycle: "Monthly",
        payDate: "",
        scope: PAYROLL_SCOPES[0],
        notes: "",
      });
      onClose();
    } catch {
      toast.error("Could not create the payroll run");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      ref={modalRef}
      title="New Payroll Run"
      maxWidth="max-w-xl"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className=" text-base-content/80 -mt-1">
          The run is created as a draft. Figures are provisional until Finance
          approval.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className=" font-semibold text-base-content/80 mb-1 block">
              Pay period <span className="text-error">*</span>
            </label>
            <input
              type="month"
              value={form.period}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, period: e.target.value }))
              }
              className="input input-bordered w-full  rounded-xl bg-base-200/80"
              required
            />
          </div>

          <div>
            <label className=" font-semibold text-base-content/80 mb-1 block">
              Cycle <span className="text-error">*</span>
            </label>
            <LocalSelect
              value={form.cycle}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  cycle: e.target.value as PayrollCycle,
                }))
              }
            >
              {PAYROLL_CYCLES.map((cycle) => (
                <option key={cycle} value={cycle}>
                  {cycle}
                </option>
              ))}
            </LocalSelect>
          </div>

          <div>
            <label className=" font-semibold text-base-content/80 mb-1 block">
              Pay date <span className="text-error">*</span>
            </label>
            <input
              type="date"
              value={form.payDate}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, payDate: e.target.value }))
              }
              className="input input-bordered w-full  rounded-xl bg-base-200/80"
              required
            />
          </div>

          <div>
            <label className=" font-semibold text-base-content/80 mb-1 block">
              Scope
            </label>
            <LocalSelect
              value={form.scope}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, scope: e.target.value }))
              }
            >
              {PAYROLL_SCOPES.map((scope) => (
                <option key={scope} value={scope}>
                  {scope}
                </option>
              ))}
            </LocalSelect>
          </div>
        </div>

        <div>
          <label className=" font-semibold text-base-content/80 mb-1 block">
            Notes
          </label>
          <textarea
            value={form.notes}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, notes: e.target.value }))
            }
            rows={2}
            placeholder="Adjustments, bonuses, or approvals context..."
            className="textarea textarea-bordered w-full  rounded-xl bg-base-200/80"
          />
        </div>

        <div className="flex items-start gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3  text-base-content/80">
          <Sparkles className="size-4 text-primary shrink-0 mt-0.5" />
          <span>
            Staff count of {ESTIMATED_STAFF} and gross of ₦
            {ESTIMATED_GROSS.toLocaleString()} are pre-filled from the last run.
          </span>
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
            disabled={isSubmitting}
            className="btn btn-sm bg-primary text-white hover:bg-primary/90 rounded-xl px-5"
          >
            Create draft
          </button>
        </div>
      </form>
    </Modal>
  );
}

import { useEffect, useRef, useState } from "react";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import SimpleInput from "@/components/inputs/SimpleInput";
import LocalSelect from "@/components/inputs/LocalSelect";
import { useUpdateLeaveType } from "@/api/leaveApi";
import type { LeaveTypeSummary } from "./types";
import { extract_message } from "@/helpers/auth";
import { toast } from "sonner";
import { Save } from "lucide-react";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@/api/simpleApi";

interface LeaveTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: LeaveTypeSummary | null;
}

const currentYear = new Date().getFullYear();

const LEAVE_TYPE_CODES = [
  { value: "annual", label: "Annual (annual)" },
  { value: "sick", label: "Sick (sick)" },
  { value: "maternity", label: "Maternity (maternity)" },
  { value: "paternity", label: "Paternity (paternity)" },
  { value: "compassionate", label: "Compassionate (compassionate)" },
  { value: "study", label: "Study (study)" },
  { value: "unpaid", label: "Unpaid (unpaid)" },
] as const;

const normalizeCode = (value?: string): string => {
  const key = (value ?? "").trim().toLowerCase();
  const match = LEAVE_TYPE_CODES.find((c) => c.value === key);
  return match ? match.value : "annual";
};

const defaultFormState = () => ({
  code: "annual",
  name: "",
  entitlementDays: "20",
  year: String(currentYear),
  requiresEvidenceOverDays: "2",
  isPaid: true,
  evidenceAlwaysRequired: false,
  isActive: true,
});

export default function LeaveTypeModal({
  isOpen,
  onClose,
  initialType,
}: LeaveTypeModalProps) {
  const modalRef = useRef<ModalHandle>(null);
  const updateLeaveType = useUpdateLeaveType();

  const [form, setForm] = useState(defaultFormState);

  const isEditing = Boolean(initialType);

  useEffect(() => {
    if (!isOpen) {
      modalRef.current?.close();
      return;
    }

    if (initialType) {
      setForm({
        code: normalizeCode(initialType.code ?? initialType.type),
        name: initialType.name ?? initialType.type,
        entitlementDays: String(initialType.entitlementDays ?? 0),
        year: String(initialType.year ?? currentYear),
        requiresEvidenceOverDays: String(
          initialType.requiresEvidenceOverDays ?? 0,
        ),
        isPaid: initialType.isPaid ?? true,
        evidenceAlwaysRequired: initialType.evidenceAlwaysRequired ?? false,
        isActive: initialType.isActive ?? true,
      });
    } else {
      setForm(defaultFormState());
    }

    modalRef.current?.open();
  }, [isOpen, initialType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = form.name.trim();
    const trimmedCode = form.code.trim();
    const entitlementDays = Number(form.entitlementDays);
    const year = Number(form.year);
    const requiresEvidenceOverDays = Number(form.requiresEvidenceOverDays);

    if (!trimmedName || !trimmedCode) {
      toast.error("Please provide both a leave type name and code");
      return;
    }

    if (!Number.isFinite(entitlementDays) || entitlementDays < 0) {
      toast.error("Entitlement days must be 0 or greater");
      return;
    }

    if (!Number.isFinite(year) || year < 2000) {
      toast.error("Please enter a valid policy year");
      return;
    }

    if (
      !form.evidenceAlwaysRequired &&
      (!Number.isFinite(requiresEvidenceOverDays) ||
        requiresEvidenceOverDays < 0)
    ) {
      toast.error("Evidence threshold days must be 0 or greater");
      return;
    }

    try {
      await updateLeaveType.mutateAsync({
        code: trimmedCode,
        name: trimmedName,
        isPaid: form.isPaid,
        evidenceAlwaysRequired: form.evidenceAlwaysRequired,
        requiresEvidenceOverDays: form.evidenceAlwaysRequired
          ? 0
          : requiresEvidenceOverDays,
        isActive: form.isActive,
        year,
        entitlementDays,
      });

      toast.success(
        isEditing
          ? `${trimmedName} leave type updated`
          : `${trimmedName} leave type created`,
      );
      onClose();
    } catch (error) {
      toast.error(extract_message(error as AxiosError<ApiResponse>));
    }
  };

  return (
    <Modal
      ref={modalRef}
      title={isEditing ? "Configure Leave Type" : "New Leave Type"}
      maxWidth="max-w-xl"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-base-content/80 -mt-1 mb-3">
          {isEditing
            ? "Update entitlement, documentation rules, and status for this leave policy."
            : "Define a new company leave policy, annual allowance, and evidence rules."}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="font-semibold text-base-content/80 mb-1 block">
              Leave type name <span className="text-error">*</span>
            </label>
            <SimpleInput
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Annual Leave"
              required
            />
          </div>

          <div>
            <label className="font-semibold text-base-content/80 mb-1 block">
              Code <span className="text-error">*</span>
            </label>
            <LocalSelect
              value={form.code}
              onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
              required
            >
              {LEAVE_TYPE_CODES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </LocalSelect>
          </div>

          <div>
            <label className="font-semibold text-base-content/80 mb-1 block">
              Entitlement days <span className="text-error">*</span>
            </label>
            <SimpleInput
              type="number"
              min={0}
              value={form.entitlementDays}
              onChange={(e) =>
                setForm((p) => ({ ...p, entitlementDays: e.target.value }))
              }
              placeholder="20"
              required
            />
          </div>

          <div>
            <label className="font-semibold text-base-content/80 mb-1 block">
              Policy year <span className="text-error">*</span>
            </label>
            <SimpleInput
              type="number"
              min={2000}
              max={2100}
              value={form.year}
              onChange={(e) => setForm((p) => ({ ...p, year: e.target.value }))}
              placeholder={String(currentYear)}
              required
            />
          </div>
        </div>

        <div>
          <label className="font-semibold text-base-content/80 mb-1 block">
            Require supporting document over (days)
          </label>
          <SimpleInput
            type="number"
            min={0}
            disabled={form.evidenceAlwaysRequired}
            value={form.requiresEvidenceOverDays}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                requiresEvidenceOverDays: e.target.value,
              }))
            }
            placeholder="2"
          />
          <span className="text-[11px] text-base-content/60 mt-1 block">
            {form.evidenceAlwaysRequired
              ? "Disabled because supporting documents are always required."
              : "Requests exceeding this number of days will require an attachment."}
          </span>
        </div>

        <div className="space-y-2.5 pt-2 border-t border-base-200">
          <label className="flex items-center justify-between gap-3 p-3 rounded-xl border border-base-200 bg-base-200/30 cursor-pointer">
            <div>
              <div className="font-semibold text-sm text-base-content">
                Paid leave
              </div>
              <div className="text-xs text-base-content/70">
                Employees continue receiving salary during this leave.
              </div>
            </div>
            <input
              type="checkbox"
              checked={form.isPaid}
              onChange={(e) =>
                setForm((p) => ({ ...p, isPaid: e.target.checked }))
              }
              className="toggle toggle-primary toggle-sm"
            />
          </label>

          <label className="flex items-center justify-between gap-3 p-3 rounded-xl border border-base-200 bg-base-200/30 cursor-pointer">
            <div>
              <div className="font-semibold text-sm text-base-content">
                Always require evidence
              </div>
              <div className="text-xs text-base-content/70">
                Require a supporting document regardless of leave duration.
              </div>
            </div>
            <input
              type="checkbox"
              checked={form.evidenceAlwaysRequired}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  evidenceAlwaysRequired: e.target.checked,
                }))
              }
              className="toggle toggle-primary toggle-sm"
            />
          </label>

          <label className="flex items-center justify-between gap-3 p-3 rounded-xl border border-base-200 bg-base-200/30 cursor-pointer">
            <div>
              <div className="font-semibold text-sm text-base-content">
                Active policy
              </div>
              <div className="text-xs text-base-content/70">
                Make this leave type available for new leave requests.
              </div>
            </div>
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) =>
                setForm((p) => ({ ...p, isActive: e.target.checked }))
              }
              className="toggle toggle-primary toggle-sm"
            />
          </label>
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
            disabled={updateLeaveType.isPending}
            className="btn btn-sm bg-primary text-white hover:bg-primary/90 rounded-xl px-5 gap-1.5 shadow-sm shadow-primary/20"
          >
            <Save className="size-3.5" />
            <span>
              {updateLeaveType.isPending
                ? "Saving..."
                : isEditing
                  ? "Save changes"
                  : "Create leave type"}
            </span>
          </button>
        </div>
      </form>
    </Modal>
  );
}

import { useState, useRef, useEffect } from "react";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import SimpleInput from "@/components/inputs/SimpleInput";
import LocalSelect from "@/components/inputs/LocalSelect";
import SimpleSelect from "@/components/inputs/SimpleSelect";
import { useStaffs } from "@/api/employeesApi";
import { toLeaveType, useLeaveBalances, useLeaveTypes } from "@/api/leaveApi";
import type { LeaveRequest, LeaveType } from "./types";
import { extract_message } from "@/helpers/errors";
import { toast } from "sonner";
import { Send, Upload } from "lucide-react";

interface NewLeaveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitRequest: (request: LeaveRequest) => void;
  defaultType?: LeaveType;
}

interface BackendLeaveTypeOption {
  id?: string;
  code?: string;
  name?: string;
  type?: string;
  entitlementDays?: number;
  entitlement_days?: number;
  entitlement?: string | number;
}

const dateRangeDefaults = () => ({
  from: new Date().toISOString().slice(0, 10),
  to: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
});

export default function NewLeaveRequestModal({
  isOpen,
  onClose,
  onSubmitRequest,
  defaultType = "Annual",
}: NewLeaveRequestModalProps) {
  const modalRef = useRef<ModalHandle>(null);
  const { data: staffs = [] } = useStaffs();
  const { data: leaveTypesData } = useLeaveTypes();
  const leaveTypes = leaveTypesData ?? [];
  const { data: balances = [] } = useLeaveBalances();

  const [form, setForm] = useState({
    emp: "",
    type: defaultType,
    leaveTypeId: "",
    from: dateRangeDefaults().from,
    to: dateRangeDefaults().to,
    half: "No" as "No" | "First half" | "Second half",
    cover: "",
    coverId: "",
    reason: "",
    phone: "",
    address: "",
  });

  const [fileName, setFileName] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const list = leaveTypesData ?? [];
    const matched = list.find((lt) => lt.type === defaultType) ?? list[0];
    const resolvedId = matched?.id ?? matched?.code ?? "";
    setForm((p) => {
      const nextLeaveTypeId = resolvedId || p.leaveTypeId;
      if (p.type === defaultType && p.leaveTypeId === nextLeaveTypeId) {
        return p;
      }
      return {
        ...p,
        type: defaultType,
        leaveTypeId: nextLeaveTypeId,
      };
    });
  }, [defaultType, leaveTypesData]);

  useEffect(() => {
    if (staffs.length > 0 && (!form.emp || !form.cover)) {
      setForm((p) => ({
        ...p,
        emp: p.emp || staffs[0].name,
        cover: p.cover || staffs[0].name,
        coverId: p.coverId || staffs[0].id,
      }));
    }
  }, [staffs]);

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.open();
    } else {
      modalRef.current?.close();
    }
  }, [isOpen]);

  const resetForm = () =>
    setForm({
      emp: "",
      type: "Annual",
      leaveTypeId: "",
      from: dateRangeDefaults().from,
      to: dateRangeDefaults().to,
      half: "No",
      cover: "",
      coverId: "",
      reason: "",
      phone: "",
      address: "",
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.emp.trim() || !form.reason.trim()) {
      toast.error("Please fill in all required fields including reason");
      return;
    }

    const startDate = new Date(form.from);
    const endDate = new Date(form.to);

    if (endDate < startDate) {
      toast.error("End date cannot be earlier than start date");
      return;
    }

    setIsSubmitting(true);

    try {
      const daysCount = Math.max(
        1,
        Math.round((endDate.getTime() - startDate.getTime()) / 86400000) + 1,
      );

      const formattedFrom = startDate.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
      });
      const formattedTo = endDate.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
      });

      const newRequest: LeaveRequest = {
        id: "",
        emp: form.emp,
        type: form.type,
        from: formattedFrom,
        to: formattedTo,
        days: form.half !== "No" ? 0.5 : daysCount,
        status: "Submitted",
        reason: form.reason.trim(),
        cover: form.cover.trim() || undefined,
        phone: form.phone.trim() || undefined,
        address: form.address.trim() || undefined,
        half: form.half,
        startDate: form.from,
        endDate: form.to,
        coverId: form.coverId || undefined,
        leaveTypeId: form.leaveTypeId || undefined,
      };

      await onSubmitRequest(newRequest);
      toast.success("Leave request submitted", {
        description: `Request for ${newRequest.days} ${newRequest.days === 1 ? "day" : "days"} has been sent to line manager.`,
      });

      // Reset
      resetForm();
      setFileName("");
      onClose();
    } catch (error) {
      toast.error(extract_message(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const annualBalance =
    balances.find((b) => b.type === "Annual") ?? balances[0];

  return (
    <Modal
      ref={modalRef}
      title="New Leave Request"
      maxWidth="max-w-2xl"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className=" text-base-content/80 -mt-1 mb-3">
          {annualBalance?.available != null
            ? `Available balance: ${annualBalance.available} days annual leave. Requests go to your manager, then HR.`
            : "Requests go to your manager, then HR."}
        </p>

        {/* Section 1: Leave details */}
        <div className="space-y-3">
          <h4 className=" font-bold uppercase tracking-wider text-base-content/80">
            Leave Details
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className=" font-semibold text-base-content/80 mb-1 block">
                Employee <span className="text-error">*</span>
              </label>
              <LocalSelect
                value={form.emp}
                onChange={(e) =>
                  setForm((p) => ({ ...p, emp: e.target.value }))
                }
              >
                {staffs.map((staff) => (
                  <option key={staff.id} value={staff.name}>
                    {staff.name}
                  </option>
                ))}
              </LocalSelect>
            </div>

            <div>
              <label className=" font-semibold text-base-content/80 mb-1 block">
                Leave type <span className="text-error">*</span>
              </label>
              <SimpleSelect<BackendLeaveTypeOption>
                route="/leave/types"
                value={form.leaveTypeId}
                onChange={(selectedValue) => {
                  const matched = leaveTypes.find(
                    (lt) => (lt.id ?? lt.code ?? lt.type) === selectedValue,
                  );
                  setForm((p) => ({
                    ...p,
                    leaveTypeId: selectedValue,
                    type: matched?.type ?? toLeaveType(selectedValue),
                  }));
                }}
                render={(rawItem: any, index) => {
                  const lt =
                    rawItem?.type && typeof rawItem.type === "object"
                      ? rawItem.type
                      : rawItem?.leaveType &&
                          typeof rawItem.leaveType === "object"
                        ? rawItem.leaveType
                        : rawItem;
                  const optionValue = String(
                    lt?.id ?? rawItem?.id ?? lt?.code ?? lt?.name ?? index,
                  );
                  const days =
                    rawItem?.entitlementDays ??
                    rawItem?.entitlement_days ??
                    lt?.entitlementDays ??
                    lt?.entitlement_days;
                  const entitlementText =
                    typeof days === "number"
                      ? `${days} days`
                      : rawItem?.entitlement &&
                          typeof rawItem.entitlement !== "object"
                        ? String(rawItem.entitlement)
                        : "";
                  const rawLabel =
                    lt?.name ??
                    lt?.code ??
                    (typeof rawItem?.type === "string"
                      ? rawItem.type
                      : undefined) ??
                    "Leave";
                  const labelText = String(rawLabel);
                  return (
                    <option key={optionValue} value={optionValue}>
                      {entitlementText
                        ? `${labelText} (${entitlementText})`
                        : labelText}
                    </option>
                  );
                }}
              />
            </div>

            <div>
              <label className=" font-semibold text-base-content/80 mb-1 block">
                Start date <span className="text-error">*</span>
              </label>
              <input
                type="date"
                value={form.from}
                onChange={(e) =>
                  setForm((p) => ({ ...p, from: e.target.value }))
                }
                className="input input-bordered w-full  rounded-xl bg-base-200/80"
                required
              />
            </div>

            <div>
              <label className=" font-semibold text-base-content/80 mb-1 block">
                End date <span className="text-error">*</span>
              </label>
              <input
                type="date"
                value={form.to}
                onChange={(e) => setForm((p) => ({ ...p, to: e.target.value }))}
                className="input input-bordered w-full  rounded-xl bg-base-200/80"
                required
              />
            </div>

            <div>
              <label className=" font-semibold text-base-content/80 mb-1 block">
                Half day
              </label>
              <LocalSelect
                value={form.half}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    half: e.target.value as "No" | "First half" | "Second half",
                  }))
                }
              >
                <option value="No">No (Full day)</option>
                <option value="First half">First half</option>
                <option value="Second half">Second half</option>
              </LocalSelect>
            </div>

            <div>
              <label className=" font-semibold text-base-content/80 mb-1 block">
                Covering colleague (handover)
              </label>
              <LocalSelect
                value={form.cover}
                onChange={(e) => {
                  const staff = staffs.find((s) => s.name === e.target.value);
                  setForm((p) => ({
                    ...p,
                    cover: e.target.value,
                    coverId: staff?.id ?? "",
                  }));
                }}
              >
                {staffs.map((staff) => (
                  <option key={staff.id} value={staff.name}>
                    {staff.name}
                  </option>
                ))}
              </LocalSelect>
            </div>
          </div>

          <div>
            <label className=" font-semibold text-base-content/80 mb-1 block">
              Reason <span className="text-error">*</span>
            </label>
            <textarea
              value={form.reason}
              onChange={(e) =>
                setForm((p) => ({ ...p, reason: e.target.value }))
              }
              placeholder="State the purpose of this leave request..."
              rows={2}
              className="textarea textarea-bordered w-full  rounded-xl bg-base-200/80"
              required
            />
          </div>
        </div>

        {/* Section 2: Contact & Documents */}
        <div className="space-y-3 pt-3 border-t border-base-200">
          <h4 className=" font-bold uppercase tracking-wider text-base-content/80">
            Contact & Documents
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className=" font-semibold text-base-content/80 mb-1 block">
                Contact while away
              </label>
              <SimpleInput
                value={form.phone}
                onChange={(e) =>
                  setForm((p) => ({ ...p, phone: e.target.value }))
                }
                placeholder="+234 …"
              />
            </div>

            <div>
              <label className=" font-semibold text-base-content/80 mb-1 block">
                Address while on leave
              </label>
              <SimpleInput
                value={form.address}
                onChange={(e) =>
                  setForm((p) => ({ ...p, address: e.target.value }))
                }
                placeholder="City, State or Country"
              />
            </div>
          </div>

          <div>
            <label className=" font-semibold text-base-content/80 mb-1 block">
              Supporting document
            </label>
            <div className="flex items-center gap-3">
              <label className="btn btn-sm btn-outline rounded-xl cursor-pointer gap-2">
                <Upload className="size-3.5" />
                <span>Upload document</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFileName(file.name);
                      toast.success(`Attached ${file.name}`);
                    }
                  }}
                />
              </label>
              {fileName && (
                <span className=" font-medium text-primary">{fileName}</span>
              )}
            </div>
            <span className="text-[10px] text-base-content/80 mt-1 block">
              Required for sick leave over 2 days, maternity and study leave
            </span>
          </div>
        </div>

        {/* Actions */}
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
            <Send className="size-3.5" />
            <span>Submit request</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}

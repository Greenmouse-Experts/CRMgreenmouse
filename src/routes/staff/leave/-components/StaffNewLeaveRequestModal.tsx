import { useState, useRef, useEffect, useMemo } from "react";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import SimpleInput from "@/components/inputs/SimpleInput";
import LocalSelect from "@/components/inputs/LocalSelect";
import { useEmployees } from "@/api/employeesApi";
import {
  toLeaveType,
  useLeaveBalances,
  useLeaveTypes,
} from "@/api/leaveApi";
import type { LeaveRequest, LeaveType } from "@/routes/hr/leave/-components/types";
import { extract_message } from "@/helpers/errors";
import { toast } from "sonner";
import { Send, Upload, UserCheck } from "lucide-react";

interface StaffNewLeaveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitRequest: (request: LeaveRequest) => Promise<void> | void;
  employeeName: string;
  currentEmployeeId?: string;
  defaultType?: LeaveType;
}

const dateRangeDefaults = () => ({
  from: new Date().toISOString().slice(0, 10),
  to: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
});

export default function StaffNewLeaveRequestModal({
  isOpen,
  onClose,
  onSubmitRequest,
  employeeName,
  currentEmployeeId,
  defaultType = "Annual",
}: StaffNewLeaveRequestModalProps) {
  const modalRef = useRef<ModalHandle>(null);
  const { data: employees = [] } = useEmployees();
  const { data: leaveTypesData = [] } = useLeaveTypes();
  const { data: balances = [] } = useLeaveBalances();

  const activeLeaveTypes = useMemo(
    () => leaveTypesData.filter((lt) => lt.isActive !== false),
    [leaveTypesData],
  );

  const coveringOptions = useMemo(
    () =>
      employees
        .filter(
          (e) =>
            !e.isDraft &&
            String(e.lifecycleStatus ?? "").toLowerCase() !== "exited" &&
            e.id !== currentEmployeeId,
        )
        .map((e) => ({
          id: e.id,
          name:
            `${e.firstName ?? ""} ${e.lastName ?? ""}`.trim() ||
            e.email ||
            e.employeeNumber ||
            e.id,
        })),
    [employees, currentEmployeeId],
  );

  const [form, setForm] = useState({
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
    const matched =
      activeLeaveTypes.find((lt) => lt.type === defaultType) ??
      activeLeaveTypes[0];
    const resolvedId = matched?.id ?? matched?.code ?? "";
    setForm((p) => ({
      ...p,
      type: matched?.type ?? defaultType,
      leaveTypeId: p.leaveTypeId || resolvedId,
    }));
  }, [defaultType, activeLeaveTypes]);

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.open();
    } else {
      modalRef.current?.close();
    }
  }, [isOpen]);

  const resetForm = () =>
    setForm({
      type: defaultType,
      leaveTypeId:
        activeLeaveTypes.find((lt) => lt.type === defaultType)?.id ??
        activeLeaveTypes[0]?.id ??
        "",
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

    if (!form.leaveTypeId) {
      toast.error("Please select a leave type");
      return;
    }

    if (!form.reason.trim()) {
      toast.error("Please provide a reason for your leave request");
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
        emp: employeeName,
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
        description: `Request for ${newRequest.days} ${newRequest.days === 1 ? "day" : "days"} has been submitted for approval.`,
      });

      resetForm();
      setFileName("");
      onClose();
    } catch (error) {
      toast.error(extract_message(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedBalance =
    balances.find((b) => b.type === form.type) ??
    balances.find((b) => b.type === "Annual") ??
    balances[0];

  return (
    <Modal
      ref={modalRef}
      title="Request New Leave"
      maxWidth="max-w-2xl"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-base-content/80 -mt-1 mb-3">
          {selectedBalance?.available != null
            ? `Available ${selectedBalance.type ?? "leave"} balance: ${selectedBalance.available} days. Requests are routed to your manager and HR.`
            : "Requests are routed to your line manager and HR for approval."}
        </p>

        {/* Section 1: Leave details */}
        <div className="space-y-3">
          <h4 className="font-bold uppercase tracking-wider text-base-content/80">
            Leave Details
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-base-content/80 mb-1 block">
                Employee
              </label>
              <div className="input input-bordered w-full rounded-xl bg-base-200/60 flex items-center gap-2 text-base-content font-medium">
                <UserCheck className="size-4 text-primary shrink-0" />
                <span className="truncate">{employeeName}</span>
              </div>
            </div>

            <div>
              <label className="font-semibold text-base-content/80 mb-1 block">
                Leave type <span className="text-error">*</span>
              </label>
              <LocalSelect
                value={form.leaveTypeId}
                onChange={(e) => {
                  const selectedValue = e.target.value;
                  const matched = activeLeaveTypes.find(
                    (lt) => (lt.id ?? lt.code ?? lt.type) === selectedValue,
                  );
                  setForm((p) => ({
                    ...p,
                    leaveTypeId: selectedValue,
                    type: matched?.type ?? toLeaveType(selectedValue),
                  }));
                }}
              >
                {activeLeaveTypes.length === 0 ? (
                  <option value="">Loading leave types...</option>
                ) : (
                  activeLeaveTypes.map((lt, idx) => {
                    const optionValue = String(lt.id ?? lt.code ?? idx);
                    const labelText = lt.name || lt.type;
                    const entitlementText =
                      typeof lt.entitlementDays === "number"
                        ? `${lt.entitlementDays} days`
                        : lt.entitlement || "";
                    return (
                      <option key={optionValue} value={optionValue}>
                        {entitlementText
                          ? `${labelText} (${entitlementText})`
                          : labelText}
                      </option>
                    );
                  })
                )}
              </LocalSelect>
            </div>

            <div>
              <label className="font-semibold text-base-content/80 mb-1 block">
                Start date <span className="text-error">*</span>
              </label>
              <input
                type="date"
                value={form.from}
                onChange={(e) =>
                  setForm((p) => ({ ...p, from: e.target.value }))
                }
                className="input input-bordered w-full rounded-xl bg-base-200/80"
                required
              />
            </div>

            <div>
              <label className="font-semibold text-base-content/80 mb-1 block">
                End date <span className="text-error">*</span>
              </label>
              <input
                type="date"
                value={form.to}
                onChange={(e) => setForm((p) => ({ ...p, to: e.target.value }))}
                className="input input-bordered w-full rounded-xl bg-base-200/80"
                required
              />
            </div>

            <div>
              <label className="font-semibold text-base-content/80 mb-1 block">
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
                <option value="First half">First half (AM)</option>
                <option value="Second half">Second half (PM)</option>
              </LocalSelect>
            </div>

            <div>
              <label className="font-semibold text-base-content/80 mb-1 block">
                Covering colleague (handover)
              </label>
              <LocalSelect
                value={form.coverId}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  const staff = coveringOptions.find((s) => s.id === selectedId);
                  setForm((p) => ({
                    ...p,
                    coverId: selectedId,
                    cover: staff?.name ?? "",
                  }));
                }}
              >
                <option value="">None / Select colleague (optional)</option>
                {coveringOptions.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.name}
                  </option>
                ))}
              </LocalSelect>
            </div>
          </div>

          <div>
            <label className="font-semibold text-base-content/80 mb-1 block">
              Reason <span className="text-error">*</span>
            </label>
            <textarea
              value={form.reason}
              onChange={(e) =>
                setForm((p) => ({ ...p, reason: e.target.value }))
              }
              placeholder="State the purpose of your leave request..."
              rows={2}
              className="textarea textarea-bordered w-full rounded-xl bg-base-200/80"
              required
            />
          </div>
        </div>

        {/* Section 2: Contact & Documents */}
        <div className="space-y-3 pt-3 border-t border-base-200">
          <h4 className="font-bold uppercase tracking-wider text-base-content/80">
            Contact & Documents
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-base-content/80 mb-1 block">
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
              <label className="font-semibold text-base-content/80 mb-1 block">
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
            <label className="font-semibold text-base-content/80 mb-1 block">
              Supporting document
            </label>
            <div className="flex items-center gap-3">
              <label className="btn btn-sm btn-outline rounded-xl cursor-pointer gap-2">
                <Upload className="size-3.5" />
                <span>Attach document</span>
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
                <span className="font-medium text-primary">{fileName}</span>
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
            <span>{isSubmitting ? "Submitting..." : "Submit request"}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}

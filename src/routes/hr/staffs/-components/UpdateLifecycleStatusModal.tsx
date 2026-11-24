import { useEffect, useRef, useState } from "react";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import EmployeeStatusBadge from "./EmployeeStatusBadge";
import type { Employee } from "./types";
import {
  useActivateEmployee,
  useFinalizeEmployee,
  useReactivateEmployee,
  useSuspendEmployee,
  useUpdateEmployeeLifecycleStatus,
} from "@/api/employeesApi";
import { extract_message } from "@/helpers/errors";
import { toast } from "sonner";
import { ArrowRight, CheckCircle2 } from "lucide-react";

interface UpdateLifecycleStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
}

interface TransitionOption {
  target: string;
  label: string;
  description: string;
  endpointNote: string;
}

const CONTROLLED_TRANSITIONS: Record<string, TransitionOption[]> = {
  draft: [
    {
      target: "preboarding",
      label: "Preboarding",
      description: "Finalize draft record and move employee to preboarding.",
      endpointNote: "POST /v1/employees/:id/finalize",
    },
  ],
  preboarding: [
    {
      target: "active",
      label: "Active",
      description: "Complete preboarding and activate the employee.",
      endpointNote: "POST /v1/employees/:id/activate",
    },
  ],
  active: [
    {
      target: "suspended",
      label: "Suspended",
      description: "Temporarily suspend the active employee.",
      endpointNote: "POST /v1/employees/:id/suspend",
    },
    {
      target: "notice_period",
      label: "Notice Period",
      description:
        "Place the employee into notice period following resignation.",
      endpointNote: "PATCH /v1/employees/:id",
    },
  ],
  suspended: [
    {
      target: "active",
      label: "Active",
      description: "Lift suspension and reactivate the employee.",
      endpointNote: "POST /v1/employees/:id/reactivate",
    },
    {
      target: "exited",
      label: "Exited",
      description: "Mark the suspended employee as exited.",
      endpointNote: "PATCH /v1/employees/:id",
    },
  ],
  notice_period: [
    {
      target: "active",
      label: "Active (Resignation cancelled)",
      description:
        "Cancel resignation and return the employee to active status.",
      endpointNote: "PATCH /v1/employees/:id",
    },
    {
      target: "exited",
      label: "Exited",
      description: "Complete offboarding and mark the employee as exited.",
      endpointNote: "PATCH /v1/employees/:id",
    },
  ],
};

const normalizeLifecycleKey = (employee: Employee | null): string => {
  if (!employee) return "";
  const raw = employee.lifecycleStatus || employee.status || "";
  return raw.trim().toLowerCase().replace(/\s+/g, "_");
};

export default function UpdateLifecycleStatusModal({
  isOpen,
  onClose,
  employee,
}: UpdateLifecycleStatusModalProps) {
  const modalRef = useRef<ModalHandle>(null);

  const finalizeEmployee = useFinalizeEmployee();
  const activateEmployee = useActivateEmployee();
  const suspendEmployee = useSuspendEmployee();
  const reactivateEmployee = useReactivateEmployee();
  const updateLifecycleStatus = useUpdateEmployeeLifecycleStatus();

  const currentKey = normalizeLifecycleKey(employee);
  const options = CONTROLLED_TRANSITIONS[currentKey] ?? [];

  const [selectedTarget, setSelectedTarget] = useState<string>("");

  useEffect(() => {
    if (!isOpen) {
      modalRef.current?.close();
      return;
    }

    const firstOption = options[0]?.target ?? "";
    setSelectedTarget(firstOption);
    modalRef.current?.open();
  }, [isOpen, employee?.id, currentKey]);

  const isPending =
    finalizeEmployee.isPending ||
    activateEmployee.isPending ||
    suspendEmployee.isPending ||
    reactivateEmployee.isPending ||
    updateLifecycleStatus.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee || !selectedTarget) return;

    try {
      if (currentKey === "draft" && selectedTarget === "preboarding") {
        await finalizeEmployee.mutateAsync(employee.id);
      } else if (currentKey === "preboarding" && selectedTarget === "active") {
        await activateEmployee.mutateAsync(employee.id);
      } else if (currentKey === "active" && selectedTarget === "suspended") {
        await suspendEmployee.mutateAsync(employee.id);
      } else if (currentKey === "suspended" && selectedTarget === "active") {
        await reactivateEmployee.mutateAsync(employee.id);
      } else {
        await updateLifecycleStatus.mutateAsync({
          id: employee.id,
          lifecycleStatus: selectedTarget,
        });
      }

      const chosen = options.find((opt) => opt.target === selectedTarget);
      toast.success(
        `${employee.name} moved to ${chosen?.label ?? selectedTarget}.`,
      );
      onClose();
    } catch (error) {
      toast.error(extract_message(error));
    }
  };

  return (
    <Modal
      ref={modalRef}
      title="Update Lifecycle Status"
      maxWidth="max-w-lg"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {employee && (
          <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-base-200/50 border border-base-200">
            <div className="min-w-0">
              <p className="font-semibold text-sm text-base-content truncate">
                {employee.name}
              </p>
              <p className="text-xs text-base-content/70 truncate">
                {employee.employeeNumber || employee.email}
              </p>
            </div>
            <EmployeeStatusBadge
              status={employee.status}
              onLeave={employee.onLeave}
            />
          </div>
        )}

        {options.length === 0 ? (
          <p className="text-sm text-base-content/70 py-3">
            No further lifecycle transitions are available from{" "}
            <span className="font-semibold">{employee?.status ?? "this"}</span>{" "}
            status.
          </p>
        ) : (
          <div className="space-y-2.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-base-content/70">
              Controlled transitions
            </p>
            {options.map((option) => {
              const isSelected = selectedTarget === option.target;
              return (
                <label
                  key={option.target}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-base-200 bg-base-200/30 hover:border-base-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="lifecycleTransition"
                    value={option.target}
                    checked={isSelected}
                    onChange={() => setSelectedTarget(option.target)}
                    className="radio radio-primary radio-sm mt-0.5"
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-base-content">
                      <span className="font-mono text-xs text-base-content/70">
                        {currentKey}
                      </span>
                      <ArrowRight className="size-3.5 text-primary shrink-0" />
                      <span>{option.label}</span>
                    </div>
                    <p className="text-xs text-base-content/70">
                      {option.description}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-base-200">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm btn-ghost rounded-xl"
          >
            Cancel
          </button>
          {options.length > 0 && (
            <button
              type="submit"
              disabled={isPending || !selectedTarget}
              className="btn btn-sm bg-primary text-white hover:bg-primary/90 rounded-xl px-5 gap-1.5 shadow-sm shadow-primary/20"
            >
              <CheckCircle2 className="size-3.5" />
              <span>{isPending ? "Updating..." : "Update status"}</span>
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
}

import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import LocalSelect from "@/components/inputs/LocalSelect";
import type { EmployeeRecord } from "@/api/employeesApi";
import { employeeDisplayName } from "./mappers";
import type { ChecklistItem } from "./types";
import { ArrowRightLeft } from "lucide-react";

interface ReassignTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: ChecklistItem | null;
  employees: EmployeeRecord[];
  onReassign: (taskId: string, assignedTo: string) => Promise<void>;
}

interface ReassignForm {
  assignedTo: string;
}

export default function ReassignTaskModal({
  isOpen,
  onClose,
  task,
  employees,
  onReassign,
}: ReassignTaskModalProps) {
  const modalRef = useRef<ModalHandle>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<ReassignForm>({ defaultValues: { assignedTo: "" } });

  useEffect(() => {
    if (isOpen) {
      reset({ assignedTo: "" });
      modalRef.current?.open();
    } else {
      modalRef.current?.close();
    }
  }, [isOpen, reset]);

  const onSubmit = async (values: ReassignForm) => {
    if (!task) return;
    await onReassign(task.id, values.assignedTo);
  };

  return (
    <Modal
      ref={modalRef}
      title="Reassign Task"
      maxWidth="max-w-xl"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <p className="text-base-content/80 -mt-1 mb-3">
          Move{" "}
          <span className="font-semibold text-base-content">
            {task?.text ?? "this task"}
          </span>{" "}
          to another team member.
        </p>

        <div>
          <label className="font-semibold text-base-content/80 mb-1 block">
            Assign to <span className="text-error">*</span>
          </label>
          <LocalSelect
            {...register("assignedTo", { required: "Select a team member" })}
          >
            <option value="">Select a team member</option>
            {employees.map((member) => (
              <option key={member.id} value={member.id}>
                {employeeDisplayName(member)}
                {member.email ? ` — ${member.email}` : ""}
              </option>
            ))}
          </LocalSelect>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-base-200">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm btn-ghost rounded-xl"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-sm bg-primary text-white hover:bg-primary/90 rounded-xl px-5 gap-1.5 shadow-sm shadow-primary/20"
          >
            <ArrowRightLeft className="size-3.5" />
            <span>{isSubmitting ? "Reassigning..." : "Reassign Task"}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}

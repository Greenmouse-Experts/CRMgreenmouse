import { Fragment, useEffect, useRef } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import SimpleInput from "@/components/inputs/SimpleInput";
import LocalSelect from "@/components/inputs/LocalSelect";
import SimpleSelect from "@/components/inputs/SimpleSelect";
import { CLEARANCE_DEPARTMENTS } from "./offboardingData";
import type { ClearanceDepartment } from "./types";
import type { EmployeeRecord } from "@/api/employeesApi";
import { useAddOffboardingTask } from "@/api/offboardingApi";
import { extract_message } from "@/helpers/errors";
import { toast } from "sonner";
import { Plus } from "lucide-react";

interface AddClearanceItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: string;
}

const TASK_TYPES = [
  { value: "handover", label: "Handover" },
  { value: "asset_return", label: "Asset return" },
  { value: "clearance", label: "Clearance" },
  { value: "exit_interview", label: "Exit interview" },
  { value: "access_revocation", label: "Access revocation" },
] as const;

interface AddTaskFormData {
  taskType: string;
  department: ClearanceDepartment;
  title: string;
  assignedTo: string;
  dueDate: string;
  required: boolean;
}

export default function AddClearanceItemModal({
  isOpen,
  onClose,
  caseId,
}: AddClearanceItemModalProps) {
  const modalRef = useRef<ModalHandle>(null);
  const addOffboardingTask = useAddOffboardingTask();

  const methods = useForm<AddTaskFormData>({
    mode: "onSubmit",
    defaultValues: {
      taskType: "clearance",
      department: "IT",
      title: "",
      assignedTo: "",
      dueDate: new Date().toISOString().slice(0, 10),
      required: true,
    },
  });

  const { control, register, handleSubmit, reset } = methods;

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.open();
      reset({
        taskType: "clearance",
        department: "IT",
        title: "",
        assignedTo: "",
        dueDate: new Date().toISOString().slice(0, 10),
        required: true,
      });
    } else {
      modalRef.current?.close();
    }
  }, [isOpen, reset]);

  const onSubmit = async (values: AddTaskFormData) => {
    if (!caseId) {
      toast.error("No active offboarding case selected");
      return;
    }
    if (!values.title.trim()) {
      toast.error("Please enter a task or item description");
      return;
    }
    if (!values.assignedTo) {
      toast.error("Please select an assignee");
      return;
    }

    try {
      await addOffboardingTask.mutateAsync({
        caseId,
        taskType: values.taskType,
        department: values.department,
        title: values.title.trim(),
        assignedTo: values.assignedTo,
        dueDate: values.dueDate || undefined,
        required: values.required,
      });
      toast.success("Clearance task added");
      onClose();
    } catch (error) {
      toast.error(extract_message(error));
    }
  };

  return (
    <Modal
      ref={modalRef}
      title="Add Clearance Task"
      maxWidth="max-w-md"
      onClose={onClose}
    >
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <p className="text-base-content/80 -mt-1">
            Create an inter-departmental checklist item for asset return or
            sign-off.
          </p>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <LocalSelect label="Task Type *" {...register("taskType")}>
                {TASK_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </LocalSelect>

              <LocalSelect label="Department *" {...register("department")}>
                {CLEARANCE_DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </LocalSelect>
            </div>

            <SimpleInput
              label="Item / Task Description *"
              placeholder="e.g. Return building access card"
              required
              {...register("title", { required: true })}
            />

            <Controller
              name="assignedTo"
              control={control}
              rules={{ required: "Assignee is required" }}
              render={({ field }) => (
                <SimpleSelect<EmployeeRecord>
                  route="/employees"
                  value={field.value}
                  onChange={field.onChange}
                  label="Responsible Owner *"
                  render={(emp, index) => {
                    const name =
                      [emp.firstName, emp.lastName].filter(Boolean).join(" ") ||
                      emp.email ||
                      "Unnamed";
                    return (
                      <Fragment key={emp.id}>
                        {index === 0 && (
                          <option value="">Select Assignee</option>
                        )}
                        <option value={emp.id}>{name}</option>
                      </Fragment>
                    );
                  }}
                />
              )}
            />

            <div>
              <label className="font-semibold text-base-content/80 mb-1 block">
                Due Date
              </label>
              <input
                type="date"
                {...register("dueDate")}
                className="input input-bordered w-full rounded-xl bg-base-200/80"
              />
            </div>

            <label className="label cursor-pointer justify-start gap-2.5 p-3 rounded-xl border border-base-200 bg-base-200/30">
              <input
                type="checkbox"
                {...register("required")}
                className="checkbox checkbox-sm checkbox-primary rounded"
              />
              <span className="text-sm font-medium text-base-content">
                Required for clearance sign-off
              </span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-base-200">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-sm btn-ghost rounded-xl"
              disabled={addOffboardingTask.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addOffboardingTask.isPending}
              className="btn btn-sm bg-primary text-white hover:bg-primary/90 rounded-xl px-5 gap-1.5 shadow-sm shadow-primary/20"
            >
              <Plus className="size-4" />
              <span>
                {addOffboardingTask.isPending ? "Adding..." : "Add task"}
              </span>
            </button>
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
}

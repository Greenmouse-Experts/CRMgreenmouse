import { Fragment, useEffect, useRef } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import SimpleInput from "@/components/inputs/SimpleInput";
import SimpleTextArea from "@/components/inputs/SimpleTextArea";
import LocalSelect from "@/components/inputs/LocalSelect";
import SimpleSelect from "@/components/inputs/SimpleSelect";
import { useCreateTask, useUpdateTask, type Task } from "@/api/tasksApi";
import type { EmployeeRecord } from "@/api/employeesApi";
import { extract_message } from "@/helpers/errors";
import { Plus, Save } from "lucide-react";
import { toast } from "sonner";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTask?: Task | null;
}

const TYPE_OPTIONS = ["email", "call", "meeting", "follow_up", "task"] as const;

const STATUS_OPTIONS = [
  "open",
  "in_progress",
  "completed",
  "cancelled",
] as const;

const PRIORITY_OPTIONS = ["low", "medium", "high", "urgent"] as const;

interface TaskFormData {
  title: string;
  description?: string;
  type?: string;
  status?: string;
  priority?: string;
  dueAt?: string;
  assignedTo?: string;
}

const defaultValues: TaskFormData = {
  title: "",
  description: "",
  type: "task",
  status: "open",
  priority: "medium",
  dueAt: "",
  assignedTo: "",
};

export default function CreateTaskModal({
  isOpen,
  onClose,
  initialTask,
}: CreateTaskModalProps) {
  const modalRef = useRef<ModalHandle>(null);
  const methods = useForm<TaskFormData>({
    mode: "onSubmit",
    defaultValues,
  });
  const { control, register, handleSubmit, reset } = methods;
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  const isEditing = Boolean(initialTask);
  const isPending = createTask.isPending || updateTask.isPending;

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.open();
      if (initialTask) {
        reset({
          title: initialTask.title ?? "",
          description: initialTask.description ?? "",
          type: initialTask.type || "task",
          status: initialTask.status || "open",
          priority: initialTask.priority || "medium",
          dueAt: initialTask.dueAt ? initialTask.dueAt.slice(0, 10) : "",
          assignedTo: initialTask.assignedTo ?? initialTask.assignee?.id ?? "",
        });
      } else {
        reset(defaultValues);
      }
    } else {
      modalRef.current?.close();
    }
  }, [isOpen, initialTask, reset]);

  const onSubmit = async (values: TaskFormData) => {
    const title = values.title?.trim();
    if (!title) return;

    const payload = {
      title,
      description: values.description?.trim() || undefined,
      type: values.type || undefined,
      status: values.status || undefined,
      priority: values.priority || undefined,
      dueAt: values.dueAt || undefined,
      assignedTo: values.assignedTo || undefined,
    };

    try {
      if (initialTask) {
        await toast.promise(
          updateTask.mutateAsync({ id: initialTask.id, ...payload }),
          {
            loading: "Updating task...",
            success: "Task updated",
            error: (error) => extract_message(error),
          },
        );
      } else {
        await toast.promise(createTask.mutateAsync(payload), {
          loading: "Creating task...",
          success: "Task created",
          error: (error) => extract_message(error),
        });
      }
      reset(defaultValues);
      onClose();
    } catch {
      // Error toast is shown by toast.promise.
    }
  };

  return (
    <Modal
      ref={modalRef}
      title={isEditing ? "Edit Task" : "Add Task"}
      maxWidth="max-w-lg"
      onClose={onClose}
    >
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <SimpleInput
            label="Task title"
            placeholder="e.g. Send the Q3 report"
            required
            {...register("title", { required: "A title is required." })}
            disabled={isPending}
          />

          <SimpleTextArea
            label="Description (optional)"
            rows={3}
            {...register("description")}
            disabled={isPending}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SimpleInput
              label="Due date (optional)"
              type="date"
              min={
                isEditing ? undefined : new Date().toISOString().slice(0, 10)
              }
              {...register("dueAt")}
              disabled={isPending}
            />

            <Controller
              name="assignedTo"
              control={control}
              render={({ field }) => (
                <SimpleSelect<EmployeeRecord>
                  route="/employees"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  label="Assign to (optional)"
                  render={(employee, index) => {
                    const name =
                      [employee.firstName, employee.lastName]
                        .filter(Boolean)
                        .join(" ") ||
                      employee.email ||
                      "Unnamed";
                    return (
                      <Fragment key={employee.id}>
                        {index === 0 && <option value="">Unassigned</option>}
                        <option value={employee.id}>{name}</option>
                      </Fragment>
                    );
                  }}
                />
              )}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <LocalSelect label="Type" {...register("type")}>
              {TYPE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </LocalSelect>
            <LocalSelect label="Status" {...register("status")}>
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </LocalSelect>
            <LocalSelect label="Priority" {...register("priority")}>
              {PRIORITY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </LocalSelect>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-base-200">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-sm btn-ghost rounded-xl"
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="btn btn-sm bg-primary text-white hover:bg-primary/90 rounded-xl px-5 gap-1.5 shadow-sm shadow-primary/20"
            >
              {isEditing ? (
                <Save className="size-3.5" />
              ) : (
                <Plus className="size-3.5" />
              )}
              <span>
                {isPending
                  ? isEditing
                    ? "Saving..."
                    : "Creating..."
                  : isEditing
                    ? "Save changes"
                    : "Create task"}
              </span>
            </button>
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
}

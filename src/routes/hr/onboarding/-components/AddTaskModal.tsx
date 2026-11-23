import { useEffect, useRef } from "react";
import { useForm, FormProvider } from "react-hook-form";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import SimpleInput from "@/components/inputs/SimpleInput";
import SimpleTextArea from "@/components/inputs/SimpleTextArea";
import { useCreateTask } from "@/api/tasksApi";
import { extract_message } from "@/helpers/auth";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** The onboarding employee the new task is assigned to. */
  employeeId: string;
  /** Display name of that employee, for the modal copy. */
  employeeName?: string;
  /** Fired after a task is created successfully. */
  onTaskCreated?: () => void;
}

interface AddTaskFormData {
  title: string;
  description?: string;
  dueAt?: string;
}

/**
 * Adds a new generic task (`POST /v1/tasks`) from the onboarding checklist.
 * The task is assigned to the onboarding employee (`assignedTo`).
 */
export default function AddTaskModal({
  isOpen,
  onClose,
  employeeId,
  employeeName,
  onTaskCreated,
}: AddTaskModalProps) {
  const modalRef = useRef<ModalHandle>(null);
  const methods = useForm<AddTaskFormData>({
    mode: "onSubmit",
    defaultValues: { title: "", description: "", dueAt: "" },
  });
  const { register, handleSubmit, reset } = methods;
  const createTask = useCreateTask();

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.open();
      reset();
    } else {
      modalRef.current?.close();
    }
  }, [isOpen, employeeId, reset]);

  const onSubmit = async (values: AddTaskFormData) => {
    if (createTask.isPending) return;

    const title = (values.title ?? "").trim();
    if (!title) {
      methods.setError("title", { message: "A title is required." });
      return;
    }

    try {
      await toast.promise(
        createTask.mutateAsync({
          title,
          description: values.description?.trim() || undefined,
          dueAt: values.dueAt || undefined,
          assignedTo: employeeId,
        }),
        {
          loading: "Creating task...",
          success: "Task created",
          error: (error) => extract_message(error as never),
        },
      );
      reset();
      onClose();
      onTaskCreated?.();
    } catch {
      // Error toast is shown by toast.promise.
    }
  };

  return (
    <Modal
      ref={modalRef}
      title="Add Task"
      maxWidth="max-w-lg"
      onClose={onClose}
    >
      <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <p className=" text-base-content/80 -mt-1 mb-3">
          Create a new task and assign it to{" "}
          <span className="font-semibold text-base-content">
            {employeeName ?? employeeId}
          </span>
          .
        </p>

        <SimpleInput
          label="Task title"
          placeholder="e.g. Complete the welcome email onboarding"
          {...register("title", { required: "A title is required." })}
          disabled={createTask.isPending}
        />

        <SimpleTextArea
          label="Description (optional)"
          rows={3}
          {...register("description")}
          disabled={createTask.isPending}
        />

        <SimpleInput
          label="Due date (optional)"
          type="date"
          {...register("dueAt")}
          disabled={createTask.isPending}
        />

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-base-200">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm btn-ghost rounded-xl"
            disabled={createTask.isPending}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createTask.isPending}
            className="btn btn-sm bg-primary text-white hover:bg-primary/90 rounded-xl px-5 gap-1.5 shadow-sm shadow-primary/20"
          >
            <Plus className="size-3.5" />
            <span>{createTask.isPending ? "Creating..." : "Create task"}</span>
          </button>
        </div>
      </form>
      </FormProvider>
    </Modal>
  );
}

import { useEffect, useRef } from "react";
import { FormProvider, useForm } from "react-hook-form";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import SimpleInput from "@/components/inputs/SimpleInput";
import SimpleTextArea from "@/components/inputs/SimpleTextArea";
import LocalSelect from "@/components/inputs/LocalSelect";
import { useCreateTask } from "@/api/tasksApi";
import { extract_message } from "@/helpers/auth";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TYPE_OPTIONS = [
  "email",
  "call",
  "meeting",
  "follow_up",
  "task",
] as const;

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
}

export default function CreateTaskModal({
  isOpen,
  onClose,
}: CreateTaskModalProps) {
  const modalRef = useRef<ModalHandle>(null);
  const methods = useForm<TaskFormData>({
    mode: "onSubmit",
    defaultValues: {
      title: "",
      description: "",
      type: "task",
      status: "open",
      priority: "medium",
    },
  });
  const { register, handleSubmit, reset } = methods;
  const createTask = useCreateTask();

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.open();
      reset({
        title: "",
        description: "",
        type: "task",
        status: "open",
        priority: "medium",
      });
    } else {
      modalRef.current?.close();
    }
  }, [isOpen]);

  const onSubmit = async (values: TaskFormData) => {
    const title = values.title?.trim();
    if (!title) return;
    try {
      await toast.promise(
        createTask.mutateAsync({
          title,
          description: values.description?.trim() || undefined,
          type: values.type || undefined,
          status: values.status || undefined,
          priority: values.priority || undefined,
          dueAt: values.dueAt || undefined,
        }),
        {
          loading: "Creating task...",
          success: "Task created",
          error: (error) => extract_message(error as never),
        },
      );
      reset();
      onClose();
    } catch {
      // Error toast is shown by toast.promise.
    }
  };

  return (
    <Modal
      ref={modalRef}
      title="Add Task"
      maxWidth="max-w-md"
      onClose={onClose}
    >
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <SimpleInput
            label="Task title"
            placeholder="e.g. Send the Q3 report"
            required
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
            min={new Date().toISOString().slice(0, 10)}
            {...register("dueAt")}
            disabled={createTask.isPending}
          />

          <div className="grid grid-cols-2 gap-3">
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

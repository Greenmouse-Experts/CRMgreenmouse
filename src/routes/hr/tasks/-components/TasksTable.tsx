import { CheckCircle2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import CustomTable, { type columnType } from "@/components/tables/CustomTable";
import type { Actions } from "@/components/tables/pop-up";
import { useDeleteTask, useUpdateTaskStatus, type Task } from "@/api/tasksApi";
import { extract_message } from "@/helpers/errors";

const STATUS_STYLES: Record<string, string> = {
  open: "bg-base-200/80 text-base-content/80",
  in_progress: "bg-primary/10 text-primary",
  completed: "bg-emerald-500/15 text-emerald-600",
  cancelled: "bg-error/10 text-error",
};

const PRIORITY_STYLES: Record<string, string> = {
  low: "text-base-content/50",
  medium: "text-base-content/80",
  high: "text-amber-600",
  urgent: "text-error",
};

const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString() : "—";

interface TasksTableProps {
  tasks: Task[];
  onEdit?: (task: Task) => void;
}

export default function TasksTable({ tasks, onEdit }: TasksTableProps) {
  const updateStatus = useUpdateTaskStatus();
  const removeTask = useDeleteTask();

  const actions: Actions<Task>[] = [
    ...(onEdit
      ? [
          {
            key: "edit",
            label: "Edit task",
            render: () => (
              <span className="flex items-center gap-1.5">
                <Pencil className="size-3.5" />
                Edit
              </span>
            ),
            action: (task: Task) => {
              onEdit(task);
            },
          },
        ]
      : []),
    {
      key: "complete",
      label: "Mark completed",
      render: () => (
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="size-3.5" />
          Mark completed
        </span>
      ),
      action: (task) => {
        toast.promise(
          updateStatus.mutateAsync({ id: task.id, status: "completed" }),
          {
            loading: "Updating task...",
            success: "Task marked completed",
            error: (error) => extract_message(error),
          },
        );
      },
    },
    {
      key: "delete",
      label: "Delete task",
      render: () => (
        <span className="flex items-center gap-1.5">
          <Trash2 className="size-3.5" />
          Delete
        </span>
      ),
      action: (task) => {
        toast.promise(removeTask.mutateAsync(task.id), {
          loading: "Deleting task...",
          success: "Task deleted",
          error: (error) => extract_message(error),
        });
      },
    },
  ];

  const columns: columnType<Task>[] = [
    {
      key: "title",
      label: "Task",
      render: (value, task) => (
        <div className="space-y-0.5">
          <p
            className={
              task.status === "completed"
                ? "line-through text-base-content/60"
                : "font-medium text-base-content"
            }
          >
            {value}
          </p>
          {task.description && (
            <p className="line-clamp-2 text-xs text-base-content/70">
              {task.description}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <span
          className={`badge badge-sm rounded-lg capitalize ${
            STATUS_STYLES[value] ?? "bg-base-200/80"
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      key: "priority",
      label: "Priority",
      render: (value) => (
        <span
          className={`text-xs capitalize ${
            PRIORITY_STYLES[value] ?? "text-base-content/80"
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (value) => (
        <span className="text-xs text-base-content/80">{value || "task"}</span>
      ),
    },
    {
      key: "dueAt",
      label: "Due",
      render: (value) => (
        <span className="font-mono text-xs text-base-content/80">
          {formatDate(value as string)}
        </span>
      ),
    },
    {
      key: "assignee",
      label: "Assignee",
      render: (_value, task) => {
        const fullName = [task.assignee?.firstName, task.assignee?.lastName]
          .filter(Boolean)
          .join(" ");
        return (
          <span className="text-sm text-base-content/80">
            {task.assignee?.name || fullName || task.assignee?.email || "—"}
          </span>
        );
      },
    },
  ];

  return <CustomTable data={tasks} columns={columns} actions={actions} />;
}

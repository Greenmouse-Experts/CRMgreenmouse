import { useMemo, useState } from "react";
import type { Task } from "@/api/tasksApi";
import CustomTable, { type columnType } from "@/components/tables/CustomTable";
import { CheckCircle2, ClipboardCheck, Eye, Search } from "lucide-react";
import {
  formatTaskDate,
  formatTaskStatusLabel,
  formatTaskTypeLabel,
  isTaskOverdue,
  PRIORITY_STYLES,
  STATUS_STYLES,
  TASK_PRIORITY_OPTIONS,
  TASK_STATUS_TABS,
} from "./taskHelpers";

interface StaffTasksTableProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  canUpdateStatus?: boolean;
  onUpdateStatus?: (task: Task, status: "in_progress" | "completed") => void;
  updatingTaskId?: string | null;
}

export default function StaffTasksTable({
  tasks,
  onSelectTask,
  canUpdateStatus = false,
  onUpdateStatus,
  updatingTaskId = null,
}: StaffTasksTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");

  const filteredTasks = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return tasks.filter((task) => {
      const status = String(task.status ?? "open").toLowerCase();
      const priority = String(task.priority ?? "medium").toLowerCase();
      if (selectedStatus !== "all" && status !== selectedStatus) return false;
      if (selectedPriority !== "all" && priority !== selectedPriority)
        return false;

      if (q) {
        return (
          task.title.toLowerCase().includes(q) ||
          (task.description ?? "").toLowerCase().includes(q) ||
          formatTaskTypeLabel(task.type).toLowerCase().includes(q) ||
          priority.includes(q) ||
          formatTaskStatusLabel(task.status).toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [tasks, searchTerm, selectedStatus, selectedPriority]);

  const columns: columnType<Task>[] = [
    {
      key: "title",
      label: "Task",
      render: (value, task) => (
        <div className="space-y-0.5 max-w-md">
          <p
            className={
              String(task.status ?? "").toLowerCase() === "completed"
                ? "line-through text-base-content/60 font-medium"
                : "font-semibold text-base-content"
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
      key: "type",
      label: "Type",
      render: (value) => (
        <span className="badge badge-sm badge-ghost rounded-lg capitalize font-medium">
          {formatTaskTypeLabel(value)}
        </span>
      ),
    },
    {
      key: "priority",
      label: "Priority",
      render: (value) => {
        const key = String(value ?? "medium").toLowerCase();
        return (
          <span
            className={`badge badge-sm rounded-lg capitalize font-semibold ${
              PRIORITY_STYLES[key] ?? PRIORITY_STYLES.medium
            }`}
          >
            {value || "medium"}
          </span>
        );
      },
    },
    {
      key: "dueAt",
      label: "Due Date",
      render: (value, task) => {
        const overdue = isTaskOverdue(task);
        return (
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span
              className={`font-mono text-xs ${
                overdue ? "text-error font-semibold" : "text-base-content/80"
              }`}
            >
              {formatTaskDate(value)}
            </span>
            {overdue && (
              <span className="badge badge-xs bg-error/15 text-error border border-error/25">
                Overdue
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (value) => {
        const key = String(value ?? "open").toLowerCase();
        return (
          <span
            className={`badge badge-sm rounded-lg capitalize font-semibold whitespace-nowrap ${
              STATUS_STYLES[key] ?? STATUS_STYLES.open
            }`}
          >
            {formatTaskStatusLabel(value)}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (_value, task) => {
        const statusKey = String(task.status ?? "open").toLowerCase();
        const canComplete =
          canUpdateStatus &&
          Boolean(onUpdateStatus) &&
          (statusKey === "open" || statusKey === "in_progress");
        const isBusy = updatingTaskId === task.id;

        return (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectTask(task);
              }}
              className="btn btn-sm btn-ghost rounded-lg gap-1 hover:bg-base-200 text-base-content/80"
            >
              <Eye className="size-3.5" />
              <span>View</span>
            </button>

            {canComplete && onUpdateStatus && (
              <button
                type="button"
                disabled={isBusy}
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateStatus(task, "completed");
                }}
                className="btn btn-sm btn-ghost rounded-lg gap-1 text-primary hover:bg-primary/10"
                title="Mark task completed"
              >
                <CheckCircle2 className="size-3.5" />
                <span>{isBusy ? "Saving..." : "Complete"}</span>
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm p-4 sm:p-6 space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-base-content">My Tasks</h2>
            <span className="badge badge-sm badge-ghost font-semibold">
              {filteredTasks.length}
            </span>
          </div>
          <p className="text-sm text-base-content/80 mt-0.5">
            View only the tasks assigned directly to your employee profile.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <select
            aria-label="Filter by priority"
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="select select-sm select-bordered rounded-xl bg-base-200/80"
          >
            {TASK_PRIORITY_OPTIONS.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>

          <div className="relative w-full sm:w-64">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/70" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search my tasks..."
              className="input input-sm input-bordered w-full pl-9 rounded-xl bg-base-200/80"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 border-b border-base-200 pb-2">
        {TASK_STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setSelectedStatus(tab.key)}
            className={`px-3 py-1 text-sm font-semibold rounded-lg transition-all ${
              selectedStatus === tab.key
                ? "bg-primary text-white shadow-2xs"
                : "text-base-content/80 hover:bg-base-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredTasks.length === 0 ? (
        <div className="text-center py-10 text-base-content/80">
          <ClipboardCheck className="size-8 mx-auto mb-2 opacity-30" />
          <p className="font-medium text-sm">
            {tasks.length === 0
              ? "No tasks assigned to you yet"
              : "No tasks match your current filter"}
          </p>
          <p className="text-sm text-base-content/70 mt-0.5">
            {tasks.length === 0
              ? "Tasks assigned to your employee profile will appear here."
              : "Try adjusting your status, priority filter, or search query."}
          </p>
        </div>
      ) : (
        <CustomTable
          data={filteredTasks}
          columns={columns}
          onRowClick={onSelectTask}
        />
      )}
    </div>
  );
}

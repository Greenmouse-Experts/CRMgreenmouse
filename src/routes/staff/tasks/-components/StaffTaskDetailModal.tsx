import { useEffect, useRef } from "react";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import type { MyTaskStatus, Task } from "@/api/tasksApi";
import {
  CalendarClock,
  CheckCircle2,
  FileText,
  PlayCircle,
  RotateCcw,
  Tag,
  UserCheck,
  XCircle,
} from "lucide-react";
import {
  formatTaskDate,
  formatTaskStatusLabel,
  formatTaskTypeLabel,
  isTaskOverdue,
  PRIORITY_STYLES,
  STATUS_STYLES,
} from "./taskHelpers";

interface StaffTaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  assigneeName: string;
  canUpdateStatus?: boolean;
  onUpdateStatus?: (task: Task, status: MyTaskStatus) => void;
  isUpdatingStatus?: boolean;
  isLoadingDetail?: boolean;
}

export default function StaffTaskDetailModal({
  isOpen,
  onClose,
  task,
  assigneeName,
  canUpdateStatus = true,
  onUpdateStatus,
  isUpdatingStatus = false,
  isLoadingDetail = false,
}: StaffTaskDetailModalProps) {
  const modalRef = useRef<ModalHandle>(null);

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.open();
    } else {
      modalRef.current?.close();
    }
  }, [isOpen]);

  if (!task) return null;

  const statusKey = String(task.status ?? "open").toLowerCase();
  const priorityKey = String(task.priority ?? "medium").toLowerCase();
  const overdue = isTaskOverdue(task);

  const resolvedAssignee =
    task.assignee?.name ||
    [task.assignee?.firstName, task.assignee?.lastName]
      .filter(Boolean)
      .join(" ") ||
    task.assignee?.email ||
    assigneeName;

  return (
    <Modal
      ref={modalRef}
      title={
        <div className="flex flex-wrap items-center gap-2">
          <span>Task Details</span>
          <span
            className={`badge badge-sm rounded-lg capitalize font-semibold ${
              STATUS_STYLES[statusKey] ?? STATUS_STYLES.open
            }`}
          >
            {formatTaskStatusLabel(task.status)}
          </span>
          {isLoadingDetail && (
            <span className="loading loading-spinner loading-xs text-primary" />
          )}
        </div>
      }
      maxWidth="max-w-xl"
      onClose={onClose}
    >
      <div className="space-y-5">
        <div className="rounded-xl border border-base-200 bg-base-200/30 p-4 space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="font-bold text-base text-base-content">
              {task.title}
            </h3>
            <div className="flex items-center gap-1.5">
              <span
                className={`badge badge-sm rounded-lg capitalize font-semibold ${
                  PRIORITY_STYLES[priorityKey] ?? PRIORITY_STYLES.medium
                }`}
              >
                {task.priority || "medium"} priority
              </span>
              {overdue && (
                <span className="badge badge-sm rounded-lg bg-error/15 text-error border border-error/25 font-semibold">
                  Overdue
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-base-200/80 text-sm">
            <div>
              <span className="text-base-content/70 flex items-center gap-1 text-xs">
                <Tag className="size-3.5" />
                Type
              </span>
              <span className="font-semibold text-base-content capitalize">
                {formatTaskTypeLabel(task.type)}
              </span>
            </div>
            <div>
              <span className="text-base-content/70 flex items-center gap-1 text-xs">
                <UserCheck className="size-3.5" />
                Assigned to
              </span>
              <span className="font-semibold text-base-content truncate block">
                {resolvedAssignee}
              </span>
            </div>
            <div>
              <span className="text-base-content/70 flex items-center gap-1 text-xs">
                <CalendarClock className="size-3.5" />
                Due date
              </span>
              <span
                className={`font-semibold ${
                  overdue ? "text-error" : "text-base-content"
                }`}
              >
                {formatTaskDate(task.dueAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <h4 className="font-bold uppercase tracking-wider text-xs text-base-content/80 flex items-center gap-1.5">
            <FileText className="size-4 text-primary" />
            <span>Description</span>
          </h4>
          <div className="p-3.5 rounded-xl border border-base-200 bg-base-100 text-sm text-base-content/90 leading-relaxed whitespace-pre-wrap">
            {task.description?.trim() || "No additional description provided."}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 rounded-xl border border-base-200 bg-base-200/20 p-3.5 text-sm">
          <div>
            <span className="text-base-content/70 block text-xs">
              Start date
            </span>
            <span className="font-medium text-base-content">
              {formatTaskDate(task.startAt)}
            </span>
          </div>
          <div>
            <span className="text-base-content/70 block text-xs">End date</span>
            <span className="font-medium text-base-content">
              {formatTaskDate(task.endAt)}
            </span>
          </div>
          <div>
            <span className="text-base-content/70 block text-xs">Created</span>
            <span className="font-medium text-base-content">
              {formatTaskDate(task.createdAt)}
            </span>
          </div>
          {task.relatedType && (
            <div className="col-span-2 sm:col-span-3 pt-1 border-t border-base-200/70">
              <span className="text-base-content/70 block text-xs">
                Related record
              </span>
              <span className="font-medium text-base-content capitalize">
                {task.relatedType}
                {task.relatedId ? ` · ${task.relatedId}` : ""}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-base-200">
          <div className="flex flex-wrap items-center gap-2">
            {canUpdateStatus && onUpdateStatus && statusKey === "open" && (
              <button
                type="button"
                disabled={isUpdatingStatus}
                onClick={() => onUpdateStatus(task, "in_progress")}
                className="btn btn-sm btn-outline border-primary/40 text-primary hover:bg-primary/10 rounded-xl gap-1.5"
              >
                <PlayCircle className="size-4" />
                <span>Start task</span>
              </button>
            )}
            {canUpdateStatus &&
              onUpdateStatus &&
              (statusKey === "open" || statusKey === "in_progress") && (
                <button
                  type="button"
                  disabled={isUpdatingStatus}
                  onClick={() => onUpdateStatus(task, "completed")}
                  className="btn btn-sm bg-primary text-white hover:bg-primary/90 border-0 rounded-xl gap-1.5"
                >
                  <CheckCircle2 className="size-4" />
                  <span>Mark completed</span>
                </button>
              )}
            {canUpdateStatus &&
              onUpdateStatus &&
              (statusKey === "completed" || statusKey === "cancelled") && (
                <button
                  type="button"
                  disabled={isUpdatingStatus}
                  onClick={() => onUpdateStatus(task, "open")}
                  className="btn btn-sm btn-outline border-base-300 text-base-content hover:bg-base-200 rounded-xl gap-1.5"
                >
                  <RotateCcw className="size-4" />
                  <span>Reopen task</span>
                </button>
              )}
            {canUpdateStatus &&
              onUpdateStatus &&
              (statusKey === "open" || statusKey === "in_progress") && (
                <button
                  type="button"
                  disabled={isUpdatingStatus}
                  onClick={() => onUpdateStatus(task, "cancelled")}
                  className="btn btn-sm btn-ghost text-error hover:bg-error/10 rounded-xl gap-1.5"
                >
                  <XCircle className="size-4" />
                  <span>Cancel task</span>
                </button>
              )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm btn-ghost rounded-xl ml-auto"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}

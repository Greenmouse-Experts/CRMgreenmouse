import type { Task } from "@/api/tasksApi";

export const TASK_STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
] as const;

export const TASK_PRIORITY_OPTIONS = [
  { key: "all", label: "All priorities" },
  { key: "urgent", label: "Urgent" },
  { key: "high", label: "High" },
  { key: "medium", label: "Medium" },
  { key: "low", label: "Low" },
] as const;

export const STATUS_STYLES: Record<string, string> = {
  open: "bg-base-200/80 text-base-content/80 border border-base-300",
  in_progress: "bg-primary/10 text-primary border border-primary/20",
  completed: "bg-emerald-500/15 text-emerald-700 border border-emerald-200",
  cancelled: "bg-error/10 text-error border border-error/20",
};

export const PRIORITY_STYLES: Record<string, string> = {
  low: "bg-base-200/70 text-base-content/70 border border-base-300",
  medium: "bg-info/10 text-info border border-info/20",
  high: "bg-amber-500/15 text-amber-700 border border-amber-200",
  urgent: "bg-error/15 text-error border border-error/25",
};

export function formatTaskStatusLabel(status?: string): string {
  const normalized = String(status ?? "open").toLowerCase();
  if (normalized === "in_progress") return "In Progress";
  return normalized.replace(/_/g, " ");
}

export function formatTaskTypeLabel(type?: string): string {
  const normalized = String(type ?? "task").toLowerCase();
  return normalized.replace(/_/g, " ");
}

export function formatTaskDate(value?: string | null): string {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function isTaskOverdue(
  task: Pick<Task, "dueAt" | "status">,
  now: Date = new Date(),
): boolean {
  if (!task.dueAt) return false;
  const status = String(task.status ?? "").toLowerCase();
  if (status === "completed" || status === "cancelled") return false;
  const due = new Date(task.dueAt);
  if (Number.isNaN(due.getTime())) return false;
  return due.getTime() < now.getTime();
}

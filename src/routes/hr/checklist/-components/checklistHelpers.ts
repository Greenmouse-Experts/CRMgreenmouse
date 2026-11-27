import type { ChecklistItemRecord } from "@/api/checklistApi";

export const OWNER_BADGE_STYLES: Record<string, string> = {
  hr: "bg-purple-500/15 text-purple-600 border-purple-500/25",
  it: "bg-blue-500/15 text-blue-600 border-blue-500/25",
  manager: "bg-amber-500/15 text-amber-600 border-amber-500/25",
  payroll: "bg-emerald-500/15 text-emerald-600 border-emerald-500/25",
  employee: "bg-teal-500/15 text-teal-600 border-teal-500/25",
  admin: "bg-slate-500/15 text-slate-600 border-slate-500/25",
};

export function formatChecklistOwner(owner?: string): string {
  const key = String(owner ?? "hr").trim().toLowerCase();
  if (key === "hr") return "HR";
  if (key === "it") return "IT";
  if (!key) return "HR";
  return key
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getOwnerBadgeClass(owner?: string): string {
  const key = String(owner ?? "hr").trim().toLowerCase();
  return (
    OWNER_BADGE_STYLES[key] ??
    "bg-base-200 text-base-content/80 border-base-300"
  );
}

export function formatChecklistDate(dateStr?: string): string {
  if (!dateStr) return "—";
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getNextSortOrder(items: ChecklistItemRecord[]): number {
  if (items.length === 0) return 0;
  const maxOrder = items.reduce(
    (max, item) => (item.sortOrder > max ? item.sortOrder : max),
    -1,
  );
  return maxOrder + 1;
}

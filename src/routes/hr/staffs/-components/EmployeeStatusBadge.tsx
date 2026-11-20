import type { EmploymentStatus } from "./types";

interface EmployeeStatusBadgeProps {
  status: EmploymentStatus;
  onLeave?: boolean;
  className?: string;
}

export default function EmployeeStatusBadge({
  status,
  onLeave,
  className = "",
}: EmployeeStatusBadgeProps) {
  const getStatusStyle = (s: string) => {
    switch (s.toLowerCase()) {
      case "active":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "probation":
        return "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20";
      case "notice period":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "suspended":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
      case "draft":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "inactive":
        return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20";
      default:
        return "bg-base-200 text-base-content/70 border-base-300";
    }
  };

  return (
    <div className={`inline-flex flex-wrap items-center gap-1.5 ${className}`}>
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5  font-medium border ${getStatusStyle(
          status,
        )}`}
      >
        <span className="size-1.5 rounded-full bg-current" />
        {status}
      </span>
      {onLeave && (
        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5  font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
          <span className="size-1.5 rounded-full bg-amber-500" />
          On Leave
        </span>
      )}
    </div>
  );
}

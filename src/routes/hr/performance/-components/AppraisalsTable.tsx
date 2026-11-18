import type { AppraisalRecord, AppraisalStatus } from "./types";
import { UserCheck } from "lucide-react";

interface AppraisalsTableProps {
  appraisals: AppraisalRecord[];
  onSelectAppraisal?: (appraisal: AppraisalRecord) => void;
}

export default function AppraisalsTable({
  appraisals,
  onSelectAppraisal,
}: AppraisalsTableProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const getStatusBadge = (status: AppraisalStatus) => {
    switch (status) {
      case "Completed":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Completed
          </span>
        );
      case "In Progress":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
            <span className="size-1.5 rounded-full bg-blue-500 animate-pulse" />
            In Progress
          </span>
        );
      case "Pending":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
            <span className="size-1.5 rounded-full bg-amber-500" />
            Pending
          </span>
        );
    }
  };

  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between gap-2 border-b border-base-200 pb-3">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-info/10 text-info flex items-center justify-center">
            <UserCheck className="size-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-base-content">
              Appraisals
            </h2>
            <p className="text-xs text-base-content/60">
              Q4 employee reviews, reviewer assignments, and ratings.
            </p>
          </div>
        </div>

        <span className="badge badge-sm badge-ghost text-xs font-semibold">
          {appraisals.length} reviews
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="table table-sm w-full">
          <thead>
            <tr className="border-b border-base-200 text-xs font-semibold text-base-content/60">
              <th>Employee</th>
              <th>Reviewer</th>
              <th>Rating</th>
              <th className="text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-base-200 text-xs">
            {appraisals.map((item) => (
              <tr
                key={item.id}
                onClick={() => onSelectAppraisal?.(item)}
                className="hover:bg-base-200/50 cursor-pointer transition-colors"
              >
                <td>
                  <div className="flex items-center gap-2.5">
                    <div className="size-7 rounded-full bg-primary/10 text-primary font-bold text-[11px] flex items-center justify-center shrink-0">
                      {getInitials(item.employee)}
                    </div>
                    <span className="font-semibold text-base-content">
                      {item.employee}
                    </span>
                  </div>
                </td>

                <td className="text-base-content/80 font-medium">
                  {item.reviewer}
                </td>

                <td>
                  {item.rating !== "—" ? (
                    <span className="font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md text-xs">
                      {item.rating} / 5.0
                    </span>
                  ) : (
                    <span className="text-base-content/40">—</span>
                  )}
                </td>

                <td className="text-right">{getStatusBadge(item.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

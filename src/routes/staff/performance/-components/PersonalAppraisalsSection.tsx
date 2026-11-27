import type {
  AppraisalRecord,
  AppraisalStatus,
} from "@/routes/hr/performance/-components/types";
import { Eye, UserCheck } from "lucide-react";

export interface PersonalAppraisalItem extends AppraisalRecord {
  selfAssessment?: string;
  managerComments?: string;
}

interface PersonalAppraisalsSectionProps {
  appraisals: PersonalAppraisalItem[];
  onSelectAppraisal: (appraisal: PersonalAppraisalItem) => void;
}

export default function PersonalAppraisalsSection({
  appraisals,
  onSelectAppraisal,
}: PersonalAppraisalsSectionProps) {
  const getStatusBadge = (status: AppraisalStatus) => {
    switch (status) {
      case "Completed":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 font-semibold text-emerald-700 border border-emerald-200">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Completed
          </span>
        );
      case "In Progress":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 font-semibold text-blue-700 border border-blue-200">
            <span className="size-1.5 rounded-full bg-blue-500 animate-pulse" />
            In Progress
          </span>
        );
      case "Pending":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 font-semibold text-amber-700 border border-amber-200">
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
              My Performance Reviews
            </h2>
            <p className="text-xs sm:text-sm text-base-content/80">
              Cycle reviews, self-assessments, manager ratings, and final
              sign-off.
            </p>
          </div>
        </div>

        <span className="badge badge-sm badge-ghost font-semibold">
          {appraisals.length} reviews
        </span>
      </div>

      {appraisals.length === 0 ? (
        <div className="py-10 text-center text-base-content/75">
          <UserCheck className="size-8 mx-auto mb-2 opacity-30" />
          <p className="font-medium text-sm">No performance reviews yet</p>
          <p className="text-xs text-base-content/60 mt-0.5">
            Your appraisals will appear here once a review cycle opens for you.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-sm w-full">
            <thead>
              <tr className="border-b border-base-200 font-semibold text-base-content/80">
                <th>Cycle</th>
                <th>Reviewer</th>
                <th>Self</th>
                <th>Manager</th>
                <th>Final Rating</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-base-200">
              {appraisals.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => onSelectAppraisal(item)}
                  className="hover:bg-base-200/80 cursor-pointer transition-colors"
                >
                  <td className="font-semibold text-base-content">
                    {item.cycle || "Current Cycle"}
                  </td>
                  <td className="text-base-content/80 font-medium">
                    {item.reviewer}
                  </td>
                  <td className="text-base-content/80">
                    {item.selfScore ? `${item.selfScore} / 5.0` : "—"}
                  </td>
                  <td className="text-base-content/80">
                    {item.managerScore ? `${item.managerScore} / 5.0` : "—"}
                  </td>
                  <td>
                    {item.rating !== "—" ? (
                      <span className="font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                        {item.rating} / 5.0
                      </span>
                    ) : (
                      <span className="text-base-content/80">—</span>
                    )}
                  </td>
                  <td>{getStatusBadge(item.status)}</td>
                  <td className="text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectAppraisal(item);
                      }}
                      className="btn btn-sm btn-ghost rounded-lg gap-1 text-base-content/80"
                    >
                      <Eye className="size-3.5" />
                      <span>Review</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

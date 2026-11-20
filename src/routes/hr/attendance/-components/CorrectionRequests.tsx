import type { CorrectionRequest, CorrectionStatus } from "./types";
import { Check, X } from "lucide-react";

interface CorrectionRequestsProps {
  requests: CorrectionRequest[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export default function CorrectionRequests({
  requests,
  onApprove,
  onReject,
}: CorrectionRequestsProps) {
  const getStatusBadge = (status: CorrectionStatus) => {
    switch (status) {
      case "Approved":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
            Approved
          </span>
        );
      case "Rejected":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700 border border-rose-200">
            Rejected
          </span>
        );
      case "Pending":
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm p-4 sm:p-6 space-y-4">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-base-content">
            Correction requests
          </h2>
          <span className="badge badge-sm badge-ghost  font-semibold">
            {requests.filter((r) => r.status === "Pending").length} pending
          </span>
        </div>
        <p className=" text-base-content/80 mt-0.5">
          Pending adjustments, missed punches, and overtime claims requiring
          manager sign-off
        </p>
      </div>

      <ul className="space-y-3">
        {requests.length === 0 ? (
          <li className="py-6 text-center  text-base-content/80 italic">
            No correction requests submitted.
          </li>
        ) : (
          requests.map((req) => {
            const isPending = req.status === "Pending";

            return (
              <li
                key={req.id}
                className="rounded-2xl border border-base-200 bg-base-100 p-4 shadow-2xs hover:border-base-300 transition-all space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-base-content">
                    {req.employeeName}
                  </p>
                  {getStatusBadge(req.status)}
                </div>

                <p className=" text-base-content/80">{req.detail}</p>

                {req.reason && (
                  <p className="text-[11px] text-base-content/80 italic bg-base-200/80 p-2 rounded-lg">
                    &ldquo;{req.reason}&rdquo;
                  </p>
                )}

                {isPending && (
                  <div className="mt-3 flex items-center gap-2 pt-2 border-t border-base-200">
                    <button
                      type="button"
                      onClick={() => onApprove(req.id)}
                      className="btn btn-xs bg-emerald-600 text-white hover:bg-emerald-700 border-0 rounded-lg px-3 gap-1"
                    >
                      <Check className="size-3" />
                      <span>Approve</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onReject(req.id)}
                      className="btn btn-xs btn-outline btn-error rounded-lg px-3 gap-1"
                    >
                      <X className="size-3" />
                      <span>Reject</span>
                    </button>
                  </div>
                )}
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}

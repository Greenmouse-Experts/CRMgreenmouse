import { useState } from "react";
import type { LeaveRequest, LeaveStatus } from "./types";
import { Search, Check, X, User } from "lucide-react";

interface LeaveRequestsTableProps {
  requests: LeaveRequest[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export default function LeaveRequestsTable({
  requests,
  onApprove,
  onReject,
}: LeaveRequestsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredRequests = requests.filter((r) => {
    if (statusFilter !== "All") {
      if (statusFilter === "Pending") {
        if (!r.status.startsWith("Pending") && r.status !== "Submitted") {
          return false;
        }
      } else if (r.status !== statusFilter) {
        return false;
      }
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        r.id.toLowerCase().includes(q) ||
        r.emp.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const getStatusBadge = (status: LeaveStatus) => {
    switch (status) {
      case "Approved":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5  font-semibold text-emerald-700 border border-emerald-200">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Approved
          </span>
        );
      case "Rejected":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-0.5  font-semibold text-rose-700 border border-rose-200">
            <span className="size-1.5 rounded-full bg-rose-500" />
            Rejected
          </span>
        );
      case "Cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5  font-semibold text-slate-600 border border-slate-200">
            Cancelled
          </span>
        );
      case "Submitted":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5  font-semibold text-blue-700 border border-blue-200">
            <span className="size-1.5 rounded-full bg-blue-500 animate-pulse" />
            Submitted
          </span>
        );
      case "Pending Manager Approval":
      case "Pending HR Approval":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5  font-semibold text-amber-700 border border-amber-200">
            <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
            {status}
          </span>
        );
    }
  };

  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm p-4 sm:p-6 space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-base-content">Requests</h2>
            <span className="badge badge-sm badge-ghost  font-semibold">
              {filteredRequests.length}
            </span>
          </div>
          <p className=" text-base-content/80 mt-0.5">
            Review time-off requests, supporting details, and manage approvals.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/80" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search employee, ID, type..."
            className="input input-sm input-bordered w-full pl-9  rounded-xl bg-base-200/80"
          />
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-base-200 pb-2">
        {["All", "Pending", "Approved", "Rejected"].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setStatusFilter(tab)}
            className={`px-3 py-1  font-semibold rounded-lg transition-all ${
              statusFilter === tab
                ? "bg-primary text-white shadow-2xs"
                : "text-base-content/80 hover:bg-base-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="table table-sm w-full">
          <thead>
            <tr className="border-b border-base-200  font-semibold text-base-content/80">
              <th>ID</th>
              <th>Employee</th>
              <th>Type</th>
              <th>Dates</th>
              <th>Days</th>
              <th>Status</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-base-200 ">
            {filteredRequests.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-8 text-center text-base-content/80 italic"
                >
                  No leave requests found.
                </td>
              </tr>
            ) : (
              filteredRequests.map((req) => {
                const isPending =
                  req.status.startsWith("Pending") ||
                  req.status === "Submitted";
                const isExpanded = expandedId === req.id;

                return (
                  <tr
                    key={req.id}
                    onClick={() => setExpandedId(isExpanded ? null : req.id)}
                    className="hover:bg-base-200/80 cursor-pointer transition-colors"
                  >
                    <td className="font-mono font-medium text-base-content/80">
                      {req.id}
                    </td>

                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="size-7 rounded-full bg-primary/10 text-primary font-bold text-[11px] flex items-center justify-center shrink-0">
                          {getInitials(req.emp)}
                        </div>
                        <span className="font-semibold text-base-content">
                          {req.emp}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span className="font-medium text-base-content/80">
                        {req.type}
                      </span>
                    </td>

                    <td className="text-base-content/80">
                      {req.from} – {req.to}
                    </td>

                    <td className="font-semibold text-base-content">
                      {req.days} {req.days === 1 ? "day" : "days"}
                    </td>

                    <td>{getStatusBadge(req.status)}</td>

                    <td
                      className="text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {isPending ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onApprove(req.id)}
                            className="btn btn-sm bg-emerald-600 text-white hover:bg-emerald-700 border-0 rounded-lg px-2.5 gap-1 shadow-2xs"
                          >
                            <Check className="size-3" />
                            <span>Approve</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onReject(req.id)}
                            className="btn btn-sm btn-outline btn-error rounded-lg px-2.5 gap-1"
                          >
                            <X className="size-3" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <span className=" text-base-content/80">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Expanded item details if selected */}
      {expandedId && (
        <div className="p-4 rounded-xl bg-base-200/80 border border-base-200 space-y-2 animate-in fade-in duration-200">
          {(() => {
            const req = requests.find((r) => r.id === expandedId);
            if (!req) return null;
            return (
              <>
                <div className="flex items-center justify-between">
                  <span className=" font-bold text-base-content">
                    Request Details · {req.emp} ({req.id})
                  </span>
                  <button
                    type="button"
                    onClick={() => setExpandedId(null)}
                    className=" text-base-content/80 hover:text-base-content"
                  >
                    Dismiss
                  </button>
                </div>
                {req.reason && (
                  <p className=" text-base-content/80">
                    <span className="font-semibold">Reason:</span> {req.reason}
                  </p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-base-content/80 pt-1">
                  {req.cover && (
                    <div className="flex items-center gap-1.5">
                      <User className="size-3.5 text-base-content/80" />
                      <span>
                        Handover covering colleague:{" "}
                        <strong>{req.cover}</strong>
                      </span>
                    </div>
                  )}
                  {req.phone && (
                    <div>
                      <span>
                        Contact while away: <strong>{req.phone}</strong>
                      </span>
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}

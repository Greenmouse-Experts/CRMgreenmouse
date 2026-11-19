import type { LeaveStatus, PayslipStatus } from "./types";

export function getLeaveStatusBadge(status: LeaveStatus) {
  switch (status) {
    case "Approved":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          Approved
        </span>
      );
    case "Rejected":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 border border-rose-200">
          <span className="size-1.5 rounded-full bg-rose-500" />
          Rejected
        </span>
      );
    case "Cancelled":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 border border-slate-200">
          <span className="size-1.5 rounded-full bg-slate-400" />
          Cancelled
        </span>
      );
    case "Pending":
    case "Submitted":
    default:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
          <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
          {status}
        </span>
      );
  }
}

export function getPayslipStatusBadge(status: PayslipStatus) {
  switch (status) {
    case "Paid":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          Paid
        </span>
      );
    case "On hold":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
          <span className="size-1.5 rounded-full bg-amber-500" />
          On hold
        </span>
      );
    case "Ready":
    default:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
          <span className="size-1.5 rounded-full bg-blue-500" />
          Ready
        </span>
      );
  }
}

import { useState } from "react";
import { Check, FileText, Search, Send, Wallet, X } from "lucide-react";
import { formatCurrency } from "./payrollData";
import type { PayrollRun, PayrollRunStatus } from "./types";

interface PayrollRunsTableProps {
  runs: PayrollRun[];
  onSubmitRun: (id: string) => void;
  onApproveRun: (id: string) => void;
  onMarkPaid: (id: string) => void;
  onCancelRun: (id: string) => void;
  onViewPayslips: (id: string) => void;
}

const TABS = ["All", "Draft", "Pending", "Approved", "Paid"] as const;

function getStatusBadge(status: PayrollRunStatus) {
  switch (status) {
    case "Paid":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5  font-semibold text-emerald-700 border border-emerald-200">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          Paid
        </span>
      );
    case "Cancelled":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5  font-semibold text-slate-600 border border-slate-200">
          Cancelled
        </span>
      );
    case "Approved":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-0.5  font-semibold text-teal-700 border border-teal-200">
          <span className="size-1.5 rounded-full bg-teal-500" />
          Approved
        </span>
      );
    case "Draft":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-base-200 px-2.5 py-0.5  font-semibold text-base-content/70 border border-base-300">
          Draft
        </span>
      );
    case "Pending Approval":
    default:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5  font-semibold text-amber-700 border border-amber-200">
          <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
          Pending approval
        </span>
      );
  }
}

export default function PayrollRunsTable({
  runs,
  onSubmitRun,
  onApproveRun,
  onMarkPaid,
  onCancelRun,
  onViewPayslips,
}: PayrollRunsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<(typeof TABS)[number]>("All");

  const filteredRuns = runs.filter((run) => {
    if (statusFilter === "Pending") {
      if (run.status !== "Pending Approval") return false;
    } else if (statusFilter !== "All" && run.status !== statusFilter) {
      return false;
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        run.id.toLowerCase().includes(q) ||
        run.period.toLowerCase().includes(q) ||
        run.preparedBy.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-base-content">
              Payroll runs
            </h2>
            <span className="badge badge-sm badge-ghost  font-semibold">
              {filteredRuns.length}
            </span>
          </div>
          <p className=" text-base-content/80 mt-0.5">
            Prepare, approve, and settle each pay period. Every run is audited.
          </p>
        </div>

        <div className="relative w-full sm:w-60">
          <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search run, period, preparer..."
            className="input input-sm input-bordered w-full pl-9  rounded-xl bg-base-200/80"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 border-b border-base-200 pb-2">
        {TABS.map((tab) => (
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

      <div className="overflow-x-auto">
        <table className="table table-sm w-full">
          <thead>
            <tr className="border-b border-base-200  font-semibold text-base-content/80">
              <th>Run</th>
              <th>Period</th>
              <th>Pay date</th>
              <th>Staff</th>
              <th>Gross</th>
              <th>Net</th>
              <th>Status</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-base-200 ">
            {filteredRuns.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="py-8 text-center text-base-content/40 italic"
                >
                  No payroll runs match this filter.
                </td>
              </tr>
            ) : (
              filteredRuns.map((run) => (
                <tr
                  key={run.id}
                  className="hover:bg-base-200/40 transition-colors"
                >
                  <td className="font-mono font-medium text-base-content/70">
                    {run.id}
                  </td>
                  <td>
                    <div className="font-semibold text-base-content">
                      {run.period}
                    </div>
                    <div className="text-[11px] text-base-content/80">
                      {run.cycle} · {run.preparedBy}
                    </div>
                  </td>
                  <td className="text-base-content/70">{run.payDate}</td>
                  <td className="text-base-content/70">{run.employees}</td>
                  <td className="font-medium text-base-content">
                    {formatCurrency(run.gross)}
                  </td>
                  <td className="font-semibold text-base-content">
                    {formatCurrency(run.net)}
                  </td>
                  <td>{getStatusBadge(run.status)}</td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {run.status === "Draft" && (
                        <button
                          type="button"
                          onClick={() => onSubmitRun(run.id)}
                          className="btn btn-xs bg-primary text-white hover:bg-primary/90 border-0 rounded-lg px-2.5 gap-1 shadow-2xs"
                        >
                          <Send className="size-3" />
                          <span>Submit</span>
                        </button>
                      )}
                      {run.status === "Pending Approval" && (
                        <>
                          <button
                            type="button"
                            onClick={() => onApproveRun(run.id)}
                            className="btn btn-xs bg-emerald-600 text-white hover:bg-emerald-700 border-0 rounded-lg px-2.5 gap-1 shadow-2xs"
                          >
                            <Check className="size-3" />
                            <span>Approve</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onCancelRun(run.id)}
                            className="btn btn-xs btn-outline btn-error rounded-lg px-2.5 gap-1"
                          >
                            <X className="size-3" />
                            <span>Cancel</span>
                          </button>
                        </>
                      )}
                      {run.status === "Approved" && (
                        <button
                          type="button"
                          onClick={() => onMarkPaid(run.id)}
                          className="btn btn-xs bg-emerald-600 text-white hover:bg-emerald-700 border-0 rounded-lg px-2.5 gap-1 shadow-2xs"
                        >
                          <Wallet className="size-3" />
                          <span>Mark paid</span>
                        </button>
                      )}
                      {(run.status === "Paid" || run.status === "Approved") && (
                        <button
                          type="button"
                          onClick={() => onViewPayslips(run.id)}
                          className="btn btn-xs btn-ghost rounded-lg px-2.5 gap-1"
                        >
                          <FileText className="size-3" />
                          <span>Payslips</span>
                        </button>
                      )}
                      {run.status === "Cancelled" && (
                        <span className=" text-base-content/40">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

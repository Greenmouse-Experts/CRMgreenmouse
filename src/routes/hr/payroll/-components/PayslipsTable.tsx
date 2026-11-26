import { Fragment, useState } from "react";
import { FileText, PauseCircle, PlayCircle, Search } from "lucide-react";
import { formatCurrency } from "./payrollData";
import type { Payslip, PayslipStatus } from "./types";

interface PayslipsTableProps {
  payslips: Payslip[];
  onViewPayslip: (payslip: Payslip) => void;
  onToggleHold: (id: string) => void;
}

const TABS = ["All", "Ready", "On hold"] as const;

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

function getStatusBadge(status: PayslipStatus) {
  switch (status) {
    case "Paid":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5  font-semibold text-emerald-700 border border-emerald-200">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          Paid
        </span>
      );
    case "On hold":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5  font-semibold text-amber-700 border border-amber-200">
          <span className="size-1.5 rounded-full bg-amber-500" />
          On hold
        </span>
      );
    case "Ready":
    default:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5  font-semibold text-blue-700 border border-blue-200">
          <span className="size-1.5 rounded-full bg-blue-500" />
          Ready
        </span>
      );
  }
}

export default function PayslipsTable({
  payslips,
  onViewPayslip,
  onToggleHold,
}: PayslipsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<(typeof TABS)[number]>("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredPayslips = payslips.filter((slip) => {
    if (statusFilter !== "All" && slip.status !== statusFilter) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        slip.employee.toLowerCase().includes(q) ||
        slip.department.toLowerCase().includes(q) ||
        slip.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const visibleNet = filteredPayslips
    .filter((slip) => slip.status !== "On hold")
    .reduce((sum, slip) => sum + slip.netPay, 0);

  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-base-content">
              Payslips · Nov 2026
            </h2>
            <span className="badge badge-sm badge-ghost  font-semibold">
              {filteredPayslips.length}
            </span>
          </div>
          <p className=" text-base-content/80 mt-0.5">
            Review calculated pay before release. Held payslips are skipped at
            payout.
          </p>
        </div>

        <div className="relative w-full sm:w-60">
          <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/80" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search employee, department..."
            className="input input-sm input-bordered w-full pl-9  rounded-xl bg-base-200/80"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 border-b border-base-200 pb-2">
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
        <span className="ml-auto text-[11px] font-medium text-base-content/80">
          Releasable total:{" "}
          <strong className="text-primary">{formatCurrency(visibleNet)}</strong>
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="table table-sm w-full">
          <thead>
            <tr className="border-b border-base-200  font-semibold text-base-content/80">
              <th>Employee</th>
              <th>Gross</th>
              <th>Deductions</th>
              <th>Net pay</th>
              <th>Status</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-base-200 ">
            {filteredPayslips.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-8 text-center text-base-content/80 italic"
                >
                  No payslips match this filter.
                </td>
              </tr>
            ) : (
              filteredPayslips.map((slip) => {
                const isExpanded = expandedId === slip.id;
                const deductions = slip.tax + slip.pension + slip.loan;

                return (
                  <Fragment key={slip.id}>
                    <tr
                      onClick={() => setExpandedId(isExpanded ? null : slip.id)}
                      className="hover:bg-base-200/80 cursor-pointer transition-colors"
                    >
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="size-7 rounded-full bg-primary/10 text-primary font-bold text-[11px] flex items-center justify-center shrink-0">
                            {getInitials(slip.employee)}
                          </div>
                          <div>
                            <div className="font-semibold text-base-content">
                              {slip.employee}
                            </div>
                            <div className="text-[11px] text-base-content/80">
                              {slip.role} · {slip.department}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="font-medium text-base-content">
                        {formatCurrency(slip.gross)}
                      </td>
                      <td className="text-rose-600">
                        −{formatCurrency(deductions)}
                      </td>
                      <td className="font-semibold text-base-content">
                        {formatCurrency(slip.netPay)}
                      </td>
                      <td>{getStatusBadge(slip.status)}</td>
                      <td
                        className="text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onViewPayslip(slip)}
                            className="btn btn-sm btn-ghost rounded-lg px-2 gap-1"
                          >
                            <FileText className="size-3" />
                            <span>View</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onToggleHold(slip.id)}
                            className="btn btn-sm btn-outline rounded-lg px-2 gap-1"
                          >
                            {slip.status === "On hold" ? (
                              <>
                                <PlayCircle className="size-3" />
                                <span>Release</span>
                              </>
                            ) : (
                              <>
                                <PauseCircle className="size-3" />
                                <span>Hold</span>
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr key={`${slip.id}-details`} className="bg-base-200/30">
                        <td colSpan={6} className="p-4">
                          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                            <div>
                              <div className="text-[10px] uppercase tracking-wider text-base-content/80">
                                Base salary
                              </div>
                              <div className="text-sm font-semibold text-base-content">
                                {formatCurrency(slip.baseSalary)}
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] uppercase tracking-wider text-base-content/80">
                                Allowances
                              </div>
                              <div className="text-sm font-semibold text-base-content">
                                {formatCurrency(slip.allowances)}
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] uppercase tracking-wider text-base-content/80">
                                Overtime
                              </div>
                              <div className="text-sm font-semibold text-base-content">
                                {formatCurrency(slip.overtime)}
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] uppercase tracking-wider text-base-content/80">
                                Bonus
                              </div>
                              <div className="text-sm font-semibold text-base-content">
                                {formatCurrency(slip.bonus)}
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] uppercase tracking-wider text-base-content/80">
                                PAYE tax
                              </div>
                              <div className="text-sm font-semibold text-rose-600">
                                −{formatCurrency(slip.tax)}
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] uppercase tracking-wider text-base-content/80">
                                Pension
                              </div>
                              <div className="text-sm font-semibold text-rose-600">
                                −{formatCurrency(slip.pension)}
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] uppercase tracking-wider text-base-content/80">
                                Loan recovery
                              </div>
                              <div className="text-sm font-semibold text-rose-600">
                                −{formatCurrency(slip.loan)}
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] uppercase tracking-wider text-base-content/80">
                                Bank
                              </div>
                              <div className="text-sm font-semibold text-base-content">
                                {slip.bank} {slip.accountMasked}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

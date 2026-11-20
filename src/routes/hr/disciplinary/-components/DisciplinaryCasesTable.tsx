import { useState } from "react";
import type { CaseSeverity, CaseStatus, DisciplinaryCase } from "./types";
import { Eye, Search, ShieldAlert } from "lucide-react";

interface DisciplinaryCasesTableProps {
  cases: DisciplinaryCase[];
  onSelectCase: (caseItem: DisciplinaryCase) => void;
}

const TABS: (CaseStatus | "All")[] = [
  "All",
  "Under Review",
  "Hearing Scheduled",
  "Closed",
];

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export default function DisciplinaryCasesTable({
  cases,
  onSelectCase,
}: DisciplinaryCasesTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState<CaseStatus | "All">("All");

  const filteredCases = cases.filter((c) => {
    if (selectedTab !== "All" && c.status !== selectedTab) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        c.id.toLowerCase().includes(q) ||
        c.employee.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.investigator.toLowerCase().includes(q) ||
        c.department.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (status: CaseStatus) => {
    switch (status) {
      case "Under Review":
      case "Investigation":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5  font-semibold text-amber-700 border border-amber-200">
            <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
            Under Review
          </span>
        );
      case "Hearing Scheduled":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5  font-semibold text-blue-700 border border-blue-200">
            <span className="size-1.5 rounded-full bg-blue-500" />
            Hearing scheduled
          </span>
        );
      case "Closed":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5  font-semibold text-emerald-700 border border-emerald-200">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Closed
          </span>
        );
      case "Decision Pending":
      case "Appealed":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-2.5 py-0.5  font-semibold text-purple-700 border border-purple-200">
            {status}
          </span>
        );
    }
  };

  const getSeverityBadge = (severity: CaseSeverity) => {
    switch (severity) {
      case "Gross misconduct":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 border border-rose-200">
            Gross misconduct
          </span>
        );
      case "Major":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-orange-50 px-2 py-0.5 text-[11px] font-semibold text-orange-700 border border-orange-200">
            Major
          </span>
        );
      case "Minor":
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 border border-slate-200">
            Minor
          </span>
        );
    }
  };

  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm p-4 sm:p-6 space-y-4">
      {/* Table Header: Title + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-base-content">
              Disciplinary Records
            </h2>
            <span className="badge badge-sm badge-ghost  font-semibold">
              {filteredCases.length}
            </span>
          </div>
          <p className=" text-base-content/80 mt-0.5">
            Strict audit logging is enabled for all disciplinary queries and
            modifications.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search case, employee, category..."
            className="input input-sm input-bordered w-full pl-9  rounded-xl bg-base-200/80"
          />
        </div>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-base-200 pb-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setSelectedTab(tab)}
            className={`px-3 py-1  font-semibold rounded-lg transition-all ${
              selectedTab === tab
                ? "bg-primary text-white shadow-2xs"
                : "text-base-content/80 hover:bg-base-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="table table-sm w-full ">
          <thead>
            <tr className="border-b border-base-200 text-base-content/80 font-medium">
              <th className="py-3 font-semibold">Case</th>
              <th className="font-semibold">Employee</th>
              <th className="font-semibold">Category</th>
              <th className="font-semibold">Severity</th>
              <th className="font-semibold">Opened</th>
              <th className="font-semibold">Stage</th>
              <th className="font-semibold">Status</th>
              <th className="text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-base-200">
            {filteredCases.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="text-center py-10 text-base-content/80"
                >
                  <ShieldAlert className="size-8 mx-auto mb-2 opacity-30" />
                  <p className="font-medium text-sm">
                    No disciplinary cases found
                  </p>
                  <p className=" text-base-content/40 mt-0.5">
                    Try adjusting your filters or search keywords
                  </p>
                </td>
              </tr>
            ) : (
              filteredCases.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => onSelectCase(c)}
                  className="hover:bg-base-200/40 cursor-pointer transition-colors"
                >
                  <td className="py-3 font-bold text-base-content">
                    <span className="font-mono bg-base-200/80 px-2 py-0.5 rounded-md border border-base-300">
                      {c.id}
                    </span>
                  </td>

                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="size-7 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-[10px]">
                        {getInitials(c.employee)}
                      </div>
                      <div>
                        <div className="font-semibold text-base-content">
                          {c.employee}
                        </div>
                        <div className="text-[10px] text-base-content/80">
                          {c.department}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="font-medium text-base-content/80">
                    {c.category}
                  </td>

                  <td>{getSeverityBadge(c.severity)}</td>

                  <td className="text-base-content/70 whitespace-nowrap">
                    {c.openedDate}
                  </td>

                  <td>
                    <span className="font-medium text-base-content/80 text-[11px]">
                      {c.currentStep}
                    </span>
                  </td>

                  <td>{getStatusBadge(c.status)}</td>

                  <td className="text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCase(c);
                      }}
                      className="btn btn-xs btn-ghost rounded-lg gap-1 hover:bg-base-200 text-base-content/70"
                    >
                      <Eye className="size-3.5" />
                      <span>Review</span>
                    </button>
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

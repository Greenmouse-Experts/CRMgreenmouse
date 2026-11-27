import { useState } from "react";
import type {
  CaseSeverity,
  CaseStatus,
  DisciplinaryCase,
} from "@/routes/hr/disciplinary/-components/types";
import CustomTable, { type columnType } from "@/components/tables/CustomTable";
import { Eye, Search, ShieldAlert } from "lucide-react";

interface StaffDisciplinaryCasesTableProps {
  cases: DisciplinaryCase[];
  onSelectCase: (caseItem: DisciplinaryCase) => void;
}

const TABS: (CaseStatus | "All")[] = [
  "All",
  "Under Review",
  "Investigation",
  "Hearing Scheduled",
  "Decision Pending",
  "Closed",
];

export default function StaffDisciplinaryCasesTable({
  cases,
  onSelectCase,
}: StaffDisciplinaryCasesTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState<CaseStatus | "All">("All");

  const filteredCases = cases.filter((c) => {
    if (selectedTab !== "All" && c.status !== selectedTab) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        c.caseCode.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.currentStep.toLowerCase().includes(q) ||
        c.status.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (status: CaseStatus) => {
    switch (status) {
      case "Under Review":
      case "Investigation":
        return (
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-amber-50 px-2.5 py-0.5 text-sm font-semibold text-amber-700 border border-amber-200">
            <span className="size-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
            {status}
          </span>
        );
      case "Hearing Scheduled":
        return (
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-blue-50 px-2.5 py-0.5 text-sm font-semibold text-blue-700 border border-blue-200">
            <span className="size-1.5 rounded-full bg-blue-500 shrink-0" />
            Hearing scheduled
          </span>
        );
      case "Closed":
        return (
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-emerald-50 px-2.5 py-0.5 text-sm font-semibold text-emerald-700 border border-emerald-200">
            <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" />
            Closed
          </span>
        );
      case "Decision Pending":
      case "Appealed":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-purple-50 px-2.5 py-0.5 text-sm font-semibold text-purple-700 border border-purple-200">
            {status}
          </span>
        );
    }
  };

  const getSeverityBadge = (severity: CaseSeverity) => {
    const normalized = String(severity).toLowerCase();
    if (normalized.includes("gross")) {
      return (
        <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-md bg-rose-50 px-2 py-0.5 text-sm font-semibold text-rose-700 border border-rose-200 capitalize">
          {severity}
        </span>
      );
    }
    if (normalized.includes("major")) {
      return (
        <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-md bg-orange-50 px-2 py-0.5 text-sm font-semibold text-orange-700 border border-orange-200 capitalize">
          {severity}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-md bg-slate-100 px-2 py-0.5 text-sm font-semibold text-slate-700 border border-slate-200 capitalize">
        {severity}
      </span>
    );
  };

  const columns: columnType<DisciplinaryCase>[] = [
    {
      key: "caseCode",
      label: "Case",
      render: (value: string) => (
        <span className="font-mono font-bold whitespace-nowrap bg-base-200/80 px-2 py-0.5 rounded-md border border-base-300">
          {value}
        </span>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (value: string) => (
        <span className="font-medium text-base-content/80 capitalize">
          {value}
        </span>
      ),
    },
    {
      key: "severity",
      label: "Severity",
      render: (value: CaseSeverity) => getSeverityBadge(value),
    },
    {
      key: "investigator",
      label: "Investigator",
      render: (value: string) => (
        <span className="text-base-content/80">{value}</span>
      ),
    },
    {
      key: "openedDate",
      label: "Opened",
      render: (value: string) => (
        <span className="text-base-content/80 whitespace-nowrap">{value}</span>
      ),
    },
    {
      key: "currentStep",
      label: "Current Stage",
      render: (value: string) => (
        <span className="font-medium text-primary text-sm">{value}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value: CaseStatus) => getStatusBadge(value),
    },
    {
      key: "action",
      label: "Details",
      render: (_value: unknown, c: DisciplinaryCase) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelectCase(c);
          }}
          className="btn btn-sm btn-ghost rounded-lg gap-1 hover:bg-base-200 text-base-content/80"
        >
          <Eye className="size-3.5" />
          <span>View status</span>
        </button>
      ),
    },
  ];

  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-base-content">
              My Disciplinary Cases
            </h2>
            <span className="badge badge-sm badge-ghost font-semibold">
              {filteredCases.length}
            </span>
          </div>
          <p className="text-sm text-base-content/80 mt-0.5">
            Track cases opened against your profile, current review stage, and
            live status updates from HR.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/80" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search case code, category..."
            className="input input-sm input-bordered w-full pl-9 rounded-xl bg-base-200/80"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 border-b border-base-200 pb-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setSelectedTab(tab)}
            className={`px-3 py-1 font-semibold rounded-lg transition-all ${
              selectedTab === tab
                ? "bg-primary text-white shadow-2xs"
                : "text-base-content/80 hover:bg-base-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {filteredCases.length === 0 ? (
        <div className="text-center py-10 text-base-content/80">
          <ShieldAlert className="size-8 mx-auto mb-2 opacity-30" />
          <p className="font-medium text-sm">
            {cases.length === 0
              ? "No disciplinary cases on your record"
              : "No cases match your current filter"}
          </p>
          <p className="text-sm text-base-content/70 mt-0.5">
            {cases.length === 0
              ? "You currently have a clean disciplinary record."
              : "Try adjusting your status filter or search query."}
          </p>
        </div>
      ) : (
        <CustomTable
          data={filteredCases}
          columns={columns}
          onRowClick={onSelectCase}
        />
      )}
    </div>
  );
}

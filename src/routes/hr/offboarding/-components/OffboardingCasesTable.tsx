import { useState } from "react";
import CustomTable, { type columnType } from "@/components/tables/CustomTable";
import type { Actions } from "@/components/tables/pop-up";
import type { OffboardingCase, OffboardingStatus } from "./types";
import { Search } from "lucide-react";
import { toast } from "sonner";

interface OffboardingCasesTableProps {
  cases: OffboardingCase[];
  activeCaseId: string;
  onSelectCase: (caseItem: OffboardingCase) => void;
  onCompleteCase: (id: string) => void;
}

const TABS: (OffboardingStatus | "All")[] = [
  "All",
  "Notice period",
  "Clearance in progress",
  "Completed",
];

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export default function OffboardingCasesTable({
  cases,
  activeCaseId,
  onSelectCase,
  onCompleteCase,
}: OffboardingCasesTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState<OffboardingStatus | "All">(
    "All",
  );

  const filteredCases = cases.filter((c) => {
    if (selectedTab !== "All" && c.status !== selectedTab) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        c.employee.toLowerCase().includes(q) ||
        c.department.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q) ||
        c.separationType.toLowerCase().includes(q) ||
        c.currentStep.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (status: OffboardingStatus) => {
    switch (status) {
      case "Completed":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5  font-semibold text-emerald-700 border border-emerald-200">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Completed
          </span>
        );
      case "Notice period":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5  font-semibold text-amber-700 border border-amber-200">
            <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
            Notice period
          </span>
        );
      case "Clearance in progress":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5  font-semibold text-blue-700 border border-blue-200">
            <span className="size-1.5 rounded-full bg-blue-500" />
            Clearance in progress
          </span>
        );
    }
  };

  const columns: columnType<OffboardingCase>[] = [
    {
      key: "employee",
      label: "Employee",
      render: (_: string, row: OffboardingCase) => {
        const isActive = row.id === activeCaseId;
        return (
          <div className="flex items-center gap-2.5">
            <div
              className={`size-8 rounded-full font-bold flex items-center justify-center text-[10px] ${
                isActive
                  ? "bg-primary text-white"
                  : "bg-primary/10 text-primary"
              }`}
            >
              {getInitials(row.employee)}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold  text-base-content">
                  {row.employee}
                </span>
                {isActive && (
                  <span className="badge badge-xs badge-primary text-[9px] font-bold">
                    Active view
                  </span>
                )}
              </div>
              <div className="text-[11px] text-base-content/80">
                {row.role} · {row.department}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: "separationType",
      label: "Separation Type",
      render: (type: string) => (
        <span className="badge badge-sm badge-ghost  font-medium">{type}</span>
      ),
    },
    {
      key: "lastWorkingDay",
      label: "Last Working Day",
      render: (date: string) => (
        <span className=" font-medium text-base-content">
          {new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "currentStep",
      label: "Current Milestone",
      render: (step: string) => (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-base-200/80 text-base-content  font-medium border border-base-300">
          {step}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (status: OffboardingStatus) => getStatusBadge(status),
    },
  ];

  const actions: Actions<OffboardingCase>[] = [
    {
      key: "select_active",
      label: "View Clearance Checklist",
      action: (item) => {
        onSelectCase(item);
        toast.info(`Switched active view to ${item.employee}`);
      },
    },
    {
      key: "conclude_exit",
      label: "Mark Offboarding Completed",
      action: (item) => {
        onCompleteCase(item.id);
        toast.success(`Offboarding for ${item.employee} concluded`);
      },
    },
  ];

  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm p-4 sm:p-6 space-y-4">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-base-content">
              All Offboarding Records
            </h2>
            <span className="badge badge-sm badge-ghost  font-semibold">
              {filteredCases.length}
            </span>
          </div>
          <p className=" text-base-content/80 mt-0.5">
            Archival records and status tracking for all exiting and departed
            staff.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search employee, department..."
            className="input input-sm input-bordered w-full pl-9  rounded-xl bg-base-200/80"
          />
        </div>
      </div>

      {/* Filter Tabs */}
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

      {/* CustomTable */}
      <div className="overflow-hidden rounded-xl border border-base-200">
        <CustomTable
          ring={false}
          data={filteredCases}
          columns={columns}
          actions={actions}
          onRowClick={(item) => onSelectCase(item)}
        />
      </div>
    </div>
  );
}

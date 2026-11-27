import { useMemo, useState } from "react";
import type { Vacancy, VacancyStatus } from "./types";
import { HR_DEPARTMENTS } from "./recruitmentData";
import { getVacancyStatusBadgeClass } from "./mappers";
import { Eye, Search } from "lucide-react";
import CustomTable, { type columnType } from "@/components/tables/CustomTable";
import type { Actions } from "@/components/tables/pop-up";

interface VacanciesTableProps {
  vacancies: Vacancy[];
  onSelectVacancy?: (vacancy: Vacancy) => void;
  onEditVacancy?: (vacancy: Vacancy) => void;
  onSubmitVacancy?: (vacancy: Vacancy) => void;
  onApproveVacancy?: (vacancy: Vacancy) => void;
  onRejectVacancy?: (vacancy: Vacancy) => void;
  onPublishVacancy?: (vacancy: Vacancy) => void;
  onUnpublishVacancy?: (vacancy: Vacancy) => void;
  onCloseVacancy?: (vacancy: Vacancy) => void;
  onArchiveVacancy?: (vacancy: Vacancy) => void;
}

const STATUS_OPTIONS: VacancyStatus[] = [
  "Published",
  "Approved",
  "Pending Approval",
  "Draft",
  "Unpublished",
  "Rejected",
  "Closed",
  "Archived",
];

export default function VacanciesTable({
  vacancies,
  onSelectVacancy,
  onEditVacancy,
  onSubmitVacancy,
  onApproveVacancy,
  onRejectVacancy,
  onPublishVacancy,
  onUnpublishVacancy,
  onCloseVacancy,
  onArchiveVacancy,
}: VacanciesTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const departmentChoices = useMemo(() => {
    const set = new Set<string>(HR_DEPARTMENTS);
    for (const v of vacancies) {
      if (v.dept && v.dept !== "—") set.add(v.dept);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [vacancies]);

  const filteredVacancies = vacancies.filter((v) => {
    if (departmentFilter !== "All" && v.dept !== departmentFilter) {
      return false;
    }
    if (statusFilter !== "All" && v.status !== statusFilter) {
      return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        v.title.toLowerCase().includes(q) ||
        v.dept.toLowerCase().includes(q) ||
        (v.vacancyNumber ?? "").toLowerCase().includes(q) ||
        v.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const renderStatusBadge = (status: VacancyStatus) => {
    const dotClass =
      status === "Published"
        ? "bg-emerald-500 animate-pulse"
        : status === "Approved"
          ? "bg-sky-500"
          : status === "Pending Approval"
            ? "bg-amber-500"
            : status === "Unpublished"
              ? "bg-purple-500"
              : status === "Closed" || status === "Rejected"
                ? "bg-rose-500"
                : "bg-slate-400";

    return (
      <span
        className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${getVacancyStatusBadgeClass(status)}`}
      >
        <span className={`size-1.5 rounded-full ${dotClass}`} />
        {status}
      </span>
    );
  };

  const columns: columnType<Vacancy>[] = [
    {
      key: "id",
      label: "Vacancy #",
      render: (_value: string, item: Vacancy) => (
        <button
          type="button"
          onClick={() => onSelectVacancy?.(item)}
          className="font-mono text-xs font-bold text-primary whitespace-nowrap hover:underline text-left cursor-pointer"
        >
          {item.vacancyNumber || item.id.slice(0, 8)}
        </button>
      ),
    },
    {
      key: "title",
      label: "Title",
      render: (value: string, item: Vacancy) => (
        <button
          type="button"
          onClick={() => onSelectVacancy?.(item)}
          className="text-left group cursor-pointer"
        >
          <span className="font-semibold text-base-content group-hover:text-primary transition-colors block">
            {value}
          </span>
          {(item.type || item.location) && (
            <span className="text-xs text-base-content/70">
              {[item.type, item.location].filter(Boolean).join(" · ")}
            </span>
          )}
        </button>
      ),
    },
    {
      key: "dept",
      label: "Department",
      render: (value: string) => (
        <span className="rounded-md bg-base-200 px-2 py-0.5 text-xs font-medium text-base-content/80 capitalize whitespace-nowrap">
          {value}
        </span>
      ),
    },
    {
      key: "openings",
      label: "Openings",
      render: (value: number) => (
        <span className="font-medium tabular-nums text-base-content">
          {value ?? 1}
        </span>
      ),
    },
    {
      key: "applicants",
      label: "Applicants",
      render: (value: number) => (
        <span className="font-bold tabular-nums text-base-content">
          {value ?? 0}
        </span>
      ),
    },
    {
      key: "closes",
      label: "Closes",
      render: (value: string) => (
        <span className="text-base-content/80 whitespace-nowrap">{value}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value: VacancyStatus) => renderStatusBadge(value),
    },
  ];

  const actions: Actions<Vacancy>[] = [
    {
      key: "view",
      label: "View details",
      render: () => (
        <span className="flex items-center gap-1.5">
          <Eye className="size-3.5" />
          View details
        </span>
      ),
      disabled: () => !onSelectVacancy,
      action: (item) => onSelectVacancy?.(item),
    },
    {
      key: "edit",
      label: "Edit vacancy",
      disabled: (item) =>
        item.status === "Archived" ||
        item.status === "Closed" ||
        !onEditVacancy,
      action: (item) => onEditVacancy?.(item),
    },
    {
      key: "submit",
      label: "Submit for approval",
      disabled: (item) => item.status !== "Draft" || !onSubmitVacancy,
      action: (item) => onSubmitVacancy?.(item),
    },
    {
      key: "approve",
      label: "Approve vacancy",
      disabled: (item) =>
        item.status !== "Pending Approval" || !onApproveVacancy,
      action: (item) => onApproveVacancy?.(item),
    },
    {
      key: "reject",
      label: "Reject vacancy",
      disabled: (item) =>
        item.status !== "Pending Approval" || !onRejectVacancy,
      action: (item) => onRejectVacancy?.(item),
    },
    {
      key: "publish",
      label: "Publish vacancy",
      disabled: (item) =>
        !["Approved", "Unpublished", "Draft"].includes(item.status) ||
        !onPublishVacancy,
      action: (item) => onPublishVacancy?.(item),
    },
    {
      key: "unpublish",
      label: "Unpublish vacancy",
      disabled: (item) => item.status !== "Published" || !onUnpublishVacancy,
      action: (item) => onUnpublishVacancy?.(item),
    },
    {
      key: "close",
      label: "Close vacancy",
      disabled: (item) =>
        ["Closed", "Archived"].includes(item.status) || !onCloseVacancy,
      action: (item) => onCloseVacancy?.(item),
    },
    {
      key: "archive",
      label: "Archive vacancy",
      disabled: (item) => item.status === "Archived" || !onArchiveVacancy,
      action: (item) => onArchiveVacancy?.(item),
    },
  ];

  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm p-4 sm:p-6 space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-base-content">Vacancies</h2>
            <span className="badge badge-sm badge-ghost font-semibold">
              {filteredVacancies.length}
            </span>
          </div>
          <p className="text-sm text-base-content/80 mt-0.5">
            Job requisitions, approvals, active job board postings, and
            applicant tallies
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 shrink-0">
          <div className="relative w-full sm:w-52">
            <Search className="pointer-events-none z-10 absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-base-content/60" />
            <input
              type="text"
              placeholder="Search vacancy..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input input-sm input-bordered w-full pl-9 bg-base-200/80 border-base-300 rounded-xl"
            />
          </div>

          <select
            aria-label="Filter by department"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="select select-sm select-bordered w-full sm:w-36 bg-base-200/80 border-base-300 rounded-xl"
          >
            <option value="All">All Depts</option>
            {departmentChoices.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select select-sm select-bordered w-full sm:w-40 bg-base-200/80 border-base-300 rounded-xl"
          >
            <option value="All">All Statuses</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Shared table component */}
      {filteredVacancies.length > 0 ? (
        <CustomTable
          data={filteredVacancies}
          columns={columns}
          actions={actions}
        />
      ) : (
        <div className="py-8 text-center text-base-content/80">
          No vacancies found matching the current filters.
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import type { Vacancy, VacancyStatus } from "./types";
import { HR_DEPARTMENTS } from "./recruitmentData";
import { Search } from "lucide-react";
import CustomTable, { type columnType } from "@/components/tables/CustomTable";
import type { Actions } from "@/components/tables/pop-up";

interface VacanciesTableProps {
  vacancies: Vacancy[];
  onSelectVacancy?: (vacancy: Vacancy) => void;
  onUpdateStatus?: (vacancyId: string, status: VacancyStatus) => void;
  onDeleteVacancy?: (vacancyId: string) => void;
}

export default function VacanciesTable({
  vacancies,
  onSelectVacancy,
  onUpdateStatus,
  onDeleteVacancy,
}: VacanciesTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");

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
        v.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (status: VacancyStatus) => {
    switch (status) {
      case "Published":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Published
          </span>
        );
      case "Pending Approval":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
            <span className="size-1.5 rounded-full bg-amber-500" />
            Pending Approval
          </span>
        );
      case "Draft":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 border border-slate-200">
            <span className="size-1.5 rounded-full bg-slate-400" />
            Draft
          </span>
        );
      case "Closed":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 border border-rose-200">
            <span className="size-1.5 rounded-full bg-rose-500" />
            Closed
          </span>
        );
      default:
        return <span className="badge badge-sm badge-ghost">{status}</span>;
    }
  };

  const columns: columnType<Vacancy>[] = [
    {
      key: "id",
      label: "ID",
      render: (value: string) => (
        <span className="font-mono text-xs font-bold text-primary">{value}</span>
      ),
    },
    {
      key: "title",
      label: "Title",
      render: (value: string) => (
        <span className="font-semibold text-base-content">{value}</span>
      ),
    },
    {
      key: "dept",
      label: "Department",
      render: (value: string) => (
        <span className="rounded-md bg-base-200 px-2 py-0.5 text-[11px] font-medium text-base-content/80">
          {value}
        </span>
      ),
    },
    { key: "openings", label: "Openings" },
    {
      key: "applicants",
      label: "Applicants",
      render: (value: number) => (
        <span className="font-bold text-base-content">{value ?? 0}</span>
      ),
    },
    {
      key: "closes",
      label: "Closes",
      render: (value: string) => (
        <span className="text-base-content/70">{value}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value: VacancyStatus) => getStatusBadge(value),
    },
  ];

  const actions: Actions<Vacancy>[] = [
    {
      key: "view",
      label: "View details",
      disabled: () => !onSelectVacancy,
      action: (item) => onSelectVacancy?.(item),
    },
    {
      key: "publish",
      label: "Mark published",
      disabled: (item) => item.status === "Published" || !onUpdateStatus,
      action: (item) => onUpdateStatus?.(item.id, "Published"),
    },
    {
      key: "close",
      label: "Close vacancy",
      disabled: (item) => item.status === "Closed" || !onUpdateStatus,
      action: (item) => onUpdateStatus?.(item.id, "Closed"),
    },
    {
      key: "delete",
      label: "Delete",
      disabled: () => !onDeleteVacancy,
      action: (item) => onDeleteVacancy?.(item.id),
    },
  ];

  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-base-content">Vacancies</h2>
          <p className="text-xs text-base-content/60">
            Job requisitions, active job board postings, and applicant tallies
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-48">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-base-content/40" />
            <input
              type="text"
              placeholder="Search vacancy..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input input-xs w-full pl-8 bg-base-200/60 border-base-300 rounded-lg text-xs"
            />
          </div>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="select select-xs bg-base-200/60 border-base-300 rounded-lg text-xs"
          >
            <option value="All">All Depts</option>
            {HR_DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select select-xs bg-base-200/60 border-base-300 rounded-lg text-xs"
          >
            <option value="All">All Statuses</option>
            <option value="Published">Published</option>
            <option value="Pending Approval">Pending Approval</option>
            <option value="Draft">Draft</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Shared table component */}
      {filteredVacancies.length > 0 ? (
        <CustomTable
          data={filteredVacancies}
          columns={columns}
          actions={actions}
          onRowClick={(item) => onSelectVacancy?.(item as Vacancy)}
        />
      ) : (
        <div className="py-8 text-center text-xs text-base-content/40">
          No vacancies found matching the current filters.
        </div>
      )}
    </div>
  );
}

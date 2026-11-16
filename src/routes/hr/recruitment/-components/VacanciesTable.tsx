import { useState } from "react";
import type { Vacancy, VacancyStatus } from "./types";
import { HR_DEPARTMENTS } from "./recruitmentData";
import {
  Search,
  MoreVertical,
  Eye,
  CheckCircle2,
  Clock,
  Trash2,
} from "lucide-react";

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
          {/* Search */}
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

          {/* Department Select */}
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

          {/* Status Select */}
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

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-base-200">
        <table className="table table-sm w-full">
          <thead>
            <tr className="bg-base-200/60 text-xs font-semibold text-base-content/70">
              <th>ID</th>
              <th>Title</th>
              <th>Department</th>
              <th className="text-center">Openings</th>
              <th className="text-center">Applicants</th>
              <th>Closes</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-base-200 text-xs">
            {filteredVacancies.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="py-8 text-center text-base-content/40"
                >
                  No vacancies found matching the current filters.
                </td>
              </tr>
            ) : (
              filteredVacancies.map((vacancy) => (
                <tr
                  key={vacancy.id}
                  className="hover:bg-base-200/40 transition-colors"
                >
                  <td className="font-mono text-xs font-bold text-primary">
                    {vacancy.id}
                  </td>
                  <td className="font-semibold text-base-content">
                    {vacancy.title}
                  </td>
                  <td>
                    <span className="rounded-md bg-base-200 px-2 py-0.5 text-[11px] font-medium text-base-content/80">
                      {vacancy.dept}
                    </span>
                  </td>
                  <td className="text-center font-semibold">
                    {vacancy.openings}
                  </td>
                  <td className="text-center">
                    <span className="font-bold text-base-content">
                      {vacancy.applicants}
                    </span>
                  </td>
                  <td className="text-base-content/70">{vacancy.closes}</td>
                  <td>{getStatusBadge(vacancy.status)}</td>
                  <td className="text-right">
                    <div className="dropdown dropdown-end">
                      <button
                        tabIndex={0}
                        className="btn btn-ghost btn-xs size-7 p-0 rounded-lg"
                      >
                        <MoreVertical className="size-4" />
                      </button>
                      <ul
                        tabIndex={0}
                        className="dropdown-content z-20 menu p-1.5 shadow-lg bg-base-100 rounded-box w-44 text-xs border border-base-200"
                      >
                        {onSelectVacancy && (
                          <li>
                            <button
                              onClick={() => onSelectVacancy(vacancy)}
                              className="flex items-center gap-2"
                            >
                              <Eye className="size-3.5 text-base-content/70" />
                              View details
                            </button>
                          </li>
                        )}
                        {onUpdateStatus && vacancy.status !== "Published" && (
                          <li>
                            <button
                              onClick={() =>
                                onUpdateStatus(vacancy.id, "Published")
                              }
                              className="flex items-center gap-2 text-emerald-600"
                            >
                              <CheckCircle2 className="size-3.5" />
                              Mark Published
                            </button>
                          </li>
                        )}
                        {onUpdateStatus && vacancy.status !== "Closed" && (
                          <li>
                            <button
                              onClick={() =>
                                onUpdateStatus(vacancy.id, "Closed")
                              }
                              className="flex items-center gap-2 text-slate-600"
                            >
                              <Clock className="size-3.5" />
                              Close vacancy
                            </button>
                          </li>
                        )}
                        {onDeleteVacancy && (
                          <li>
                            <button
                              onClick={() => onDeleteVacancy(vacancy.id)}
                              className="flex items-center gap-2 text-error"
                            >
                              <Trash2 className="size-3.5" />
                              Delete
                            </button>
                          </li>
                        )}
                      </ul>
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

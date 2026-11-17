import { useState } from "react";
import type { Department, DepartmentStatus } from "./types";
import {
  Search,
  MoreVertical,
  Eye,
  Trash2,
  CheckCircle2,
  MapPin,
} from "lucide-react";

interface DepartmentsTableProps {
  departments: Department[];
  onSelectDepartment?: (dept: Department) => void;
  onUpdateStatus?: (deptId: string, status: DepartmentStatus) => void;
  onDeleteDepartment?: (deptId: string) => void;
}

export default function DepartmentsTable({
  departments,
  onSelectDepartment,
  onUpdateStatus,
  onDeleteDepartment,
}: DepartmentsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const filteredDepartments = departments.filter((dept) => {
    if (statusFilter !== "All" && dept.status !== statusFilter) {
      return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        dept.name.toLowerCase().includes(q) ||
        dept.code.toLowerCase().includes(q) ||
        dept.head.toLowerCase().includes(q) ||
        (dept.location && dept.location.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm p-4 sm:p-6 space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-base-content">Departments</h2>
          <p className="text-xs text-base-content/60">
            Registered business divisions and their leadership
          </p>
        </div>

        {/* Search & Status Filter */}
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-44">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-base-content/40" />
            <input
              type="text"
              placeholder="Search depts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input input-xs w-full pl-8 bg-base-200/60 border-base-300 rounded-lg text-xs"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select select-xs bg-base-200/60 border-base-300 rounded-lg text-xs"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-base-200">
        <table className="table table-sm w-full">
          <thead>
            <tr className="bg-base-200/60 text-xs font-semibold text-base-content/70">
              <th>Code</th>
              <th>Name</th>
              <th>Head</th>
              <th>Staff</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-base-200 text-xs">
            {filteredDepartments.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-8 text-center text-base-content/40"
                >
                  No departments found matching your criteria.
                </td>
              </tr>
            ) : (
              filteredDepartments.map((dept) => (
                <tr
                  key={dept.id}
                  className="hover:bg-base-200/40 transition-colors"
                >
                  <td className="font-mono text-xs font-bold text-primary">
                    {dept.code}
                  </td>
                  <td className="font-semibold text-base-content">
                    <div className="flex flex-col">
                      <span>{dept.name}</span>
                      {dept.location && (
                        <span className="flex items-center gap-1 text-[11px] text-base-content/50 font-normal">
                          <MapPin className="size-2.5" />
                          {dept.location}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="text-base-content/80 font-medium">
                    {dept.head}
                  </td>
                  <td>
                    <span className="rounded-md bg-base-200/80 px-2 py-0.5 text-xs font-bold text-base-content">
                      {dept.count}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
                        dept.status === "Active"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${
                          dept.status === "Active"
                            ? "bg-emerald-500 animate-pulse"
                            : "bg-slate-400"
                        }`}
                      />
                      {dept.status}
                    </span>
                  </td>
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
                        {onSelectDepartment && (
                          <li>
                            <button
                              onClick={() => onSelectDepartment(dept)}
                              className="flex items-center gap-2"
                            >
                              <Eye className="size-3.5 text-base-content/70" />
                              View details
                            </button>
                          </li>
                        )}
                        {onUpdateStatus && (
                          <li>
                            <button
                              onClick={() =>
                                onUpdateStatus(
                                  dept.id,
                                  dept.status === "Active"
                                    ? "Inactive"
                                    : "Active",
                                )
                              }
                              className="flex items-center gap-2"
                            >
                              <CheckCircle2 className="size-3.5" />
                              {dept.status === "Active"
                                ? "Deactivate"
                                : "Activate"}
                            </button>
                          </li>
                        )}
                        {onDeleteDepartment && (
                          <li>
                            <button
                              onClick={() => onDeleteDepartment(dept.id)}
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

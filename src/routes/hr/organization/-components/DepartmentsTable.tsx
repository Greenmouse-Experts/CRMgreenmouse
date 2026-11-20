import { useMemo, useState } from "react";
import CustomTable, { type columnType } from "@/components/tables/CustomTable";
import type { Actions } from "@/components/tables/pop-up";
import { Search } from "lucide-react";
import type { Department, DepartmentStatus } from "./types";

interface DepartmentsTableProps {
  departments: Department[];
  onSelectDepartment?: (dept: Department) => void;
  onUpdateStatus?: (deptId: string, status: DepartmentStatus) => void;
  onDeleteDepartment?: (deptId: string) => void;
}

function getStatusBadge(status?: DepartmentStatus | string) {
  const isActive = status?.toLowerCase() === "active";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
        isActive
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : "bg-slate-100 text-slate-700 border-slate-200"
      }`}
    >
      <span
        className={`size-1.5 rounded-full ${
          isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
        }`}
      />
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

export default function DepartmentsTable({
  departments,
  onSelectDepartment,
  onUpdateStatus,
  onDeleteDepartment,
}: DepartmentsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const filteredDepartments = useMemo(
    () =>
      departments.filter((dept) => {
        if (
          statusFilter !== "All" &&
          dept.status?.toLowerCase() !== statusFilter.toLowerCase()
        ) {
          return false;
        }
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          return (
            Boolean(dept.name && dept.name.toLowerCase().includes(q)) ||
            Boolean(dept.code && dept.code.toLowerCase().includes(q)) ||
            Boolean(dept.status && dept.status.toLowerCase().includes(q))
          );
        }
        return true;
      }),
    [departments, searchTerm, statusFilter],
  );

  const columns: columnType<Department>[] = [
    {
      key: "code",
      label: "Code",
      render: (value, dept) => (
        <span className="font-mono  font-bold text-primary">
          {value || dept.code || "—"}
        </span>
      ),
    },
    {
      key: "name",
      label: "Name",
      render: (value, dept) => (
        <span className="font-semibold text-base-content">
          {value || dept.name || "Untitled"}
        </span>
      ),
    },
    {
      key: "staffCount",
      label: "Staff Count",
      render: (value, dept) => (
        <span className="rounded-md bg-base-200/80 px-2 py-0.5  font-bold text-base-content">
          {Number(value ?? dept.staffCount ?? dept.count ?? 0)}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value, dept) => getStatusBadge(value || dept.status),
    },
  ];

  const actions: Actions<Department>[] = [
    {
      key: "view",
      label: "View details",
      action: (dept) => onSelectDepartment?.(dept),
    },
    {
      key: "toggle",
      label: "Deactivate / Activate",
      render: (dept) => {
        const isActive = dept.status?.toLowerCase() === "active";
        return isActive ? "Deactivate" : "Activate";
      },
      action: (dept) => {
        const isActive = dept.status?.toLowerCase() === "active";
        const nextStatus = isActive ? "Inactive" : "Active";
        onUpdateStatus?.(dept.id, nextStatus as DepartmentStatus);
      },
    },
    {
      key: "delete",
      label: "Mark Inactive",
      action: (dept) => onDeleteDepartment?.(dept.id),
    },
  ];

  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm p-4 sm:p-6 space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-base-content">Departments</h3>
          <p className=" text-base-content/80">
            {filteredDepartments.length} functional business unit
            {filteredDepartments.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/80" />
            <input
              type="text"
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input input-sm input-bordered pl-8  rounded-xl w-44 sm:w-52"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select select-sm select-bordered  rounded-xl"
          >
            <option value="All">All statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* CustomTable */}
      <CustomTable
        columns={columns}
        data={filteredDepartments}
        actions={actions}
        onRowClick={(dept) => onSelectDepartment?.(dept)}
      />
    </div>
  );
}

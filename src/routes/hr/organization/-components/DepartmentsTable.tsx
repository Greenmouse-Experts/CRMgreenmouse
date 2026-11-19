import { useMemo, useState } from "react";
import CustomTable, { type columnType } from "@/components/tables/CustomTable";
import type { Actions } from "@/components/tables/pop-up";
import { MapPin, Search } from "lucide-react";
import type { Department, DepartmentStatus } from "./types";

interface DepartmentsTableProps {
  departments: Department[];
  onSelectDepartment?: (dept: Department) => void;
  onUpdateStatus?: (deptId: string, status: DepartmentStatus) => void;
  onDeleteDepartment?: (deptId: string) => void;
}

function getStatusBadge(status: DepartmentStatus) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
        status === "Active"
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : "bg-slate-100 text-slate-700 border-slate-200"
      }`}
    >
      <span
        className={`size-1.5 rounded-full ${
          status === "Active" ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
        }`}
      />
      {status}
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
      }),
    [departments, searchTerm, statusFilter],
  );

  const columns: columnType[] = [
    {
      key: "code",
      label: "Code",
      render: (value) => (
        <span className="font-mono text-xs font-bold text-primary">
          {value}
        </span>
      ),
    },
    {
      key: "name",
      label: "Name",
      render: (_value, dept) => (
        <div className="flex flex-col">
          <span className="font-semibold text-base-content">{dept.name}</span>
          {dept.location && (
            <span className="flex items-center gap-1 text-[11px] text-base-content/50 font-normal">
              <MapPin className="size-2.5" />
              {dept.location}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "head",
      label: "Head",
      render: (value) => (
        <span className="text-base-content/80 font-medium">{value}</span>
      ),
    },
    {
      key: "count",
      label: "Staff",
      render: (value) => (
        <span className="rounded-md bg-base-200/80 px-2 py-0.5 text-xs font-bold text-base-content">
          {value}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (_value, dept) => getStatusBadge(dept.status),
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
      render: (dept) =>
        dept.status === "Active" ? "Deactivate" : "Activate",
      action: (dept) =>
        onUpdateStatus?.(
          dept.id,
          dept.status === "Active" ? "Inactive" : "Active",
        ),
    },
    {
      key: "delete",
      label: "Delete",
      render: () => <span className="text-error">Delete</span>,
      action: (dept) => onDeleteDepartment?.(dept.id),
    },
  ];

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
      <CustomTable
        ring={false}
        data={filteredDepartments}
        columns={columns}
        actions={actions}
      />
    </div>
  );
}

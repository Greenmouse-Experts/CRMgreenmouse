import { Link } from "@tanstack/react-router";
import type { Employee } from "./types";
import EmployeeAvatar from "./EmployeeAvatar";
import EmployeeStatusBadge from "./EmployeeStatusBadge";
import CustomTable, { type columnType } from "@/components/tables/CustomTable";
import { Trash2 } from "lucide-react";

interface EmployeeTableViewProps {
  employees: Employee[];
  onSelectEmployee: (employee: Employee) => void;
  onDeleteEmployee?: (employeeId: string) => void;
}

export default function EmployeeTableView({
  employees,
  onSelectEmployee,
  onDeleteEmployee,
}: EmployeeTableViewProps) {
  if (employees.length === 0) {
    return null;
  }

  const columns: columnType<Employee>[] = [
    {
      key: "name",
      label: "Employee",
      render: (_value: string, emp: Employee) => (
        <div className="flex items-center gap-3">
          <EmployeeAvatar name={emp.name} size="sm" />
          <div>
            <p className="font-semibold text-base-content">{emp.name}</p>
            <p className="text-xs text-base-content/60">{emp.title}</p>
          </div>
        </div>
      ),
    },
    {
      key: "id",
      label: "ID",
      render: (value: string) => (
        <span className="bg-base-200/60 px-2 py-0.5 rounded-md font-mono text-xs text-base-content/70">
          {value}
        </span>
      ),
    },
    { key: "dept", label: "Department" },
    { key: "type", label: "Type" },
    { key: "location", label: "Location" },
    {
      key: "status",
      label: "Status",
      render: (_value: string, emp: Employee) => (
        <EmployeeStatusBadge status={emp.status} onLeave={emp.onLeave} />
      ),
    },
    {
      key: "action",
      label: "Action",
      render: (_value: unknown, emp: Employee) => (
        <div className="flex items-center justify-end gap-1">
          <Link
            to="/hr/staffs/$id"
            params={{ id: emp.id }}
            onClick={(e) => e.stopPropagation()}
            className="btn btn-xs btn-ghost text-base-content/70 hover:text-primary font-medium"
          >
            Edit
          </Link>
          <button
            type="button"
            onClick={() => onSelectEmployee(emp)}
            className="btn btn-xs btn-ghost text-primary font-semibold hover:bg-primary/10"
          >
            View →
          </button>
          {onDeleteEmployee && (
            <button
              type="button"
              title="Remove employee"
              onClick={() => onDeleteEmployee(emp.id)}
              className="btn btn-xs btn-ghost text-error hover:bg-error/10"
            >
              <Trash2 className="size-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="card bg-base-100 border border-base-200/80 shadow-xs overflow-hidden rounded-2xl">
      <CustomTable
        data={employees}
        columns={columns}
        onRowClick={(item) => onSelectEmployee(item as Employee)}
      />
    </div>
  );
}

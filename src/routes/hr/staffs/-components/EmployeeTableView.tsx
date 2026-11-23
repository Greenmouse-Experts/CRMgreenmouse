import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { Employee } from "./types";
import EmployeeAvatar from "./EmployeeAvatar";
import EmployeeStatusBadge from "./EmployeeStatusBadge";
import LinkToStaffModal from "./LinkToStaffModal";
import CustomTable, { type columnType } from "@/components/tables/CustomTable";
import type { Actions } from "@/components/tables/pop-up";
import { useStaffs, type StaffOption } from "@/api/employeesApi";

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
  const navigate = useNavigate();
  const staffsQuery = useStaffs();
  const [isLinkStaffOpen, setIsLinkStaffOpen] = useState(false);

  if (employees.length === 0) {
    return null;
  }

  const removeEmployee = onDeleteEmployee;

  const handleAcceptLinkStaff = (staff: StaffOption) => {
    setIsLinkStaffOpen(false);
    navigate({ to: "/hr/staffs/$id", params: { id: staff.id } });
  };

  const actions: Actions<Employee>[] = [
    {
      key: "edit",
      label: "Edit",
      action: (emp, nav) => {
        nav({
          to: "/hr/staffs/$id",
          params: { id: emp.id },
          search: { mode: "edit" },
        });
      },
    },
    {
      key: "view",
      label: "View →",
      action: (emp) => {
        onSelectEmployee(emp);
      },
    },
    {
      key: "linkStaff",
      label: "Link to staff",
      action: () => {
        setIsLinkStaffOpen(true);
      },
    },
  ];

  if (removeEmployee) {
    actions.push({
      key: "delete",
      label: "Remove employee",
      render: () => <span className="text-error font-medium">Remove employee</span>,
      action: (emp) => {
        removeEmployee(emp.id);
      },
    });
  }

  const columns: columnType<Employee>[] = [
    {
      key: "name",
      label: "Employee",
      render: (_value: string, emp: Employee) => (
        <div className="flex items-center gap-3">
          <EmployeeAvatar name={emp.name} size="sm" />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="font-semibold text-base-content truncate">
                {emp.name}
              </p>
              {emp.isDraft && (
                <span className="badge badge-xs badge-warning font-semibold text-[10px]">
                  Draft
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-base-content/80 truncate">
              {emp.title !== "—" && <span>{emp.title}</span>}
              {emp.title !== "—" && emp.email !== "—" && <span>·</span>}
              {emp.email !== "—" && (
                <span className="truncate">{emp.email}</span>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "employeeNumber",
      label: "Employee ID",
      render: (_value: string, emp: Employee) => (
        <span className="bg-base-200/80 px-2 py-0.5 rounded-md font-mono text-base-content/80 font-medium">
          {emp.employeeNumber ||
            (emp.id && emp.id.length > 8 ? emp.id.slice(0, 8) : emp.id)}
        </span>
      ),
    },
    {
      key: "dept",
      label: "Department",
      render: (value: string) => (
        <span className="font-medium text-base-content/80">{value}</span>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (value: string) => (
        <span className="text-base-content/80">{value}</span>
      ),
    },
    {
      key: "location",
      label: "Location",
      render: (value: string) => (
        <span className="text-base-content/80">{value}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (_value: string, emp: Employee) => (
        <EmployeeStatusBadge status={emp.status} onLeave={emp.onLeave} />
      ),
    },
    {
      key: "start",
      label: "Start Date",
      render: (value: string) => (
        <span className="font-mono text-base-content/80">{value || "—"}</span>
      ),
    },
  ];

  return (
    <>
      <div className="card bg-base-100 border border-base-200/80 shadow-xs overflow-hidden rounded-2xl">
        <CustomTable data={employees} columns={columns} actions={actions} />
      </div>
      <LinkToStaffModal
        isOpen={isLinkStaffOpen}
        staffs={staffsQuery.data ?? []}
        isLoading={staffsQuery.isLoading}
        onClose={() => setIsLinkStaffOpen(false)}
        onAccept={handleAcceptLinkStaff}
      />
    </>
  );
}

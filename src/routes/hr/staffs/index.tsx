import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/Headers/PageHeader";
import PageLoader from "@/components/layout/PageLoader";
import EmployeeStats from "./-components/EmployeeStats";
import EmployeeFilters from "./-components/EmployeeFilters";
import EmployeeTableView from "./-components/EmployeeTableView";
import EmployeeDetailModal from "./-components/EmployeeDetailModal";
import AddEmployeeModal from "./-components/AddEmployeeModal";
import { exportEmployeesToCSV } from "./-components/employeeData";
import type { Employee, StatusFilterOption } from "./-components/types";
import {
  useCreateEmployee,
  useEmployees,
  useRemoveEmployee,
  type CreateEmployeeInput,
  type EmployeeRecord,
} from "@/api/employeesApi";
import { extract_message } from "@/helpers/auth";
import { Download, Plus, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/hr/staffs/")({
  component: RouteComponent,
});

const UNKNOWN = "—";

const titleCase = (value?: string) =>
  value
    ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
    : UNKNOWN;

const relationName = (
  relation?: { name?: string } | string,
  fallback?: string,
) => {
  if (relation && typeof relation === "object")
    return relation.name || fallback || UNKNOWN;
  if (typeof relation === "string" && relation) return relation;
  return fallback || UNKNOWN;
};

const toUiEmployee = (employee: EmployeeRecord): Employee => {
  const statusKey = employee.status?.toLowerCase();
  const status =
    statusKey === "inactive" || statusKey === "suspended"
      ? "Suspended"
      : statusKey === "probation"
        ? "Probation"
        : statusKey === "notice" || statusKey === "notice_period"
          ? "Notice Period"
          : statusKey === "active"
            ? "Active"
            : titleCase(employee.status);

  return {
    id: employee.id,
    name:
      `${employee.firstName ?? ""} ${employee.lastName ?? ""}`.trim() ||
      UNKNOWN,
    email: employee.email ?? UNKNOWN,
    phone: employee.phoneNumber || UNKNOWN,
    title: relationName(
      employee.position ?? employee.role,
      employee.positionName,
    ),
    dept: relationName(employee.department, employee.departmentName),
    location: employee.location || UNKNOWN,
    type: titleCase(employee.employmentType),
    status,
    onLeave: false,
    manager:
      relationName(employee.manager) === UNKNOWN
        ? undefined
        : relationName(employee.manager),
    start: employee.startDate?.slice(0, 10) || employee.createdAt?.slice(0, 10),
    grade: employee.grade,
  };
};

function RouteComponent() {
  const employeesQuery = useEmployees();
  const createEmployee = useCreateEmployee();
  const removeEmployee = useRemoveEmployee();

  const employeeList = useMemo<Employee[]>(
    () => (employeesQuery.data ?? []).map(toUiEmployee),
    [employeesQuery.data],
  );

  const departments = useMemo(() => {
    const unique = new Set(
      employeeList
        .map((emp) => emp.dept)
        .filter((dept) => dept && dept !== UNKNOWN),
    );
    return [...unique].sort();
  }, [employeeList]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilterOption>("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredEmployees = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    return employeeList.filter((emp) => {
      if (
        statusFilter !== "All" &&
        emp.status.toLowerCase() !== statusFilter.toLowerCase()
      ) {
        return false;
      }

      if (
        departmentFilter !== "All" &&
        emp.dept.toLowerCase() !== departmentFilter.toLowerCase()
      ) {
        return false;
      }

      if (term) {
        return (
          emp.name.toLowerCase().includes(term) ||
          emp.id.toLowerCase().includes(term) ||
          emp.dept.toLowerCase().includes(term) ||
          emp.title.toLowerCase().includes(term) ||
          emp.email.toLowerCase().includes(term)
        );
      }

      return true;
    });
  }, [employeeList, searchTerm, statusFilter, departmentFilter]);

  const handleExport = () => {
    try {
      exportEmployeesToCSV(filteredEmployees);
      toast.success(
        `Exported ${filteredEmployees.length} employee records to CSV.`,
      );
    } catch (_err) {
      toast.error("Failed to export employees.");
    }
  };

  const handleAddEmployee = async (payload: CreateEmployeeInput) => {
    try {
      await createEmployee.mutateAsync(payload);
      toast.success("Employee added successfully.");
      setIsAddModalOpen(false);
    } catch (error) {
      toast.error(extract_message(error as never));
      throw error;
    }
  };

  const handleRemoveEmployee = (employeeId: string) => {
    toast.promise(removeEmployee.mutateAsync(employeeId), {
      loading: "Deactivating employee...",
      success: "Employee deactivated",
      error: (error) => extract_message(error as never),
    });
    setSelectedEmployee(null);
  };

  const handleToggleLeave = (employeeId: string) => {
    setSelectedEmployee((prev) =>
      prev && prev.id === employeeId
        ? { ...prev, onLeave: !prev.onLeave }
        : prev,
    );
    toast.info("Availability updated locally");
  };

  return (
    <div className="space-y-6 pb-16">
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          People
        </p>
        <PageHeader
          title="Employees"
          description={`${employeeList.length} records · employment status tracked separately from availability`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExport}
              className="btn btn-sm btn-ghost border border-base-300 gap-1.5 rounded-lg text-xs font-medium"
            >
              <Download className="size-4" /> Export
            </button>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="btn btn-sm btn-primary gap-1.5 rounded-lg text-xs font-medium shadow-xs"
            >
              <Plus className="size-4" /> Add employee
            </button>
          </div>
        </PageHeader>
      </div>

      <PageLoader
        query={employeesQuery}
        emptyState={{
          title: "No staff members yet",
          description:
            "Add your first staff member to start building the directory.",
          actionText: "Add employee",
          onAction: () => setIsAddModalOpen(true),
        }}
      >
        <EmployeeStats employees={employeeList} />

        <EmployeeFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          departmentFilter={departmentFilter}
          onDepartmentFilterChange={setDepartmentFilter}
          allEmployees={employeeList}
          departments={departments}
        />

        {filteredEmployees.length === 0 ? (
          <div className="card bg-base-100 border border-base-200/80 p-12 text-center space-y-3 rounded-2xl shadow-xs">
            <div className="size-12 rounded-full bg-base-200 text-base-content/40 flex items-center justify-center mx-auto">
              <Search className="size-5" />
            </div>
            <h3 className="font-semibold text-base text-base-content">
              No matching employees found
            </h3>
            <p className="text-xs text-base-content/60 max-w-sm mx-auto">
              No records matched your filters. Try clearing your search term or
              adjusting the status and department filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("All");
                setDepartmentFilter("All");
              }}
              className="btn btn-xs btn-outline rounded-lg mx-auto"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <EmployeeTableView
            employees={filteredEmployees}
            onSelectEmployee={setSelectedEmployee}
            onDeleteEmployee={handleRemoveEmployee}
          />
        )}
      </PageLoader>

      <EmployeeDetailModal
        employee={selectedEmployee}
        isOpen={Boolean(selectedEmployee)}
        onClose={() => setSelectedEmployee(null)}
        onToggleLeave={handleToggleLeave}
      />

      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddEmployee={handleAddEmployee}
      />
    </div>
  );
}

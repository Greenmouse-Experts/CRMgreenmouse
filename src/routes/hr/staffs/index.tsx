import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/Headers/PageHeader";
import PageLoader from "@/components/layout/PageLoader";
import EmployeeStats from "./-components/EmployeeStats";
import EmployeeFilters from "./-components/EmployeeFilters";
import EmployeeGridView from "./-components/EmployeeGridView";
import EmployeeTableView from "./-components/EmployeeTableView";
import EmployeeDetailModal from "./-components/EmployeeDetailModal";
import AddEmployeeModal from "./-components/AddEmployeeModal";
import { exportEmployeesToCSV } from "./-components/employeeData";
import type {
  CreateStaffInput,
  Employee,
  StatusFilterOption,
  ViewMode,
} from "./-components/types";
import {
  useCreateStaff,
  useDeleteStaff,
  useStaffs,
  type StaffMember,
} from "@/api/tenantApi";
import { extract_message } from "@/helpers/auth";
import { Download, Plus, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/hr/staffs/")({
  component: RouteComponent,
});

const UNKNOWN = "—";

function toUiEmployee(staff: StaffMember): Employee {
  const statusKey = staff.status?.toLowerCase();
  const status =
    statusKey === "active"
      ? "Active"
      : statusKey === "inactive"
        ? "Suspended"
        : staff.status
          ? staff.status.charAt(0).toUpperCase() + staff.status.slice(1)
          : UNKNOWN;

  return {
    id: staff.id,
    name: `${staff.firstName ?? ""} ${staff.lastName ?? ""}`.trim() || UNKNOWN,
    email: staff.email ?? UNKNOWN,
    phone: staff.phoneNumber || UNKNOWN,
    title: staff.role?.name || UNKNOWN,
    dept: staff.role?.name || UNKNOWN,
    location: UNKNOWN,
    type: UNKNOWN,
    status,
    onLeave: false,
    start: staff.createdAt?.slice(0, 10) || UNKNOWN,
  };
}

function RouteComponent() {
  const staffQuery = useStaffs();
  const createStaffMutation = useCreateStaff();
  const deleteStaffMutation = useDeleteStaff();

  // Availability is UI-only state; there is no leave field on the staff endpoint.
  const [leaveOverrides, setLeaveOverrides] = useState<Record<string, boolean>>(
    {},
  );

  // Employees are derived directly from the /staffs endpoint
  const employeeList = useMemo<Employee[]>(
    () =>
      (staffQuery.data ?? []).map((staff) => {
        const employee = toUiEmployee(staff);
        return {
          ...employee,
          onLeave: leaveOverrides[staff.id] ?? employee.onLeave,
        };
      }),
    [staffQuery.data, leaveOverrides],
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilterOption>("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [viewMode, setViewMode] = useState<ViewMode>("list");

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

  const handleAddStaff = async (payload: CreateStaffInput) => {
    try {
      await createStaffMutation.mutateAsync(payload);
      toast.success("Employee added successfully.");
      setIsAddModalOpen(false);
    } catch (error) {
      toast.error(extract_message(error as never));
    }
  };

  const handleDeleteStaff = (employeeId: string) => {
    toast.promise(deleteStaffMutation.mutateAsync(employeeId), {
      loading: "Removing employee...",
      success: "Employee removed",
      error: (error) => extract_message(error as never),
    });
    setSelectedEmployee(null);
  };

  const handleToggleLeave = (employeeId: string) => {
    setLeaveOverrides((prev) => ({
      ...prev,
      [employeeId]: !employeeList.find((emp) => emp.id === employeeId)?.onLeave,
    }));
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
        query={staffQuery}
        emptyState={{
          title: "No staff members yet",
          description: "Add your first staff member to start building the directory.",
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
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          allEmployees={employeeList}
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
        ) : viewMode === "grid" ? (
          <EmployeeGridView
            employees={filteredEmployees}
            onSelectEmployee={setSelectedEmployee}
          />
        ) : (
          <EmployeeTableView
            employees={filteredEmployees}
            onSelectEmployee={setSelectedEmployee}
            onDeleteEmployee={handleDeleteStaff}
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
        onAddStaff={handleAddStaff}
      />
    </div>
  );
}

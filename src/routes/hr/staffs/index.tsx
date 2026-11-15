import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/Headers/PageHeader";
import EmployeeStats from "./-components/EmployeeStats";
import EmployeeFilters from "./-components/EmployeeFilters";
import EmployeeGridView from "./-components/EmployeeGridView";
import EmployeeTableView from "./-components/EmployeeTableView";
import EmployeeDetailModal from "./-components/EmployeeDetailModal";
import AddEmployeeModal from "./-components/AddEmployeeModal";
import {
  INITIAL_EMPLOYEES,
  exportEmployeesToCSV,
} from "./-components/employeeData";
import type {
  Employee,
  StatusFilterOption,
  ViewMode,
} from "./-components/types";
import { useStaffs } from "@/api/tenantApi";
import { Download, Plus, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/hr/staffs/")({
  component: RouteComponent,
});

function RouteComponent() {
  const staffQuery = useStaffs();

  // Local state initialized with Kinovia HR employees
  const [employeeList, setEmployeeList] =
    useState<Employee[]>(INITIAL_EMPLOYEES);

  // Sync any real backend staff records if available
  useMemo(() => {
    if (staffQuery.data && staffQuery.data.length > 0) {
      const backendEmployees: Employee[] = staffQuery.data.map(
        (staff, idx) => ({
          id: `STF-${staff.id.slice(0, 6)}`,
          name: `${staff.firstName} ${staff.lastName}`.trim() || "Staff Member",
          email: staff.email,
          phone: staff.phoneNumber || "",
          dept: staff.role?.name || "Operations",
          title: staff.role?.name || "Team Member",
          location: "Lagos",
          type: "Full-time",
          status: staff.status === "active" ? "Active" : "Suspended",
          onLeave: idx % 6 === 2,
          salary: 400000,
          grade: "G2",
          start: staff.createdAt?.slice(0, 10) || "2024-01-15",
        }),
      );

      // Merge backend staff with initial demo records avoiding duplicates by email
      const existingEmails = new Set(
        backendEmployees.map((e) => e.email.toLowerCase()),
      );
      const remainingInitial = INITIAL_EMPLOYEES.filter(
        (e) => !existingEmails.has(e.email.toLowerCase()),
      );
      setEmployeeList([...backendEmployees, ...remainingInitial]);
    }
  }, [staffQuery.data]);

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilterOption>("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  // Modals state
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Filtered employees list
  const filteredEmployees = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    return employeeList.filter((emp) => {
      // Status filter
      if (
        statusFilter !== "All" &&
        emp.status.toLowerCase() !== statusFilter.toLowerCase()
      ) {
        return false;
      }

      // Department filter
      if (
        departmentFilter !== "All" &&
        emp.dept.toLowerCase() !== departmentFilter.toLowerCase()
      ) {
        return false;
      }

      // Search term filter
      if (term) {
        const matchesName = emp.name.toLowerCase().includes(term);
        const matchesId = emp.id.toLowerCase().includes(term);
        const matchesDept = emp.dept.toLowerCase().includes(term);
        const matchesTitle = emp.title.toLowerCase().includes(term);
        const matchesEmail = emp.email.toLowerCase().includes(term);
        if (
          !matchesName &&
          !matchesId &&
          !matchesDept &&
          !matchesTitle &&
          !matchesEmail
        ) {
          return false;
        }
      }

      return true;
    });
  }, [employeeList, searchTerm, statusFilter, departmentFilter]);

  // Handle export to CSV
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

  // Add new employee
  const handleAddEmployee = (newEmployee: Employee) => {
    setEmployeeList((prev) => [newEmployee, ...prev]);
  };

  // Toggle onLeave state
  const handleToggleLeave = (employeeId: string) => {
    setEmployeeList((prev) =>
      prev.map((emp) => {
        if (emp.id === employeeId) {
          const nextLeave = !emp.onLeave;
          toast.success(
            `${emp.name} is now ${nextLeave ? "marked as On Leave" : "marked as Present / Available"}.`,
          );
          return { ...emp, onLeave: nextLeave };
        }
        return emp;
      }),
    );
    setSelectedEmployee((prev) =>
      prev && prev.id === employeeId
        ? { ...prev, onLeave: !prev.onLeave }
        : prev,
    );
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header section matching Kinovia HR */}
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

      {/* Top Stat KPI Cards */}
      <EmployeeStats employees={employeeList} />

      {/* Filter and View Controls */}
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

      {/* Empty State */}
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
        /* Grid Card View */
        <EmployeeGridView
          employees={filteredEmployees}
          onSelectEmployee={setSelectedEmployee}
        />
      ) : (
        /* Table View */
        <EmployeeTableView
          employees={filteredEmployees}
          onSelectEmployee={setSelectedEmployee}
        />
      )}

      {/* Employee Profile Detail Modal */}
      <EmployeeDetailModal
        employee={selectedEmployee}
        isOpen={Boolean(selectedEmployee)}
        onClose={() => setSelectedEmployee(null)}
        onToggleLeave={handleToggleLeave}
      />

      {/* Add Employee Form Modal */}
      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddEmployee={handleAddEmployee}
      />
    </div>
  );
}

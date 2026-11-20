import type { Employee, StatusFilterOption } from "./types";

interface EmployeeFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusFilterOption;
  onStatusFilterChange: (status: StatusFilterOption) => void;
  departmentFilter: string;
  onDepartmentFilterChange: (dept: string) => void;
  allEmployees: Employee[];
  departments: string[];
}

const statusOptions: StatusFilterOption[] = [
  "All",
  "Active",
  "Probation",
  "Notice Period",
  "Suspended",
];

export default function EmployeeFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  departmentFilter,
  onDepartmentFilterChange,
  allEmployees,
  departments,
}: EmployeeFiltersProps) {
  const getStatusCount = (status: StatusFilterOption) => {
    if (status === "All") return allEmployees.length;
    return allEmployees.filter(
      (e) => e.status.toLowerCase() === status.toLowerCase(),
    ).length;
  };

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    statusFilter !== "All" ||
    departmentFilter !== "All";

  const handleReset = () => {
    onSearchChange("");
    onStatusFilterChange("All");
    onDepartmentFilterChange("All");
  };

  return (
    <div className="card bg-base-100 border border-base-200/80 shadow-xs p-4 sm:p-5 space-y-4 rounded-2xl">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Status Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {statusOptions.map((status) => {
            const isSelected = statusFilter === status;
            const count = getStatusCount(status);

            return (
              <button
                key={status}
                type="button"
                onClick={() => onStatusFilterChange(status)}
                className={`btn btn-xs rounded-full transition-all shrink-0 font-normal ${
                  isSelected
                    ? "btn-primary text-primary-content font-medium shadow-xs"
                    : "btn-ghost border border-base-300 text-base-content/70 hover:border-base-content/30"
                }`}
              >
                {status}
                <span
                  className={`badge badge-xs ml-1 ${
                    isSelected
                      ? "bg-primary-content/25 text-primary-content"
                      : "badge-ghost opacity-70"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Department Filter */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1 justify-end">
          <select
            value={departmentFilter}
            onChange={(e) => onDepartmentFilterChange(e.target.value)}
            className="select select-sm select-bordered rounded-lg text-xs"
          >
            <option value="All">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          {/*<div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/40 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search name, ID, department..."
              className="input input-sm input-bordered w-full pl-9 pr-7 rounded-lg text-xs"
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>*/}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="btn btn-sm btn-ghost text-xs text-base-content/60 hover:text-base-content"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

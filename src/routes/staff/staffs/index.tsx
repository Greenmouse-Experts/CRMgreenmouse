import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/Headers/PageHeader";
import PageLoader from "@/components/layout/PageLoader";
import ColleagueStats from "./-components/ColleagueStats";
import ColleagueFilters from "./-components/ColleagueFilters";
import ColleagueTableView from "./-components/ColleagueTableView";
import type { Colleague, StatusFilterOption } from "./-components/types";
import { useEmployees, type EmployeeRecord } from "@/api/employeesApi";
import { Search } from "lucide-react";

export const Route = createFileRoute("/staff/staffs/")({
  component: RouteComponent,
});

const UNKNOWN = "—";

const titleCase = (value?: string) =>
  value
    ? value
        .trim()
        .split(/\s+/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ")
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

const toUiColleague = (employee: EmployeeRecord): Colleague => {
  const rawStatus =
    employee.lifecycleStatus ||
    employee.employmentStatus ||
    employee.status ||
    (employee.isDraft ? "draft" : "active");

  const statusKey = rawStatus?.toLowerCase();
  const status =
    statusKey === "active"
      ? "Active"
      : statusKey === "preboarding"
        ? "Preboarding"
        : statusKey === "notice_period"
          ? "Notice Period"
          : statusKey === "suspended"
            ? "Suspended"
            : statusKey === "exited"
              ? "Exited"
              : statusKey === "draft"
                ? "Draft"
                : titleCase(rawStatus);

  const firstName = employee.firstName ?? employee.first_name ?? "";
  const middleName = employee.middleName ?? employee.middle_name ?? "";
  const lastName = employee.lastName ?? employee.last_name ?? "";

  const constructedName = [firstName, middleName, lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  const name =
    employee.name ??
    employee.fullName ??
    (constructedName ? titleCase(constructedName) : employee.email || UNKNOWN);

  const empNumber =
    employee.employeeNumber ||
    employee.employee_number ||
    (employee.id && employee.id.length > 8
      ? employee.id.slice(0, 8)
      : employee.id) ||
    UNKNOWN;

  const rawTitle = relationName(
    employee.position ?? employee.role,
    employee.positionName ?? employee.position_name ?? employee.jobTitle,
  );
  const title = rawTitle !== UNKNOWN ? titleCase(rawTitle) : UNKNOWN;

  const rawDept = relationName(
    employee.department,
    employee.departmentName ?? employee.department_name,
  );
  const dept =
    rawDept.toLowerCase() === "qa"
      ? "QA"
      : rawDept.toLowerCase() === "hr"
        ? "HR"
        : rawDept.toLowerCase() === "it"
          ? "IT"
          : rawDept !== UNKNOWN
            ? titleCase(rawDept)
            : UNKNOWN;

  const rawType =
    employee.employeeType ??
    employee.employmentType ??
    employee.employment_type ??
    UNKNOWN;
  const type = rawType !== UNKNOWN ? titleCase(rawType) : UNKNOWN;

  const rawLocation =
    employee.workLocation ??
    employee.location ??
    employee.work_location ??
    UNKNOWN;
  const location = rawLocation !== UNKNOWN ? titleCase(rawLocation) : UNKNOWN;

  return {
    id: employee.id || employee._id || UNKNOWN,
    staffId: employee.staffId || undefined,
    employeeNumber: empNumber,
    name,
    firstName,
    middleName,
    lastName,
    email: employee.email ?? UNKNOWN,
    phone:
      employee.phone ||
      employee.phoneNumber ||
      employee.phone_number ||
      UNKNOWN,
    title,
    dept,
    location,
    type,
    status,
    isDraft: Boolean(employee.isDraft || statusKey === "draft"),
    onLeave: Boolean(employee.onLeave || employee.isOnLeave),
  };
};

function ColleaguesDirectoryContent({
  employees,
}: {
  employees: EmployeeRecord[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilterOption>("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");

  const colleagueList = useMemo<Colleague[]>(
    () =>
      employees
        .map(toUiColleague)
        .filter((emp) => !emp.isDraft && emp.status.toLowerCase() !== "exited"),
    [employees],
  );

  const departments = useMemo(() => {
    const unique = new Set(
      colleagueList
        .map((emp) => emp.dept)
        .filter((dept) => dept && dept !== UNKNOWN),
    );
    return [...unique].sort();
  }, [colleagueList]);

  const filteredColleagues = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    return colleagueList.filter((emp) => {
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
          (emp.employeeNumber?.toLowerCase().includes(term) ?? false) ||
          emp.dept.toLowerCase().includes(term) ||
          emp.title.toLowerCase().includes(term) ||
          emp.email.toLowerCase().includes(term)
        );
      }

      return true;
    });
  }, [colleagueList, searchTerm, statusFilter, departmentFilter]);

  return (
    <div className="space-y-6">
      <ColleagueStats
        colleagues={colleagueList}
        departmentCount={departments.length}
      />

      <ColleagueFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        departmentFilter={departmentFilter}
        onDepartmentFilterChange={setDepartmentFilter}
        allColleagues={colleagueList}
        departments={departments}
      />

      {filteredColleagues.length === 0 ? (
        <div className="card bg-base-100 border border-base-200/80 p-12 text-center space-y-3 rounded-2xl shadow-xs">
          <div className="size-12 rounded-full bg-base-200 text-base-content/80 flex items-center justify-center mx-auto">
            <Search className="size-5" />
          </div>
          <h3 className="font-semibold text-base text-base-content">
            No matching colleagues found
          </h3>
          <p className=" text-base-content/80 max-w-sm mx-auto">
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
        <ColleagueTableView colleagues={filteredColleagues} />
      )}
    </div>
  );
}

function RouteComponent() {
  const employeesQuery = useEmployees();
  const visibleCount = (employeesQuery.data ?? []).filter(
    (e) =>
      !e.isDraft &&
      (e.lifecycleStatus || e.employmentStatus || e.status)?.toLowerCase() !==
        "exited",
  ).length;

  return (
    <div className="space-y-6 pb-16">
      <div>
        <p className="mb-1  font-semibold uppercase tracking-[0.18em] text-primary">
          People
        </p>
        <PageHeader
          title="Colleagues"
          description={`${visibleCount} colleagues · basic directory information`}
        />
      </div>

      <PageLoader
        query={employeesQuery}
        emptyState={{
          title: "No colleagues listed yet",
          description: "Colleagues in your organization will appear here.",
        }}
      >
        {(data) => <ColleaguesDirectoryContent employees={data} />}
      </PageLoader>
    </div>
  );
}

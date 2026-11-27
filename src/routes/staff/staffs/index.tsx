import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/Headers/PageHeader";
import PageLoader from "@/components/layout/PageLoader";
import ColleagueStats from "./-components/ColleagueStats";
import ColleagueFilters, {
  type DepartmentFilterOption,
} from "./-components/ColleagueFilters";
import ColleagueTableView from "./-components/ColleagueTableView";
import type { Colleague, StatusFilterOption } from "./-components/types";
import {
  useEmployeeColleagues,
  type ColleagueRecord,
} from "@/api/employeesApi";
import { usePortalOrganization } from "@/api/organizationApi";
import { ChevronLeft, ChevronRight, Search, Users } from "lucide-react";

export const Route = createFileRoute("/staff/staffs/")({
  component: RouteComponent,
});

const UNKNOWN = "—";
const PAGE_LIMIT = 20;

const titleCase = (value?: string | null) =>
  value
    ? value
        .trim()
        .split(/\s+/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ")
    : UNKNOWN;

const formatDeptLabel = (rawDept?: string | null) => {
  if (!rawDept || !rawDept.trim()) return UNKNOWN;
  const lower = rawDept.trim().toLowerCase();
  if (lower === "qa") return "QA";
  if (lower === "hr") return "HR";
  if (lower === "it") return "IT";
  return titleCase(rawDept);
};

const relationName = (
  relation?: { name?: string; title?: string } | string | null,
  fallback?: string | null,
) => {
  if (relation && typeof relation === "object") {
    return relation.name || relation.title || fallback || UNKNOWN;
  }
  if (typeof relation === "string" && relation) return relation;
  return fallback || UNKNOWN;
};

const toUiColleague = (employee: ColleagueRecord): Colleague => {
  const explicitStatus =
    employee.lifecycleStatus ||
    employee.employmentStatus ||
    employee.status ||
    (employee.isDraft ? "draft" : undefined);

  const rawStatus = explicitStatus || "active";
  const statusKey = rawStatus.toLowerCase();
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
    employee.jobTitle ?? employee.positionName ?? employee.position_name,
  );
  const title = rawTitle !== UNKNOWN ? titleCase(rawTitle) : UNKNOWN;

  const rawDept = relationName(
    employee.department,
    employee.departmentName ?? employee.department_name,
  );
  const dept = rawDept !== UNKNOWN ? formatDeptLabel(rawDept) : UNKNOWN;

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
    profilePhotoUrl: employee.profilePhotoUrl ?? employee.photoUrl ?? null,
    title,
    dept,
    location,
    type,
    status,
    hasStatus: Boolean(explicitStatus),
    isDraft: Boolean(employee.isDraft || statusKey === "draft"),
    onLeave: Boolean(employee.onLeave || employee.isOnLeave),
  };
};

function RouteComponent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilterOption>("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 250);
    return () => clearTimeout(handle);
  }, [searchTerm]);

  const colleaguesQuery = useEmployeeColleagues({
    search: debouncedSearch || undefined,
    department: departmentFilter !== "All" ? departmentFilter : undefined,
    page,
    limit: PAGE_LIMIT,
  });

  const portalOrgQuery = usePortalOrganization();

  const colleagueList = useMemo<Colleague[]>(
    () =>
      (colleaguesQuery.data?.data ?? [])
        .map(toUiColleague)
        .filter((emp) => !emp.isDraft && emp.status.toLowerCase() !== "exited"),
    [colleaguesQuery.data?.data],
  );

  const filteredColleagues = useMemo(() => {
    if (statusFilter === "All") return colleagueList;
    return colleagueList.filter(
      (emp) => emp.status.toLowerCase() === statusFilter.toLowerCase(),
    );
  }, [colleagueList, statusFilter]);

  const departmentOptions = useMemo<DepartmentFilterOption[]>(() => {
    const seen = new Map<string, string>();
    for (const dept of portalOrgQuery.data?.departments ?? []) {
      const raw = String(dept.name ?? "").trim();
      if (!raw || raw === UNKNOWN) continue;
      if (!seen.has(raw.toLowerCase())) {
        seen.set(raw.toLowerCase(), raw);
      }
    }
    for (const rawEmp of colleaguesQuery.data?.data ?? []) {
      const raw = relationName(
        rawEmp.department,
        rawEmp.departmentName ?? rawEmp.department_name,
      );
      if (!raw || raw === UNKNOWN) continue;
      if (!seen.has(raw.toLowerCase())) {
        seen.set(raw.toLowerCase(), raw);
      }
    }
    return Array.from(seen.values())
      .map((raw) => ({
        value: raw,
        label: formatDeptLabel(raw),
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [portalOrgQuery.data?.departments, colleaguesQuery.data?.data]);

  const totalCount = colleaguesQuery.data?.total ?? colleagueList.length;
  const currentPage = colleaguesQuery.data?.page ?? page;
  const pageLimit = colleaguesQuery.data?.limit ?? PAGE_LIMIT;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageLimit));
  const departmentCount =
    portalOrgQuery.data?.summary.departments ?? departmentOptions.length;

  const hasActiveFilters =
    Boolean(debouncedSearch) ||
    statusFilter !== "All" ||
    departmentFilter !== "All";

  const resetFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setStatusFilter("All");
    setDepartmentFilter("All");
    setPage(1);
  };

  return (
    <div className="space-y-6 pb-16">
      <div>
        <p className="mb-1  font-semibold uppercase tracking-[0.18em] text-primary">
          People
        </p>
        <PageHeader
          title="Colleagues"
          description={`${totalCount} ${totalCount === 1 ? "colleague" : "colleagues"} · basic directory information`}
        />
      </div>

      <PageLoader query={colleaguesQuery} loadingText="Loading colleagues...">
        {() => (
          <div className="space-y-6">
            <ColleagueStats
              colleagues={colleagueList}
              departmentCount={departmentCount}
              totalCount={totalCount}
            />

            <ColleagueFilters
              searchTerm={searchTerm}
              onSearchChange={(val) => {
                setSearchTerm(val);
                setPage(1);
              }}
              statusFilter={statusFilter}
              onStatusFilterChange={(val) => {
                setStatusFilter(val);
                setPage(1);
              }}
              departmentFilter={departmentFilter}
              onDepartmentFilterChange={(val) => {
                setDepartmentFilter(val);
                setPage(1);
              }}
              allColleagues={colleagueList}
              departments={departmentOptions}
            />

            {filteredColleagues.length === 0 ? (
              hasActiveFilters ? (
                <div className="card bg-base-100 border border-base-200/80 p-12 text-center space-y-3 rounded-2xl shadow-xs">
                  <div className="size-12 rounded-full bg-base-200 text-base-content/80 flex items-center justify-center mx-auto">
                    <Search className="size-5" />
                  </div>
                  <h3 className="font-semibold text-base text-base-content">
                    No matching colleagues found
                  </h3>
                  <p className=" text-base-content/80 max-w-sm mx-auto">
                    No records matched your filters. Try clearing your search
                    term or adjusting the department filter.
                  </p>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="btn btn-sm btn-outline rounded-lg mx-auto"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="card bg-base-100 border border-base-200/80 p-12 text-center space-y-3 rounded-2xl shadow-xs">
                  <div className="size-12 rounded-full bg-base-200 text-base-content/80 flex items-center justify-center mx-auto">
                    <Users className="size-5" />
                  </div>
                  <h3 className="font-semibold text-base text-base-content">
                    No colleagues listed yet
                  </h3>
                  <p className=" text-base-content/80 max-w-sm mx-auto">
                    Colleagues in your organization will appear here.
                  </p>
                </div>
              )
            ) : (
              <>
                <ColleagueTableView colleagues={filteredColleagues} />

                {totalPages > 1 && (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-base-200/80 bg-base-100 px-4 py-3 text-sm">
                    <span className="text-base-content/75">
                      Page{" "}
                      <strong className="text-base-content">
                        {currentPage}
                      </strong>{" "}
                      of{" "}
                      <strong className="text-base-content">
                        {totalPages}
                      </strong>{" "}
                      · {totalCount} total colleagues
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={currentPage <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className="btn btn-sm btn-outline rounded-lg gap-1"
                      >
                        <ChevronLeft className="size-4" />
                        <span>Previous</span>
                      </button>
                      <button
                        type="button"
                        disabled={currentPage >= totalPages}
                        onClick={() =>
                          setPage((p) => Math.min(totalPages, p + 1))
                        }
                        className="btn btn-sm btn-outline rounded-lg gap-1"
                      >
                        <span>Next</span>
                        <ChevronRight className="size-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </PageLoader>
    </div>
  );
}

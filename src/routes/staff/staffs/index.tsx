import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/Headers/PageHeader";
import PageLoader from "@/components/layout/PageLoader";
import ColleagueStats from "./-components/ColleagueStats";
import ColleagueFilters, {
  type DepartmentFilterOption,
} from "./-components/ColleagueFilters";
import ColleagueTableView from "./-components/ColleagueTableView";
import {
  formatDeptLabel,
  relationName,
  toUiColleague,
  UNKNOWN,
} from "./-components/colleagueUtils";
import type { Colleague, StatusFilterOption } from "./-components/types";
import { useEmployeeColleagues } from "@/api/employeesApi";
import { usePortalOrganization } from "@/api/organizationApi";
import { ChevronLeft, ChevronRight, Search, Users } from "lucide-react";

export const Route = createFileRoute("/staff/staffs/")({
  component: RouteComponent,
});

const PAGE_LIMIT = 20;

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

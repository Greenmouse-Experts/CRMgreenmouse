import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/Headers/PageHeader";
import PageLoader from "@/components/layout/PageLoader";
import { usePortalOrganization } from "@/api/organizationApi";
import { useAuth, useProfile } from "@/store/authStore";
import OrganizationStats from "./organization/-components/OrganizationStats";
import OrgHierarchy from "./organization/-components/OrgHierarchy";
import DepartmentsTable from "./organization/-components/DepartmentsTable";
import PositionsTable from "./organization/-components/PositionsTable";
import type { OrgLeader } from "./organization/-components/types";
import { toast } from "sonner";

export const Route = createFileRoute("/staff/organization/")({
  component: RouteComponent,
});

function RouteComponent() {
  const organizationQuery = usePortalOrganization();
  const [authUser] = useAuth();
  const [profile] = useProfile();
  const companyName =
    authUser?.user?.companyName ||
    authUser?.profile?.companyName ||
    profile?.companyName;
  const orgLeader: OrgLeader | undefined = companyName
    ? {
        name: companyName,
        title: "Organization",
        email: authUser?.user?.email,
      }
    : undefined;

  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Organization"
        description="Department structure, job positions and reporting hierarchy."
      />

      <PageLoader
        query={organizationQuery}
        loadingText="Loading organization structure..."
      >
        {(data) => {
          const departments = data.departments ?? [];
          const positions = data.positions ?? [];
          const hierarchy = data.hierarchy ?? [];
          const summary = data.summary;

          return (
            <div className="space-y-6">
              <OrganizationStats
                departments={departments}
                positions={positions}
                summary={summary}
              />

              <OrgHierarchy
                leader={orgLeader}
                departments={departments}
                hierarchy={hierarchy}
                totalWorkforce={summary?.totalWorkforce}
                selectedDeptId={selectedDeptId}
                onSelectDept={(deptId) => {
                  setSelectedDeptId((prev) =>
                    prev === deptId ? null : deptId,
                  );
                  const dept = departments.find((d) => d.id === deptId);
                  if (dept) {
                    toast.info(
                      `${dept.name} department · Head: ${dept.head || "Unassigned"} (${dept.count ?? 0} staff)`,
                    );
                  }
                }}
              />

              <div className="grid gap-6 lg:grid-cols-2 items-start">
                <DepartmentsTable
                  departments={
                    selectedDeptId
                      ? departments.filter((d) => d.id === selectedDeptId)
                      : departments
                  }
                />

                <PositionsTable positions={positions} />
              </div>
            </div>
          );
        }}
      </PageLoader>
    </div>
  );
}

import StatCard from "@/components/StatCard";
import type { PortalOrganizationSummary } from "@/api/organizationApi";
import type { Department, Position } from "./types";
import { Briefcase, Building2, UserCheck, Users } from "lucide-react";

interface OrganizationStatsProps {
  departments: Department[];
  positions: Position[];
  summary?: PortalOrganizationSummary;
}

export default function OrganizationStats({
  departments,
  positions,
  summary,
}: OrganizationStatsProps) {
  const fallbackHeadcount = departments.reduce(
    (acc, d) => acc + (Number(d.count) || 0),
    0,
  );
  const fallbackDepartments = departments.length;

  const fallbackApproved = positions.reduce(
    (acc, p) => acc + (Number(p.approved) || 0),
    0,
  );
  const totalFilled = positions.reduce(
    (acc, p) => acc + (Number(p.filled) || 0),
    0,
  );
  const fallbackOpen = Math.max(0, fallbackApproved - totalFilled);

  const totalHeadcount = summary?.totalWorkforce ?? fallbackHeadcount;
  const totalDepartments = summary?.departments ?? fallbackDepartments;
  const totalApproved = summary?.approvedHeadcount ?? fallbackApproved;
  const openPositions = summary?.openRequisitions ?? fallbackOpen;

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <StatCard
        title="Total Workforce"
        value={totalHeadcount}
        desc="Active employees across all departments"
        icon={<Users className="size-5" />}
        variant="primary"
      />
      <StatCard
        title="Departments"
        value={totalDepartments}
        desc="Operating functional business units"
        icon={<Building2 className="size-5" />}
        variant="info"
      />
      <StatCard
        title="Approved Headcount"
        value={totalApproved}
        desc={`${totalFilled} positions currently filled`}
        icon={<UserCheck className="size-5" />}
        variant="success"
      />
      <StatCard
        title="Open Requisitions"
        value={openPositions}
        desc="Vacancies awaiting hire fulfillment"
        icon={<Briefcase className="size-5" />}
        variant="warning"
      />
    </div>
  );
}

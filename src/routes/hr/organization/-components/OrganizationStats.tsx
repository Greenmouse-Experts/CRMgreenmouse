import StatCard from "@/components/StatCard";
import type { Department, Position } from "./types";
import { Users, Building2, Briefcase, UserCheck } from "lucide-react";

interface OrganizationStatsProps {
  departments: Department[];
  positions: Position[];
}

export default function OrganizationStats({
  departments,
  positions,
}: OrganizationStatsProps) {
  const totalHeadcount = departments.reduce((acc, d) => acc + d.count, 0);
  const totalDepartments = departments.length;

  const totalApproved = positions.reduce((acc, p) => acc + p.approved, 0);
  const totalFilled = positions.reduce((acc, p) => acc + p.filled, 0);
  const openPositions = Math.max(0, totalApproved - totalFilled);

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

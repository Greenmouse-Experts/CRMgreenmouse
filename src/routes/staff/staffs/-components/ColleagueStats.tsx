import StatCard from "@/components/StatCard";
import type { Colleague } from "./types";
import { Building2, CalendarCheck2, UserCheck, Users } from "lucide-react";

interface ColleagueStatsProps {
  colleagues: Colleague[];
  departmentCount: number;
}

export default function ColleagueStats({
  colleagues,
  departmentCount,
}: ColleagueStatsProps) {
  const total = colleagues.length;
  const activeCount = colleagues.filter(
    (e) => e.status.toLowerCase() === "active",
  ).length;
  const onLeaveCount = colleagues.filter((e) => e.onLeave).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Colleagues"
        value={total}
        desc="Team members in your workspace"
        icon={<Users className="size-5" />}
        variant="primary"
      />
      <StatCard
        title="Active Staff"
        value={activeCount}
        desc={`${Math.round((activeCount / (total || 1)) * 100)}% of listed staff`}
        icon={<UserCheck className="size-5" />}
        variant="success"
      />
      <StatCard
        title="Departments"
        value={departmentCount}
        desc="Teams represented in directory"
        icon={<Building2 className="size-5" />}
        variant="info"
      />
      <StatCard
        title="Currently On Leave"
        value={onLeaveCount}
        desc="Colleagues on approved leave"
        icon={<CalendarCheck2 className="size-5" />}
        variant="warning"
      />
    </div>
  );
}

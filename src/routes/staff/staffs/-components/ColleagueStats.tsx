import StatCard from "@/components/StatCard";
import type { Colleague } from "./types";
import {
  Building2,
  CalendarCheck2,
  MapPin,
  UserCheck,
  Users,
} from "lucide-react";

interface ColleagueStatsProps {
  colleagues: Colleague[];
  departmentCount: number;
  totalCount?: number;
}

export default function ColleagueStats({
  colleagues,
  departmentCount,
  totalCount,
}: ColleagueStatsProps) {
  const total = totalCount ?? colleagues.length;
  const activeCount = colleagues.filter(
    (e) => e.status.toLowerCase() === "active",
  ).length;
  const onLeaveCount = colleagues.filter((e) => e.onLeave).length;
  const hasLeaveField = colleagues.some((e) => e.onLeave);
  const locationCount = new Set(
    colleagues.map((e) => e.location).filter((loc) => loc && loc !== "—"),
  ).size;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Colleagues"
        value={total}
        desc="Team members in your directory"
        icon={<Users className="size-5" />}
        variant="primary"
      />
      <StatCard
        title="Shown on Page"
        value={colleagues.length}
        desc={
          total > 0
            ? `${activeCount} active in current view`
            : "No colleagues matched"
        }
        icon={<UserCheck className="size-5" />}
        variant="success"
      />
      <StatCard
        title="Departments"
        value={departmentCount}
        desc="Teams across organization"
        icon={<Building2 className="size-5" />}
        variant="info"
      />
      {hasLeaveField ? (
        <StatCard
          title="Currently On Leave"
          value={onLeaveCount}
          desc="Colleagues on approved leave"
          icon={<CalendarCheck2 className="size-5" />}
          variant="warning"
        />
      ) : (
        <StatCard
          title="Work Locations"
          value={locationCount}
          desc="Locations in current view"
          icon={<MapPin className="size-5" />}
          variant="warning"
        />
      )}
    </div>
  );
}

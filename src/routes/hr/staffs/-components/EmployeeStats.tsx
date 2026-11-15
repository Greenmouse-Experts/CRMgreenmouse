import StatCard from "@/components/StatCard";
import type { Employee } from "./types";
import { Users, UserCheck, Clock, CalendarCheck2 } from "lucide-react";

interface EmployeeStatsProps {
  employees: Employee[];
}

export default function EmployeeStats({ employees }: EmployeeStatsProps) {
  const total = employees.length;
  const activeCount = employees.filter(
    (e) => e.status.toLowerCase() === "active",
  ).length;
  const probationOrNoticeCount = employees.filter((e) => {
    const s = e.status.toLowerCase();
    return s === "probation" || s === "notice period";
  }).length;
  const onLeaveCount = employees.filter((e) => e.onLeave).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Employees"
        value={total}
        desc="Total enrolled employee records"
        icon={<Users className="size-5" />}
        variant="primary"
      />
      <StatCard
        title="Active Staff"
        value={activeCount}
        desc={`${Math.round((activeCount / (total || 1)) * 100)}% of total workforce`}
        icon={<UserCheck className="size-5" />}
        variant="success"
      />
      <StatCard
        title="Probation & Notice"
        value={probationOrNoticeCount}
        desc="Under review or transitioning"
        icon={<Clock className="size-5" />}
        variant="info"
      />
      <StatCard
        title="Currently On Leave"
        value={onLeaveCount}
        desc="Scheduled & approved time-off"
        icon={<CalendarCheck2 className="size-5" />}
        variant="warning"
      />
    </div>
  );
}

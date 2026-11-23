import StatCard from "@/components/StatCard";
import type { AttendanceDashboard } from "@/api/attendanceApi";
import { UserCheck, Clock, UserX, Timer } from "lucide-react";

interface AttendanceStatsProps {
  stats: AttendanceDashboard;
}

const metric = (stats: AttendanceDashboard, ...keys: string[]) => {
  for (const key of keys) {
    const value = stats?.[key];
    if (typeof value === "number") return value;
  }
  return 0;
};

export default function AttendanceStats({ stats }: AttendanceStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <StatCard
        title="Present"
        value={metric(stats, "present", "presentCount", "presentEmployees")}
        desc="Employees on-site or active remote"
        icon={<UserCheck className="size-5" />}
        variant="success"
      />
      <StatCard
        title="Late"
        value={metric(stats, "late", "lateCount", "lateEmployees")}
        desc="Clock-in recorded after the grace period"
        icon={<Clock className="size-5" />}
        variant="warning"
      />
      <StatCard
        title="Absent"
        value={metric(stats, "absent", "absentCount", "absentEmployees")}
        desc="Unplanned absence or no clock-in"
        icon={<UserX className="size-5" />}
        variant="error"
      />
      <StatCard
        title="Overtime hrs (week)"
        value={metric(stats, "overtimeHours", "overtime", "weeklyOvertime")}
        desc="Cumulative approved overtime"
        icon={<Timer className="size-5" />}
        variant="info"
      />
    </div>
  );
}

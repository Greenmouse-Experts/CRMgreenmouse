import StatCard from "@/components/StatCard";
import type { AttendanceRecord } from "./types";
import { UserCheck, Clock, UserX, Timer } from "lucide-react";

interface AttendanceStatsProps {
  logs: AttendanceRecord[];
}

export default function AttendanceStats({ logs }: AttendanceStatsProps) {
  const presentCount = logs.filter((l) => l.status === "Present").length;
  const lateCount = logs.filter((l) => l.status === "Late").length;
  const absentCount = logs.filter((l) => l.status === "Absent").length;

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <StatCard
        title="Present"
        value={presentCount > 0 ? 220 + presentCount : 226}
        desc="Employees on-site or active remote"
        icon={<UserCheck className="size-5" />}
        variant="success"
      />
      <StatCard
        title="Late"
        value={lateCount > 0 ? 9 + lateCount : 11}
        desc="Clock-in recorded after 09:15"
        icon={<Clock className="size-5" />}
        variant="warning"
      />
      <StatCard
        title="Absent"
        value={absentCount > 0 ? 7 + absentCount : 8}
        desc="Unplanned absence or no clock-in"
        icon={<UserX className="size-5" />}
        variant="error"
      />
      <StatCard
        title="Overtime hrs (week)"
        value={46}
        desc="Cumulative approved overtime"
        icon={<Timer className="size-5" />}
        variant="info"
      />
    </div>
  );
}

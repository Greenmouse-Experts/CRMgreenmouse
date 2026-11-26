import StatCard from "@/components/StatCard";
import type { AttendanceRecordApi } from "@/api/attendanceApi";
import { Clock, Timer, UserCheck, UserX } from "lucide-react";

interface AttendanceStatsProps {
  records: AttendanceRecordApi[];
}

export function computePersonalAttendanceStats(records: AttendanceRecordApi[]) {
  let presentCount = 0;
  let lateCount = 0;
  let absentCount = 0;
  let totalMs = 0;

  for (const record of records) {
    const status = record.status?.toLowerCase();
    if (status === "absent") {
      absentCount += 1;
    } else if (status === "late") {
      lateCount += 1;
      presentCount += 1;
    } else if (
      status === "present" ||
      status === "half_day" ||
      status === "halfday" ||
      record.clockInAt
    ) {
      presentCount += 1;
    }

    if (record.clockInAt && record.clockOutAt) {
      const start = new Date(record.clockInAt).getTime();
      const end = new Date(record.clockOutAt).getTime();
      if (!Number.isNaN(start) && !Number.isNaN(end) && end > start) {
        totalMs += end - start;
      }
    }
  }

  const totalHours = Math.round((totalMs / 3_600_000) * 10) / 10;
  return {
    presentCount,
    lateCount,
    absentCount,
    totalHours,
  };
}

export default function AttendanceStats({ records }: AttendanceStatsProps) {
  const stats = computePersonalAttendanceStats(records);

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <StatCard
        title="Present"
        value={stats.presentCount}
        desc="Your recorded days clocked in"
        icon={<UserCheck className="size-5" />}
        variant="success"
      />
      <StatCard
        title="Late"
        value={stats.lateCount}
        desc="Your clock-ins after grace period"
        icon={<Clock className="size-5" />}
        variant="warning"
      />
      <StatCard
        title="Absent"
        value={stats.absentCount}
        desc="Your recorded absences"
        icon={<UserX className="size-5" />}
        variant="error"
      />
      <StatCard
        title="Hours logged"
        value={`${stats.totalHours} hrs`}
        desc="Total hours from completed shifts"
        icon={<Timer className="size-5" />}
        variant="info"
      />
    </div>
  );
}

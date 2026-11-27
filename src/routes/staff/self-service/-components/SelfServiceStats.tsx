import StatCard from "@/components/StatCard";
import type { SelfServiceSummary } from "./types";
import {
  CalendarDays,
  DollarSign,
  FileText,
  GraduationCap,
} from "lucide-react";

interface SelfServiceStatsProps {
  summary: SelfServiceSummary;
}

export default function SelfServiceStats({ summary }: SelfServiceStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Pending Leave"
        value={summary.pendingLeave}
        desc="Leave requests awaiting review"
        icon={<CalendarDays className="size-5" />}
        variant="warning"
      />
      <StatCard
        title="Leave Balance"
        value={`${summary.leaveBalance} days`}
        desc="Annual leave remaining this year"
        icon={<FileText className="size-5" />}
        variant="primary"
      />
      <StatCard
        title="Ready Payslips"
        value={summary.readyPayslips}
        desc="Current month, ready for review"
        icon={<DollarSign className="size-5" />}
        variant="success"
      />
      <StatCard
        title="Enrolled Courses"
        value={summary.enrolledCourses}
        desc="Training in progress"
        icon={<GraduationCap className="size-5" />}
        variant="info"
      />
    </div>
  );
}

import StatCard from "@/components/StatCard";
import { Calendar, CheckCircle2, Clock, CalendarDays } from "lucide-react";
import type { LeaveRequest } from "./types";

interface LeaveStatsProps {
  requests: LeaveRequest[];
}

export default function LeaveStats({ requests }: LeaveStatsProps) {
  // Compute dynamically based on requests or standards
  const annualTotal = 24;
  const approvedAnnualDays = requests
    .filter((r) => r.type === "Annual" && r.status === "Approved")
    .reduce((sum, r) => sum + r.days, 0);
  const pendingAnnualDays = requests
    .filter(
      (r) =>
        r.type === "Annual" &&
        (r.status === "Submitted" || r.status.startsWith("Pending")),
    )
    .reduce((sum, r) => sum + r.days, 0);

  const used = approvedAnnualDays > 0 ? approvedAnnualDays : 8;
  const pending = pendingAnnualDays > 0 ? pendingAnnualDays : 3;
  const available = Math.max(0, annualTotal - used - pending);
  const percentAvailable = Math.round((available / annualTotal) * 100);

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <StatCard
        title="Annual entitlement"
        value={
          <div className="flex items-baseline gap-1">
            <span>{annualTotal}</span>
            <span className=" font-normal text-base-content/80">days</span>
          </div>
        }
        desc="Standard yearly paid leave allowance"
        icon={<CalendarDays className="size-5" />}
        variant="info"
      />

      <StatCard
        title="Used"
        value={
          <div className="flex items-baseline gap-1">
            <span>{used}</span>
            <span className=" font-normal text-base-content/80">days</span>
          </div>
        }
        desc="Approved days taken year-to-date"
        icon={<CheckCircle2 className="size-5" />}
        variant="success"
      />

      <StatCard
        title="Pending reservation"
        value={
          <div className="flex items-baseline gap-1">
            <span>{pending}</span>
            <span className=" font-normal text-base-content/80">days</span>
          </div>
        }
        desc="Awaiting manager or HR approval"
        icon={<Clock className="size-5" />}
        variant="warning"
      />

      <StatCard
        title="Available"
        value={
          <div className="flex items-baseline gap-1">
            <span className="text-primary font-bold">{available}</span>
            <span className=" font-normal text-base-content/80">days</span>
          </div>
        }
        desc={
          <div className="space-y-1.5 mt-1">
            <div className="flex items-center justify-between text-[11px] text-base-content/80">
              <span>Remaining balance</span>
              <span className="font-semibold text-primary">
                {percentAvailable}%
              </span>
            </div>
            <progress
              className="progress progress-primary w-full h-1.5"
              value={percentAvailable}
              max="100"
            />
          </div>
        }
        icon={<Calendar className="size-5" />}
        variant="primary"
      />
    </div>
  );
}

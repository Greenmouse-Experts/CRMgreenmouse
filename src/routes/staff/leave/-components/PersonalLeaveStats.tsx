import StatCard from "@/components/StatCard";
import { useLeaveBalances } from "@/api/leaveApi";
import type { LeaveRequest } from "@/routes/hr/leave/-components/types";
import { Calendar, CalendarDays, CheckCircle2, Clock } from "lucide-react";

interface PersonalLeaveStatsProps {
  requests: LeaveRequest[];
}

export default function PersonalLeaveStats({
  requests,
}: PersonalLeaveStatsProps) {
  const { data: balances = [] } = useLeaveBalances();
  const annualBalance =
    balances.find((b) => b.type === "Annual") ?? balances[0];

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

  const annualTotal = annualBalance?.annualEntitlement ?? 0;
  const used = annualBalance?.used ?? approvedAnnualDays;
  const pending = annualBalance?.pendingReservation ?? pendingAnnualDays;
  const available =
    annualBalance?.available ?? Math.max(0, annualTotal - used - pending);
  const percentAvailable =
    annualTotal > 0 ? Math.round((available / annualTotal) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          title="Annual entitlement"
          value={
            <div className="flex items-baseline gap-1">
              <span>{annualTotal}</span>
              <span className="font-normal text-base-content/80">days</span>
            </div>
          }
          desc="Your yearly paid leave allowance"
          icon={<CalendarDays className="size-5" />}
          variant="info"
        />

        <StatCard
          title="Used"
          value={
            <div className="flex items-baseline gap-1">
              <span>{used}</span>
              <span className="font-normal text-base-content/80">days</span>
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
              <span className="font-normal text-base-content/80">days</span>
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
              <span className="font-normal text-base-content/80">days</span>
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

      {balances.length > 1 && (
        <div className="flex flex-wrap items-center gap-2">
          {balances.map((bal, idx) => (
            <div
              key={`${bal.type ?? "leave"}-${idx}`}
              className="rounded-xl border border-base-200 bg-base-100 px-3 py-1.5 text-xs flex items-center gap-2 shadow-2xs"
            >
              <span className="font-semibold text-base-content">
                {bal.type ?? "Leave"}
              </span>
              <span className="text-base-content/70">
                Available:{" "}
                <strong className="text-primary">{bal.available ?? 0}</strong> /{" "}
                {bal.annualEntitlement ?? 0} d
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

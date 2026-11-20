import StatCard from "@/components/StatCard";
import {
  CalendarClock,
  CircleDollarSign,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { formatCurrency } from "./payrollData";
import type { PayrollRun, Payslip } from "./types";

interface PayrollStatsProps {
  runs: PayrollRun[];
  payslips: Payslip[];
}

export default function PayrollStats({ runs, payslips }: PayrollStatsProps) {
  const activeRun =
    runs.find((r) => r.status === "Pending Approval") ??
    runs.find((r) => r.status === "Draft") ??
    runs[0];

  const pendingApprovals = runs.filter(
    (r) => r.status === "Pending Approval",
  ).length;
  const onHold = payslips.filter((p) => p.status === "On hold").length;
  const readyToPay = payslips.filter((p) => p.status === "Ready").length;

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <StatCard
        title="Next pay date"
        value={
          <span className="text-lg font-semibold sm:text-xl">
            {activeRun?.payDate ?? "Not scheduled"}
          </span>
        }
        desc={
          activeRun
            ? `${activeRun.period} · ${activeRun.cycle}`
            : "No run scheduled"
        }
        icon={<CalendarClock className="size-5" />}
        variant="info"
      />

      <StatCard
        title="Gross payroll"
        value={formatCurrency(activeRun?.gross ?? 0)}
        desc={`${activeRun?.employees ?? 0} employees in active run`}
        icon={<CircleDollarSign className="size-5" />}
        variant="primary"
      />

      <StatCard
        title="Net payout"
        value={formatCurrency(activeRun?.net ?? 0)}
        desc={`${formatCurrency(activeRun?.deductions ?? 0)} in deductions`}
        icon={<Wallet className="size-5" />}
        variant="success"
      />

      <StatCard
        title="Needs attention"
        value={
          <div className="flex items-baseline gap-1.5">
            <span>{pendingApprovals + onHold}</span>
            <span className=" font-normal text-base-content/80">items</span>
          </div>
        }
        desc={
          <span>
            {pendingApprovals} run{pendingApprovals === 1 ? "" : "s"} awaiting
            approval · {onHold} payslip{onHold === 1 ? "" : "s"} on hold
          </span>
        }
        icon={<ShieldCheck className="size-5" />}
        variant="warning"
        className={readyToPay === 0 ? "opacity-90" : undefined}
      />
    </div>
  );
}

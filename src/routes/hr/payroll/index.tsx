import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/Headers/PageHeader";
import PayrollStats from "./-components/PayrollStats";
import PayrollRunsTable from "./-components/PayrollRunsTable";
import PayslipsTable from "./-components/PayslipsTable";
import PayrollConfigSection from "./-components/PayrollConfigSection";
import {
  INITIAL_PAYROLL_RUNS,
  INITIAL_PAYSLIPS,
  formatCurrency,
} from "./-components/payrollData";
import type { PayrollRun, Payslip } from "./-components/types";
import { Download, Play } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/hr/payroll/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [runs, setRuns] = useState<PayrollRun[]>(INITIAL_PAYROLL_RUNS);
  const [payslips, setPayslips] = useState<Payslip[]>(INITIAL_PAYSLIPS);

  const handleSubmitRun = (id: string) => {
    setRuns((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "Pending Approval" } : r)),
    );
    toast.success("Payroll run submitted for approval");
  };

  const handleApproveRun = (id: string) => {
    setRuns((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "Approved" } : r)),
    );
    toast.success("Payroll run approved by finance");
  };

  const handleMarkPaid = (id: string) => {
    setRuns((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "Paid" } : r)),
    );
    setPayslips((prev) => prev.map((p) => ({ ...p, status: "Paid" })));
    toast.success("Payroll marked as paid and disbursed");
  };

  const handleCancelRun = (id: string) => {
    setRuns((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "Cancelled" } : r)),
    );
    toast.info("Payroll run cancelled");
  };

  const handleViewPayslips = (id: string) => {
    toast.info(`Viewing payslips for run ${id}`);
  };

  const handleToggleHold = (id: string) => {
    setPayslips((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const newStatus = p.status === "On hold" ? "Ready" : "On hold";
          toast.info(
            newStatus === "On hold"
              ? `Payslip for ${p.employee} placed on hold`
              : `Payslip for ${p.employee} marked ready`,
          );
          return { ...p, status: newStatus };
        }
        return p;
      }),
    );
  };

  const handleViewPayslip = (payslip: Payslip) => {
    const deductions = payslip.gross - payslip.netPay;
    toast.info(`Payslip for ${payslip.employee}`, {
      description: `Gross: ${formatCurrency(payslip.gross)} · Deductions: ${formatCurrency(deductions)} · Net: ${formatCurrency(payslip.netPay)}`,
    });
  };

  const handleExportSchedule = () => {
    toast.success("Bank payment schedule downloaded", {
      description: "Payroll batch CSV file ready for corporate banking upload.",
    });
  };

  const handleRunPayroll = () => {
    toast.info("Active payroll calculation triggered", {
      description:
        "Processing timecard inputs, bonuses, and statutory deductions.",
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <PageHeader
        title="Payroll"
        description="Salary processing, statutory deductions, payslips and pay schedules."
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportSchedule}
            className="btn btn-sm btn-ghost border border-base-200 rounded-xl px-3 font-medium gap-1.5"
          >
            <Download className="size-4" />
            <span className="hidden sm:inline">Export schedule</span>
          </button>
          <button
            type="button"
            onClick={handleRunPayroll}
            className="btn btn-sm bg-primary text-white hover:bg-primary/90 border-0 rounded-xl px-4 font-medium gap-1.5 shadow-sm shadow-primary/20"
          >
            <Play className="size-4" />
            <span>Process run</span>
          </button>
        </div>
      </PageHeader>

      {/* Top 4 KPI Stat Cards */}
      <PayrollStats runs={runs} payslips={payslips} />

      {/* Payroll Runs History / Management */}
      <PayrollRunsTable
        runs={runs}
        onSubmitRun={handleSubmitRun}
        onApproveRun={handleApproveRun}
        onMarkPaid={handleMarkPaid}
        onCancelRun={handleCancelRun}
        onViewPayslips={handleViewPayslips}
      />

      {/* 2-Column Responsive Layout: Payslips Breakdown & Config Rules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2">
          <PayslipsTable
            payslips={payslips}
            onViewPayslip={handleViewPayslip}
            onToggleHold={handleToggleHold}
          />
        </div>
        <div className="lg:col-span-1">
          <PayrollConfigSection />
        </div>
      </div>
    </div>
  );
}

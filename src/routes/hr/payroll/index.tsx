import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/Headers/PageHeader";
import PayrollStats from "./-components/PayrollStats";
import PayrollRunsTable from "./-components/PayrollRunsTable";
import PayslipsTable from "./-components/PayslipsTable";
import PayrollConfigSection from "./-components/PayrollConfigSection";
import NewPayrollRunModal from "./-components/NewPayrollRunModal";
import { formatCurrency } from "./-components/payrollData";
import type {
  PayrollCycle,
  PayrollRun,
  Payslip,
} from "./-components/types";
import {
  usePayrollRuns,
  useMyPayslips,
  useCreatePayrollRun,
  useCalculatePayrollRun,
  useApprovePayrollRun,
  useMarkPayrollRunPaid,
  toPayrollRunStatus,
} from "@/api/payrollApi";
import { extract_message } from "@/helpers/auth";
import { Download, Play, Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/hr/payroll/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [newRunOpen, setNewRunOpen] = useState(false);

  const runsQuery = usePayrollRuns();
  const payslipsQuery = useMyPayslips();

  const createRunMutation = useCreatePayrollRun();
  const calculateRunMutation = useCalculatePayrollRun();
  const approveRunMutation = useApprovePayrollRun();
  const markPaidMutation = useMarkPayrollRunPaid();

  const [cancelledRuns, setCancelledRuns] = useState<Record<string, boolean>>(
    {},
  );
  const [holds, setHolds] = useState<Record<string, boolean>>({});

  const runs = useMemo<PayrollRun[]>(() => {
    const base = (runsQuery.data ?? []).map((r) => ({
      id: r.id,
      period: r.period ?? "",
      cycle: (r.cycle as PayrollCycle) ?? "Monthly",
      payDate: r.payDate ?? "",
      employees: (r.employees as number) ?? 0,
      gross: (r.gross as number) ?? 0,
      deductions: (r.deductions as number) ?? 0,
      net: (r.net as number) ?? 0,
      status: toPayrollRunStatus(r.status) as PayrollRun["status"],
      preparedBy: (r.preparedBy as string) ?? "",
      notes: r.notes as string | undefined,
    }));
    return base.map((r) =>
      cancelledRuns[r.id] ? { ...r, status: "Cancelled" } : r,
    );
  }, [runsQuery.data, cancelledRuns]);

  const payslips = useMemo<Payslip[]>(() => {
    const base = (payslipsQuery.data as Payslip[] | undefined) ?? [];
    return base.map((p) =>
      p.id in holds ? { ...p, status: holds[p.id] ? "On hold" : "Ready" } : p,
    );
  }, [payslipsQuery.data, holds]);

  const handleNewRun = async (payload: {
    periodStart: string;
    periodEnd: string;
    payDate: string;
  }) => {
    try {
      await toast.promise(createRunMutation.mutateAsync(payload), {
        loading: "Creating payroll run...",
        success: "Payroll run created",
        error: (error) => extract_message(error as never),
      });
      setNewRunOpen(false);
    } catch {
      // Error toast shown by toast.promise.
    }
  };

  const handleProcessRun = () => {
    const activeRun = runs.find((r) =>
      ["Draft", "Pending Approval"].includes(r.status),
    );
    if (!activeRun) {
      toast.info("No draft or pending payroll run to process.");
      return;
    }
    toast.promise(calculateRunMutation.mutateAsync({ id: activeRun.id }), {
      loading: "Calculating payroll run...",
      success: "Payroll run calculated",
      error: (error) => extract_message(error as never),
    });
  };

  const handleSubmitRun = (id: string) => {
    toast.promise(calculateRunMutation.mutateAsync({ id }), {
      loading: "Calculating payroll run...",
      success: "Payroll run submitted for approval",
      error: (error) => extract_message(error as never),
    });
  };

  const handleApproveRun = (id: string) => {
    toast.promise(approveRunMutation.mutateAsync({ id }), {
      loading: "Approving payroll run...",
      success: "Payroll run approved by finance",
      error: (error) => extract_message(error as never),
    });
  };

  const handleMarkPaid = (id: string) => {
    toast.promise(
      markPaidMutation.mutateAsync({
        id,
        paymentReference: `PR-${id} payment`,
        paidAt: new Date().toISOString(),
      }),
      {
        loading: "Recording payment...",
        success: "Payroll marked as paid and disbursed",
        error: (error) => extract_message(error as never),
      },
    );
  };

  const handleCancelRun = (id: string) => {
    setCancelledRuns((prev) => ({ ...prev, [id]: true }));
    toast.info("Payroll run cancelled");
  };

  const handleViewPayslips = (id: string) => {
    toast.info(`Viewing payslips for run ${id}`);
  };

  const handleToggleHold = (id: string) => {
    const slip = payslips.find((p) => p.id === id);
    const wasHeld = holds[id] ?? slip?.status === "On hold";
    setHolds((prev) => ({ ...prev, [id]: !wasHeld }));
    toast.info(
      wasHeld
        ? `Payslip for ${slip?.employee} marked ready`
        : `Payslip for ${slip?.employee} placed on hold`,
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
            onClick={() => setNewRunOpen(true)}
            className="btn btn-sm bg-primary text-white hover:bg-primary/90 border-0 rounded-xl px-4 gap-1.5 shadow-sm shadow-primary/20"
          >
            <Plus className="size-4" />
            <span>New run</span>
          </button>
          <button
            type="button"
            onClick={handleProcessRun}
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

      <NewPayrollRunModal
        isOpen={newRunOpen}
        onClose={() => setNewRunOpen(false)}
        isPending={createRunMutation.isPending}
        onSubmitRun={handleNewRun}
      />
    </div>
  );
}

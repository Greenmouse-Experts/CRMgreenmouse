import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import PageHeader from "@/components/Headers/PageHeader";
import { get_user_value } from "@/store/authStore";
import SelfServiceStats from "./-components/SelfServiceStats";
import LeaveRequestsTable from "./-components/LeaveRequestsTable";
import PayslipsTable from "./-components/PayslipsTable";
import LeaveRequestModal from "./-components/LeaveRequestModal";
import PayslipModal from "./-components/PayslipModal";
import {
  INITIAL_LEAVE_REQUESTS,
  INITIAL_PAYSLIPS,
  formatCurrency,
  getSelfServiceSummary,
} from "./-components/selfServiceData";
import type { LeaveRequest, LeaveStatus, Payslip } from "./-components/types";

export const Route = createFileRoute("/hr/self-service/")({
  component: RouteComponent,
});

function getEmployeeName(): string {
  const user = get_user_value()?.user;
  return [user?.firstName, user?.lastName]
    .filter((part): part is string => Boolean(part))
    .join(" ")
    .trim();
}

function RouteComponent() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() =>
    INITIAL_LEAVE_REQUESTS.map((request) => ({
      ...request,
      employee: getEmployeeName() || request.employee,
    })),
  );
  const [payslips] = useState<Payslip[]>(INITIAL_PAYSLIPS);
  const [selectedLeaveRequest, setSelectedLeaveRequest] =
    useState<LeaveRequest | null>(null);
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(
    null,
  );

  const summary = getSelfServiceSummary(leaveRequests, payslips);

  const handleCancelLeaveRequest = (request: LeaveRequest) => {
    setLeaveRequests((prev) =>
      prev.map((r) =>
        r.id === request.id
          ? { ...r, status: "Cancelled" as LeaveStatus }
          : r,
      ),
    );
    setSelectedLeaveRequest(null);
    toast.info(`Leave request ${request.id} cancelled`);
  };

  const handleDownloadPayslip = (payslip: Payslip) => {
    toast.info("Payslip download started", {
      description: `${payslip.month} — net pay ${formatCurrency(payslip.netPay)}`,
    });
  };

  return (
    <div className="space-y-6 pb-16">
      <PageHeader
        title="My Self-Service"
        description="View and manage my payslips, leave requests, and training records."
      />

      <SelfServiceStats summary={summary} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LeaveRequestsTable
          requests={leaveRequests}
          onOpenDetail={setSelectedLeaveRequest}
          onCancelRequest={handleCancelLeaveRequest}
        />
        <PayslipsTable
          payslips={payslips}
          onOpenDetail={setSelectedPayslip}
        />
      </div>

      <LeaveRequestModal
        request={selectedLeaveRequest}
        onClose={() => setSelectedLeaveRequest(null)}
        onCancel={handleCancelLeaveRequest}
      />

      <PayslipModal
        payslip={selectedPayslip}
        onClose={() => setSelectedPayslip(null)}
        onDownload={handleDownloadPayslip}
      />
    </div>
  );
}

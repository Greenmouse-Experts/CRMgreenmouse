import { useMemo, useState } from "react";
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
  INITIAL_PAYSLIPS,
  formatCurrency,
  getSelfServiceSummary,
  mapSelfServiceLeaveRequest,
} from "./-components/selfServiceData";
import type { LeaveRequest, Payslip } from "./-components/types";
import {
  useCancelLeaveRequest,
  useLeaveBalances,
  useMyLeaveRequests,
} from "@/api/leaveApi";
import { extract_message } from "@/helpers/auth";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@/api/simpleApi";

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
  const [selectedLeaveRequest, setSelectedLeaveRequest] =
    useState<LeaveRequest | null>(null);
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(
    null,
  );

  const leaveRequestsQuery = useMyLeaveRequests();
  const cancelLeaveRequest = useCancelLeaveRequest();
  const { data: balances = [] } = useLeaveBalances();
  const userName = getEmployeeName();

  const leaveRequests = useMemo(
    () =>
      (leaveRequestsQuery.data ?? []).map((request) => {
        const mapped = mapSelfServiceLeaveRequest(request);
        return { ...mapped, employee: mapped.employee || userName };
      }),
    [leaveRequestsQuery.data, userName],
  );

  const annualBalance = balances.find((b) => b.type === "Annual") ?? balances[0];

  const summary = getSelfServiceSummary(
    leaveRequests,
    INITIAL_PAYSLIPS,
    annualBalance?.annualEntitlement ?? annualBalance?.available,
  );

  const handleCancelLeaveRequest = async (request: LeaveRequest) => {
    try {
      await cancelLeaveRequest.mutateAsync(request.id);
      toast.info(`Leave request ${request.id} cancelled`);
      setSelectedLeaveRequest(null);
    } catch (error) {
      toast.error(extract_message(error as AxiosError<ApiResponse>));
    }
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
          payslips={INITIAL_PAYSLIPS}
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

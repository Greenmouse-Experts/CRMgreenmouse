import type {
  LeaveRequest as HRLeaveRequest,
  LeaveStatus as HRLeaveStatus,
} from "@/routes/hr/leave/-components/types";
import type {
  LeaveRequest,
  LeaveStatus,
  Payslip,
  SelfServiceSummary,
} from "./types";

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);

export const formatDate = (value: string) =>
  value
    ? new Date(value).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

export const ENROLLED_TRAINING_COURSES = [
  "Advanced Excel for Finance",
  "Customer Service Fundamentals",
  "HR Analytics Basics",
  "Payroll Compliance",
];

export const INITIAL_PAYSLIPS: Payslip[] = [
  // {
  //   id: "PS-459",
  //   month: "Sep 2026",
  //   gross: 385000,
  //   deductions: 12380,
  //   netPay: 361620,
  //   status: "Paid",
  //   bank: "GTBank ****4521",
  // },
  // {
  //   id: "PS-460",
  //   month: "Oct 2026",
  //   gross: 390000,
  //   deductions: 11820,
  //   netPay: 378180,
  //   status: "Paid",
  //   bank: "GTBank ****4521",
  // },
  // {
  //   id: "PS-461",
  //   month: "Nov 2026",
  //   gross: 410000,
  //   deductions: 11290,
  //   netPay: 398710,
  //   status: "Ready",
  //   bank: "GTBank ****4521",
  // },
];

const HR_STATUS_TO_SELF_SERVICE: Record<HRLeaveStatus, LeaveStatus> = {
  Approved: "Approved",
  Rejected: "Rejected",
  Cancelled: "Cancelled",
  Submitted: "Submitted",
  "Pending Manager Approval": "Pending",
  "Pending HR Approval": "Pending",
};

/** Map a management-page leave request onto the self-service leave shape. */
export const mapSelfServiceLeaveRequest = (
  request: HRLeaveRequest,
): LeaveRequest => ({
  id: request.id,
  employee: request.emp || "—",
  type: request.type,
  startDate: request.startDate ?? request.from,
  endDate: request.endDate ?? request.to,
  days: request.days,
  status: HR_STATUS_TO_SELF_SERVICE[request.status],
  reason: request.reason ?? "",
});

export const getSelfServiceSummary = (
  requests: LeaveRequest[],
  payslips: Payslip[],
  annualLeaveEntitlement?: number,
): SelfServiceSummary => {
  const approvedAnnualLeaveDays = requests
    .filter(
      (request) => request.status === "Approved" && request.type === "Annual",
    )
    .reduce((sum, request) => sum + request.days, 0);

  return {
    pendingLeave: requests.filter((request) => request.status === "Pending")
      .length,
    leaveBalance: annualLeaveEntitlement
      ? Math.max(0, annualLeaveEntitlement - approvedAnnualLeaveDays)
      : 0,
    readyPayslips: payslips.filter((payslip) => payslip.status === "Ready")
      .length,
    enrolledCourses: ENROLLED_TRAINING_COURSES.length,
  };
};

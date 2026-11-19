export type LeaveStatus =
  | "Pending"
  | "Submitted"
  | "Approved"
  | "Rejected"
  | "Cancelled";

export type PayslipStatus = "Ready" | "Paid" | "On hold";

export interface LeaveRequest {
  id: string;
  employee: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  status: LeaveStatus;
  reason: string;
}

export interface Payslip {
  id: string;
  month: string;
  gross: number;
  deductions: number;
  netPay: number;
  status: PayslipStatus;
  bank: string;
}

export interface SelfServiceSummary {
  pendingLeave: number;
  leaveBalance: number;
  readyPayslips: number;
  enrolledCourses: number;
}

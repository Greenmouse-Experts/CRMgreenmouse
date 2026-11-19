import type {
  LeaveRequest,
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

export const TOTAL_ANNUAL_LEAVE_DAYS = 21;

export const ENROLLED_TRAINING_COURSES = [
  "Advanced Excel for Finance",
  "Customer Service Fundamentals",
  "HR Analytics Basics",
  "Payroll Compliance",
];

export const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: "LR-301",
    employee: "Kelechi Nwosu",
    type: "Annual Leave",
    startDate: "2026-11-03",
    endDate: "2026-11-05",
    days: 3,
    status: "Approved",
    reason: "Family occasion",
  },
  {
    id: "LR-302",
    employee: "Kelechi Nwosu",
    type: "Sick Leave",
    startDate: "2026-11-09",
    endDate: "2026-11-09",
    days: 1,
    status: "Pending",
    reason: "Personal health",
  },
  {
    id: "LR-303",
    employee: "Kelechi Nwosu",
    type: "Unpaid Leave",
    startDate: "2026-12-21",
    endDate: "2026-12-26",
    days: 6,
    status: "Rejected",
    reason: "Extended relocation",
  },
];

export const INITIAL_PAYSLIPS: Payslip[] = [
  {
    id: "PS-459",
    month: "Sep 2026",
    gross: 385000,
    deductions: 12380,
    netPay: 361620,
    status: "Paid",
    bank: "GTBank ****4521",
  },
  {
    id: "PS-460",
    month: "Oct 2026",
    gross: 390000,
    deductions: 11820,
    netPay: 378180,
    status: "Paid",
    bank: "GTBank ****4521",
  },
  {
    id: "PS-461",
    month: "Nov 2026",
    gross: 410000,
    deductions: 11290,
    netPay: 398710,
    status: "Ready",
    bank: "GTBank ****4521",
  },
];

export const getSelfServiceSummary = (
  requests: LeaveRequest[],
  payslips: Payslip[],
): SelfServiceSummary => {
  const approvedAnnualLeaveDays = requests
    .filter((request) => request.status === "Approved" && request.type === "Annual Leave")
    .reduce((sum, request) => sum + request.days, 0);

  return {
    pendingLeave: requests.filter((request) => request.status === "Pending")
      .length,
    leaveBalance: Math.max(
      0,
      TOTAL_ANNUAL_LEAVE_DAYS - approvedAnnualLeaveDays,
    ),
    readyPayslips: payslips.filter((payslip) => payslip.status === "Ready")
      .length,
    enrolledCourses: ENROLLED_TRAINING_COURSES.length,
  };
};

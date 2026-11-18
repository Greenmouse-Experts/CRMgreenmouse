export type PayrollCycle = "Monthly" | "Bi-weekly" | "Weekly";

export type PayrollRunStatus =
  | "Draft"
  | "Pending Approval"
  | "Approved"
  | "Paid"
  | "Cancelled";

export interface PayrollRun {
  id: string;
  period: string;
  cycle: PayrollCycle;
  payDate: string;
  employees: number;
  gross: number;
  deductions: number;
  net: number;
  status: PayrollRunStatus;
  preparedBy: string;
  notes?: string;
}

export type PayslipStatus = "Ready" | "On hold" | "Paid";

export interface Payslip {
  id: string;
  employee: string;
  department: string;
  role: string;
  baseSalary: number;
  allowances: number;
  overtime: number;
  bonus: number;
  gross: number;
  tax: number;
  pension: number;
  loan: number;
  netPay: number;
  status: PayslipStatus;
  bank: string;
  accountMasked: string;
}

export interface PayrollPolicy {
  name: string;
  rate: string;
  basis: "Statutory" | "Company";
  description: string;
  color: string;
}

export interface NewPayrollRunForm {
  period: string;
  cycle: PayrollCycle;
  payDate: string;
  scope: string;
  notes: string;
}

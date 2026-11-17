export type LeaveType =
  | "Annual"
  | "Sick"
  | "Maternity"
  | "Paternity"
  | "Compassionate"
  | "Study"
  | "Unpaid";

export type LeaveStatus =
  | "Submitted"
  | "Pending Manager Approval"
  | "Pending HR Approval"
  | "Approved"
  | "Rejected"
  | "Cancelled";

export interface LeaveRequest {
  id: string;
  emp: string;
  type: LeaveType;
  from: string;
  to: string;
  days: number;
  status: LeaveStatus;
  reason?: string;
  cover?: string;
  phone?: string;
  address?: string;
  half?: "No" | "First half" | "Second half";
}

export interface LeaveBalanceSummary {
  annualEntitlement: number;
  used: number;
  pendingReservation: number;
  available: number;
}

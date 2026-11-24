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
  /** ISO start/end dates sent to the backend with the create-request payload. */
  startDate?: string;
  endDate?: string;
  /** ID of the covering colleague (the backend's `coveringEmployeeId`). */
  coverId?: string;
}

export interface LeaveTypeSummary {
  type: LeaveType;
  entitlement: string;
  description: string;
  color: string;
  entitlementDays?: number;
  code?: string;
  name?: string;
  isPaid?: boolean;
  evidenceAlwaysRequired?: boolean;
  requiresEvidenceOverDays?: number;
  isActive?: boolean;
  year?: number;
}

export interface LeaveBalanceSummary {
  type?: LeaveType;
  annualEntitlement?: number;
  used?: number;
  pendingReservation?: number;
  available?: number;
}

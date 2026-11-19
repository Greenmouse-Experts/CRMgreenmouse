export type OffboardingStep =
  | "Resignation"
  | "Acceptance"
  | "Handover"
  | "Asset return"
  | "Clearance"
  | "Final settlement"
  | "Access revoked"
  | "Exit interview";

export type ClearanceStatus =
  | "Pending"
  | "In Progress"
  | "Completed"
  | "Scheduled"
  | "Waived";

export type ClearanceDepartment =
  | "IT"
  | "Finance"
  | "HR"
  | "Manager"
  | "Operations"
  | "Admin";

export interface ClearanceItem {
  id: string;
  caseId: string;
  department: ClearanceDepartment;
  item: string;
  owner: string;
  status: ClearanceStatus;
  dueDate?: string;
  notes?: string;
}

export type SeparationType =
  | "Resignation"
  | "End of Contract"
  | "Redundancy"
  | "Termination"
  | "Retirement";

export type OffboardingStatus =
  | "Notice period"
  | "Clearance in progress"
  | "Settlement ready"
  | "Completed";

export interface OffboardingCase {
  id: string;
  employee: string;
  employeeId: string;
  department: string;
  role: string;
  separationType: SeparationType;
  resignationDate: string;
  lastWorkingDay: string;
  currentStep: OffboardingStep;
  status: OffboardingStatus;
  handoverTo: string;
  severancePay?: number;
  notes?: string;
}

export interface InitiateOffboardingPayload {
  employee: string;
  separationType: SeparationType;
  resignationDate: string;
  lastWorkingDay: string;
  handoverTo: string;
  notes?: string;
}

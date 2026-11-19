export type EmploymentStatus =
  | "Active"
  | "Probation"
  | "Notice Period"
  | "Suspended"
  | string;

export type EmploymentType =
  | "Full-time"
  | "Contract"
  | "Part-time"
  | "Intern"
  | string;

export interface Employee {
  id: string;
  name: string;
  email: string;
  title: string;
  dept: string;
  location: string;
  type: EmploymentType;
  status: EmploymentStatus;
  onLeave: boolean;
  manager?: string;
  start?: string;
  salary?: number;
  grade?: string;
  phone?: string;
  birthday?: string;
}

export type StatusFilterOption =
  | "All"
  | "Active"
  | "Probation"
  | "Notice Period"
  | "Suspended";

export type ViewMode = "list" | "grid";

/** Fields accepted by POST /v1/staffs. */
export interface CreateStaffInput {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

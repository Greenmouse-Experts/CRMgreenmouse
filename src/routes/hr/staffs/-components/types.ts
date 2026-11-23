export type EmploymentStatus =
  | "Active"
  | "Probation"
  | "Notice Period"
  | "Suspended"
  | "Draft"
  | string;

export type EmploymentType =
  | "Full-time"
  | "Contract"
  | "Part-time"
  | "Intern"
  | string;

export interface Employee {
  id: string;
  employeeNumber?: string;
  staffId?: string;
  name: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  title: string;
  dept: string;
  location: string;
  type: EmploymentType;
  status: EmploymentStatus;
  isDraft?: boolean;
  onLeave: boolean;
  manager?: string;
  start?: string;
  salary?: number;
  grade?: string;
  birthday?: string;
}

export type StatusFilterOption =
  | "All"
  | "Active"
  | "Probation"
  | "Notice Period"
  | "Suspended";

export type ViewMode = "list" | "grid";

/** Fields accepted for employee creation. */
export interface CreateStaffInput {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

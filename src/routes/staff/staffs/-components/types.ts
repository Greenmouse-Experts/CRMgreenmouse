export type EmploymentStatus =
  | "Active"
  | "Preboarding"
  | "Probation"
  | "Notice Period"
  | "Suspended"
  | "Draft"
  | "Exited"
  | string;

export type EmploymentType =
  | "Full-time"
  | "Contract"
  | "Part-time"
  | "Intern"
  | string;

export interface Colleague {
  id: string;
  employeeNumber?: string;
  staffId?: string;
  name: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  profilePhotoUrl?: string | null;
  title: string;
  dept: string;
  location: string;
  type: EmploymentType;
  status: EmploymentStatus;
  hasStatus?: boolean;
  isDraft?: boolean;
  onLeave: boolean;
}

export type StatusFilterOption =
  | "All"
  | "Active"
  | "Preboarding"
  | "Notice Period";

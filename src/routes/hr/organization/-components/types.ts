export type DepartmentStatus = "Active" | "Inactive";

export interface Department {
  id: string;
  code: string;
  name: string;
  status: DepartmentStatus | string;
  staffCount?: number;
  count?: number;
  headEmployeeId?: string | null;
  head?: string;
  headName?: string | null;
  parentDepartmentName?: string | null;
  parent?: string;
  costCentre?: string | null;
  primaryLocation?: string | null;
  location?: string;
  description?: string | null;
  [key: string]: any;
}

export interface Position {
  id: string;
  title: string;
  departmentId?: string;
  dept: string;
  grade: string;
  approved: number;
  filled: number;
}

export interface OrgLeader {
  name: string;
  title: string;
  avatar?: string;
  email?: string;
}

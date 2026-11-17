export type DepartmentStatus = "Active" | "Inactive";

export interface Department {
  id: string;
  code: string;
  name: string;
  head: string;
  count: number;
  status: DepartmentStatus;
  parent?: string;
  costCentre?: string;
  location?: string;
  description?: string;
}

export interface Position {
  id: string;
  title: string;
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

export type DepartmentTag = "HR" | "IT" | "Manager" | "Payroll";

export interface ChecklistItem {
  id: string;
  dept: DepartmentTag;
  text: string;
  completed: boolean;
  /** ISO timestamp the task was created at, if the API provides it. */
  createdAt?: string | null;
  /** ISO timestamp the task was completed at, if the API provides it. */
  completedAt?: string | null;
}

export interface OnboardingHire {
  id: string;
  name: string;
  role: string;
  start: string;
  progress: number;
  email?: string;
  dept?: string;
  probationStep: number;
}

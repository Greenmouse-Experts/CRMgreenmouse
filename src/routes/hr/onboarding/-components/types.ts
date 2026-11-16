export type DepartmentTag = "HR" | "IT" | "Manager" | "Payroll";

export interface ChecklistItem {
  id: string;
  dept: DepartmentTag;
  text: string;
  completed: boolean;
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

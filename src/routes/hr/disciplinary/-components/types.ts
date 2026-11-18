export type CaseCategory =
  | "Attendance"
  | "Policy breach"
  | "Misconduct"
  | "Performance"
  | "Harassment"
  | "Fraud";

export type CaseSeverity = "Minor" | "Major" | "Gross misconduct";

export type WorkflowStep =
  | "Report"
  | "Investigation"
  | "Employee response"
  | "Hearing"
  | "Decision"
  | "Appeal";

export type CaseStatus =
  | "Under Review"
  | "Investigation"
  | "Hearing Scheduled"
  | "Decision Pending"
  | "Closed"
  | "Appealed";

export interface DisciplinaryCase {
  id: string;
  employee: string;
  department: string;
  category: CaseCategory;
  severity: CaseSeverity;
  openedDate: string;
  status: CaseStatus;
  currentStep: WorkflowStep;
  reporter: string;
  investigator: string;
  description: string;
  witnesses?: string;
  interimAction?: string;
  dueDate?: string;
}

export interface CreateCasePayload {
  emp: string;
  category: CaseCategory;
  date: string;
  severity: CaseSeverity;
  reporter: string;
  investigator: string;
  desc: string;
  witnesses?: string;
  interim?: string;
  conf: boolean;
}

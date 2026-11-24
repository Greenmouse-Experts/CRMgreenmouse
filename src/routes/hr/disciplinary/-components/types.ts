export type CaseCategory =
  | "Attendance"
  | "Policy breach"
  | "Misconduct"
  | "Performance"
  | "Harassment"
  | "Fraud"
  | (string & {});

export type CaseSeverity =
  | "Minor"
  | "Major"
  | "Gross misconduct"
  | (string & {});

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
  caseCode: string;
  employee: string;
  department: string;
  category: CaseCategory;
  severity: CaseSeverity;
  openedDate: string;
  incidentDate?: string;
  status: CaseStatus;
  currentStep: WorkflowStep;
  reporter: string;
  investigator: string;
  description: string;
  witnesses?: string;
  interimAction?: string;
  outcome?: string;
  dueDate?: string;
}

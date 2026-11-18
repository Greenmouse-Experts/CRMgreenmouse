import type {
  CaseCategory,
  CaseSeverity,
  DisciplinaryCase,
  WorkflowStep,
} from "./types";

export const WORKFLOW_STEPS: WorkflowStep[] = [
  "Report",
  "Investigation",
  "Employee response",
  "Hearing",
  "Decision",
  "Appeal",
];

export const CASE_CATEGORIES: CaseCategory[] = [
  "Attendance",
  "Policy breach",
  "Misconduct",
  "Performance",
  "Harassment",
  "Fraud",
];

export const CASE_SEVERITIES: CaseSeverity[] = [
  "Minor",
  "Major",
  "Gross misconduct",
];

export const INVESTIGATORS = [
  "Grace Danjuma — HR",
  "Adaeze Ike",
  "External investigator",
];

export const EMPLOYEES_LIST = [
  "Zainab Musa",
  "Emeka Uche",
  "Tunde Adeyemi",
  "Folake Adeleke",
  "Babajide Sanwo",
  "Chioma Okonkwo",
  "Amara Okafor",
  "David Adeleke",
  "Ibrahim Bello",
  "Samuel Adekunle",
];

export const INTERIM_ACTIONS = [
  "None",
  "Paid suspension pending investigation",
  "Temporary reassignment",
];

export const INITIAL_DISCIPLINARY_CASES: DisciplinaryCase[] = [
  {
    id: "DC-014",
    employee: "Zainab Musa",
    department: "Sales",
    category: "Policy breach",
    severity: "Major",
    openedDate: "Oct 30",
    status: "Under Review",
    currentStep: "Employee response",
    reporter: "Tunde Adeyemi",
    investigator: "Grace Danjuma — HR",
    description: "Repeated sharing of internal product roadmap document with unvetted third parties without prior authorization.",
    witnesses: "David Adeleke, Folake Adeleke",
    interimAction: "None",
    dueDate: "2026-11-24",
  },
  {
    id: "DC-013",
    employee: "Emeka Uche",
    department: "Engineering",
    category: "Attendance",
    severity: "Minor",
    openedDate: "Oct 02",
    status: "Closed",
    currentStep: "Decision",
    reporter: "Samuel Adekunle",
    investigator: "Adaeze Ike",
    description: "Consecutive unexcused absences spanning 4 business days during sprint release milestone.",
    witnesses: "Babajide Sanwo",
    interimAction: "None",
    dueDate: "2026-10-16",
  },
  {
    id: "DC-012",
    employee: "Babajide Sanwo",
    department: "Finance",
    category: "Misconduct",
    severity: "Minor",
    openedDate: "Sep 18",
    status: "Closed",
    currentStep: "Decision",
    reporter: "Grace Danjuma",
    investigator: "Grace Danjuma — HR",
    description: "Unprofessional verbal conduct toward customer support associate during quarterly reconciliation meeting.",
    witnesses: "Chioma Okonkwo",
    interimAction: "None",
    dueDate: "2026-09-30",
  },
];

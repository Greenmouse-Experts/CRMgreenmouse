import type { WorkflowStep } from "./types";

export const WORKFLOW_STEPS: WorkflowStep[] = [
  "Report",
  "Investigation",
  "Employee response",
  "Hearing",
  "Decision",
  "Appeal",
];

export const DEFAULT_CASE_CATEGORIES: string[] = [
  "Attendance",
  "Policy breach",
  "Misconduct",
  "Performance",
  "Harassment",
  "Fraud",
];

export const DEFAULT_CASE_SEVERITIES: string[] = [
  "Minor",
  "Major",
  "Gross misconduct",
];

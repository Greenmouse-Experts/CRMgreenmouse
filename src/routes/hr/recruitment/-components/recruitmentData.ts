import type { PipelineStage } from "./types";

export const PIPELINE_STAGES: PipelineStage[] = [
  "Applied",
  "Screening",
  "Shortlisted",
  "Interview",
  "Assessment",
  "Offer",
  "Hired",
];

export const HR_DEPARTMENTS = [
  "Sales",
  "Engineering",
  "Finance",
  "Operations",
  "Marketing",
  "Customer Success",
  "HR",
];

export const HR_GRADES = ["G1", "G2", "G3", "G4", "G5", "G6", "G7"];

export const HR_EMPLOYMENT_TYPES = [
  "Full-time",
  "Contract",
  "Part-time",
  "Intern",
];

export const HR_LOCATIONS = ["Lagos", "Abuja", "Accra", "Remote"];

export const REASON_OPTIONS = [
  "New position",
  "Replacement",
  "Expansion",
  "Temporary cover",
];

export const APPROVER_OPTIONS = [
  "Head of HR",
  "Department Head",
  "CFO",
];

export const CHANNEL_OPTIONS = [
  "Careers page",
  "LinkedIn",
  "Internal only",
  "All channels",
];

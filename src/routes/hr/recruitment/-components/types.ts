import type { RecruitmentVacancy } from "@/api/recruitmentApi";

export type PipelineStage =
  | "Applied"
  | "Screening"
  | "Shortlisted"
  | "Interview"
  | "Assessment"
  | "Offer"
  | "Hired";

export type VacancyStatus =
  | "Draft"
  | "Pending Approval"
  | "Approved"
  | "Published"
  | "Unpublished"
  | "Rejected"
  | "Closed"
  | "Archived";

export interface Candidate {
  id: string;
  name: string;
  role: string;
  stage: PipelineStage;
  score: number;
  email?: string;
  phone?: string;
  appliedDate?: string;
  experience?: string;
  notes?: string;
  resumeUrl?: string;
  source?: string;
}

export interface Vacancy {
  id: string;
  vacancyNumber?: string;
  title: string;
  dept: string;
  departmentId?: string;
  openings: number;
  applicants: number;
  closes: string;
  closingDate?: string;
  status: VacancyStatus;
  rawStatus?: string;
  grade?: string;
  type?: string;
  location?: string;
  reason?: string;
  budget?: string;
  desc?: string;
  manager?: string;
  hiringManagerId?: string | null;
  approver?: string;
  approverId?: string | null;
  channels?: string;
  salaryMinimum?: number | null;
  salaryMaximum?: number | null;
  salaryCurrency?: string | null;
  salaryPeriod?: string | null;
  rejectionReason?: string | null;
  decidedBy?: string | null;
  decidedAt?: string | null;
  archivedAt?: string | null;
  archivedBy?: string | null;
  archiveReason?: string | null;
  createdAt?: string;
  updatedAt?: string;
  raw?: RecruitmentVacancy;
}

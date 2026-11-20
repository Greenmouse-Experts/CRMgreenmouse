export type PipelineStage =
  | "Applied"
  | "Screening"
  | "Shortlisted"
  | "Interview"
  | "Assessment"
  | "Offer"
  | "Hired";

export type VacancyStatus =
  | "Published"
  | "Pending Approval"
  | "Draft"
  | "Closed";

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
}

export interface Vacancy {
  id: string;
  title: string;
  dept: string;
  departmentId?: string;
  openings: number;
  applicants: number;
  closes: string;
  closingDate?: string;
  status: VacancyStatus;
  grade?: string;
  type?: string;
  location?: string;
  reason?: string;
  budget?: string;
  desc?: string;
  manager?: string;
  approver?: string;
  approverId?: string;
  channels?: string;
}

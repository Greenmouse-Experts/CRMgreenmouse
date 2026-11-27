import type {
  RecruitmentApplication,
  RecruitmentVacancy,
} from "@/api/recruitmentApi";
import type {
  Candidate,
  PipelineStage,
  Vacancy,
  VacancyStatus,
} from "./types";

const STATUS_MAP: Record<string, VacancyStatus> = {
  draft: "Draft",
  pending: "Pending Approval",
  pending_approval: "Pending Approval",
  approved: "Approved",
  published: "Published",
  active: "Published",
  unpublished: "Unpublished",
  rejected: "Rejected",
  closed: "Closed",
  cancelled: "Closed",
  archived: "Archived",
};

const STAGE_MAP: Record<string, PipelineStage> = {
  applied: "Applied",
  screening: "Screening",
  shortlisted: "Shortlisted",
  interview: "Interview",
  assessment: "Assessment",
  offer: "Offer",
  hired: "Hired",
};

export function mapBackendVacancyStatus(status?: string | null): VacancyStatus {
  const key = String(status ?? "")
    .trim()
    .toLowerCase();
  return STATUS_MAP[key] ?? "Draft";
}

export function formatVacancyDate(value?: string | null): string {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatVacancySalaryRange({
  salaryMinimum,
  salaryMaximum,
  salaryCurrency,
  salaryPeriod,
}: {
  salaryMinimum?: number | null;
  salaryMaximum?: number | null;
  salaryCurrency?: string | null;
  salaryPeriod?: string | null;
}): string {
  const hasMin = typeof salaryMinimum === "number" && Number.isFinite(salaryMinimum);
  const hasMax = typeof salaryMaximum === "number" && Number.isFinite(salaryMaximum);
  if (!hasMin && !hasMax) return "Not specified";

  const currency = (salaryCurrency || "NGN").toUpperCase();
  const fmt = (n: number) => `${currency} ${n.toLocaleString()}`;

  const range =
    hasMin && hasMax
      ? `${fmt(salaryMinimum)} – ${fmt(salaryMaximum)}`
      : hasMin
        ? `From ${fmt(salaryMinimum)}`
        : `Up to ${fmt(salaryMaximum as number)}`;

  return salaryPeriod ? `${range} / ${salaryPeriod}` : range;
}

export function toUiVacancy(
  raw: RecruitmentVacancy,
  nameLookup?: Record<string, string>,
): Vacancy {
  const status = mapBackendVacancyStatus(raw.status);
  const salaryBudget = formatVacancySalaryRange({
    salaryMinimum: raw.salaryMinimum,
    salaryMaximum: raw.salaryMaximum,
    salaryCurrency: raw.salaryCurrency,
    salaryPeriod: raw.salaryPeriod,
  });

  return {
    id: raw.id,
    vacancyNumber: raw.vacancyNumber || undefined,
    title: raw.jobTitle ?? raw.title ?? "Untitled vacancy",
    dept: raw.departmentName ?? raw.department ?? "—",
    departmentId: raw.departmentId,
    openings: raw.openings ?? 1,
    applicants:
      raw.applicantCount ?? raw.applicants ?? raw.applicationCount ?? 0,
    closes: raw.closingDate
      ? new Date(raw.closingDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      : "—",
    closingDate: raw.closingDate,
    status,
    rawStatus: raw.status,
    grade: raw.gradeName ?? raw.grade ?? undefined,
    type: raw.employmentType,
    location: raw.workLocation ?? raw.location ?? undefined,
    reason: raw.reasonForHire,
    budget:
      raw.budget ??
      (salaryBudget !== "Not specified" ? salaryBudget : undefined),
    desc: raw.jobDescription,
    manager: raw.hiringManagerId
      ? nameLookup?.[raw.hiringManagerId] ?? raw.hiringManagerId
      : undefined,
    hiringManagerId: raw.hiringManagerId,
    approver: raw.approverId
      ? nameLookup?.[raw.approverId] ?? raw.approverId
      : undefined,
    approverId: raw.approverId,
    channels: raw.publishingChannel ?? undefined,
    salaryMinimum: raw.salaryMinimum,
    salaryMaximum: raw.salaryMaximum,
    salaryCurrency: raw.salaryCurrency,
    salaryPeriod: raw.salaryPeriod,
    rejectionReason: raw.rejectionReason,
    decidedBy: raw.decidedBy,
    decidedAt: raw.decidedAt,
    archivedAt: raw.archivedAt,
    archivedBy: raw.archivedBy,
    archiveReason: raw.archiveReason,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    raw,
  };
}

export function toUiCandidate(raw: RecruitmentApplication): Candidate {
  const stageKey = (
    raw.stage ??
    raw.applicationStage ??
    "applied"
  ).toLowerCase();
  return {
    id: raw.id,
    name:
      raw.name ||
      [raw.firstName, raw.lastName].filter(Boolean).join(" ") ||
      "Candidate",
    role: raw.vacancyTitle ?? raw.jobTitle ?? "Applicant",
    stage: STAGE_MAP[stageKey] ?? "Applied",
    score: raw.score ?? 0,
    email: raw.email,
    phone: raw.phone,
    appliedDate: raw.appliedAt ?? raw.createdAt,
    notes: raw.notes,
    resumeUrl: raw.resumeUrl,
    source: raw.source,
  };
}

export function getVacancyStatusBadgeClass(status: VacancyStatus): string {
  switch (status) {
    case "Published":
      return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    case "Approved":
      return "bg-sky-50 text-sky-700 border border-sky-200";
    case "Pending Approval":
      return "bg-amber-50 text-amber-700 border border-amber-200";
    case "Unpublished":
      return "bg-purple-50 text-purple-700 border border-purple-200";
    case "Rejected":
    case "Closed":
      return "bg-rose-50 text-rose-700 border border-rose-200";
    case "Archived":
      return "bg-neutral/10 text-base-content/60 border border-base-300";
    case "Draft":
    default:
      return "bg-slate-100 text-slate-700 border border-slate-200";
  }
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "./simpleApi";

/** Loose shapes: the recruitment API returns flat objects / arrays directly. */
export interface RecruitmentDashboard {
  openVacancies?: number;
  applicants?: number;
  interviewsThisWeek?: number;
  offersOut?: number;
  pipeline?: Array<{ stage?: string; count?: number; [key: string]: any }>;
  vacancies?: any[];
  [key: string]: any;
}

export interface RecruitmentVacancy {
  id: string;
  tenantId?: string;
  vacancyNumber?: string;
  jobTitle?: string;
  title?: string;
  departmentId?: string;
  department?: string;
  departmentName?: string;
  gradeId?: string | null;
  gradeName?: string | null;
  openings?: number;
  applicantCount?: number;
  applicationCount?: number;
  applicants?: number;
  status?: string;
  closingDate?: string;
  employmentType?: string;
  workLocation?: string | null;
  workplaceType?: string | null;
  locationCity?: string | null;
  locationState?: string | null;
  locationCountryCode?: string | null;
  jobDescription?: string;
  reasonForHire?: string;
  salaryMinimum?: number | null;
  salaryMaximum?: number | null;
  salaryCurrency?: string | null;
  salaryPeriod?: "hourly" | "weekly" | "monthly" | "annual" | string | null;
  hiringManagerId?: string | null;
  approverId?: string | null;
  publishingChannel?: string | null;
  rejectionReason?: string | null;
  decidedBy?: string | null;
  decidedAt?: string | null;
  archivedAt?: string | null;
  archivedBy?: string | null;
  archiveReason?: string | null;
  createdBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
  managedByOwner?: boolean;
  [key: string]: any;
}

export interface RecruitmentApplication {
  id: string;
  stage?: string;
  applicationStage?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  source?: string;
  resumeUrl?: string;
  notes?: string;
  score?: number;
  vacancyId?: string;
  vacancyTitle?: string;
  jobTitle?: string;
  appliedAt?: string;
  createdAt?: string;
  [key: string]: any;
}

export interface RecruitmentOption {
  id: string;
  name: string;
  email?: string;
  isOwner?: boolean;
  [key: string]: any;
}

/**
 * Verified against the live backend (2026-11-23):
 * - Required: jobTitle (≤ 160), departmentId (UUID), openings (int 1–1000),
 *   employmentType (≤ 80), reasonForHire (≤ 120), jobDescription (≤ 20000),
 *   closingDate (ISO 8601), hiringManagerId (UUID), approverId (UUID).
 * - Optional: gradeId (UUID), workLocation, salaryMinimum/salaryMaximum,
 *   salaryCurrency, salaryPeriod (hourly/weekly/monthly/annual),
 *   publishingChannel, saveAsDraft.
 * - `grade`, `location`, `budget`, `channels`, `type`, `reason` are rejected.
 */
export interface CreateVacancyPayload {
  jobTitle: string;
  departmentId: string;
  openings: number;
  employmentType: string;
  reasonForHire: string;
  jobDescription: string;
  closingDate: string;
  hiringManagerId: string;
  approverId: string;
  gradeId?: string;
  workLocation?: string;
  salaryMinimum?: number;
  salaryMaximum?: number;
  salaryCurrency?: string;
  salaryPeriod?: "hourly" | "weekly" | "monthly" | "annual";
  publishingChannel?: string;
  saveAsDraft?: boolean;
}

export interface VacancyQueryParams {
  sort?: string;
  order?: "asc" | "desc";
}

export interface CreateApplicationPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  source?: string;
  resumeUrl?: string;
  [key: string]: any;
}

export interface CreateInterviewPayload {
  applicationId: string;
  interviewerId: string;
  scheduledAt: string;
  [key: string]: any;
}

export interface CreateOfferPayload {
  applicationId: string;
  salaryAmount: number;
  startDate: string;
  expiresAt: string;
  [key: string]: any;
}

const unwrapList = <T>(data: any, keys: string[]): T[] => {
  if (Array.isArray(data)) return data as T[];
  if (Array.isArray(data?.data)) return data.data as T[];
  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key] as T[];
  }
  return [];
};

const queryRoot = ["recruitment"] as const;

/* -------------------------------------------------------------------------- */
/* Queries                                                                     */
/* -------------------------------------------------------------------------- */

export const useRecruitmentDashboard = () =>
  useQuery<RecruitmentDashboard>({
    queryKey: [...queryRoot, "dashboard"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/recruitment/dashboard");
      return (data?.data ?? data) as RecruitmentDashboard;
    },
  });

export const useRecruitmentVacancies = (params?: VacancyQueryParams) =>
  useQuery<RecruitmentVacancy[]>({
    queryKey: [...queryRoot, "vacancies", params],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/recruitment/vacancies", {
        params,
      });
      return unwrapList<RecruitmentVacancy>(data, ["vacancies"]);
    },
  });

export const useRecruitmentVacancy = (id?: string) =>
  useQuery<RecruitmentVacancy>({
    queryKey: [...queryRoot, "vacancies", "detail", id],
    queryFn: async () => {
      if (!id) throw new Error("Vacancy ID required");
      const { data } = await apiClient.get<any>(`/recruitment/vacancies/${id}`);
      return (data?.data ?? data) as RecruitmentVacancy;
    },
    enabled: Boolean(id),
  });

export const useRecruitmentApplications = (params?: {
  vacancyId?: string;
  stage?: string;
}) =>
  useQuery<RecruitmentApplication[]>({
    queryKey: [...queryRoot, "applications", params],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/recruitment/applications", {
        params,
      });
      return unwrapList<RecruitmentApplication>(data, ["applications"]);
    },
  });

export const useRecruitmentInterviews = () =>
  useQuery<any[]>({
    queryKey: [...queryRoot, "interviews"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/recruitment/interviews");
      return unwrapList<any>(data, ["interviews"]);
    },
  });

export const useRecruitmentOffers = () =>
  useQuery<any[]>({
    queryKey: [...queryRoot, "offers"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/recruitment/offers");
      return unwrapList<any>(data, ["offers"]);
    },
  });

export const useRecruitmentOptions = (type: string) =>
  useQuery<RecruitmentOption[]>({
    queryKey: [...queryRoot, "options", type],
    queryFn: async () => {
      const { data } = await apiClient.get<any>(`/recruitment/options/${type}`);
      return unwrapList<RecruitmentOption>(data, ["options"]);
    },
    enabled: Boolean(type),
  });

export const useRecruitmentApprovers = () =>
  useQuery<RecruitmentOption[]>({
    queryKey: [...queryRoot, "approvers"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/recruitment/approvers");
      return unwrapList<RecruitmentOption>(data, ["approvers"]);
    },
  });

/* -------------------------------------------------------------------------- */
/* Mutations                                                                   */
/* -------------------------------------------------------------------------- */

const useInvalidateRecruitment = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryRoot });
};

export const useCreateVacancy = () => {
  const invalidate = useInvalidateRecruitment();
  return useMutation({
    mutationFn: async (payload: CreateVacancyPayload) => {
      const { data } = await apiClient.post<any>(
        "/recruitment/vacancies",
        payload,
      );
      return data?.data ?? data;
    },
    onSuccess: invalidate,
  });
};

export const useUpdateVacancy = () => {
  const invalidate = useInvalidateRecruitment();
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: { id: string } & Partial<CreateVacancyPayload>) => {
      const { data } = await apiClient.patch<any>(
        `/recruitment/vacancies/${id}`,
        payload,
      );
      return data?.data ?? data;
    },
    onSuccess: invalidate,
  });
};

export const useSubmitVacancy = () => {
  const invalidate = useInvalidateRecruitment();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.post<any>(
        `/recruitment/vacancies/${id}/submit`,
      );
      return data?.data ?? data;
    },
    onSuccess: invalidate,
  });
};

export const useDecideVacancy = () => {
  const invalidate = useInvalidateRecruitment();
  return useMutation({
    mutationFn: async ({
      id,
      decision,
      reason,
    }: {
      id: string;
      decision: "approve" | "reject";
      reason?: string;
    }) => {
      const { data } = await apiClient.patch<any>(
        `/recruitment/vacancies/${id}/decision`,
        {
          decision,
          ...(reason?.trim() ? { reason: reason.trim() } : {}),
        },
      );
      return data?.data ?? data;
    },
    onSuccess: invalidate,
  });
};

export const usePublishVacancy = () => {
  const invalidate = useInvalidateRecruitment();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.patch<any>(
        `/recruitment/vacancies/${id}/publish`,
      );
      return data?.data ?? data;
    },
    onSuccess: invalidate,
  });
};

export const useUnpublishVacancy = () => {
  const invalidate = useInvalidateRecruitment();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const { data } = await apiClient.patch<any>(
        `/recruitment/vacancies/${id}/unpublish`,
        reason?.trim() ? { reason: reason.trim() } : {},
      );
      return data?.data ?? data;
    },
    onSuccess: invalidate,
  });
};

export const useCloseVacancy = () => {
  const invalidate = useInvalidateRecruitment();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const { data } = await apiClient.patch<any>(
        `/recruitment/vacancies/${id}/close`,
        reason?.trim() ? { reason: reason.trim() } : {},
      );
      return data?.data ?? data;
    },
    onSuccess: invalidate,
  });
};

export const useArchiveVacancy = () => {
  const invalidate = useInvalidateRecruitment();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const { data } = await apiClient.patch<any>(
        `/recruitment/vacancies/${id}/archive`,
        reason?.trim() ? { reason: reason.trim() } : {},
      );
      return data?.data ?? data;
    },
    onSuccess: invalidate,
  });
};

export const useCreateApplication = () => {
  const invalidate = useInvalidateRecruitment();
  return useMutation({
    mutationFn: async ({
      vacancyId,
      ...payload
    }: { vacancyId: string } & CreateApplicationPayload) => {
      const { data } = await apiClient.post<any>(
        `/recruitment/vacancies/${vacancyId}/applications`,
        payload,
      );
      return data?.data ?? data;
    },
    onSuccess: invalidate,
  });
};

export const useUpdateApplicationStage = () => {
  const invalidate = useInvalidateRecruitment();
  return useMutation({
    mutationFn: async ({
      id,
      stage,
      score,
      notes,
    }: {
      id: string;
      stage:
        | "applied"
        | "screening"
        | "shortlisted"
        | "interview"
        | "assessment"
        | "offer"
        | "hired"
        | "rejected"
        | "withdrawn";
      score?: number;
      notes?: string;
    }) => {
      const { data } = await apiClient.patch<any>(
        `/recruitment/applications/${id}/stage`,
        {
          stage,
          ...(score !== undefined ? { score } : {}),
          ...(notes?.trim() ? { notes: notes.trim() } : {}),
        },
      );
      return data?.data ?? data;
    },
    onSuccess: invalidate,
  });
};

export const useCreateInterview = () => {
  const invalidate = useInvalidateRecruitment();
  return useMutation({
    mutationFn: async (payload: CreateInterviewPayload) => {
      const { data } = await apiClient.post<any>(
        "/recruitment/interviews",
        payload,
      );
      return data?.data ?? data;
    },
    onSuccess: invalidate,
  });
};

export const useUpdateInterview = () => {
  const invalidate = useInvalidateRecruitment();
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: { id: string } & Record<string, any>) => {
      const { data } = await apiClient.patch<any>(
        `/recruitment/interviews/${id}`,
        payload,
      );
      return data?.data ?? data;
    },
    onSuccess: invalidate,
  });
};

export const useCancelInterview = () => {
  const invalidate = useInvalidateRecruitment();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.patch<any>(
        `/recruitment/interviews/${id}/cancel`,
      );
      return data?.data ?? data;
    },
    onSuccess: invalidate,
  });
};

export const useCreateOffer = () => {
  const invalidate = useInvalidateRecruitment();
  return useMutation({
    mutationFn: async (payload: CreateOfferPayload) => {
      const { data } = await apiClient.post<any>(
        "/recruitment/offers",
        payload,
      );
      return data?.data ?? data;
    },
    onSuccess: invalidate,
  });
};

export const useDecideOffer = () => {
  const invalidate = useInvalidateRecruitment();
  return useMutation({
    mutationFn: async ({
      id,
      decision,
    }: {
      id: string;
      decision: "approve" | "send" | "accept" | "decline";
    }) => {
      const { data } = await apiClient.patch<any>(
        `/recruitment/offers/${id}/decision`,
        { decision },
      );
      return data?.data ?? data;
    },
    onSuccess: invalidate,
  });
};

export const useConvertToEmployee = () => {
  const invalidate = useInvalidateRecruitment();
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: {
      id: string;
      startDate: string;
      contractType: string;
    }) => {
      const { data } = await apiClient.post<any>(
        `/recruitment/applications/${id}/convert`,
        payload,
      );
      return data?.data ?? data;
    },
    onSuccess: invalidate,
  });
};

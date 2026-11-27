import { useQuery } from "@tanstack/react-query";
import apiClient from "@/client/api";
import type {
  ReportItem,
  ReportChart,
} from "@/routes/hr/reports/-components/types";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface ReportQueryParams {
  months?: number;
  period?: string;
  departmentId?: string;
  department?: string;
  cycleId?: string;
}

export interface HeadcountTurnoverResponse {
  kpis: ReportItem["kpis"];
  chart: ReportChart;
  cols: string[];
  rows: (string | number)[][];
  insights: string[];
}

export interface AttendanceSummaryResponse {
  kpis: ReportItem["kpis"];
  chart: ReportChart;
  cols: string[];
  rows: (string | number)[][];
  insights: string[];
}

export interface LeaveUtilizationResponse {
  kpis: ReportItem["kpis"];
  chart: ReportChart;
  cols: string[];
  rows: (string | number)[][];
  insights: string[];
}

export interface PayrollSummaryResponse {
  kpis: ReportItem["kpis"];
  chart: ReportChart;
  cols: string[];
  rows: (string | number)[][];
  insights: string[];
}

export interface RecruitmentFunnelResponse {
  kpis: ReportItem["kpis"];
  chart: ReportChart;
  cols: string[];
  rows: (string | number)[][];
  insights: string[];
}

export interface PerformanceDistributionResponse {
  kpis: ReportItem["kpis"];
  chart: ReportChart;
  cols: string[];
  rows: (string | number)[][];
  insights: string[];
}

export interface TrainingCompletionResponse {
  kpis: ReportItem["kpis"];
  chart: ReportChart;
  cols: string[];
  rows: (string | number)[][];
  insights: string[];
}

export interface DiversityOverviewResponse {
  kpis: ReportItem["kpis"];
  chart: ReportChart;
  cols: string[];
  rows: (string | number)[][];
  insights: string[];
}

export interface ContractExpirationsResponse {
  kpis: ReportItem["kpis"];
  chart: ReportChart;
  cols: string[];
  rows: (string | number)[][];
  insights: string[];
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const getAuthConfig = async () => {
  const { get_user_value } = await import("@/store/authStore");
  const token = get_user_value()?.accessToken;
  return { headers: { Authorization: `Bearer ${token}` } };
};

const unwrap = <T>(data: any): T =>
  (data?.data?.data ?? data?.data ?? data?.payload ?? data) as T;

/* -------------------------------------------------------------------------- */
/* Query hooks                                                                */
/* -------------------------------------------------------------------------- */

export const useHeadcountTurnoverReport = (params: ReportQueryParams = {}) =>
  useQuery<HeadcountTurnoverResponse>({
    queryKey: ["reports", "headcount-turnover", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.months) searchParams.set("months", String(params.months));
      if (params.departmentId)
        searchParams.set("departmentId", params.departmentId);
      const { data } = await apiClient.get<any>(
        `/v1/reports/headcount-turnover?${searchParams.toString()}`,
        await getAuthConfig(),
      );
      return unwrap<HeadcountTurnoverResponse>(data);
    },
  });

export const useAttendanceSummaryReport = (params: ReportQueryParams = {}) =>
  useQuery<AttendanceSummaryResponse>({
    queryKey: ["reports", "attendance-summary", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.period) searchParams.set("period", params.period);
      if (params.departmentId)
        searchParams.set("departmentId", params.departmentId);
      const { data } = await apiClient.get<any>(
        `/v1/reports/attendance-summary?${searchParams.toString()}`,
        await getAuthConfig(),
      );
      return unwrap<AttendanceSummaryResponse>(data);
    },
  });

export const useLeaveUtilizationReport = (params: ReportQueryParams = {}) =>
  useQuery<LeaveUtilizationResponse>({
    queryKey: ["reports", "leave-utilization", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.months) searchParams.set("months", String(params.months));
      if (params.departmentId)
        searchParams.set("departmentId", params.departmentId);
      const { data } = await apiClient.get<any>(
        `/v1/reports/leave-utilization?${searchParams.toString()}`,
        await getAuthConfig(),
      );
      return unwrap<LeaveUtilizationResponse>(data);
    },
  });

export const usePayrollSummaryReport = (params: ReportQueryParams = {}) =>
  useQuery<PayrollSummaryResponse>({
    queryKey: ["reports", "payroll-summary", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.months) searchParams.set("months", String(params.months));
      if (params.departmentId)
        searchParams.set("departmentId", params.departmentId);
      const { data } = await apiClient.get<any>(
        `/v1/reports/payroll-summary?${searchParams.toString()}`,
        await getAuthConfig(),
      );
      return unwrap<PayrollSummaryResponse>(data);
    },
  });

export const useRecruitmentFunnelReport = (params: ReportQueryParams = {}) =>
  useQuery<RecruitmentFunnelResponse>({
    queryKey: ["reports", "recruitment-funnel", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.months) searchParams.set("months", String(params.months));
      if (params.departmentId)
        searchParams.set("departmentId", params.departmentId);
      const { data } = await apiClient.get<any>(
        `/v1/reports/recruitment-funnel?${searchParams.toString()}`,
        await getAuthConfig(),
      );
      return unwrap<RecruitmentFunnelResponse>(data);
    },
  });

export const usePerformanceDistributionReport = (
  params: ReportQueryParams = {},
) =>
  useQuery<PerformanceDistributionResponse>({
    queryKey: ["reports", "performance-distribution", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.cycleId) searchParams.set("cycleId", params.cycleId);
      if (params.department) searchParams.set("department", params.department);
      const { data } = await apiClient.get<any>(
        `/v1/reports/performance-distribution?${searchParams.toString()}`,
        await getAuthConfig(),
      );
      return unwrap<PerformanceDistributionResponse>(data);
    },
  });

export const useTrainingCompletionReport = (params: ReportQueryParams = {}) =>
  useQuery<TrainingCompletionResponse>({
    queryKey: ["reports", "training-completion", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.months) searchParams.set("months", String(params.months));
      if (params.department) searchParams.set("department", params.department);
      const { data } = await apiClient.get<any>(
        `/v1/reports/training-completion?${searchParams.toString()}`,
        await getAuthConfig(),
      );
      return unwrap<TrainingCompletionResponse>(data);
    },
  });

export const useDiversityOverviewReport = (params: ReportQueryParams = {}) =>
  useQuery<DiversityOverviewResponse>({
    queryKey: ["reports", "diversity-overview", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.months) searchParams.set("months", String(params.months));
      if (params.departmentId)
        searchParams.set("departmentId", params.departmentId);
      const { data } = await apiClient.get<any>(
        `/v1/reports/diversity-overview?${searchParams.toString()}`,
        await getAuthConfig(),
      );
      return unwrap<DiversityOverviewResponse>(data);
    },
  });

export const useContractExpirationsReport = (params: ReportQueryParams = {}) =>
  useQuery<ContractExpirationsResponse>({
    queryKey: ["reports", "contract-expirations", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.months) searchParams.set("months", String(params.months));
      if (params.departmentId)
        searchParams.set("departmentId", params.departmentId);
      const { data } = await apiClient.get<any>(
        `/v1/reports/contract-expirations?${searchParams.toString()}`,
        await getAuthConfig(),
      );
      return unwrap<ContractExpirationsResponse>(data);
    },
  });

/* -------------------------------------------------------------------------- */
/* Export hooks                                                               */
/* -------------------------------------------------------------------------- */

export const useExportHeadcountTurnover = (params: ReportQueryParams = {}) =>
  useQuery<Blob>({
    queryKey: ["reports", "headcount-turnover", "export", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.months) searchParams.set("months", String(params.months));
      if (params.departmentId)
        searchParams.set("departmentId", params.departmentId);
      const { data } = await apiClient.get(
        `/v1/reports/headcount-turnover/export?${searchParams.toString()}`,
        { ...(await getAuthConfig()), responseType: "blob" },
      );
      return data as Blob;
    },
    enabled: false,
  });

export const useExportAttendanceSummary = (params: ReportQueryParams = {}) =>
  useQuery<Blob>({
    queryKey: ["reports", "attendance-summary", "export", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.period) searchParams.set("period", params.period);
      if (params.departmentId)
        searchParams.set("departmentId", params.departmentId);
      const { data } = await apiClient.get(
        `/v1/reports/attendance-summary/export?${searchParams.toString()}`,
        { ...(await getAuthConfig()), responseType: "blob" },
      );
      return data as Blob;
    },
    enabled: false,
  });

export const useExportLeaveUtilization = (params: ReportQueryParams = {}) =>
  useQuery<Blob>({
    queryKey: ["reports", "leave-utilization", "export", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.months) searchParams.set("months", String(params.months));
      if (params.departmentId)
        searchParams.set("departmentId", params.departmentId);
      const { data } = await apiClient.get(
        `/v1/reports/leave-utilization/export?${searchParams.toString()}`,
        { ...(await getAuthConfig()), responseType: "blob" },
      );
      return data as Blob;
    },
    enabled: false,
  });

export const useExportPayrollSummary = (params: ReportQueryParams = {}) =>
  useQuery<Blob>({
    queryKey: ["reports", "payroll-summary", "export", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.months) searchParams.set("months", String(params.months));
      if (params.departmentId)
        searchParams.set("departmentId", params.departmentId);
      const { data } = await apiClient.get(
        `/v1/reports/payroll-summary/export?${searchParams.toString()}`,
        { ...(await getAuthConfig()), responseType: "blob" },
      );
      return data as Blob;
    },
    enabled: false,
  });

export const useExportRecruitmentFunnel = (params: ReportQueryParams = {}) =>
  useQuery<Blob>({
    queryKey: ["reports", "recruitment-funnel", "export", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.months) searchParams.set("months", String(params.months));
      if (params.departmentId)
        searchParams.set("departmentId", params.departmentId);
      const { data } = await apiClient.get(
        `/v1/reports/recruitment-funnel/export?${searchParams.toString()}`,
        { ...(await getAuthConfig()), responseType: "blob" },
      );
      return data as Blob;
    },
    enabled: false,
  });

export const useExportPerformanceDistribution = (
  params: ReportQueryParams = {},
) =>
  useQuery<Blob>({
    queryKey: ["reports", "performance-distribution", "export", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.cycleId) searchParams.set("cycleId", params.cycleId);
      if (params.department) searchParams.set("department", params.department);
      const { data } = await apiClient.get(
        `/v1/reports/performance-distribution/export?${searchParams.toString()}`,
        { ...(await getAuthConfig()), responseType: "blob" },
      );
      return data as Blob;
    },
    enabled: false,
  });

export const useExportTrainingCompletion = (params: ReportQueryParams = {}) =>
  useQuery<Blob>({
    queryKey: ["reports", "training-completion", "export", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.months) searchParams.set("months", String(params.months));
      if (params.department) searchParams.set("department", params.department);
      const { data } = await apiClient.get(
        `/v1/reports/training-completion/export?${searchParams.toString()}`,
        { ...(await getAuthConfig()), responseType: "blob" },
      );
      return data as Blob;
    },
    enabled: false,
  });

export const useExportDiversityOverview = (params: ReportQueryParams = {}) =>
  useQuery<Blob>({
    queryKey: ["reports", "diversity-overview", "export", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.months) searchParams.set("months", String(params.months));
      if (params.departmentId)
        searchParams.set("departmentId", params.departmentId);
      const { data } = await apiClient.get(
        `/v1/reports/diversity-overview/export?${searchParams.toString()}`,
        { ...(await getAuthConfig()), responseType: "blob" },
      );
      return data as Blob;
    },
    enabled: false,
  });

export const useExportContractExpirations = (params: ReportQueryParams = {}) =>
  useQuery<Blob>({
    queryKey: ["reports", "contract-expirations", "export", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.months) searchParams.set("months", String(params.months));
      if (params.departmentId)
        searchParams.set("departmentId", params.departmentId);
      const { data } = await apiClient.get(
        `/v1/reports/contract-expirations/export?${searchParams.toString()}`,
        { ...(await getAuthConfig()), responseType: "blob" },
      );
      return data as Blob;
    },
    enabled: false,
  });

/* -------------------------------------------------------------------------- */
/* Helper: map report slug to query hook                                       */
/* -------------------------------------------------------------------------- */

export type ReportQueryHook = (
  params: ReportQueryParams,
) => ReturnType<typeof useQuery>;

export const reportHooksMap: Record<string, ReportQueryHook> = {
  "headcount-and-turnover": useHeadcountTurnoverReport,
  "attendance-summary": useAttendanceSummaryReport,
  "leave-utilization": useLeaveUtilizationReport,
  "payroll-summary": usePayrollSummaryReport,
  "recruitment-funnel": useRecruitmentFunnelReport,
  "performance-distribution": usePerformanceDistributionReport,
  "training-completion": useTrainingCompletionReport,
  "diversity-overview": useDiversityOverviewReport,
  "contract-expirations": useContractExpirationsReport,
};

export const reportExportHooksMap: Record<string, ReportQueryHook> = {
  "headcount-and-turnover": useExportHeadcountTurnover,
  "attendance-summary": useExportAttendanceSummary,
  "leave-utilization": useExportLeaveUtilization,
  "payroll-summary": useExportPayrollSummary,
  "recruitment-funnel": useExportRecruitmentFunnel,
  "performance-distribution": useExportPerformanceDistribution,
  "training-completion": useExportTrainingCompletion,
  "diversity-overview": useExportDiversityOverview,
  "contract-expirations": useExportContractExpirations,
};

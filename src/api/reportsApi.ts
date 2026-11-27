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
/* Tenant Revenue & Expenses Reports                                          */
/* -------------------------------------------------------------------------- */

export interface RevenueReportResponse {
  summary: {
    totalRevenue: number;
    totalInvoices: number;
    averageInvoiceValue: number;
    outstandingAmount: number;
    paidInvoices: number;
    overdueInvoices: number;
  };
  byMonth: Array<{
    month: string;
    revenue: number;
    invoices: number;
  }>;
  byCategory: Array<{
    name: string;
    total: number;
    percentage: number;
  }>;
  topCustomers: Array<{
    customer: string;
    revenue: number;
    invoices: number;
  }>;
  insights: string[];
}

export interface ExpensesReportResponse {
  summary: {
    totalExpenses: number;
    totalRecords: number;
    averageExpense: number;
    byStatus: {
      paid: number;
      pending: number;
      overdue: number;
    };
  };
  byMonth: Array<{
    month: string;
    expenses: number;
    records: number;
  }>;
  byCategory: Array<{
    name: string;
    total: number;
    percentage: number;
  }>;
  topVendors: Array<{
    vendor: string;
    amount: number;
    records: number;
  }>;
  insights: string[];
}

export type RevenueReport = RevenueReportResponse;
export type ExpensesReport = ExpensesReportResponse;

/* -------------------------------------------------------------------------- */
/* Export hooks                                                               */
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
        `/reports/headcount-turnover?${searchParams.toString()}`,
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
        `/reports/attendance-summary?${searchParams.toString()}`,
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
        `/reports/leave-utilization?${searchParams.toString()}`,
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
        `/reports/payroll-summary?${searchParams.toString()}`,
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
        `/reports/recruitment-funnel?${searchParams.toString()}`,
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
        `/reports/performance-distribution?${searchParams.toString()}`,
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
        `/reports/training-completion?${searchParams.toString()}`,
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
        `/reports/diversity-overview?${searchParams.toString()}`,
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
        `/reports/contract-expirations?${searchParams.toString()}`,
        await getAuthConfig(),
      );
      return unwrap<ContractExpirationsResponse>(data);
    },
  });

/* -------------------------------------------------------------------------- */
/* Tenant Revenue & Expenses Report Hooks                                    */
/* -------------------------------------------------------------------------- */

export interface RevenueReportQueryParams {
  year?: number;
  from?: string;
  to?: string;
  currency?: string;
}

export interface ExpensesReportQueryParams {
  year?: number;
  from?: string;
  to?: string;
}

export const useRevenueReport = (params: RevenueReportQueryParams = {}) =>
  useQuery<RevenueReportResponse>({
    queryKey: ["reports", "revenue", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.year) searchParams.set("year", String(params.year));
      if (params.from) searchParams.set("from", params.from);
      if (params.to) searchParams.set("to", params.to);
      if (params.currency) searchParams.set("currency", params.currency);
      const { data } = await apiClient.get<any>(
        `/reports/revenue?${searchParams.toString()}`,
        await getAuthConfig(),
      );
      return unwrap<RevenueReportResponse>(data);
    },
  });

export const useExpensesReport = (params: ExpensesReportQueryParams = {}) =>
  useQuery<ExpensesReportResponse>({
    queryKey: ["reports", "expenses", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.year) searchParams.set("year", String(params.year));
      if (params.from) searchParams.set("from", params.from);
      if (params.to) searchParams.set("to", params.to);
      const { data } = await apiClient.get<any>(
        `/reports/expenses?${searchParams.toString()}`,
        await getAuthConfig(),
      );
      return unwrap<ExpensesReportResponse>(data);
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
        `/reports/headcount-turnover/export?${searchParams.toString()}`,
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
        `/reports/attendance-summary/export?${searchParams.toString()}`,
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
        `/reports/leave-utilization/export?${searchParams.toString()}`,
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
        `/reports/payroll-summary/export?${searchParams.toString()}`,
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
        `/reports/recruitment-funnel/export?${searchParams.toString()}`,
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
        `/reports/performance-distribution/export?${searchParams.toString()}`,
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
        `/reports/training-completion/export?${searchParams.toString()}`,
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
        `/reports/diversity-overview/export?${searchParams.toString()}`,
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
        `/reports/contract-expirations/export?${searchParams.toString()}`,
        { ...(await getAuthConfig()), responseType: "blob" },
      );
      return data as Blob;
    },
    enabled: false,
  });

export const useExportRevenueReport = (params: RevenueReportQueryParams = {}) =>
  useQuery<Blob>({
    queryKey: ["reports", "revenue", "export", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.year) searchParams.set("year", String(params.year));
      if (params.from) searchParams.set("from", params.from);
      if (params.to) searchParams.set("to", params.to);
      if (params.currency) searchParams.set("currency", params.currency);
      const { data } = await apiClient.get(
        `/reports/revenue/export?${searchParams.toString()}`,
        { ...(await getAuthConfig()), responseType: "blob" },
      );
      return data as Blob;
    },
    enabled: false,
  });

export const useExportExpensesReport = (
  params: ExpensesReportQueryParams = {},
) =>
  useQuery<Blob>({
    queryKey: ["reports", "expenses", "export", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.year) searchParams.set("year", String(params.year));
      if (params.from) searchParams.set("from", params.from);
      if (params.to) searchParams.set("to", params.to);
      const { data } = await apiClient.get(
        `/reports/expenses/export?${searchParams.toString()}`,
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

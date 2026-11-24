import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "./simpleApi";

/**
 * Payroll controller endpoints (`Greenmouse CRM API.postman_collection.json`
 * → "Payroll Controller …", paths under `/v1/payroll/`).
 *
 * Responses are defensively unwrapped (`data` / `items` keys).
 */

export interface PayrollSettings {
  jurisdiction?: string;
  currency?: string;
  payFrequency?: string;
  [key: string]: unknown;
}

export interface StatutoryRule {
  id: string;
  name?: string;
  calculationType?: string; // "percentage"
  basis?: string; // "basic"
  rate?: string;
  fixedAmount?: number;
  isActive?: boolean;
  [key: string]: unknown;
}

export interface CompensationEntry {
  name?: string;
  amount?: number;
}

export interface PayrollCompensation {
  employeeId: string;
  effectiveFrom?: string;
  basicSalary?: number;
  allowances?: CompensationEntry[];
  bonuses?: CompensationEntry[];
  deductions?: CompensationEntry[];
  [key: string]: unknown;
}

export interface PayrollRun {
  id: string;
  periodStart?: string;
  periodEnd?: string;
  payDate?: string;
  status?: string;
  /** Optional display fields (used by the UI table and stats cards). */
  period?: string;
  cycle?: string;
  employees?: number;
  gross?: number;
  deductions?: number;
  net?: number;
  preparedBy?: string;
  notes?: string;
  [key: string]: any;
}

export interface Payslip {
  id: string;
  employee?: string;
  periodStart?: string;
  periodEnd?: string;
  payDate?: string;
  gross?: number;
  netPay?: number;
  [key: string]: unknown;
}

const unwrapList = (data: any, keys: string[]): any[] => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }
  return [];
};

const unwrapOne = (data: any) => data?.data ?? data;

const queryRoot = ["payroll"] as const;

/* -------------------------------------------------------------------------- */
/* Settings                                                                    */
/* -------------------------------------------------------------------------- */

export const usePayrollSettings = () =>
  useQuery<PayrollSettings>({
    queryKey: [...queryRoot, "settings"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/payroll/settings");
      return unwrapOne(data);
    },
  });

export const useUpdatePayrollSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: Partial<PayrollSettings>) => {
      const { data } = await apiClient.put<any>("/payroll/settings", settings);
      return unwrapOne(data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryRoot }),
  });
};

/* -------------------------------------------------------------------------- */
/* Statutory rules                                                             */
/* -------------------------------------------------------------------------- */

export const useStatutoryRules = () =>
  useQuery<StatutoryRule[]>({
    queryKey: [...queryRoot, "statutory-rules"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/payroll/statutory-rules");
      return unwrapList(data, ["rules"]);
    },
  });

export const useCreateStatutoryRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (rule: Omit<StatutoryRule, "id">) => {
      const { data } = await apiClient.post<any>("/payroll/statutory-rules", rule);
      return unwrapOne(data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryRoot }),
  });
};

export const useUpdateStatutoryRule = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (rule: Partial<StatutoryRule>) => {
      const { data } = await apiClient.patch<any>(`/payroll/statutory-rules/${id}`, rule);
      return unwrapOne(data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryRoot }),
  });
};

/* -------------------------------------------------------------------------- */
/* Compensations                                                               */
/* -------------------------------------------------------------------------- */

export const useEmployeeCompensations = (employeeId?: string) =>
  useQuery<PayrollCompensation[]>({
    queryKey: [...queryRoot, "compensations", employeeId],
    queryFn: async () => {
      if (!employeeId) return [];
      const { data } = await apiClient.get<any>(
        `/payroll/employees/${employeeId}/compensations`,
      );
      return unwrapList(data, ["compensations"]);
    },
    enabled: Boolean(employeeId),
  });

export const useCreateCompensation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (compensation: PayrollCompensation) => {
      const { data } = await apiClient.post<any>(
        "/payroll/compensations",
        compensation,
      );
      return unwrapOne(data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryRoot }),
  });
};

/* -------------------------------------------------------------------------- */
/* Runs                                                                        */
/* -------------------------------------------------------------------------- */

export const usePayrollRuns = () =>
  useQuery<PayrollRun[]>({
    queryKey: [...queryRoot, "runs"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/payroll/runs");
      return unwrapList(data, ["runs"]);
    },
  });

export const usePayrollRun = (id?: string) =>
  useQuery<PayrollRun>({
    queryKey: [...queryRoot, "runs", id],
    queryFn: async () => {
      if (!id) throw new Error("Payroll run ID required");
      const { data } = await apiClient.get<any>(`/payroll/runs/${id}`);
      return unwrapOne(data);
    },
    enabled: Boolean(id),
  });

/** Map a server run status onto the UI vocabulary in `types.ts`. */
export const toPayrollRunStatus = (status?: string): PayrollRun["status"] => {
  const s = String(status ?? "").trim().toLowerCase();
  switch (s) {
    case "draft":
    case "created":
    case "new":
    case "":
      return "Draft";
    case "pending":
    case "pending_approval":
    case "awaiting_approval":
      return "Pending Approval";
    case "approved":
    case "finalized":
    case "finalised":
    case "completed":
    case "done":
      return "Approved";
    case "paid":
      return "Paid";
    case "cancelled":
    case "canceled":
      return "Cancelled";
    default:
      return s as PayrollRun["status"];
  }
};

export const useCreatePayrollRun = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (run: {
      periodStart: string;
      periodEnd: string;
      payDate: string;
    }) => {
      const { data } = await apiClient.post<any>("/payroll/runs", run);
      return unwrapOne(data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryRoot }),
  });
};

export const useCalculatePayrollRun = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { data } = await apiClient.post<any>(`/payroll/runs/${id}/calculate`);
      return unwrapOne(data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryRoot }),
  });
};

export const useApprovePayrollRun = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { data } = await apiClient.post<any>(`/payroll/runs/${id}/approve`);
      return unwrapOne(data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryRoot }),
  });
};

export const useFinalizePayrollRun = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { data } = await apiClient.post<any>(`/payroll/runs/${id}/finalize`);
      return unwrapOne(data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryRoot }),
  });
};

export const useMarkPayrollRunPaid = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      paymentReference,
      paidAt,
    }: {
      id: string;
      paymentReference: string;
      paidAt: string;
    }) => {
      const { data } = await apiClient.post<any>(
        `/payroll/runs/${id}/paid`,
        { paymentReference, paidAt },
      );
      return unwrapOne(data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryRoot }),
  });
};

/* -------------------------------------------------------------------------- */
/* Payslips                                                                    */
/* -------------------------------------------------------------------------- */

export const useMyPayslips = () =>
  useQuery<Payslip[]>({
    queryKey: [...queryRoot, "my-payslips"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/payroll/my/payslips");
      return unwrapList(data, ["payslips"]);
    },
  });

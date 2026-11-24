import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "./simpleApi";
import { get_user_value } from "@/store/authStore";
import type {
  ClearanceDepartment,
  ClearanceItem,
  ClearanceStatus,
  OffboardingCase,
  OffboardingStatus,
  OffboardingStep,
  SeparationType,
} from "@/routes/hr/offboarding/-components/types";

/* -------------------------------------------------------------------------- */
/* Payloads                                                                   */
/* -------------------------------------------------------------------------- */

export interface OffboardingTaskInput {
  taskType: string;
  department: string;
  title: string;
  assignedTo: string;
  dueDate?: string;
  required?: boolean;
}

export interface InitiateOffboardingApiPayload {
  employeeId: string;
  category: string;
  noticeDate: string;
  lastWorkingDate: string;
  confidentialReason?: string;
  tasks?: OffboardingTaskInput[];
}

export interface SettlementLineItem {
  name: string;
  amount: number;
}

export interface SaveSettlementPayload {
  caseId: string;
  earnings: SettlementLineItem[];
  deductions: SettlementLineItem[];
  notes?: string;
}

/* -------------------------------------------------------------------------- */
/* Helpers & Mappers                                                          */
/* -------------------------------------------------------------------------- */

const authConfig = () => {
  const token = get_user_value()?.accessToken;
  return { headers: { Authorization: `Bearer ${token}` } };
};

const unwrapList = <T>(data: any, keys: string[]): T[] => {
  if (Array.isArray(data)) return data as T[];
  if (Array.isArray(data?.data)) return data.data as T[];
  if (Array.isArray(data?.data?.data)) return data.data.data as T[];
  if (Array.isArray(data?.payload)) return data.payload as T[];
  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key] as T[];
    if (Array.isArray(data?.data?.[key])) return data.data[key] as T[];
  }
  return [];
};

const unwrapOne = <T>(data: any): T =>
  (data?.data?.data ?? data?.data ?? data?.payload ?? data) as T;

const queryRoot = ["offboarding"] as const;

const useInvalidateOffboarding = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryRoot });
};

const normalizeClearanceStatus = (value?: string): ClearanceStatus => {
  const key = (value ?? "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  switch (key) {
    case "completed":
    case "done":
      return "Completed";
    case "in_progress":
    case "inprogress":
      return "In Progress";
    case "scheduled":
      return "Scheduled";
    case "waived":
      return "Waived";
    case "pending":
    default:
      return "Pending";
  }
};

const normalizeDepartment = (value?: string): ClearanceDepartment => {
  const key = (value ?? "").trim().toLowerCase();
  if (key === "it") return "IT";
  if (key === "finance" || key === "payroll") return "Finance";
  if (key === "hr") return "HR";
  if (key === "manager") return "Manager";
  if (key === "operations") return "Operations";
  if (key === "admin") return "Admin";
  return (value ? value : "HR") as ClearanceDepartment;
};

const normalizeSeparationType = (value?: string): SeparationType => {
  const key = (value ?? "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  switch (key) {
    case "end_of_contract":
    case "contract_end":
      return "End of Contract";
    case "redundancy":
      return "Redundancy";
    case "termination":
      return "Termination";
    case "retirement":
      return "Retirement";
    case "resignation":
    default:
      return "Resignation";
  }
};

const normalizeOffboardingStatus = (value?: string): OffboardingStatus => {
  const key = (value ?? "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  switch (key) {
    case "completed":
    case "closed":
    case "exited":
      return "Completed";
    case "cancelled":
    case "canceled":
      return "Cancelled";
    case "settlement_ready":
    case "settlement":
      return "Settlement ready";
    case "clearance_in_progress":
    case "clearance":
    case "accepted":
    case "in_progress":
      return "Clearance in progress";
    case "notice_period":
    case "initiated":
    case "pending":
    default:
      return "Notice period";
  }
};

const normalizeStep = (value?: string): OffboardingStep => {
  const key = (value ?? "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  switch (key) {
    case "acceptance":
    case "accepted":
      return "Acceptance";
    case "handover":
      return "Handover";
    case "asset_return":
      return "Asset return";
    case "clearance":
      return "Clearance";
    case "final_settlement":
    case "settlement":
      return "Final settlement";
    case "access_revoked":
    case "access_revocation":
      return "Access revoked";
    case "exit_interview":
    case "completed":
      return "Exit interview";
    case "resignation":
    case "initiated":
    default:
      return "Resignation";
  }
};

export const mapBackendOffboardingTask = (
  raw: any,
  fallbackCaseId = "",
): ClearanceItem => {
  const assignee = raw?.assignee ?? raw?.assignedToUser;
  const ownerName =
    raw?.assignedToName ??
    raw?.ownerName ??
    raw?.owner ??
    (assignee && typeof assignee === "object"
      ? [assignee.firstName, assignee.lastName].filter(Boolean).join(" ") ||
        assignee.name ||
        assignee.email
      : undefined) ??
    "—";

  return {
    id: String(raw?.id ?? ""),
    caseId: String(raw?.caseId ?? raw?.offboardingCaseId ?? fallbackCaseId),
    department: normalizeDepartment(raw?.department),
    item: String(raw?.title ?? raw?.item ?? "Untitled task"),
    owner: String(ownerName),
    assignedToId:
      typeof raw?.assignedTo === "string"
        ? raw.assignedTo
        : assignee?.id ?? undefined,
    taskType: raw?.taskType ?? undefined,
    required: typeof raw?.required === "boolean" ? raw.required : undefined,
    status: normalizeClearanceStatus(raw?.status),
    dueDate: raw?.dueDate ? String(raw.dueDate).slice(0, 10) : undefined,
    notes: raw?.notes ?? raw?.waiveReason ?? undefined,
  };
};

export const mapBackendOffboardingCase = (raw: any): OffboardingCase => {
  const emp = raw?.employee;
  const empName =
    raw?.employeeName ??
    (emp && typeof emp === "object"
      ? [emp.firstName, emp.lastName].filter(Boolean).join(" ") ||
        emp.name ||
        emp.email
      : typeof emp === "string"
        ? emp
        : undefined) ??
    "—";

  const dept =
    raw?.departmentName ??
    (emp && typeof emp === "object"
      ? typeof emp.department === "object"
        ? emp.department?.name
        : emp.department
      : undefined) ??
    raw?.department ??
    "—";

  const role =
    raw?.jobTitle ??
    (emp && typeof emp === "object"
      ? emp.jobTitle ?? emp.position?.name ?? emp.position?.title
      : undefined) ??
    raw?.role ??
    "—";

  const caseId = String(raw?.id ?? "");
  const rawTasks = Array.isArray(raw?.tasks) ? raw.tasks : [];

  return {
    id: caseId,
    employee: String(empName),
    employeeId: String(raw?.employeeId ?? emp?.id ?? ""),
    department: String(dept || "—"),
    role: String(role || "—"),
    separationType: normalizeSeparationType(raw?.category ?? raw?.separationType),
    resignationDate: String(
      raw?.noticeDate ?? raw?.resignationDate ?? raw?.createdAt ?? "",
    ).slice(0, 10),
    lastWorkingDay: String(
      raw?.lastWorkingDate ?? raw?.lastWorkingDay ?? "",
    ).slice(0, 10),
    currentStep: normalizeStep(raw?.currentStage ?? raw?.stage ?? raw?.currentStep),
    status: normalizeOffboardingStatus(raw?.status),
    handoverTo: String(raw?.handoverToName ?? raw?.handoverTo ?? "—"),
    notes: raw?.confidentialReason ?? raw?.notes ?? undefined,
    stage: raw?.currentStage ?? raw?.stage ?? undefined,
    settlementStatus: raw?.settlement?.status ?? raw?.settlementStatus ?? undefined,
    tasks: rawTasks.map((t: any) => mapBackendOffboardingTask(t, caseId)),
  };
};

/* -------------------------------------------------------------------------- */
/* Queries                                                                    */
/* -------------------------------------------------------------------------- */

export const useOffboardingStages = () =>
  useQuery<any[]>({
    queryKey: [...queryRoot, "stages"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>(
        "/offboarding/stages",
        authConfig(),
      );
      return unwrapList<any>(data, ["stages"]);
    },
  });

export const useOffboardingCases = () =>
  useQuery<OffboardingCase[]>({
    queryKey: [...queryRoot, "cases"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>(
        "/offboarding/cases",
        authConfig(),
      );
      return unwrapList<any>(data, ["cases"]).map(mapBackendOffboardingCase);
    },
  });

export const useOffboardingCase = (id?: string) =>
  useQuery<OffboardingCase>({
    queryKey: [...queryRoot, "cases", id],
    queryFn: async () => {
      const { data } = await apiClient.get<any>(
        `/offboarding/cases/${id}`,
        authConfig(),
      );
      return mapBackendOffboardingCase(unwrapOne<any>(data));
    },
    enabled: Boolean(id),
  });

export const useMyOffboardingTasks = () =>
  useQuery<ClearanceItem[]>({
    queryKey: [...queryRoot, "tasks", "mine"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>(
        "/offboarding/tasks/mine",
        authConfig(),
      );
      return unwrapList<any>(data, ["tasks"]).map((t) =>
        mapBackendOffboardingTask(t),
      );
    },
  });

export const useOffboardingCaseHistory = (id?: string) =>
  useQuery<any[]>({
    queryKey: [...queryRoot, "cases", id, "history"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>(
        `/offboarding/cases/${id}/history`,
        authConfig(),
      );
      return unwrapList<any>(data, ["history", "events"]);
    },
    enabled: Boolean(id),
  });

/* -------------------------------------------------------------------------- */
/* Mutations                                                                  */
/* -------------------------------------------------------------------------- */

export const useInitiateOffboarding = () => {
  const invalidate = useInvalidateOffboarding();
  return useMutation({
    mutationFn: async (payload: InitiateOffboardingApiPayload) => {
      const { data } = await apiClient.post<any>(
        "/offboarding/cases",
        payload,
        authConfig(),
      );
      return mapBackendOffboardingCase(unwrapOne<any>(data));
    },
    onSuccess: invalidate,
  });
};

export const useAcceptOffboardingCase = () => {
  const invalidate = useInvalidateOffboarding();
  return useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
      const { data } = await apiClient.post<any>(
        `/offboarding/cases/${id}/accept`,
        notes ? { notes } : {},
        authConfig(),
      );
      return unwrapOne<any>(data);
    },
    onSuccess: invalidate,
  });
};

export const useAddOffboardingTask = () => {
  const invalidate = useInvalidateOffboarding();
  return useMutation({
    mutationFn: async ({
      caseId,
      ...payload
    }: { caseId: string } & OffboardingTaskInput) => {
      const { data } = await apiClient.post<any>(
        `/offboarding/cases/${caseId}/tasks`,
        payload,
        authConfig(),
      );
      return mapBackendOffboardingTask(unwrapOne<any>(data), caseId);
    },
    onSuccess: invalidate,
  });
};

export const useUpdateOffboardingTask = () => {
  const invalidate = useInvalidateOffboarding();
  return useMutation({
    mutationFn: async ({
      id,
      status,
      notes,
    }: {
      id: string;
      status: "pending" | "in_progress" | "completed" | "scheduled";
      notes?: string;
    }) => {
      const { data } = await apiClient.patch<any>(
        `/offboarding/tasks/${id}`,
        { status, ...(notes ? { notes } : {}) },
        authConfig(),
      );
      return unwrapOne<any>(data);
    },
    onSuccess: invalidate,
  });
};

export const useWaiveOffboardingTask = () => {
  const invalidate = useInvalidateOffboarding();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { data } = await apiClient.patch<any>(
        `/offboarding/tasks/${id}/waive`,
        { reason },
        authConfig(),
      );
      return unwrapOne<any>(data);
    },
    onSuccess: invalidate,
  });
};

export const useReassignOffboardingTask = () => {
  const invalidate = useInvalidateOffboarding();
  return useMutation({
    mutationFn: async ({
      id,
      assignedTo,
    }: {
      id: string;
      assignedTo: string;
    }) => {
      const { data } = await apiClient.patch<any>(
        `/offboarding/tasks/${id}/assignment`,
        { assignedTo },
        authConfig(),
      );
      return unwrapOne<any>(data);
    },
    onSuccess: invalidate,
  });
};

export const useSaveOffboardingSettlement = () => {
  const invalidate = useInvalidateOffboarding();
  return useMutation({
    mutationFn: async ({ caseId, ...payload }: SaveSettlementPayload) => {
      const { data } = await apiClient.put<any>(
        `/offboarding/cases/${caseId}/settlement`,
        payload,
        authConfig(),
      );
      return unwrapOne<any>(data);
    },
    onSuccess: invalidate,
  });
};

export const useSubmitOffboardingSettlement = () => {
  const invalidate = useInvalidateOffboarding();
  return useMutation({
    mutationFn: async (caseId: string) => {
      const { data } = await apiClient.post<any>(
        `/offboarding/cases/${caseId}/settlement/submit`,
        {},
        authConfig(),
      );
      return unwrapOne<any>(data);
    },
    onSuccess: invalidate,
  });
};

export const useApproveOffboardingSettlement = () => {
  const invalidate = useInvalidateOffboarding();
  return useMutation({
    mutationFn: async ({
      caseId,
      notes,
    }: {
      caseId: string;
      notes?: string;
    }) => {
      const { data } = await apiClient.post<any>(
        `/offboarding/cases/${caseId}/settlement/approve`,
        notes ? { notes } : {},
        authConfig(),
      );
      return unwrapOne<any>(data);
    },
    onSuccess: invalidate,
  });
};

export const useAuthorizeOffboardingRevocation = () => {
  const invalidate = useInvalidateOffboarding();
  return useMutation({
    mutationFn: async ({
      caseId,
      revokeAt,
      reason,
    }: {
      caseId: string;
      revokeAt: string;
      reason?: string;
    }) => {
      const { data } = await apiClient.post<any>(
        `/offboarding/cases/${caseId}/access-revocation`,
        { revokeAt, ...(reason ? { reason } : {}) },
        authConfig(),
      );
      return unwrapOne<any>(data);
    },
    onSuccess: invalidate,
  });
};

export const useCancelOffboardingCase = () => {
  const invalidate = useInvalidateOffboarding();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { data } = await apiClient.post<any>(
        `/offboarding/cases/${id}/cancel`,
        { reason },
        authConfig(),
      );
      return unwrapOne<any>(data);
    },
    onSuccess: invalidate,
  });
};

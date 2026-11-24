import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "./simpleApi";
import type {
  CaseStatus,
  DisciplinaryCase,
  WorkflowStep,
} from "@/routes/hr/disciplinary/-components/types";

/* -------------------------------------------------------------------------- */
/* Types & Payloads                                                           */
/* -------------------------------------------------------------------------- */

export interface DisciplinaryOptions {
  categories: string[];
  severities: string[];
}

export interface DisciplinaryEmployee {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  department?: string | { name?: string };
}

export interface CreateDisciplinaryCasePayload {
  employeeId: string;
  category: string;
  incidentDate: string;
  severity: string;
  reportedByEmployeeId: string;
  investigatorEmployeeId: string;
  description: string;
  witnesses?: string[];
  confidentialityConfirmed: boolean;
}

export interface AdvanceStagePayload {
  id: string;
  stage: string;
  notes?: string;
}

export interface CloseCasePayload {
  id: string;
  outcome: string;
}

export interface DisciplinaryEvidenceItem {
  id: string;
  fileName?: string;
  name?: string;
  url?: string;
  fileUrl?: string;
  uploadedAt?: string;
  createdAt?: string;
  uploadedBy?:
    | string
    | { firstName?: string; lastName?: string; name?: string };
}

export interface DisciplinaryHistoryItem {
  id: string;
  action?: string;
  stage?: string;
  notes?: string;
  outcome?: string;
  createdAt?: string;
  timestamp?: string;
  actor?: string | { firstName?: string; lastName?: string; name?: string };
  performedBy?:
    | string
    | { firstName?: string; lastName?: string; name?: string };
}

/* -------------------------------------------------------------------------- */
/* Helpers & Mappers                                                          */
/* -------------------------------------------------------------------------- */

const queryRoot = ["disciplinary-cases"] as const;

const unwrapList = <T>(data: any, keys: string[]): T[] => {
  if (Array.isArray(data)) return data as T[];
  if (Array.isArray(data?.data)) return data.data as T[];
  if (Array.isArray(data?.data?.data)) return data.data.data as T[];
  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key] as T[];
    if (Array.isArray(data?.data?.[key])) return data.data[key] as T[];
  }
  return [];
};

const unwrapObject = <T>(data: any): T => {
  return (data?.data?.data ?? data?.data ?? data) as T;
};

const formatEmployeeName = (emp: any, fallback = "Unassigned"): string => {
  if (!emp) return fallback;
  if (typeof emp === "string") return emp || fallback;
  const full = `${emp.firstName ?? ""} ${emp.lastName ?? ""}`.trim();
  return full || emp.name || emp.email || fallback;
};

const formatDateShort = (value?: string): string => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

export const STAGE_TO_API: Record<WorkflowStep, string> = {
  Report: "report",
  Investigation: "investigation",
  "Employee response": "employee_response",
  Hearing: "hearing",
  Decision: "decision",
  Appeal: "appeal",
};

const API_TO_STAGE: Record<string, WorkflowStep> = {
  report: "Report",
  investigation: "Investigation",
  employee_response: "Employee response",
  "employee response": "Employee response",
  hearing: "Hearing",
  decision: "Decision",
  appeal: "Appeal",
};

const API_TO_STATUS: Record<string, CaseStatus> = {
  under_review: "Under Review",
  "under review": "Under Review",
  open: "Under Review",
  report: "Under Review",
  investigation: "Investigation",
  hearing_scheduled: "Hearing Scheduled",
  "hearing scheduled": "Hearing Scheduled",
  hearing: "Hearing Scheduled",
  decision_pending: "Decision Pending",
  "decision pending": "Decision Pending",
  decision: "Decision Pending",
  closed: "Closed",
  concluded: "Closed",
  appealed: "Appealed",
  appeal: "Appealed",
};

export const mapCaseFromApi = (raw: any): DisciplinaryCase => {
  const stageKey = String(raw?.stage ?? raw?.currentStep ?? "report")
    .toLowerCase()
    .trim();
  const statusKey = String(raw?.status ?? "")
    .toLowerCase()
    .trim();

  const currentStep: WorkflowStep = API_TO_STAGE[stageKey] ?? "Report";

  let status: CaseStatus = API_TO_STATUS[statusKey] ?? "Under Review";
  if (!raw?.status) {
    if (raw?.closedAt || raw?.outcome) {
      status = "Closed";
    } else if (currentStep === "Hearing") {
      status = "Hearing Scheduled";
    } else if (currentStep === "Decision") {
      status = "Decision Pending";
    } else if (currentStep === "Investigation") {
      status = "Investigation";
    }
  }

  const department =
    typeof raw?.employee?.department === "object"
      ? raw.employee.department?.name
      : (raw?.employee?.department ?? raw?.department ?? "—");

  const witnesses = Array.isArray(raw?.witnesses)
    ? raw.witnesses
        .map((w: any) =>
          typeof w === "string" ? w : formatEmployeeName(w, ""),
        )
        .filter(Boolean)
        .join(", ")
    : typeof raw?.witnesses === "string"
      ? raw.witnesses
      : undefined;

  return {
    id: String(raw?.id ?? ""),
    caseCode:
      raw?.caseNumber ??
      raw?.code ??
      String(raw?.id ?? "")
        .slice(0, 8)
        .toUpperCase(),
    employee: formatEmployeeName(
      raw?.employee ?? raw?.employeeName,
      "Unknown Employee",
    ),
    department: String(department || "—"),
    category: String(raw?.category ?? "Policy breach"),
    severity: String(raw?.severity ?? "Minor"),
    openedDate: formatDateShort(
      raw?.incidentDate ?? raw?.openedDate ?? raw?.createdAt,
    ),
    incidentDate: raw?.incidentDate,
    status,
    currentStep,
    reporter: formatEmployeeName(
      raw?.reportedBy ?? raw?.reporter ?? raw?.reportedByEmployee,
    ),
    investigator: formatEmployeeName(
      raw?.investigator ?? raw?.investigatorEmployee,
    ),
    description: String(raw?.description ?? ""),
    witnesses: witnesses || undefined,
    interimAction: raw?.interimAction ? String(raw.interimAction) : undefined,
    outcome: raw?.outcome ? String(raw.outcome) : undefined,
    dueDate: raw?.dueDate,
  };
};

/* -------------------------------------------------------------------------- */
/* Queries                                                                    */
/* -------------------------------------------------------------------------- */

export const useDisciplinaryCases = () =>
  useQuery<DisciplinaryCase[]>({
    queryKey: [...queryRoot, "list"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/disciplinary-cases");
      return unwrapList<any>(data, ["cases", "items"]).map(mapCaseFromApi);
    },
  });

export const useDisciplinaryOptions = () =>
  useQuery<DisciplinaryOptions>({
    queryKey: [...queryRoot, "options"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/disciplinary-cases/options");
      const obj = unwrapObject<any>(data);
      const toStrings = (list: unknown): string[] =>
        Array.isArray(list)
          ? list
              .map((item) =>
                typeof item === "string"
                  ? item
                  : String(item?.name ?? item?.label ?? item?.value ?? ""),
              )
              .filter(Boolean)
          : [];
      return {
        categories: toStrings(obj?.categories),
        severities: toStrings(obj?.severities),
      };
    },
  });

export const useDisciplinaryEmployees = () =>
  useQuery<DisciplinaryEmployee[]>({
    queryKey: [...queryRoot, "employees"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>(
        "/disciplinary-cases/employees",
      );
      return unwrapList<DisciplinaryEmployee>(data, [
        "employees",
        "staffs",
        "items",
      ]);
    },
  });

export const useDisciplinaryCaseEvidence = (caseId?: string, enabled = true) =>
  useQuery<DisciplinaryEvidenceItem[]>({
    queryKey: [...queryRoot, "evidence", caseId],
    enabled: Boolean(caseId) && enabled,
    queryFn: async () => {
      const { data } = await apiClient.get<any>(
        `/disciplinary-cases/${caseId}/evidence`,
      );
      return unwrapList<DisciplinaryEvidenceItem>(data, [
        "evidence",
        "items",
        "files",
      ]);
    },
  });

export const useDisciplinaryCaseHistory = (caseId?: string, enabled = true) =>
  useQuery<DisciplinaryHistoryItem[]>({
    queryKey: [...queryRoot, "history", caseId],
    enabled: Boolean(caseId) && enabled,
    queryFn: async () => {
      const { data } = await apiClient.get<any>(
        `/disciplinary-cases/${caseId}/history`,
      );
      return unwrapList<DisciplinaryHistoryItem>(data, [
        "history",
        "logs",
        "items",
      ]);
    },
  });

/* -------------------------------------------------------------------------- */
/* Mutations                                                                  */
/* -------------------------------------------------------------------------- */

const useInvalidateDisciplinary = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryRoot });
};

export const useConfigureDisciplinaryOptions = () => {
  const invalidate = useInvalidateDisciplinary();
  return useMutation({
    mutationFn: async (payload: DisciplinaryOptions) => {
      const { data } = await apiClient.put<any>(
        "/disciplinary-cases/options",
        payload,
      );
      return unwrapObject(data);
    },
    onSuccess: invalidate,
  });
};

export const useCreateDisciplinaryCase = () => {
  const invalidate = useInvalidateDisciplinary();
  return useMutation({
    mutationFn: async (payload: CreateDisciplinaryCasePayload) => {
      const { data } = await apiClient.post<any>(
        "/disciplinary-cases",
        payload,
      );
      return unwrapObject(data);
    },
    onSuccess: invalidate,
  });
};

export const useAdvanceDisciplinaryStage = () => {
  const invalidate = useInvalidateDisciplinary();
  return useMutation({
    mutationFn: async ({ id, stage, notes }: AdvanceStagePayload) => {
      const { data } = await apiClient.patch<any>(
        `/disciplinary-cases/${id}/stage`,
        { stage, ...(notes ? { notes } : {}) },
      );
      return unwrapObject(data);
    },
    onSuccess: invalidate,
  });
};

export const useCloseDisciplinaryCase = () => {
  const invalidate = useInvalidateDisciplinary();
  return useMutation({
    mutationFn: async ({ id, outcome }: CloseCasePayload) => {
      const { data } = await apiClient.patch<any>(
        `/disciplinary-cases/${id}/close`,
        { outcome },
      );
      return unwrapObject(data);
    },
    onSuccess: invalidate,
  });
};

export const useUploadDisciplinaryEvidence = () => {
  const invalidate = useInvalidateDisciplinary();
  return useMutation({
    mutationFn: async ({ id, file }: { id: string; file: File }) => {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await apiClient.post<any>(
        `/disciplinary-cases/${id}/evidence`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      return unwrapObject(data);
    },
    onSuccess: invalidate,
  });
};

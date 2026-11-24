import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "./simpleApi";
import { get_user_value } from "@/store/authStore";
import type {
  LeaveBalanceSummary,
  LeaveRequest,
  LeaveStatus,
  LeaveType,
  LeaveTypeSummary,
} from "@/routes/hr/leave/-components/types";

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

export interface CreateLeaveRequestPayload {
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  isHalfDay?: boolean;
  halfDayPeriod?: "AM" | "PM";
  coveringEmployeeId?: string;
  reason: string;
  contactPhone?: string;
  contactAddress?: string;
  supportingDocumentUrl?: string;
}

export interface UpdateLeaveTypePayload {
  code?: string;
  name?: string;
  isPaid?: boolean;
  evidenceAlwaysRequired?: boolean;
  requiresEvidenceOverDays?: number;
  isActive?: boolean;
  year?: number;
  entitlementDays?: number;
}

/* -------------------------------------------------------------------------- */
/* Mapping helpers (backend → UI shapes)                                       */
/* -------------------------------------------------------------------------- */

const LEAVE_TYPE_MAP: Record<string, LeaveType> = {
  annual: "Annual",
  annualleave: "Annual",
  sick: "Sick",
  sickleave: "Sick",
  maternity: "Maternity",
  maternityleave: "Maternity",
  paternity: "Paternity",
  paternityleave: "Paternity",
  compassionate: "Compassionate",
  compassionateleave: "Compassionate",
  study: "Study",
  studyleave: "Study",
  unpaid: "Unpaid",
  unpaidleave: "Unpaid",
};

/** Map a backend leave type (code or name) onto the UI LeaveType union. */
export const toLeaveType = (value?: string): LeaveType => {
  const key = (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z]/g, "");
  if (LEAVE_TYPE_MAP[key]) return LEAVE_TYPE_MAP[key];
  return (
    key ? key.charAt(0).toUpperCase() + key.slice(1) : "Annual"
  ) as LeaveType;
};

const TYPE_COLORS: Record<LeaveType, string> = {
  Annual: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Sick: "bg-blue-50 text-blue-700 border-blue-200",
  Maternity: "bg-purple-50 text-purple-700 border-purple-200",
  Paternity: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Compassionate: "bg-amber-50 text-amber-700 border-amber-200",
  Study: "bg-cyan-50 text-cyan-700 border-cyan-200",
  Unpaid: "bg-slate-50 text-slate-700 border-slate-200",
};

const formatDay = (value?: string): string => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10) || "—";
  return date.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
};

const computeDays = (
  start?: string,
  end?: string,
  halfDay?: boolean,
): number => {
  if (halfDay) return 0.5;
  if (!start || !end) return 0;
  const ms = Date.parse(end) - Date.parse(start);
  if (Number.isNaN(ms)) return 0;
  return Math.max(1, Math.round(ms / 86400000) + 1);
};

const normalizeLeaveStatus = (value?: string): LeaveStatus => {
  const key = (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "_");
  const map: Record<string, LeaveStatus> = {
    approved: "Approved",
    rejected: "Rejected",
    cancelled: "Cancelled",
    canceled: "Cancelled",
    submitted: "Submitted",
    pending_manager_approval: "Pending Manager Approval",
    manager_pending: "Pending Manager Approval",
    pending_manager: "Pending Manager Approval",
    pending_hrapproval: "Pending HR Approval",
    pending_hr_approval: "Pending HR Approval",
    hr_pending: "Pending HR Approval",
    pending_approval: "Pending HR Approval",
    pending: "Submitted",
  };
  return map[key] ?? "Submitted";
};

export const mapBackendLeaveType = (raw: any): LeaveTypeSummary => {
  const nested =
    raw?.type && typeof raw.type === "object"
      ? raw.type
      : raw?.leaveType && typeof raw.leaveType === "object"
        ? raw.leaveType
        : raw;
  const type = toLeaveType(
    nested?.code ??
      nested?.name ??
      (typeof raw?.type === "string" ? raw.type : undefined),
  );
  const entitlementDays =
    raw?.entitlementDays ??
    raw?.entitlement_days ??
    nested?.entitlementDays ??
    nested?.entitlement_days;
  return {
    id: nested?.id ?? raw?.id ?? undefined,
    type,
    entitlementDays: entitlementDays ?? undefined,
    entitlement:
      typeof entitlementDays === "number"
        ? `${entitlementDays} days`
        : typeof raw?.entitlement === "number"
          ? `${raw.entitlement} days`
          : (raw?.entitlement ?? raw?.policy ?? ""),
    description:
      raw?.description ?? raw?.policyDescription ?? nested?.description ?? "",
    color: TYPE_COLORS[type] ?? TYPE_COLORS.Annual,
    code: nested?.code ?? undefined,
    name: nested?.name ?? undefined,
    isPaid: typeof nested?.isPaid === "boolean" ? nested.isPaid : undefined,
    evidenceAlwaysRequired:
      typeof nested?.evidenceAlwaysRequired === "boolean"
        ? nested.evidenceAlwaysRequired
        : undefined,
    requiresEvidenceOverDays:
      typeof nested?.requiresEvidenceOverDays === "number"
        ? nested.requiresEvidenceOverDays
        : undefined,
    isActive:
      typeof nested?.isActive === "boolean" ? nested.isActive : undefined,
    year:
      typeof raw?.year === "number"
        ? raw.year
        : typeof nested?.year === "number"
          ? nested.year
          : undefined,
  };
};

export const mapBackendLeaveRequest = (raw: any): LeaveRequest => {
  const startDate = raw?.startDate ?? raw?.start_date ?? raw?.start;
  const endDate = raw?.endDate ?? raw?.end_date ?? raw?.end;
  const isHalfDay = Boolean(
    raw?.isHalfDay ?? raw?.isHalf ?? raw?.halfDay ?? raw?.is_half_day,
  );
  return {
    id: String(raw?.id ?? raw?.leaveRequestId ?? raw?.requestId ?? ""),
    emp: String(
      raw?.name ??
        raw?.employeeName ??
        raw?.requestedByName ??
        raw?.employee?.name ??
        raw?.staffName ??
        "—",
    ),
    type: toLeaveType(
      raw?.leaveTypeId ?? raw?.type ?? raw?.leaveType ?? raw?.typeName,
    ),
    from: formatDay(startDate),
    to: formatDay(endDate),
    days:
      typeof raw?.days === "number"
        ? raw.days
        : computeDays(startDate, endDate, isHalfDay),
    status: normalizeLeaveStatus(raw?.status ?? raw?.state),
    reason: raw?.reason,
    cover:
      raw?.coveringEmployeeName ??
      (raw?.coveringEmployeeId ? String(raw.coveringEmployeeId) : undefined),
    phone: raw?.contactPhone,
    address: raw?.contactAddress,
    half: isHalfDay
      ? raw?.halfDayPeriod === "PM"
        ? "Second half"
        : "First half"
      : "No",
    startDate: startDate ? String(startDate).slice(0, 10) : undefined,
    endDate: endDate ? String(endDate).slice(0, 10) : undefined,
    coverId: raw?.coveringEmployeeId
      ? String(raw.coveringEmployeeId)
      : undefined,
  };
};

const toOptionalNumber = (value: any): number | undefined => {
  if (value === undefined || value === null || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
};

export const mapBackendLeaveBalance = (raw: any): LeaveBalanceSummary => ({
  type: toLeaveType(raw?.type ?? raw?.leaveType ?? raw?.name),
  annualEntitlement: toOptionalNumber(
    raw?.annualEntitlement ??
      raw?.entitlementDays ??
      raw?.entitlement ??
      raw?.totalEntitlement,
  ),
  used: toOptionalNumber(
    raw?.used ?? raw?.usedDays ?? raw?.taken ?? raw?.daysUsed,
  ),
  pendingReservation: toOptionalNumber(
    raw?.pendingReservation ?? raw?.pending ?? raw?.pendingDays,
  ),
  available: toOptionalNumber(
    raw?.available ?? raw?.balance ?? raw?.remaining ?? raw?.remainingDays,
  ),
});

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
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

const queryRoot = ["leave"] as const;

const useInvalidateLeave = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryRoot });
};

/* -------------------------------------------------------------------------- */
/* Queries                                                                     */
/* -------------------------------------------------------------------------- */

export const useLeaveTypes = () =>
  useQuery<LeaveTypeSummary[]>({
    queryKey: [...queryRoot, "types"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/leave/types", authConfig());
      return unwrapList<any>(data, ["types", "leaveTypes"]).map(
        mapBackendLeaveType,
      );
    },
  });

export const useLeaveRequests = () =>
  useQuery<LeaveRequest[]>({
    queryKey: [...queryRoot, "requests"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>(
        "/leave/requests",
        authConfig(),
      );
      return unwrapList<any>(data, ["requests"]).map(mapBackendLeaveRequest);
    },
  });

export const useMyLeaveRequests = () =>
  useQuery<LeaveRequest[]>({
    queryKey: [...queryRoot, "requests", "mine"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>(
        "/leave/requests/mine",
        authConfig(),
      );
      return unwrapList<any>(data, ["requests", "mine"]).map(
        mapBackendLeaveRequest,
      );
    },
  });

export const useLeaveBalances = () =>
  useQuery<LeaveBalanceSummary[]>({
    queryKey: [...queryRoot, "balances"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>(
        "/leave/balances/mine",
        authConfig(),
      );
      const list = unwrapList<any>(data, [
        "balances",
        "entitlements",
        "summary",
      ]).map(mapBackendLeaveBalance);
      if (list.length > 0) return list;
      // Endpoint may return a single balance summary object rather than a list.
      const single = mapBackendLeaveBalance(data?.data ?? data);
      const hasData =
        single.annualEntitlement !== undefined ||
        single.used !== undefined ||
        single.pendingReservation !== undefined ||
        single.available !== undefined;
      return hasData ? [single] : [];
    },
  });

/* -------------------------------------------------------------------------- */
/* Mutations                                                                   */
/* -------------------------------------------------------------------------- */

export const useCreateLeaveRequest = () => {
  const invalidate = useInvalidateLeave();
  return useMutation({
    mutationFn: async (payload: CreateLeaveRequestPayload) => {
      const { data } = await apiClient.post<any>(
        "/leave/requests",
        payload,
        authConfig(),
      );
      return data?.data ?? data;
    },
    onSuccess: invalidate,
  });
};

export const useDecideLeaveRequest = () => {
  const invalidate = useInvalidateLeave();
  return useMutation({
    mutationFn: async ({
      id,
      decision,
      rejectionReason,
    }: {
      id: string;
      decision: "approve" | "reject";
      rejectionReason?: string;
    }) => {
      const { data } = await apiClient.patch<any>(
        `/leave/requests/${id}/decision`,
        { decision, rejectionReason },
        authConfig(),
      );
      return data?.data ?? data;
    },
    onSuccess: invalidate,
  });
};

export const useCancelLeaveRequest = () => {
  const invalidate = useInvalidateLeave();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.patch<any>(
        `/leave/requests/${id}/cancel`,
        {},
        authConfig(),
      );
      return data?.data ?? data;
    },
    onSuccess: invalidate,
  });
};

export const useUpdateLeaveType = () => {
  const invalidate = useInvalidateLeave();
  return useMutation({
    mutationFn: async (payload: UpdateLeaveTypePayload) => {
      const { data } = await apiClient.put<any>(
        "/leave/types",
        payload,
        authConfig(),
      );
      return data?.data ?? data;
    },
    onSuccess: invalidate,
  });
};

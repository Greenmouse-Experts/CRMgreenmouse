import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "./simpleApi";

/** Loose shapes — attendance responses have no examples in the collection. */
export interface AttendanceDashboard {
  [key: string]: any;
}

export interface AttendanceRecordApi {
  id: string;
  staffId?: string;
  staff?: { id?: string; firstName?: string; lastName?: string; name?: string };
  staffName?: string;
  clockInAt?: string;
  clockOutAt?: string;
  status?: string;
  shift?: { id?: string; name?: string } | string;
  workMode?: string;
  location?: string;
  [key: string]: any;
}

export interface CorrectionApi {
  id: string;
  staffId?: string;
  staff?: { id?: string; firstName?: string; lastName?: string; name?: string };
  date?: string;
  correctionType?: string;
  correctedClockInAt?: string;
  correctedClockOutAt?: string;
  reason?: string;
  rejectionReason?: string;
  status?: string;
  [key: string]: any;
}

export interface Shift {
  id: string;
  name?: string;
  startTime?: string;
  endTime?: string;
  workingDays?: number[];
  lateGraceMinutes?: number;
  overtimeGraceMinutes?: number;
  [key: string]: any;
}

export interface CreateCorrectionPayload {
  date: string;
  correctionType: string;
  correctedClockInAt?: string;
  correctedClockOutAt?: string;
  reason?: string;
  evidenceUrl?: string;
}

const unwrapList = <T>(data: any, keys: string[]): T[] => {
  if (Array.isArray(data)) return data as T[];
  if (Array.isArray(data?.data)) return data.data as T[];
  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key] as T[];
  }
  return [];
};

const queryRoot = ["attendance"] as const;

/* -------------------------------------------------------------------------- */
/* Queries                                                                     */
/* -------------------------------------------------------------------------- */

export const useAttendanceDashboard = () =>
  useQuery<AttendanceDashboard>({
    queryKey: [...queryRoot, "dashboard"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/attendance/dashboard");
      return (data?.data ?? data) as AttendanceDashboard;
    },
  });

export const useAttendanceRecords = (
  params?: {
    staffId?: string;
    from?: string;
    to?: string;
  },
  options?: { enabled?: boolean },
) =>
  useQuery<AttendanceRecordApi[]>({
    queryKey: [...queryRoot, "records", params],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/attendance", { params });
      return unwrapList<AttendanceRecordApi>(data, [
        "attendance",
        "records",
        "items",
      ]);
    },
    enabled: options?.enabled ?? true,
  });

export const useCorrectionRequests = () =>
  useQuery<CorrectionApi[]>({
    queryKey: [...queryRoot, "corrections"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/attendance/corrections");
      return unwrapList<CorrectionApi>(data, [
        "corrections",
        "requests",
        "items",
      ]);
    },
  });

export const useMyCorrectionRequests = (options?: { enabled?: boolean }) =>
  useQuery<CorrectionApi[]>({
    queryKey: [...queryRoot, "corrections", "mine"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/attendance/corrections/mine");
      return unwrapList<CorrectionApi>(data, [
        "corrections",
        "requests",
        "items",
      ]);
    },
    enabled: options?.enabled ?? true,
  });

export const useShifts = () =>
  useQuery<Shift[]>({
    queryKey: [...queryRoot, "shifts"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/attendance/shifts");
      return unwrapList<Shift>(data, ["shifts", "items"]);
    },
  });

export const useTimezone = () =>
  useQuery<{ timezone?: string; [key: string]: any }>({
    queryKey: [...queryRoot, "timezone"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/attendance/timezone");
      return data?.data ?? data ?? {};
    },
  });

/* -------------------------------------------------------------------------- */
/* Mutations                                                                   */
/* -------------------------------------------------------------------------- */

const useInvalidateAttendance = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryRoot });
};

export const useClockIn = () => {
  const invalidate = useInvalidateAttendance();
  return useMutation({
    mutationFn: async (staffId: string) => {
      const { data } = await apiClient.post<any>("/attendance/clock-in", {
        staffId,
      });
      return data?.data ?? data;
    },
    onSuccess: invalidate,
  });
};

export const useClockOut = () => {
  const invalidate = useInvalidateAttendance();
  return useMutation({
    mutationFn: async (staffId: string) => {
      const { data } = await apiClient.post<any>("/attendance/clock-out", {
        staffId,
      });
      return data?.data ?? data;
    },
    onSuccess: invalidate,
  });
};

export const useCreateCorrection = () => {
  const invalidate = useInvalidateAttendance();
  return useMutation({
    mutationFn: async (payload: CreateCorrectionPayload) => {
      const { data } = await apiClient.post<any>(
        "/attendance/corrections",
        payload,
      );
      return data?.data ?? data;
    },
    onSuccess: invalidate,
  });
};

export const useDecideCorrection = () => {
  const invalidate = useInvalidateAttendance();
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
        `/attendance/corrections/${id}/decision`,
        { decision, rejectionReason },
      );
      return data?.data ?? data;
    },
    onSuccess: invalidate,
  });
};

export const useCreateShift = () => {
  const invalidate = useInvalidateAttendance();
  return useMutation({
    mutationFn: async (payload: {
      name: string;
      startTime: string;
      endTime: string;
      workingDays: number[];
      lateGraceMinutes?: number;
      overtimeGraceMinutes?: number;
    }) => {
      const { data } = await apiClient.post<any>("/attendance/shifts", payload);
      return data?.data ?? data;
    },
    onSuccess: invalidate,
  });
};

export const useUpdateShift = () => {
  const invalidate = useInvalidateAttendance();
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: {
      id: string;
    } & Partial<Shift>) => {
      const { data } = await apiClient.patch<any>(
        `/attendance/shifts/${id}`,
        payload,
      );
      return data?.data ?? data;
    },
    onSuccess: invalidate,
  });
};

export const useAssignShift = () => {
  const invalidate = useInvalidateAttendance();
  return useMutation({
    mutationFn: async ({ id, staffId }: { id: string; staffId: string }) => {
      const { data } = await apiClient.put<any>(
        `/attendance/shifts/${id}/assignment`,
        { staffId },
      );
      return data?.data ?? data;
    },
    onSuccess: invalidate,
  });
};

export const useUpdateTimezone = () => {
  const invalidate = useInvalidateAttendance();
  return useMutation({
    mutationFn: async (timezone: string) => {
      const { data } = await apiClient.put<any>("/attendance/timezone", {
        timezone,
      });
      return data?.data ?? data;
    },
    onSuccess: invalidate,
  });
};

export const useCorrectAttendanceRecord = () => {
  const invalidate = useInvalidateAttendance();
  return useMutation({
    mutationFn: async ({
      id,
      clockInAt,
      clockOutAt,
    }: {
      id: string;
      clockInAt: string;
      clockOutAt: string;
    }) => {
      const { data } = await apiClient.patch<any>(`/attendance/${id}`, {
        clockInAt,
        clockOutAt,
      });
      return data?.data ?? data;
    },
    onSuccess: invalidate,
  });
};

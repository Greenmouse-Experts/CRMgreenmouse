import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "./simpleApi";

export interface PerformanceCycle {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  dueDate: string;
  status?: string;
  [key: string]: any;
}

export interface PerformanceGoal {
  id: string;
  employeeId: string;
  title: string;
  category: string;
  measure?: string;
  targetValue?: number;
  currentValue?: number;
  weight?: number;
  startDate?: string;
  dueDate?: string;
  description?: string;
  progress?: number;
  [key: string]: any;
}

export interface PerformanceAppraisal {
  id: string;
  employeeId?: string;
  employee?: string;
  reviewer?: string;
  rating?: number | string;
  status?: string;
  cycle?: string;
  selfScore?: number | string;
  managerScore?: number | string;
  selfAssessment?: string;
  managerComments?: string;
  [key: string]: any;
}

const queryRoot = ["performance"] as const;

const unwrapList = <T,>(data: any, keys: string[]): T[] => {
  if (Array.isArray(data)) return data as T[];
  if (Array.isArray(data?.data)) return data.data as T[];
  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key] as T[];
    if (Array.isArray(data?.data?.[key])) return data.data[key] as T[];
  }
  return [];
};

const unwrapOne = <T>(data: any): T =>
  (data?.data?.data ?? data?.data ?? data?.payload ?? data) as T;

const authConfig = () => {
  const { get_user_value } = require("@/store/authStore");
  const token = get_user_value()?.accessToken;
  return { headers: { Authorization: `Bearer ${token}` } };
};

const useInvalidatePerformance = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryRoot });
};

/* -------------------------------------------------------------------------- */
/* Cycles                                                                     */
/* -------------------------------------------------------------------------- */

export const usePerformanceCycles = () =>
  useQuery<PerformanceCycle[]>({
    queryKey: [...queryRoot, "cycles"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>(
        "/performance/cycles",
        authConfig(),
      );
      return unwrapList<PerformanceCycle>(data, ["cycles", "items"]);
    },
  });

export const useCreatePerformanceCycle = () => {
  const invalidate = useInvalidatePerformance();
  return useMutation({
    mutationFn: async (payload: {
      name: string;
      startDate: string;
      endDate: string;
      dueDate: string;
    }) => {
      const { data } = await apiClient.post<any>(
        "/performance/cycles",
        payload,
        authConfig(),
      );
      return unwrapOne<any>(data);
    },
    onSuccess: invalidate,
  });
};

export const useAdvancePerformanceCycle = () => {
  const invalidate = useInvalidatePerformance();
  return useMutation({
    mutationFn: async (cycleId: string) => {
      const { data } = await apiClient.patch<any>(
        `/performance/cycles/${cycleId}/advance`,
        {},
        authConfig(),
      );
      return unwrapOne<any>(data);
    },
    onSuccess: invalidate,
  });
};

/* -------------------------------------------------------------------------- */
/* Goals                                                                      */
/* -------------------------------------------------------------------------- */

export const usePerformanceGoals = (cycleId?: string) =>
  useQuery<PerformanceGoal[]>({
    queryKey: [...queryRoot, "goals", cycleId],
    queryFn: async () => {
      const { data } = await apiClient.get<any>(
        `/performance/cycles/${cycleId}/goals`,
        authConfig(),
      );
      return unwrapList<PerformanceGoal>(data, ["goals", "items"]);
    },
    enabled: Boolean(cycleId),
  });

export const useCreatePerformanceGoal = () => {
  const invalidate = useInvalidatePerformance();
  return useMutation({
    mutationFn: async ({
      cycleId,
      ...payload
    }: {
      cycleId: string;
      employeeId: string;
      title: string;
      category: string;
      measure?: string;
      targetValue?: number;
      weight?: number;
      startDate?: string;
      dueDate?: string;
      description?: string;
    }) => {
      const { data } = await apiClient.post<any>(
        `/performance/cycles/${cycleId}/goals`,
        payload,
        authConfig(),
      );
      return unwrapOne<any>(data);
    },
    onSuccess: invalidate,
  });
};

export const useUpdateGoalProgress = () => {
  const invalidate = useInvalidatePerformance();
  return useMutation({
    mutationFn: async ({
      goalId,
      currentValue,
      progressNote,
      evidenceUrl,
    }: {
      goalId: string;
      currentValue: number;
      progressNote?: string;
      evidenceUrl?: string;
    }) => {
      const { data } = await apiClient.patch<any>(
        `/performance/goals/${goalId}/progress`,
        { currentValue, progressNote, evidenceUrl },
        authConfig(),
      );
      return unwrapOne<any>(data);
    },
    onSuccess: invalidate,
  });
};

/* -------------------------------------------------------------------------- */
/* Appraisals                                                                 */
/* -------------------------------------------------------------------------- */

export const usePerformanceAppraisals = () =>
  useQuery<PerformanceAppraisal[]>({
    queryKey: [...queryRoot, "appraisals"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>(
        "/performance/appraisals",
        authConfig(),
      );
      return unwrapList<PerformanceAppraisal>(data, ["appraisals", "items"]);
    },
  });

export const useSelfAssessAppraisal = () => {
  const invalidate = useInvalidatePerformance();
  return useMutation({
    mutationFn: async ({
      appraisalId,
      rating,
      assessment,
    }: {
      appraisalId: string;
      rating: number;
      assessment?: string;
    }) => {
      const { data } = await apiClient.post<any>(
        `/performance/appraisals/${appraisalId}/self-assessment`,
        { rating, assessment },
        authConfig(),
      );
      return unwrapOne<any>(data);
    },
    onSuccess: invalidate,
  });
};

export const useManagerReviewAppraisal = () => {
  const invalidate = useInvalidatePerformance();
  return useMutation({
    mutationFn: async ({
      appraisalId,
      rating,
      comments,
    }: {
      appraisalId: string;
      rating: number;
      comments?: string;
    }) => {
      const { data } = await apiClient.post<any>(
        `/performance/appraisals/${appraisalId}/manager-review`,
        { rating, comments },
        authConfig(),
      );
      return unwrapOne<any>(data);
    },
    onSuccess: invalidate,
  });
};

export const useCalibrateAppraisal = () => {
  const invalidate = useInvalidatePerformance();
  return useMutation({
    mutationFn: async ({
      appraisalId,
      rating,
      reason,
    }: {
      appraisalId: string;
      rating: number;
      reason?: string;
    }) => {
      const { data } = await apiClient.post<any>(
        `/performance/appraisals/${appraisalId}/calibration`,
        { rating, reason },
        authConfig(),
      );
      return unwrapOne<any>(data);
    },
    onSuccess: invalidate,
  });
};

export const useCalibrationHistory = (appraisalId?: string) =>
  useQuery<any[]>({
    queryKey: [...queryRoot, "calibration-history", appraisalId],
    queryFn: async () => {
      const { data } = await apiClient.get<any>(
        `/performance/appraisals/${appraisalId}/calibration-history`,
        authConfig(),
      );
      return unwrapList<any>(data, ["history", "items"]);
    },
    enabled: Boolean(appraisalId),
  });

export const useSignOffAppraisal = () => {
  const invalidate = useInvalidatePerformance();
  return useMutation({
    mutationFn: async ({
      appraisalId,
      feedback,
    }: {
      appraisalId: string;
      feedback?: string;
    }) => {
      const { data } = await apiClient.post<any>(
        `/performance/appraisals/${appraisalId}/sign-off`,
        { feedback },
        authConfig(),
      );
      return unwrapOne<any>(data);
    },
    onSuccess: invalidate,
  });
};

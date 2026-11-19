import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "./simpleApi";

/** The employees module returns loose/unverified shapes; keep these permissive. */
export interface OnboardingTask {
  id: string;
  title?: string;
  name?: string;
  text?: string;
  description?: string;
  status?: string;
  completed?: boolean;
  isCompleted?: boolean;
  department?: string;
  dept?: string;
  assignedTo?: string;
  [key: string]: any;
}

export interface ProbationReview {
  id: string;
  status?: string;
  stage?: string;
  milestone?: string;
  title?: string;
  notes?: string;
  completed?: boolean;
  [key: string]: any;
}

const unwrapList = <T,>(data: any, keys: string[]): T[] => {
  if (Array.isArray(data)) return data as T[];
  if (Array.isArray(data?.data)) return data.data as T[];
  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key] as T[];
  }
  return [];
};

const queryRoot = ["onboarding"] as const;

/* -------------------------------------------------------------------------- */
/* Queries                                                                     */
/* -------------------------------------------------------------------------- */

export const useOnboardingTasks = (employeeId?: string) =>
  useQuery<OnboardingTask[]>({
    queryKey: [...queryRoot, "tasks", employeeId],
    queryFn: async () => {
      if (!employeeId) return [];
      const { data } = await apiClient.get<any>(
        `/employees/${employeeId}/onboarding/tasks`,
      );
      return unwrapList<OnboardingTask>(data, ["tasks", "items"]);
    },
    enabled: Boolean(employeeId),
  });

export const useProbationReviews = (employeeId?: string) =>
  useQuery<ProbationReview[]>({
    queryKey: [...queryRoot, "probation", employeeId],
    queryFn: async () => {
      if (!employeeId) return [];
      const { data } = await apiClient.get<any>(
        `/employees/${employeeId}/probation/reviews`,
      );
      return unwrapList<ProbationReview>(data, ["reviews", "items"]);
    },
    enabled: Boolean(employeeId),
  });

/* -------------------------------------------------------------------------- */
/* Mutations                                                                   */
/* -------------------------------------------------------------------------- */

const useInvalidateOnboarding = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryRoot });
};

export const useStartOnboarding = () => {
  const invalidate = useInvalidateOnboarding();
  return useMutation({
    mutationFn: async (employeeId: string) => {
      const { data } = await apiClient.post<any>(
        `/employees/${employeeId}/onboarding/start`,
      );
      return data?.data ?? data;
    },
    onSuccess: invalidate,
  });
};

export const useCompleteOnboardingTask = () => {
  const invalidate = useInvalidateOnboarding();
  return useMutation({
    mutationFn: async ({
      taskId,
      notes = "",
    }: {
      taskId: string;
      notes?: string;
    }) => {
      const { data } = await apiClient.patch<any>(
        `/employees/onboarding/tasks/${taskId}/complete`,
        { notes },
      );
      return data?.data ?? data;
    },
    onSuccess: invalidate,
  });
};

export const useReassignOnboardingTask = () => {
  const invalidate = useInvalidateOnboarding();
  return useMutation({
    mutationFn: async ({
      taskId,
      assignedTo,
    }: {
      taskId: string;
      assignedTo: string;
    }) => {
      const { data } = await apiClient.patch<any>(
        `/employees/onboarding/tasks/${taskId}/assignment`,
        { assignedTo },
      );
      return data?.data ?? data;
    },
    onSuccess: invalidate,
  });
};

export const useCompleteProbationReview = () => {
  const invalidate = useInvalidateOnboarding();
  return useMutation({
    mutationFn: async ({
      reviewId,
      notes = "",
    }: {
      reviewId: string;
      notes?: string;
    }) => {
      const { data } = await apiClient.patch<any>(
        `/employees/probation/reviews/${reviewId}/complete`,
        { notes },
      );
      return data?.data ?? data;
    },
    onSuccess: invalidate,
  });
};

export const useDecideProbation = () => {
  const invalidate = useInvalidateOnboarding();
  return useMutation({
    mutationFn: async ({
      employeeId,
      decision,
    }: {
      employeeId: string;
      decision: "confirm" | "extend";
    }) => {
      const { data } = await apiClient.post<any>(
        `/employees/${employeeId}/probation/decision`,
        { decision },
      );
      return data?.data ?? data;
    },
    onSuccess: invalidate,
  });
};

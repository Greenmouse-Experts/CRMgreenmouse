import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "./simpleApi";
import { get_user_value } from "@/store/authStore";
import AUTH_CRED from "../../auth_cred";

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

export interface EmployeeRecord {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  employeeNumber?: string;
  status?: string;
  employmentType?: string;
  startDate?: string;
  createdAt?: string;
  departmentId?: string;
  positionId?: string;
  departmentName?: string;
  positionName?: string;
  department?: { id?: string; name?: string } | string;
  position?: { id?: string; name?: string } | string;
  role?: { id?: string; name?: string };
  manager?: { id?: string; name?: string } | string;
  location?: string;
  grade?: string;
  [key: string]: any;
}

export interface EmployeeOption {
  id: string;
  name: string;
  [key: string]: any;
}

export interface EmployeeOrganization {
  departments: EmployeeOption[];
  positions: EmployeeOption[];
  [key: string]: any;
}

export interface CreateEmployeeInput {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  departmentId?: string;
  positionId?: string;
  employmentType?: string;
  startDate?: string;
  [key: string]: any;
}

export type UpdateEmployeeInput = Partial<CreateEmployeeInput> &
  Record<string, any>;

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * The employee API lives on the tenant session. Fall back to the seeded
 * test credentials when no user is stored so it can be exercised locally.
 */
const authConfig = () => {
  const token = get_user_value()?.accessToken ?? AUTH_CRED.accessToken;
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

const queryRoot = ["employees"] as const;

const useInvalidateEmployees = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryRoot });
};

/* -------------------------------------------------------------------------- */
/* Queries                                                                     */
/* -------------------------------------------------------------------------- */

export const useEmployees = () =>
  useQuery<EmployeeRecord[]>({
    queryKey: [...queryRoot, "list"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/employees", authConfig());
      return unwrapList<EmployeeRecord>(data, ["employees"]);
    },
  });

export const useEmployee = (id?: string) =>
  useQuery<EmployeeRecord>({
    queryKey: [...queryRoot, "detail", id],
    queryFn: async () => {
      const { data } = await apiClient.get<any>(
        `/employees/${id}`,
        authConfig(),
      );
      return unwrapOne<EmployeeRecord>(data);
    },
    enabled: Boolean(id),
  });

export const useEmployeeOrganization = () =>
  useQuery<EmployeeOrganization>({
    queryKey: [...queryRoot, "organization"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>(
        "/employees/organization",
        authConfig(),
      );
      const payload = unwrapOne<any>(data) ?? {};
      return {
        ...payload,
        departments: unwrapList<EmployeeOption>(payload, ["departments"]),
        positions: unwrapList<EmployeeOption>(payload, ["positions"]),
      } as EmployeeOrganization;
    },
  });

export const useEmployeeRecentActivity = () =>
  useQuery<any[]>({
    queryKey: [...queryRoot, "recent-activity"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>(
        "/employees/recent-activity",
        authConfig(),
      );
      return unwrapList<any>(data, ["activities"]);
    },
  });

export const useUpcomingMilestones = () =>
  useQuery<any[]>({
    queryKey: [...queryRoot, "upcoming-milestones"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>(
        "/employees/upcoming-milestones",
        authConfig(),
      );
      return unwrapList<any>(data, ["milestones"]);
    },
  });

export const useEmployeeCompensation = (id?: string) =>
  useQuery<any>({
    queryKey: [...queryRoot, "compensation", id],
    queryFn: async () => {
      const { data } = await apiClient.get<any>(
        `/employees/${id}/compensation`,
        authConfig(),
      );
      return unwrapOne<any>(data);
    },
    enabled: Boolean(id),
  });

export const useEmployeeOnboardingTasks = (id?: string) =>
  useQuery<any[]>({
    queryKey: [...queryRoot, "onboarding-tasks", id],
    queryFn: async () => {
      const { data } = await apiClient.get<any>(
        `/employees/${id}/onboarding/tasks`,
        authConfig(),
      );
      return unwrapList<any>(data, ["tasks"]);
    },
    enabled: Boolean(id),
  });

export const useEmployeeProbationReviews = (id?: string) =>
  useQuery<any[]>({
    queryKey: [...queryRoot, "probation-reviews", id],
    queryFn: async () => {
      const { data } = await apiClient.get<any>(
        `/employees/${id}/probation/reviews`,
        authConfig(),
      );
      return unwrapList<any>(data, ["reviews"]);
    },
    enabled: Boolean(id),
  });

/* -------------------------------------------------------------------------- */
/* Employee mutations                                                          */
/* -------------------------------------------------------------------------- */

export const useCreateEmployee = () => {
  const invalidate = useInvalidateEmployees();
  return useMutation({
    mutationFn: async (payload: CreateEmployeeInput) => {
      const { data } = await apiClient.post<any>(
        "/employees",
        payload,
        authConfig(),
      );
      return unwrapOne<EmployeeRecord>(data);
    },
    onSuccess: invalidate,
  });
};

export const useUpdateEmployee = () => {
  const invalidate = useInvalidateEmployees();
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: { id: string } & UpdateEmployeeInput) => {
      const { data } = await apiClient.patch<any>(
        `/employees/${id}`,
        payload,
        authConfig(),
      );
      return unwrapOne<EmployeeRecord>(data);
    },
    onSuccess: invalidate,
  });
};

/** There is no DELETE route — removing an employee sets an inactive status. */
export const useRemoveEmployee = () => {
  const invalidate = useInvalidateEmployees();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.patch<any>(
        `/employees/${id}`,
        { status: "inactive" },
        authConfig(),
      );
      return unwrapOne<EmployeeRecord>(data);
    },
    onSuccess: invalidate,
  });
};

export const useUpdateCompensation = () => {
  const invalidate = useInvalidateEmployees();
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: { id: string } & Record<string, any>) => {
      const { data } = await apiClient.patch<any>(
        `/employees/${id}/compensation`,
        payload,
        authConfig(),
      );
      return unwrapOne<any>(data);
    },
    onSuccess: invalidate,
  });
};

export const useRenewContract = () => {
  const invalidate = useInvalidateEmployees();
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: { id: string } & Record<string, any>) => {
      const { data } = await apiClient.patch<any>(
        `/employees/${id}/contract-renewal`,
        payload,
        authConfig(),
      );
      return unwrapOne<any>(data);
    },
    onSuccess: invalidate,
  });
};

export const useDecideProbation = () => {
  const invalidate = useInvalidateEmployees();
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: { id: string } & Record<string, any>) => {
      const { data } = await apiClient.post<any>(
        `/employees/${id}/probation/decision`,
        payload,
        authConfig(),
      );
      return unwrapOne<any>(data);
    },
    onSuccess: invalidate,
  });
};

export const useCompleteProbationReview = () => {
  const invalidate = useInvalidateEmployees();
  return useMutation({
    mutationFn: async ({
      reviewId,
      ...payload
    }: { reviewId: string } & Record<string, any>) => {
      const { data } = await apiClient.patch<any>(
        `/employees/probation/reviews/${reviewId}/complete`,
        payload,
        authConfig(),
      );
      return unwrapOne<any>(data);
    },
    onSuccess: invalidate,
  });
};

/* -------------------------------------------------------------------------- */
/* Onboarding mutations                                                        */
/* -------------------------------------------------------------------------- */

export const useStartOnboarding = () => {
  const invalidate = useInvalidateEmployees();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.post<any>(
        `/employees/${id}/onboarding/start`,
        {},
        authConfig(),
      );
      return unwrapOne<any>(data);
    },
    onSuccess: invalidate,
  });
};

export const useCompleteOnboardingTask = () => {
  const invalidate = useInvalidateEmployees();
  return useMutation({
    mutationFn: async (taskId: string) => {
      const { data } = await apiClient.patch<any>(
        `/employees/onboarding/tasks/${taskId}/complete`,
        {},
        authConfig(),
      );
      return unwrapOne<any>(data);
    },
    onSuccess: invalidate,
  });
};

export const useReassignOnboardingTask = () => {
  const invalidate = useInvalidateEmployees();
  return useMutation({
    mutationFn: async ({
      taskId,
      ...payload
    }: { taskId: string } & Record<string, any>) => {
      const { data } = await apiClient.patch<any>(
        `/employees/onboarding/tasks/${taskId}/assignment`,
        payload,
        authConfig(),
      );
      return unwrapOne<any>(data);
    },
    onSuccess: invalidate,
  });
};

/* -------------------------------------------------------------------------- */
/* Organization mutations                                                      */
/* -------------------------------------------------------------------------- */

export const useCreateDepartment = () => {
  const invalidate = useInvalidateEmployees();
  return useMutation({
    mutationFn: async (payload: Record<string, any>) => {
      const { data } = await apiClient.post<any>(
        "/employees/organization/departments",
        payload,
        authConfig(),
      );
      return unwrapOne<any>(data);
    },
    onSuccess: invalidate,
  });
};

export const useUpdateDepartment = () => {
  const invalidate = useInvalidateEmployees();
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: { id: string } & Record<string, any>) => {
      const { data } = await apiClient.patch<any>(
        `/employees/organization/departments/${id}`,
        payload,
        authConfig(),
      );
      return unwrapOne<any>(data);
    },
    onSuccess: invalidate,
  });
};

export const useCreatePosition = () => {
  const invalidate = useInvalidateEmployees();
  return useMutation({
    mutationFn: async (payload: Record<string, any>) => {
      const { data } = await apiClient.post<any>(
        "/employees/organization/positions",
        payload,
        authConfig(),
      );
      return unwrapOne<any>(data);
    },
    onSuccess: invalidate,
  });
};

export const useUpdatePosition = () => {
  const invalidate = useInvalidateEmployees();
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: { id: string } & Record<string, any>) => {
      const { data } = await apiClient.patch<any>(
        `/employees/organization/positions/${id}`,
        payload,
        authConfig(),
      );
      return unwrapOne<any>(data);
    },
    onSuccess: invalidate,
  });
};

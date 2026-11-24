import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "./simpleApi";
import { extract_message } from "@/helpers/errors";
import { get_user_value } from "@/store/authStore";

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

export interface EmployeeRecord {
  id: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  phone?: string;
  employeeNumber?: string;
  lifecycleStatus?: string;
  status?: string;
  // employmentStatus?: string;
  employmentType?: string;
  employeeType?: string;
  startDate?: string;
  probationEndDate?: string;
  contractType?: string;
  contractEndDate?: string;
  workSchedule?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  residentialAddress?: string;
  emergencyContactName?: string;
  emergencyContactRelationship?: string;
  emergencyContactPhone?: string;
  createdAt?: string;
  departmentId?: string;
  positionId?: string;
  departmentName?: string;
  positionName?: string;
  department?: { id?: string; name?: string } | string;
  position?: { id?: string; name?: string } | string;
  jobTitle?: string;
  role?: { id?: string; name?: string };
  manager?: { id?: string; name?: string } | string;
  managerId?: string;
  location?: string;
  workLocation?: string;
  grade?: string;
  isOnProbation?: boolean;
  needsSystemAccount?: boolean;
  isDraft?: boolean;
  staffId?: string;
  basicSalary?: number;
  payFrequency?: string;
  bankName?: string;
  bankAccountNumber?: string;
  allowances?: Array<{ name: string; amount: number }>;
  bonuses?: Array<{ name: string; amount: number }>;
  deductions?: Array<{ name: string; amount: number }>;
  documents?: Array<{
    kind?: string;
    url: string;
    publicId?: string;
    fileName?: string;
  }>;
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
  phone?: string;
  phoneNumber?: string;
  employeeNumber?: string;
  middleName?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  residentialAddress?: string;
  emergencyContactName?: string;
  emergencyContactRelationship?: string;
  emergencyContactPhone?: string;
  employeeType?: string;
  employmentType?: string;
  department?: string;
  departmentId?: string;
  jobTitle?: string;
  positionId?: string;
  grade?: string;
  managerId?: string;
  workLocation?: string;
  location?: string;
  startDate?: string;
  probationEndDate?: string;
  contractType?: string;
  contractEndDate?: string;
  workSchedule?: string;
  isDraft?: boolean;
  lifecycleStatus?: string;
  // employmentStatus?: string;
  status?: string;
  isOnProbation?: boolean;
  needsSystemAccount?: boolean;
  basicSalary?: number;
  payFrequency?: string;
  bankName?: string;
  bankAccountNumber?: string;
  allowances?: Array<{ name: string; amount: number }>;
  bonuses?: Array<{ name: string; amount: number }>;
  deductions?: Array<{ name: string; amount: number }>;
  documents?: Array<{
    kind?: string;
    url: string;
    publicId?: string;
    fileName?: string;
  }>;
  [key: string]: any;
}

export type UpdateEmployeeInput = Partial<CreateEmployeeInput> &
  Record<string, any>;

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Strip keys that the backend validator forbids:
 * - phoneNumber -> phone
 * - departmentId -> department (or stripped)
 * - positionId -> jobTitle (or stripped)
 * - employmentType -> employeeType
 * - status -> employmentStatus
 * - location -> workLocation
 * Also strips empty strings ("") or undefined so empty UUIDs or fields don't cause 400.
 */
export const sanitizeEmployeePayload = (
  input: Record<string, any>,
): Record<string, any> => {
  const payload = { ...input };

  if (payload.phoneNumber !== undefined) {
    if (!payload.phone) payload.phone = payload.phoneNumber;
    delete payload.phoneNumber;
  }
  if (payload.departmentId !== undefined) {
    if (!payload.department) payload.department = payload.departmentId;
    delete payload.departmentId;
  }
  if (payload.positionId !== undefined) {
    if (!payload.jobTitle) payload.jobTitle = payload.positionId;
    delete payload.positionId;
  }
  if (payload.employmentType !== undefined) {
    if (!payload.employeeType) payload.employeeType = payload.employmentType;
    delete payload.employmentType;
  }
  if (payload.status !== undefined) {
    if (!payload.employmentStatus) payload.employmentStatus = payload.status;
    delete payload.status;
  }
  if (payload.location !== undefined) {
    if (!payload.workLocation) payload.workLocation = payload.location;
    delete payload.location;
  }

  for (const key of Object.keys(payload)) {
    if (payload[key] === undefined || payload[key] === "") {
      delete payload[key];
    }
  }

  return payload;
};

/**
 * The employee API lives on the tenant session. Fall back to the seeded
 * test credentials when no user is stored so it can be exercised locally.
 */
const authConfig = () => {
  const token = get_user_value()?.accessToken;
  return { headers: { Authorization: `Bearer ${token}` } };
};

/**
 * Normalize a thrown API error into an Error carrying the message extracted
 * via the shared `extract_message` helper (response body message, payload
 * message, or the underlying message).
 */
const extractError = (error: unknown): Error =>
  new Error(extract_message(error));

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

export interface StaffOption {
  id: string;
  name: string;
  email?: string;
}

/** The people-directory endpoint: `GET /v1/staffs`. */
export const useStaffs = () =>
  useQuery<StaffOption[]>({
    queryKey: [...queryRoot, "staffs"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/staffs", authConfig());
      const list = unwrapList<any>(data, ["staffs", "staffMembers"]);
      return list
        .map((staff) => ({
          id: String(staff?.id ?? staff?._id ?? ""),
          name: String(
            staff?.name ??
              [staff?.firstName, staff?.middleName, staff?.lastName]
                .filter(Boolean)
                .join(" ") ??
              staff?.email ??
              "",
          ).trim(),
          email: staff?.email,
        }))
        .filter((staff) => staff.id && staff.name);
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
    enabled: Boolean(id) && id !== "new",
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
    enabled: Boolean(id) && id !== "new",
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
    enabled: Boolean(id) && id !== "new",
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
    enabled: Boolean(id) && id !== "new",
  });

/* -------------------------------------------------------------------------- */
/* Employee mutations                                                          */
/* -------------------------------------------------------------------------- */

export const useCreateEmployee = () => {
  const invalidate = useInvalidateEmployees();
  return useMutation({
    mutationFn: async (payload: CreateEmployeeInput) => {
      try {
        const sanitized = sanitizeEmployeePayload(payload);
        const { data } = await apiClient.post<any>(
          "/employees",
          sanitized,
          authConfig(),
        );
        return unwrapOne<EmployeeRecord>(data);
      } catch (error) {
        throw extractError(error);
      }
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
      try {
        const sanitized = sanitizeEmployeePayload(payload);
        const { data } = await apiClient.patch<any>(
          `/employees/${id}`,
          sanitized,
          authConfig(),
        );
        return unwrapOne<EmployeeRecord>(data);
      } catch (error) {
        throw extractError(error);
      }
    },
    onSuccess: invalidate,
  });
};

/** There is no DELETE route — removing an employee sets an exited status. */
export const useRemoveEmployee = () => {
  const invalidate = useInvalidateEmployees();
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        const { data } = await apiClient.delete<any>(`/employees/${id}`);
        return unwrapOne<EmployeeRecord>(data);
      } catch (error) {
        throw extractError(error);
      }
    },
    onSuccess: invalidate,
  });
};

export const useActivateEmployee = () => {
  const invalidate = useInvalidateEmployees();
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        const { data } = await apiClient.post<any>(
          `/employees/${id}/activate`,
          {},
          authConfig(),
        );
        return unwrapOne<EmployeeRecord>(data);
      } catch (error) {
        throw extractError(error);
      }
    },
    onSuccess: invalidate,
  });
};

export const useSuspendEmployee = () => {
  const invalidate = useInvalidateEmployees();
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        const { data } = await apiClient.post<any>(
          `/employees/${id}/suspend`,
          {},
          authConfig(),
        );
        return unwrapOne<EmployeeRecord>(data);
      } catch (error) {
        throw extractError(error);
      }
    },
    onSuccess: invalidate,
  });
};

export const useReactivateEmployee = () => {
  const invalidate = useInvalidateEmployees();
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        const { data } = await apiClient.post<any>(
          `/employees/${id}/reactivate`,
          {},
          authConfig(),
        );
        return unwrapOne<EmployeeRecord>(data);
      } catch (error) {
        throw extractError(error);
      }
    },
    onSuccess: invalidate,
  });
};

export const useFinalizeEmployee = () => {
  const invalidate = useInvalidateEmployees();
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        const { data } = await apiClient.post<any>(
          `/employees/${id}/finalize`,
          {},
          authConfig(),
        );
        return unwrapOne<EmployeeRecord>(data);
      } catch (error) {
        throw extractError(error);
      }
    },
    onSuccess: invalidate,
  });
};

export const useUpdateEmployeeLifecycleStatus = () => {
  const invalidate = useInvalidateEmployees();
  return useMutation({
    mutationFn: async ({
      id,
      lifecycleStatus,
    }: {
      id: string;
      lifecycleStatus: string;
    }) => {
      try {
        const { data } = await apiClient.patch<any>(
          `/employees/${id}`,
          { lifecycleStatus },
          authConfig(),
        );
        return unwrapOne<EmployeeRecord>(data);
      } catch (error) {
        throw extractError(error);
      }
    },
    onSuccess: invalidate,
  });
};

/** Links an employee account to a staff account (the people-directory staff). */
export const useLinkStaffAccount = () => {
  const invalidate = useInvalidateEmployees();
  return useMutation({
    mutationFn: async ({
      employeeId,
      staffId,
    }: {
      employeeId: string;
      staffId: string;
    }) => {
      try {
        const { data } = await apiClient.patch<any>(
          `/employees/${employeeId}/staff-account`,
          { staffId },
          authConfig(),
        );
        return unwrapOne<EmployeeRecord>(data);
      } catch (error) {
        throw extractError(error);
      }
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
      try {
        const { data } = await apiClient.patch<any>(
          `/employees/${id}/compensation`,
          payload,
          authConfig(),
        );
        return unwrapOne<any>(data);
      } catch (error) {
        throw extractError(error);
      }
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
      try {
        const { data } = await apiClient.patch<any>(
          `/employees/${id}/contract-renewal`,
          payload,
          authConfig(),
        );
        return unwrapOne<any>(data);
      } catch (error) {
        throw extractError(error);
      }
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
      try {
        const { data } = await apiClient.post<any>(
          `/employees/${id}/probation/decision`,
          payload,
          authConfig(),
        );
        return unwrapOne<any>(data);
      } catch (error) {
        throw extractError(error);
      }
    },
    onSuccess: invalidate,
  });
};

export const useStartEmployeeOnboarding = () => {
  const invalidate = useInvalidateEmployees();
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        const { data } = await apiClient.post<any>(
          `/employees/${id}/onboarding/start`,
          {},
          authConfig(),
        );
        return unwrapOne<any>(data);
      } catch (error) {
        throw extractError(error);
      }
    },
    onSuccess: invalidate,
  });
};

export const useCompleteEmployeeOnboardingTask = () => {
  const invalidate = useInvalidateEmployees();
  return useMutation({
    mutationFn: async (taskId: string) => {
      try {
        const { data } = await apiClient.patch<any>(
          `/employees/onboarding/tasks/${taskId}/complete`,
          {},
          authConfig(),
        );
        return unwrapOne<any>(data);
      } catch (error) {
        throw extractError(error);
      }
    },
    onSuccess: invalidate,
  });
};

export const useStartEmployeeProbationReview = () => {
  const invalidate = useInvalidateEmployees();
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        const { data } = await apiClient.post<any>(
          `/employees/${id}/probation/start-review`,
          {},
          authConfig(),
        );
        return unwrapOne<any>(data);
      } catch (error) {
        throw extractError(error);
      }
    },
    onSuccess: invalidate,
  });
};

export const useSubmitEmployeeProbationReview = () => {
  const invalidate = useInvalidateEmployees();
  return useMutation({
    mutationFn: async ({
      reviewId,
      ...payload
    }: { reviewId: string } & Record<string, any>) => {
      try {
        const { data } = await apiClient.post<any>(
          `/employees/probation/reviews/${reviewId}/submit`,
          payload,
          authConfig(),
        );
        return unwrapOne<any>(data);
      } catch (error) {
        throw extractError(error);
      }
    },
    onSuccess: invalidate,
  });
};

/* -------------------------------------------------------------------------- */
/* Department & Position mutations                                            */
/* -------------------------------------------------------------------------- */

export const useCreateDepartment = () => {
  const invalidate = useInvalidateEmployees();
  return useMutation({
    mutationFn: async (payload: {
      name: string;
      code?: string;
      headEmployeeId?: string;
      parentDepartmentId?: string;
      costCentre?: string;
      primaryLocation?: string;
      approvedHeadcount?: number;
      description?: string;
      status?: "active" | "inactive";
    }) => {
      try {
        const { data } = await apiClient.post<any>(
          "/employees/organization/departments",
          payload,
          authConfig(),
        );
        return unwrapOne<any>(data);
      } catch (error) {
        throw extractError(error);
      }
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
    }: {
      id: string;
      name?: string;
      code?: string;
      headEmployeeId?: string;
      parentDepartmentId?: string;
      costCentre?: string;
      primaryLocation?: string;
      approvedHeadcount?: number;
      description?: string;
      status?: "active" | "inactive";
    }) => {
      try {
        const { data } = await apiClient.patch<any>(
          `/employees/organization/departments/${id}`,
          payload,
          authConfig(),
        );
        return unwrapOne<any>(data);
      } catch (error) {
        throw extractError(error);
      }
    },
    onSuccess: invalidate,
  });
};

export const useCreatePosition = () => {
  const invalidate = useInvalidateEmployees();
  return useMutation({
    mutationFn: async (payload: {
      title: string;
      departmentId?: string;
      gradeId?: string;
      approvedHeadcount?: number;
      status?: "active" | "inactive";
    }) => {
      try {
        const { data } = await apiClient.post<any>(
          "/employees/organization/positions",
          payload,
          authConfig(),
        );
        return unwrapOne<any>(data);
      } catch (error) {
        throw extractError(error);
      }
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
    }: {
      id: string;
      title?: string;
      departmentId?: string;
      gradeId?: string;
      approvedHeadcount?: number;
      status?: "active" | "inactive";
    }) => {
      try {
        const { data } = await apiClient.patch<any>(
          `/employees/organization/positions/${id}`,
          payload,
          authConfig(),
        );
        return unwrapOne<any>(data);
      } catch (error) {
        throw extractError(error);
      }
    },
    onSuccess: invalidate,
  });
};

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "./simpleApi";
import type {
  Department,
  Position,
} from "@/routes/hr/organization/-components/types";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type CreateDepartmentPayload = Omit<Department, "id">;

export interface UpdateDepartmentPayload {
  code?: string;
  name?: string;
  head?: string;
  count?: number;
  status?: string;
  parent?: string;
  costCentre?: string;
  location?: string;
  description?: string;
}

export type CreatePositionPayload = Omit<Position, "id">;
export type UpdatePositionPayload = Partial<CreatePositionPayload>;

export interface OrganizationData {
  departments: Department[];
  positions: Position[];
}

const unwrapArray = <T,>(data: any): T[] => {
  if (Array.isArray(data)) return data as T[];
  if (Array.isArray(data?.data)) return data.data as T[];
  return [];
};

/* -------------------------------------------------------------------------- */
/* Queries                                                                    */
/* -------------------------------------------------------------------------- */

export const useOrganization = () =>
  useQuery<OrganizationData>({
    queryKey: ["organization"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/employees/organization");
      return {
        departments: unwrapArray<Department>(data?.departments),
        positions: unwrapArray<Position>(data?.positions),
      };
    },
  });

/* -------------------------------------------------------------------------- */
/* Mutations                                                                  */
/* -------------------------------------------------------------------------- */

const useInvalidateOrganization = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["organization"] });
};

export const useCreateDepartment = () => {
  const invalidate = useInvalidateOrganization();
  return useMutation({
    mutationFn: async (payload: CreateDepartmentPayload) => {
      const { data } = await apiClient.post<any>(
        "/employees/organization/departments",
        payload,
      );
      return data?.data ?? data;
    },
    onSuccess: invalidate,
  });
};

export const useUpdateDepartment = () => {
  const invalidate = useInvalidateOrganization();
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: { id: string } & Partial<UpdateDepartmentPayload>) => {
      const { data } = await apiClient.patch<any>(
        `/employees/organization/departments/${id}`,
        payload,
      );
      return data?.data ?? data;
    },
    onSuccess: invalidate,
  });
};

/** There is no DELETE route — removing a department marks it inactive. */
export const useDeleteDepartment = () => {
  const invalidate = useInvalidateOrganization();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.patch<any>(
        `/employees/organization/departments/${id}`,
        { status: "inactive" },
      );
      return data?.data ?? data;
    },
    onSuccess: invalidate,
  });
};

export const useCreatePosition = () => {
  const invalidate = useInvalidateOrganization();
  return useMutation({
    mutationFn: async (payload: CreatePositionPayload) => {
      const { data } = await apiClient.post<any>(
        "/employees/organization/positions",
        payload,
      );
      return data?.data ?? data;
    },
    onSuccess: invalidate,
  });
};

export const useUpdatePosition = () => {
  const invalidate = useInvalidateOrganization();
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: { id: string } & UpdatePositionPayload) => {
      const { data } = await apiClient.patch<any>(
        `/employees/organization/positions/${id}`,
        payload,
      );
      return data?.data ?? data;
    },
    onSuccess: invalidate,
  });
};

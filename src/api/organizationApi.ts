import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "./simpleApi";
import type {
  Department,
  Position,
} from "@/routes/hr/organization/-components/types";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface OrganizationData {
  departments: Department[];
  positions: Position[];
}

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
/* Mutations — pending backend endpoints                                      */
/* -------------------------------------------------------------------------- */

const useInvalidateOrganization = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["organization"] });
};

export const useCreateDepartment = () => {
  const invalidate = useInvalidateOrganization();
  return useMutation({
    mutationFn: async (payload: CreateDepartmentPayload) => {
      const { data } = await apiClient.post<any>("/departments", payload);
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
        `/departments/${id}`,
        payload,
      );
      return data?.data ?? data;
    },
    onSuccess: invalidate,
  });
};

export const useDeleteDepartment = () => {
  const invalidate = useInvalidateOrganization();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete<any>(`/departments/${id}`);
      return data;
    },
    onSuccess: invalidate,
  });
};

export const useCreatePosition = () => {
  const invalidate = useInvalidateOrganization();
  return useMutation({
    mutationFn: async (payload: CreatePositionPayload) => {
      const { data } = await apiClient.post<any>("/positions", payload);
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
      const { data } = await apiClient.patch<any>(`/positions/${id}`, payload);
      return data?.data ?? data;
    },
    onSuccess: invalidate,
  });
};

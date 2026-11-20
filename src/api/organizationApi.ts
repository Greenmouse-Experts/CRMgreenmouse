import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "./simpleApi";
import type {
  Department,
  Position,
} from "@/routes/hr/organization/-components/types";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface CreateDepartmentPayload {
  code: string;
  name: string;
  status: "active" | "inactive";
}

export interface UpdateDepartmentPayload {
  status?: "active" | "inactive";
  code?: string;
  name?: string;
}

export interface CreatePositionPayload {
  title: string;
  dept: string;
  grade: string;
  approved: number;
  filled: number;
}

export type UpdatePositionPayload = Partial<CreatePositionPayload>;

export interface OrganizationData {
  departments: Department[];
  positions: Position[];
}

const unwrapArray = <T>(data: any): T[] => {
  if (Array.isArray(data)) return data as T[];
  if (Array.isArray(data?.data)) return data.data as T[];
  return [];
};

export function toUiDepartment(raw: any): Department {
  const statusStr = String(
    raw?.status || (raw?.isActive ? "active" : "inactive"),
  ).toLowerCase();

  const headName =
    raw?.head ||
    raw?.headName ||
    [raw?.headFirstName, raw?.headLastName].filter(Boolean).join(" ") ||
    undefined;

  const staffCountNum = Number(
    raw?.staffCount ??
      raw?.count ??
      raw?.staff_count ??
      raw?.approvedHeadcount ??
      0,
  );

  return {
    ...raw,
    id: raw?.id ?? "",
    code:
      raw?.code ||
      (raw?.name ? String(raw.name).slice(0, 3).toUpperCase() : "DEP"),
    name: raw?.name || "Untitled Department",
    staffCount: staffCountNum,
    count: staffCountNum,
    status: statusStr === "active" ? "Active" : "Inactive",
    head: headName || "Unassigned",
    headName: headName ?? null,
    parent: raw?.parentDepartmentName ?? raw?.parent ?? undefined,
    parentDepartmentName: raw?.parentDepartmentName ?? null,
    costCentre: raw?.costCentre ?? null,
    location: raw?.primaryLocation ?? raw?.location ?? undefined,
    primaryLocation: raw?.primaryLocation ?? null,
    description: raw?.description ?? null,
  };
}

export function toUiPosition(raw: any): Position {
  return {
    ...raw,
    id: raw?.id ?? "",
    title: raw?.title ?? raw?.jobTitle ?? raw?.name ?? "Untitled Position",
    dept: raw?.dept ?? raw?.department ?? raw?.departmentName ?? "General",
    grade: raw?.grade ?? raw?.jobGrade ?? "—",
    approved: Number(
      raw?.approved ?? raw?.approvedHeadcount ?? raw?.openings ?? 1,
    ),
    filled: Number(raw?.filled ?? raw?.filledCount ?? raw?.staffCount ?? 0),
  };
}

/* -------------------------------------------------------------------------- */
/* Queries                                                                    */
/* -------------------------------------------------------------------------- */

export const useOrganization = () =>
  useQuery<OrganizationData>({
    queryKey: ["organization"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/employees/organization");
      const rawDepartments = unwrapArray<any>(data?.departments);
      const rawPositions = unwrapArray<any>(data?.positions);
      return {
        departments: rawDepartments.map(toUiDepartment),
        positions: rawPositions.map(toUiPosition),
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
    }: { id: string } & UpdateDepartmentPayload) => {
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

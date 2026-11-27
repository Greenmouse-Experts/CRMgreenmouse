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
  headEmployeeId?: string;
  parentDepartmentId?: string;
  costCentre?: string;
  primaryLocation?: string;
  approvedHeadcount?: number;
  description?: string;
}

export interface UpdateDepartmentPayload {
  status?: "active" | "inactive";
  code?: string;
  name?: string;
  headEmployeeId?: string;
  parentDepartmentId?: string;
  costCentre?: string;
  primaryLocation?: string;
  approvedHeadcount?: number;
  description?: string;
}

/**
 * Verified against the live backend (2026-11-23):
 * - `title` (string ≤ 160) and `departmentId` (existing UUID) are required.
 * - `approvedHeadcount` (number ≥ 0) and `status` (active/inactive) optional.
 * - `gradeId` (UUID) is accepted but there is no grades list endpoint yet.
 * - `grade`, `dept`, `approved`, `filled`, `openings`, `description` are
 *   rejected by the whitelist validator.
 */
export interface CreatePositionPayload {
  title: string;
  departmentId: string;
  approvedHeadcount?: number;
  status?: "active" | "inactive";
}

export type UpdatePositionPayload = Partial<CreatePositionPayload>;

export interface OrganizationData {
  departments: Department[];
  positions: Position[];
}

export interface PortalOrganizationSummary {
  totalWorkforce: number;
  departments: number;
  approvedHeadcount: number;
  openRequisitions: number;
}

export interface PortalHierarchyNode extends Department {
  children: PortalHierarchyNode[];
}

export interface PortalOrganizationData extends OrganizationData {
  summary: PortalOrganizationSummary;
  hierarchy: PortalHierarchyNode[];
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
    headEmployeeId: raw?.headEmployeeId ?? raw?.headEmployee?.id ?? undefined,
    head: headName || "Unassigned",
    headName: headName ?? null,
    parentDepartmentId:
      raw?.parentDepartmentId ?? raw?.parentDepartment?.id ?? null,
    parent: raw?.parentDepartmentName ?? raw?.parent ?? undefined,
    parentDepartmentName: raw?.parentDepartmentName ?? null,
    costCentre: raw?.costCentre ?? null,
    location: raw?.primaryLocation ?? raw?.location ?? undefined,
    primaryLocation: raw?.primaryLocation ?? null,
    description: raw?.description ?? null,
  };
}

export function toUiPosition(raw: any): Position {
  const deptName =
    (typeof raw?.department === "object"
      ? raw?.department?.name
      : raw?.department) ??
    raw?.departmentName ??
    raw?.dept ??
    "General";

  return {
    ...raw,
    id: raw?.id ?? "",
    title: raw?.title ?? raw?.jobTitle ?? raw?.name ?? "Untitled Position",
    departmentId: raw?.departmentId ?? raw?.department?.id ?? undefined,
    dept: deptName,
    grade: raw?.grade ?? raw?.gradeName ?? raw?.jobGrade ?? "—",
    approved: Number(
      raw?.approved ?? raw?.approvedHeadcount ?? raw?.openings ?? 1,
    ),
    filled: Number(
      raw?.filled ??
        raw?.filledHeadcount ??
        raw?.filledCount ??
        raw?.staffCount ??
        0,
    ),
  };
}

export function toUiHierarchyNode(raw: any): PortalHierarchyNode {
  const base = toUiDepartment(raw);
  const children = Array.isArray(raw?.children)
    ? raw.children.map(toUiHierarchyNode)
    : [];
  return {
    ...base,
    children,
  };
}

export function mapPortalOrganizationPayload(raw: any): PortalOrganizationData {
  const payload = raw?.data && !raw?.departments ? raw.data : (raw ?? {});
  const departments = unwrapArray<any>(payload?.departments).map(
    toUiDepartment,
  );
  const positions = unwrapArray<any>(payload?.positions).map(toUiPosition);
  const hierarchy = unwrapArray<any>(payload?.hierarchy).map(toUiHierarchyNode);

  const fallbackWorkforce = departments.reduce(
    (acc, d) => acc + (Number(d.count) || 0),
    0,
  );
  const fallbackApproved = positions.reduce(
    (acc, p) => acc + (Number(p.approved) || 0),
    0,
  );
  const fallbackFilled = positions.reduce(
    (acc, p) => acc + (Number(p.filled) || 0),
    0,
  );

  const rawSummary = payload?.summary ?? {};
  const approvedHeadcount = Number(
    rawSummary?.approvedHeadcount ?? fallbackApproved,
  );

  return {
    summary: {
      totalWorkforce: Number(
        rawSummary?.totalWorkforce ??
          rawSummary?.workforce ??
          fallbackWorkforce,
      ),
      departments: Number(rawSummary?.departments ?? departments.length),
      approvedHeadcount,
      openRequisitions: Number(
        rawSummary?.openRequisitions ??
          Math.max(0, approvedHeadcount - fallbackFilled),
      ),
    },
    departments,
    positions,
    hierarchy,
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

export const usePortalOrganization = (enabled = true) =>
  useQuery<PortalOrganizationData>({
    queryKey: ["organization", "portal"],
    enabled,
    queryFn: async () => {
      const { data } = await apiClient.get<any>(
        "/employees/portal/organization",
      );
      return mapPortalOrganizationPayload(data);
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

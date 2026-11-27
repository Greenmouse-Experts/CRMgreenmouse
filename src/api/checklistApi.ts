import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "./simpleApi";

/* -------------------------------------------------------------------------- */
/* Types (Aligned with /v1/employees/onboarding/checklist Postman endpoints)  */
/* -------------------------------------------------------------------------- */

export type ChecklistActiveFlag = "Y" | "N";

export interface ChecklistItemRecord {
  id: string;
  title: string;
  description: string;
  owner: string;
  sortOrder: number;
  isActive: ChecklistActiveFlag;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface CreateChecklistItemPayload {
  title: string;
  description?: string;
  owner: string;
  sortOrder?: number;
}

export interface UpdateChecklistItemPayload {
  itemId: string;
  title?: string;
  description?: string;
  owner?: string;
  sortOrder?: number;
  isActive?: ChecklistActiveFlag | boolean;
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

export const CHECKLIST_OWNER_OPTIONS = [
  { value: "hr", label: "HR" },
  { value: "it", label: "IT" },
  { value: "manager", label: "Manager" },
  { value: "payroll", label: "Payroll" },
  { value: "employee", label: "Employee" },
  { value: "admin", label: "Admin" },
] as const;

export const normalizeChecklistActiveFlag = (
  value: unknown,
): ChecklistActiveFlag => {
  if (typeof value === "boolean") return value ? "Y" : "N";
  if (typeof value === "number") return value === 0 ? "N" : "Y";
  if (typeof value === "string") {
    const key = value.trim().toLowerCase();
    if (
      key === "n" ||
      key === "no" ||
      key === "false" ||
      key === "0" ||
      key === "inactive" ||
      key === "disabled"
    ) {
      return "N";
    }
  }
  return "Y";
};

export const unwrapChecklistList = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.data)) return data.data.data;
  if (Array.isArray(data?.payload)) return data.payload;

  const keys = ["items", "checklist", "checklistItems", "records", "results"];
  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
    if (Array.isArray(data?.data?.[key])) return data.data[key];
    if (Array.isArray(data?.data?.data?.[key])) return data.data.data[key];
  }
  return [];
};

export const unwrapChecklistOne = (data: any): any =>
  data?.data?.data ??
  data?.data?.item ??
  data?.data?.checklistItem ??
  data?.data ??
  data?.item ??
  data?.checklistItem ??
  data?.payload ??
  data;

export const normalizeChecklistItem = (
  raw: any,
  fallbackIndex = 0,
): ChecklistItemRecord => {
  const source = raw?.item ?? raw?.checklistItem ?? raw ?? {};
  const idCandidate =
    source?.id ?? source?.itemId ?? source?._id ?? raw?.id ?? raw?.itemId ?? "";
  const rawSort = source?.sortOrder ?? source?.sort_order ?? source?.order;
  const parsedSort = Number(rawSort);
  const sortOrder = Number.isFinite(parsedSort) ? parsedSort : fallbackIndex;
  const isActive = normalizeChecklistActiveFlag(
    source?.isActive ?? source?.is_active ?? source?.active ?? source?.status,
  );

  return {
    ...source,
    id: String(idCandidate ?? ""),
    title: String(source?.title ?? source?.name ?? "").trim() || "Untitled item",
    description: String(source?.description ?? source?.details ?? "").trim(),
    owner: String(source?.owner ?? source?.department ?? "hr")
      .trim()
      .toLowerCase(),
    sortOrder,
    isActive,
    active: isActive === "Y",
    createdAt: source?.createdAt ?? source?.created_at,
    updatedAt: source?.updatedAt ?? source?.updated_at,
  };
};

export const sortChecklistItems = (
  items: ChecklistItemRecord[],
): ChecklistItemRecord[] =>
  [...items].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return a.title.localeCompare(b.title);
  });

export const buildCreateChecklistPayload = (
  input: CreateChecklistItemPayload,
): {
  title: string;
  description: string;
  owner: string;
  sortOrder: number;
} => {
  const sortNum = Number(input.sortOrder);
  return {
    title: input.title.trim(),
    description: (input.description ?? "").trim(),
    owner: input.owner.trim().toLowerCase() || "hr",
    sortOrder: Number.isFinite(sortNum) && sortNum >= 0 ? Math.floor(sortNum) : 0,
  };
};

export const buildUpdateChecklistPayload = (
  input: Omit<UpdateChecklistItemPayload, "itemId">,
): Record<string, unknown> => {
  const body: Record<string, unknown> = {};
  if (input.title !== undefined) {
    body.title = input.title.trim();
  }
  if (input.description !== undefined) {
    body.description = input.description.trim();
  }
  if (input.owner !== undefined) {
    body.owner = input.owner.trim().toLowerCase() || "hr";
  }
  if (input.sortOrder !== undefined) {
    const sortNum = Number(input.sortOrder);
    body.sortOrder =
      Number.isFinite(sortNum) && sortNum >= 0 ? Math.floor(sortNum) : 0;
  }
  if (input.isActive !== undefined) {
    body.isActive = normalizeChecklistActiveFlag(input.isActive);
  }
  return body;
};

/* -------------------------------------------------------------------------- */
/* Query Keys                                                                 */
/* -------------------------------------------------------------------------- */

export const checklistQueryRoot = ["checklist"] as const;

const useInvalidateChecklist = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: checklistQueryRoot });
};

/* -------------------------------------------------------------------------- */
/* Queries                                                                    */
/* -------------------------------------------------------------------------- */

/** GET /v1/employees/onboarding/checklist */
export const useChecklistItems = () =>
  useQuery<ChecklistItemRecord[]>({
    queryKey: [...checklistQueryRoot, "list"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>(
        "/employees/onboarding/checklist",
      );
      return sortChecklistItems(
        unwrapChecklistList(data).map((item, idx) =>
          normalizeChecklistItem(item, idx),
        ),
      );
    },
  });

/** GET /v1/employees/onboarding/checklist/:itemId */
export const useChecklistItem = (itemId?: string) =>
  useQuery<ChecklistItemRecord>({
    queryKey: [...checklistQueryRoot, "detail", itemId],
    queryFn: async () => {
      if (!itemId) {
        throw new Error("Checklist item ID is required.");
      }
      const { data } = await apiClient.get<any>(
        `/employees/onboarding/checklist/${itemId}`,
      );
      return normalizeChecklistItem(unwrapChecklistOne(data));
    },
    enabled: Boolean(itemId?.trim()),
  });

/* -------------------------------------------------------------------------- */
/* Mutations                                                                  */
/* -------------------------------------------------------------------------- */

/** POST /v1/employees/onboarding/checklist */
export const useCreateChecklistItem = () => {
  const invalidate = useInvalidateChecklist();
  return useMutation({
    mutationFn: async (payload: CreateChecklistItemPayload) => {
      const body = buildCreateChecklistPayload(payload);
      const { data } = await apiClient.post<any>(
        "/employees/onboarding/checklist",
        body,
      );
      return normalizeChecklistItem(unwrapChecklistOne(data));
    },
    onSuccess: invalidate,
  });
};

/** PATCH /v1/employees/onboarding/checklist/:itemId */
export const useUpdateChecklistItem = () => {
  const invalidate = useInvalidateChecklist();
  return useMutation({
    mutationFn: async ({ itemId, ...rest }: UpdateChecklistItemPayload) => {
      if (!itemId?.trim()) {
        throw new Error("Checklist item ID is required.");
      }
      const body = buildUpdateChecklistPayload(rest);
      const { data } = await apiClient.patch<any>(
        `/employees/onboarding/checklist/${itemId}`,
        body,
      );
      return normalizeChecklistItem(unwrapChecklistOne(data));
    },
    onSuccess: invalidate,
  });
};

/** DELETE /v1/employees/onboarding/checklist/:itemId */
export const useDeleteChecklistItem = () => {
  const invalidate = useInvalidateChecklist();
  return useMutation({
    mutationFn: async (itemId: string) => {
      if (!itemId?.trim()) {
        throw new Error("Checklist item ID is required.");
      }
      const { data } = await apiClient.delete<any>(
        `/employees/onboarding/checklist/${itemId}`,
      );
      return data?.data ?? data;
    },
    onSuccess: invalidate,
  });
};

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "./simpleApi";

/* -------------------------------------------------------------------------- */
/* Types (Aligned with Greenmouse CRM API.postman_collection.json)            */
/* -------------------------------------------------------------------------- */

export interface PipelineStage {
  id: string;
  pipelineId?: string;
  name: string;
  color: string;
  order: number;
  isWon: boolean;
  isLost: boolean;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface Pipeline {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  stages: PipelineStage[];
  dealCount?: number;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export type DealStatus = "open" | "won" | "lost" | "on_hold" | string;

export interface PipelineDeal {
  id: string;
  name: string;
  pipelineId: string;
  stageId: string;
  stageName?: string;
  leadId?: string;
  contactId?: string;
  value: number;
  currency: string;
  expectedCloseDate?: string;
  actualCloseDate?: string;
  status: DealStatus;
  notes?: string;
  assignedTo?: string;
  contact?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  } | null;
  company?: {
    id?: string;
    name?: string;
  } | null;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface PipelineKanbanColumn {
  stage: PipelineStage;
  deals: PipelineDeal[];
  totalValue: number;
}

export interface CreatePipelinePayload {
  name: string;
  description?: string;
}

export interface UpdatePipelinePayload {
  id: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface CreatePipelineStagePayload {
  pipelineId: string;
  name: string;
  color?: string;
  isWon?: boolean;
  isLost?: boolean;
}

export interface UpdatePipelineStagePayload {
  pipelineId: string;
  stageId: string;
  name?: string;
  color?: string;
  isWon?: boolean;
  isLost?: boolean;
}

export interface ReorderPipelineStagesPayload {
  pipelineId: string;
  stageIds: string[];
}

export interface PipelineDealsQueryParams {
  sort?:
    | "name"
    | "value"
    | "status"
    | "expectedCloseDate"
    | "actualCloseDate"
    | "createdAt"
    | "updatedAt"
    | string;
  order?: "asc" | "desc";
  search?: string;
  assignedTo?: string;
  status?: DealStatus;
  stageId?: string;
  pipelineId?: string;
}

export interface CreatePipelineDealPayload {
  name: string;
  pipelineId: string;
  stageId: string;
  leadId?: string;
  contactId?: string;
  value?: number;
  currency?: string;
  expectedCloseDate?: string;
  status?: DealStatus;
  notes?: string;
  assignedTo?: string;
}

export interface UpdatePipelineDealPayload {
  id: string;
  name?: string;
  value?: number;
  currency?: string;
  expectedCloseDate?: string;
  status?: DealStatus;
  notes?: string;
  assignedTo?: string;
  stageId?: string;
  pipelineId?: string;
}

export interface MoveDealStagePayload {
  id: string;
  stageId: string;
}

/* -------------------------------------------------------------------------- */
/* Normalization Helpers                                                      */
/* -------------------------------------------------------------------------- */

const DEFAULT_STAGE_COLOR = "#3B82F6";

export const unwrapEnvelope = <T = any>(payload: any): T =>
  (payload?.data?.data ?? payload?.data ?? payload?.payload ?? payload) as T;

export const unwrapList = <T = any>(
  payload: any,
  keys: string[] = ["items", "pipelines", "stages", "deals", "columns"],
): T[] => {
  if (Array.isArray(payload)) return payload as T[];
  if (Array.isArray(payload?.data)) return payload.data as T[];
  if (Array.isArray(payload?.data?.data)) return payload.data.data as T[];

  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key] as T[];
    if (Array.isArray(payload?.data?.[key])) return payload.data[key] as T[];
  }
  return [];
};

const toNumber = (val: unknown, fallback = 0): number => {
  if (typeof val === "number" && Number.isFinite(val)) return val;
  if (typeof val === "string" && val.trim() !== "") {
    const parsed = Number(val);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

export const normalizePipelineStage = (raw: any, index = 0): PipelineStage => {
  const source = raw?.stage ?? raw ?? {};
  const id = String(source.id ?? source._id ?? source.stageId ?? "");
  return {
    ...source,
    id,
    pipelineId: source.pipelineId ?? raw?.pipelineId,
    name: String(source.name ?? source.title ?? `Stage ${index + 1}`),
    color:
      typeof source.color === "string" && source.color.trim()
        ? source.color.trim()
        : DEFAULT_STAGE_COLOR,
    order: toNumber(source.order ?? source.position ?? source.sortOrder, index),
    isWon: Boolean(source.isWon),
    isLost: Boolean(source.isLost),
  };
};

export const normalizePipeline = (raw: any): Pipeline => {
  const source = raw?.pipeline ?? raw ?? {};
  const id = String(source.id ?? source._id ?? source.pipelineId ?? "");
  const rawStages = Array.isArray(source.stages)
    ? source.stages
    : Array.isArray(raw?.stages)
      ? raw.stages
      : [];

  const stages = rawStages
    .map((stage: any, index: number) => normalizePipelineStage(stage, index))
    .sort((a: PipelineStage, b: PipelineStage) => a.order - b.order);

  return {
    ...source,
    id,
    name: String(source.name ?? source.title ?? "Untitled Pipeline"),
    description:
      typeof source.description === "string" ? source.description : undefined,
    isActive: source.isActive !== undefined ? Boolean(source.isActive) : true,
    stages,
    dealCount:
      source.dealCount !== undefined
        ? toNumber(source.dealCount)
        : source._count?.deals !== undefined
          ? toNumber(source._count.deals)
          : undefined,
  };
};

export const normalizePipelineDeal = (raw: any): PipelineDeal => {
  const source = raw?.deal ?? raw ?? {};
  const id = String(source.id ?? source._id ?? source.dealId ?? "");
  return {
    ...source,
    id,
    name: String(source.name ?? source.title ?? "Untitled Deal"),
    pipelineId: String(source.pipelineId ?? source.pipeline?.id ?? ""),
    stageId: String(
      source.stageId ?? source.pipelineStageId ?? source.stage?.id ?? "",
    ),
    stageName: source.stageName ?? source.stage?.name,
    leadId: source.leadId ?? undefined,
    contactId: source.contactId ?? source.contact?.id ?? undefined,
    value: toNumber(source.value, 0),
    currency: String(source.currency ?? "NGN"),
    expectedCloseDate: source.expectedCloseDate ?? undefined,
    actualCloseDate: source.actualCloseDate ?? undefined,
    status: String(source.status ?? "open").toLowerCase(),
    notes: typeof source.notes === "string" ? source.notes : undefined,
    assignedTo: source.assignedTo ?? undefined,
  };
};

export const normalizeKanbanColumns = (
  raw: any,
  fallbackStages: PipelineStage[] = [],
): PipelineKanbanColumn[] => {
  const unwrapped = unwrapEnvelope<any>(raw);
  const columnMap = new Map<string, PipelineKanbanColumn>();

  for (const stage of [...fallbackStages].sort((a, b) => a.order - b.order)) {
    columnMap.set(stage.id, {
      stage,
      deals: [],
      totalValue: 0,
    });
  }

  const rawColumns: any[] = Array.isArray(unwrapped)
    ? unwrapped
    : Array.isArray(unwrapped?.columns)
      ? unwrapped.columns
      : Array.isArray(unwrapped?.stages)
        ? unwrapped.stages
        : [];

  if (rawColumns.length > 0) {
    rawColumns.forEach((col: any, idx: number) => {
      const normalizedStage = normalizePipelineStage(col?.stage ?? col, idx);
      const rawDeals = Array.isArray(col?.deals)
        ? col.deals
        : Array.isArray(col?.items)
          ? col.items
          : [];
      const deals: PipelineDeal[] = rawDeals.map((d: any) => normalizePipelineDeal(d));
      const existing = columnMap.get(normalizedStage.id);
      const mergedDeals = existing ? [...existing.deals, ...deals] : deals;
      const totalValue = mergedDeals.reduce((sum: number, d: PipelineDeal) => sum + d.value, 0);

      columnMap.set(normalizedStage.id, {
        stage: existing?.stage ?? normalizedStage,
        deals: mergedDeals,
        totalValue,
      });
    });
  }

  const flatDeals: any[] = Array.isArray(unwrapped?.deals)
    ? unwrapped.deals
    : [];
  if (flatDeals.length > 0) {
    for (const rawDeal of flatDeals) {
      const deal = normalizePipelineDeal(rawDeal);
      const targetStageId = deal.stageId;
      if (!targetStageId) continue;

      const col = columnMap.get(targetStageId) ?? {
        stage: normalizePipelineStage(
          {
            id: targetStageId,
            name: deal.stageName ?? "Stage",
          },
          columnMap.size,
        ),
        deals: [],
        totalValue: 0,
      };
      if (!col.deals.some((d) => d.id === deal.id)) {
        col.deals.push(deal);
        col.totalValue += deal.value;
      }
      columnMap.set(targetStageId, col);
    }
  }

  return Array.from(columnMap.values()).sort(
    (a, b) => a.stage.order - b.stage.order,
  );
};

export const reorderStageIds = (
  stages: PipelineStage[],
  fromIndex: number,
  toIndex: number,
): string[] => {
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= stages.length ||
    toIndex >= stages.length ||
    fromIndex === toIndex
  ) {
    return stages.map((s) => s.id);
  }
  const copy = [...stages];
  const [moved] = copy.splice(fromIndex, 1);
  copy.splice(toIndex, 0, moved);
  return copy.map((s) => s.id);
};

/* -------------------------------------------------------------------------- */
/* Query Keys                                                                 */
/* -------------------------------------------------------------------------- */

const pipelinesRoot = ["pipelines"] as const;
const dealsRoot = ["deals"] as const;

/* -------------------------------------------------------------------------- */
/* Pipeline Queries                                                           */
/* -------------------------------------------------------------------------- */

export const usePipelines = () =>
  useQuery<Pipeline[]>({
    queryKey: pipelinesRoot,
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/pipelines");
      return unwrapList<any>(data, ["pipelines", "items"]).map(
        normalizePipeline,
      );
    },
  });

export const usePipeline = (id?: string) =>
  useQuery<Pipeline>({
    queryKey: [...pipelinesRoot, "detail", id],
    queryFn: async () => {
      if (!id) throw new Error("Pipeline ID required");
      const { data } = await apiClient.get<any>(`/pipelines/${id}`);
      return normalizePipeline(unwrapEnvelope(data));
    },
    enabled: Boolean(id),
  });

/* -------------------------------------------------------------------------- */
/* Deal & Kanban Queries                                                      */
/* -------------------------------------------------------------------------- */

export const usePipelineKanban = (
  pipelineId?: string,
  stages: PipelineStage[] = [],
) =>
  useQuery<PipelineKanbanColumn[]>({
    queryKey: [...dealsRoot, "kanban", pipelineId],
    queryFn: async () => {
      if (!pipelineId) return [];
      const { data } = await apiClient.get<any>("/deals/kanban/list", {
        params: { pipelineId },
      });
      return normalizeKanbanColumns(data, stages);
    },
    enabled: Boolean(pipelineId),
  });

export const usePipelineDeals = (params?: PipelineDealsQueryParams) =>
  useQuery<PipelineDeal[]>({
    queryKey: [...dealsRoot, "pipeline-list", params],
    queryFn: async () => {
      const cleanParams = Object.fromEntries(
        Object.entries(params ?? {}).filter(
          ([, v]) => v !== undefined && v !== "",
        ),
      );
      const { data } = await apiClient.get<any>("/deals", {
        params: cleanParams,
      });
      return unwrapList<any>(data, ["deals", "items"]).map(
        normalizePipelineDeal,
      );
    },
    enabled: Boolean(params?.pipelineId || params === undefined),
  });

/* -------------------------------------------------------------------------- */
/* Pipeline & Stage Mutations                                                 */
/* -------------------------------------------------------------------------- */

const useInvalidatePipelines = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: pipelinesRoot });
    queryClient.invalidateQueries({ queryKey: dealsRoot });
  };
};

export const useCreatePipeline = () => {
  const invalidate = useInvalidatePipelines();
  return useMutation({
    mutationFn: async (payload: CreatePipelinePayload) => {
      const { data } = await apiClient.post<any>("/pipelines", payload);
      return normalizePipeline(unwrapEnvelope(data));
    },
    onSuccess: invalidate,
  });
};

export const useUpdatePipeline = () => {
  const invalidate = useInvalidatePipelines();
  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdatePipelinePayload) => {
      const { data } = await apiClient.patch<any>(`/pipelines/${id}`, payload);
      return normalizePipeline(unwrapEnvelope(data));
    },
    onSuccess: invalidate,
  });
};

export const useDeletePipeline = () => {
  const invalidate = useInvalidatePipelines();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete<any>(`/pipelines/${id}`);
      return unwrapEnvelope(data);
    },
    onSuccess: invalidate,
  });
};

export const useAddPipelineStage = () => {
  const invalidate = useInvalidatePipelines();
  return useMutation({
    mutationFn: async ({
      pipelineId,
      ...payload
    }: CreatePipelineStagePayload) => {
      const { data } = await apiClient.post<any>(
        `/pipelines/${pipelineId}/stages`,
        payload,
      );
      return normalizePipelineStage(unwrapEnvelope(data));
    },
    onSuccess: invalidate,
  });
};

export const useUpdatePipelineStage = () => {
  const invalidate = useInvalidatePipelines();
  return useMutation({
    mutationFn: async ({
      pipelineId,
      stageId,
      ...payload
    }: UpdatePipelineStagePayload) => {
      const { data } = await apiClient.patch<any>(
        `/pipelines/${pipelineId}/stages/${stageId}`,
        payload,
      );
      return normalizePipelineStage(unwrapEnvelope(data));
    },
    onSuccess: invalidate,
  });
};

export const useDeletePipelineStage = () => {
  const invalidate = useInvalidatePipelines();
  return useMutation({
    mutationFn: async ({
      pipelineId,
      stageId,
    }: {
      pipelineId: string;
      stageId: string;
    }) => {
      const { data } = await apiClient.delete<any>(
        `/pipelines/${pipelineId}/stages/${stageId}`,
      );
      return unwrapEnvelope(data);
    },
    onSuccess: invalidate,
  });
};

export const useReorderPipelineStages = () => {
  const invalidate = useInvalidatePipelines();
  return useMutation({
    mutationFn: async ({
      pipelineId,
      stageIds,
    }: ReorderPipelineStagesPayload) => {
      const { data } = await apiClient.patch<any>(
        `/pipelines/${pipelineId}/stages/reorder`,
        { stageIds },
      );
      return unwrapEnvelope(data);
    },
    onSuccess: invalidate,
  });
};

/* -------------------------------------------------------------------------- */
/* Deal Mutations                                                             */
/* -------------------------------------------------------------------------- */

export const useCreatePipelineDeal = () => {
  const invalidate = useInvalidatePipelines();
  return useMutation({
    mutationFn: async (payload: CreatePipelineDealPayload) => {
      const { data } = await apiClient.post<any>("/deals", payload);
      return normalizePipelineDeal(unwrapEnvelope(data));
    },
    onSuccess: invalidate,
  });
};

export const useUpdatePipelineDeal = () => {
  const invalidate = useInvalidatePipelines();
  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdatePipelineDealPayload) => {
      const { data } = await apiClient.patch<any>(`/deals/${id}`, payload);
      return normalizePipelineDeal(unwrapEnvelope(data));
    },
    onSuccess: invalidate,
  });
};

export const useDeletePipelineDeal = () => {
  const invalidate = useInvalidatePipelines();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete<any>(`/deals/${id}`);
      return unwrapEnvelope(data);
    },
    onSuccess: invalidate,
  });
};

export const useMoveDealStage = () => {
  const invalidate = useInvalidatePipelines();
  return useMutation({
    mutationFn: async ({ id, stageId }: MoveDealStagePayload) => {
      const { data } = await apiClient.patch<any>(`/deals/${id}/stage`, {
        stageId,
      });
      return normalizePipelineDeal(unwrapEnvelope(data));
    },
    onSuccess: invalidate,
  });
};

export const useMarkDealWon = () => {
  const invalidate = useInvalidatePipelines();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.post<any>(`/deals/${id}/mark-won`);
      return unwrapEnvelope(data);
    },
    onSuccess: invalidate,
  });
};

export const useMarkDealLost = () => {
  const invalidate = useInvalidatePipelines();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.post<any>(`/deals/${id}/mark-lost`);
      return unwrapEnvelope(data);
    },
    onSuccess: invalidate,
  });
};

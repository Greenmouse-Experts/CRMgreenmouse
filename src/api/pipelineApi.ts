import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "./simpleApi";

/** Pipeline stage interface */
export interface PipelineStage {
  id: string;
  name: string;
  color?: string;
  order?: number;
}

/** Pipeline item/ candidate interface */
export interface PipelineItem {
  id: string;
  name: string;
  stageId: string;
  stageName: string;
  email?: string;
  phone?: string;
  source?: string;
  appliedAt?: string;
  status?: string;
  [key: string]: any;
}

/** Pipeline summary/ stats interface */
export interface PipelineSummary {
  total: number;
  byStage: Record<string, number>;
  conversionRate?: number;
}

/** Pipeline query parameters */
export interface PipelineQueryParams {
  stageId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

const queryRoot = ["pipeline"] as const;

/* -------------------------------------------------------------------------- */
/* Queries                                                                     */
/* -------------------------------------------------------------------------- */

export const usePipelineStages = () =>
  useQuery<PipelineStage[]>({
    queryKey: [...queryRoot, "stages"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/pipeline/stages");
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      return [];
    },
  });

export const usePipelineItems = (params?: PipelineQueryParams) =>
  useQuery<PipelineItem[]>({
    queryKey: [...queryRoot, "items", params],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/pipeline/items", {
        params,
      });
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      return [];
    },
  });

export const usePipelineSummary = () =>
  useQuery<PipelineSummary>({
    queryKey: [...queryRoot, "summary"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/pipeline/summary");
      if (data?.data) return data.data;
      return data as PipelineSummary;
    },
  });

export const usePipelineItem = (id?: string) =>
  useQuery<PipelineItem>({
    queryKey: [...queryRoot, "item", id],
    queryFn: async () => {
      if (!id) throw new Error("Pipeline item ID required");
      const { data } = await apiClient.get<any>(`/pipeline/items/${id}`);
      return data?.data ?? data as PipelineItem;
    },
    enabled: Boolean(id),
  });

/* -------------------------------------------------------------------------- */
/* Mutations                                                                   */
/* -------------------------------------------------------------------------- */

const useInvalidatePipeline = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryRoot });
};

export const useCreatePipelineItem = () => {
  const invalidate = useInvalidatePipeline();
  return useMutation({
    mutationFn: async (payload: {
      name: string;
      email?: string;
      phone?: string;
      stageId: string;
      source?: string;
    }) => {
      const { data } = await apiClient.post<any>("/pipeline/items", payload);
      return data?.data ?? data;
    },
    onSuccess: invalidate,
  });
};

export const useUpdatePipelineItem = () => {
  const invalidate = useInvalidatePipeline();
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: {
      id: string;
      [key: string]: any;
    }) => {
      const { data } = await apiClient.patch<any>(
        `/pipeline/items/${id}`,
        payload,
      );
      return data?.data ?? data;
    },
    onSuccess: invalidate,
  });
};

export const useDeletePipelineItem = () => {
  const invalidate = useInvalidatePipeline();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete<any>(`/pipeline/items/${id}`);
      return data?.data ?? data;
    },
    onSuccess: invalidate,
  });
};

export const useMovePipelineItem = () => {
  const invalidate = useInvalidatePipeline();
  return useMutation({
    mutationFn: async ({
      id,
      toStageId,
    }: {
      id: string;
      toStageId: string;
    }) => {
      const { data } = await apiClient.patch<any>(
        `/pipeline/items/${id}/move`,
        { toStageId },
      );
      return data?.data ?? data;
    },
    onSuccess: invalidate,
  });
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */


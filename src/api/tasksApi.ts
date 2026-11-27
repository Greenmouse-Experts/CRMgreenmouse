import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "./simpleApi";

export type MyTaskStatus = "open" | "in_progress" | "completed" | "cancelled";

export interface Task {
  id: string;
  title: string;
  description?: string;
  type: "email" | "call" | "meeting" | "follow_up" | "task" | string;
  status: MyTaskStatus | string;
  priority: "low" | "medium" | "high" | "urgent" | string;
  dueAt?: string;
  startAt?: string;
  endAt?: string;
  relatedType?:
    | "deal"
    | "lead"
    | "contact"
    | "company"
    | "invoice"
    | "order"
    | string;
  relatedId?: string;
  assignedTo?: string;
  assignee?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    name?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskQueryParams {
  search?: string;
  status?: string;
  type?: string;
  priority?: string;
  assignedTo?: string;
  relatedType?: string;
  relatedId?: string;
  dueFrom?: string;
  dueTo?: string;
  overdue?: boolean | string;
  page?: number;
  limit?: number;
}

export interface MyTasksQueryParams {
  search?: string;
  status?: string;
  priority?: string;
  overdue?: boolean | string;
  page?: number;
  limit?: number;
}

export interface PaginatedTasksResponse {
  data: Task[];
  total: number;
  page: number;
  limit: number;
}

export interface TasksSummary {
  total: number;
  active: number;
  overdue: number;
  completed: number;
}

export interface CalendarTasksParams {
  from: string;
  to: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  type?: string;
  status?: string;
  priority?: string;
  dueAt?: string;
  startAt?: string;
  endAt?: string;
  relatedType?: string;
  relatedId?: string;
  assignedTo?: string;
}

export interface UpdateTaskPayload extends Partial<CreateTaskPayload> {
  id: string;
}

export const useTasks = (params?: TaskQueryParams) => {
  return useQuery<Task[]>({
    queryKey: ["tasks", params],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/tasks", { params });
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      if (Array.isArray(data?.tasks)) return data.tasks;
      return [];
    },
  });
};

export const useMyTasks = (
  params?: MyTasksQueryParams,
  options?: { enabled?: boolean },
) => {
  return useQuery<PaginatedTasksResponse>({
    queryKey: ["tasks", "mine", params ?? {}],
    enabled: options?.enabled ?? true,
    queryFn: async () => {
      const cleanParams: Record<string, string | number | boolean> = {};
      if (params?.search?.trim()) cleanParams.search = params.search.trim();
      if (params?.status && params.status !== "all") {
        cleanParams.status = params.status;
      }
      if (params?.priority && params.priority !== "all") {
        cleanParams.priority = params.priority;
      }
      if (params?.overdue !== undefined && params.overdue !== "") {
        cleanParams.overdue = params.overdue;
      }
      if (typeof params?.page === "number" && params.page > 0) {
        cleanParams.page = params.page;
      }
      if (typeof params?.limit === "number" && params.limit > 0) {
        cleanParams.limit = params.limit;
      }

      const { data } = await apiClient.get<any>("/tasks/mine", {
        params: cleanParams,
      });

      const list: Task[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.data?.data)
            ? data.data.data
            : Array.isArray(data?.tasks)
              ? data.tasks
              : [];

      const payload =
        data?.data && !Array.isArray(data.data) ? data.data : data;

      return {
        data: list,
        total: payload?.total != null ? Number(payload.total) : list.length,
        page: Number(payload?.page ?? params?.page ?? 1) || 1,
        limit: Number(payload?.limit ?? params?.limit ?? 20) || 20,
      };
    },
  });
};

export const useMyTasksSummary = (options?: { enabled?: boolean }) => {
  return useQuery<TasksSummary>({
    queryKey: ["tasks", "mine", "summary"],
    enabled: options?.enabled ?? true,
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/tasks/mine/summary");
      const raw = data?.data ?? data ?? {};
      return {
        total: Number(raw?.total ?? 0),
        active: Number(raw?.active ?? 0),
        overdue: Number(raw?.overdue ?? 0),
        completed: Number(raw?.completed ?? 0),
      };
    },
  });
};

export const useMyTask = (id?: string) => {
  return useQuery<Task>({
    queryKey: ["tasks", "mine", "detail", id],
    queryFn: async () => {
      if (!id) throw new Error("Task ID required");
      const { data } = await apiClient.get<any>(`/tasks/mine/${id}`);
      return data?.data || data;
    },
    enabled: Boolean(id),
  });
};

export const useTask = (id?: string) => {
  return useQuery<Task>({
    queryKey: ["tasks", id],
    queryFn: async () => {
      if (!id) throw new Error("Task ID required");
      const { data } = await apiClient.get<any>(`/tasks/${id}`);
      return data?.data || data;
    },
    enabled: !!id,
  });
};

export const useTaskCalendar = (
  params: CalendarTasksParams,
  enabled: boolean = true,
) => {
  return useQuery<Task[]>({
    queryKey: ["tasks", "calendar", params],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/tasks/calendar", { params });
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      if (Array.isArray(data?.tasks)) return data.tasks;
      return [];
    },
    enabled: Boolean(enabled && params.from && params.to),
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateTaskPayload) => {
      const { data } = await apiClient.post<any>("/tasks", payload);
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateTaskPayload) => {
      const { data } = await apiClient.patch<any>(`/tasks/${id}`, payload);
      return data?.data || data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["tasks", variables.id] });
    },
  });
};

export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data } = await apiClient.patch<any>(`/tasks/${id}/status`, {
        status,
      });
      return data?.data || data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["tasks", variables.id] });
    },
  });
};

export const useUpdateMyTaskStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: MyTaskStatus;
    }) => {
      const { data } = await apiClient.patch<any>(`/tasks/mine/${id}/status`, {
        status,
      });
      return data?.data || data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({
        queryKey: ["tasks", "mine", "detail", variables.id],
      });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete<any>(`/tasks/${id}`);
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};

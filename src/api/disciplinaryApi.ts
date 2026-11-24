import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "./simpleApi";

export interface DisciplinaryCase {
  id: string;
  employeeId?: string;
  category?: string;
  incidentDate?: string;
  severity?: string;
  status?: string;
  stage?: string;
  outcome?: string;
  description?: string;
  reportedByEmployeeId?: string;
  investigatorEmployeeId?: string;
  witnesses?: string[];
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface DisciplinaryCaseOptions {
  categories?: string[];
  severities?: string[];
  [key: string]: any;
}

export interface DisciplinaryCaseEmployeeOption {
  id: string;
  name: string;
  email?: string;
  [key: string]: any;
}

export interface DisciplinaryCaseEvidence {
  id: string;
  fileName?: string;
  url?: string;
  size?: number;
  uploadedAt?: string;
  [key: string]: any;
}

export interface DisciplinaryCaseHistoryEntry {
  id?: string;
  step?: string;
  stage?: string;
  note?: string;
  outcome?: string;
  at?: string;
  [key: string]: any;
}

export interface CreateDisciplinaryCasePayload {
  employeeId: string;
  category: string;
  incidentDate: string;
  severity: string;
  reportedByEmployeeId: string;
  investigatorEmployeeId: string;
  description: string;
  witnesses?: string[];
  confidentialityConfirmed?: boolean;
}

export interface DisciplinaryCaseStageUpdate {
  id: string;
  stage: string;
  notes?: string;
}

export interface CloseDisciplinaryCasePayload {
  id: string;
  outcome: string;
}

const unwrapList = <T,>(data: any): T[] => {
  if (Array.isArray(data)) return data as T[];
  if (Array.isArray(data?.data)) return data.data as T[];
  if (Array.isArray(data?.payload)) return data.payload as T[];
  return [];
};

const unwrapOne = <T,>(data: any): T => (data?.data ?? data) as T;

export const useDisciplinaryCases = () =>
  useQuery<DisciplinaryCase[]>({
    queryKey: ["disciplinary-cases"],
    queryFn: async () =>
      unwrapList<DisciplinaryCase>(
        (await apiClient.get<any>("/disciplinary-cases")).data,
      ),
  });

export const useDisciplinaryCaseEmployees = () =>
  useQuery<DisciplinaryCaseEmployeeOption[]>({
    queryKey: ["disciplinary-cases", "employees"],
    queryFn: async () =>
      unwrapList<DisciplinaryCaseEmployeeOption>(
        (await apiClient.get<any>("/disciplinary-cases/employees")).data,
      ),
  });

export const useDisciplinaryCaseOptions = () =>
  useQuery<DisciplinaryCaseOptions>({
    queryKey: ["disciplinary-cases", "options"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/disciplinary-cases/options");
      return unwrapOne<DisciplinaryCaseOptions>(data);
    },
  });

export const useDisciplinaryCaseEvidence = (id?: string) =>
  useQuery<DisciplinaryCaseEvidence[]>({
    queryKey: ["disciplinary-cases", id, "evidence"],
    enabled: Boolean(id),
    queryFn: async () =>
      unwrapList<DisciplinaryCaseEvidence>(
        (await apiClient.get<any>(`/disciplinary-cases/${id}/evidence`)).data,
      ),
  });

export const useDisciplinaryCaseHistory = (id?: string) =>
  useQuery<DisciplinaryCaseHistoryEntry[]>({
    queryKey: ["disciplinary-cases", id, "history"],
    enabled: Boolean(id),
    queryFn: async () =>
      unwrapList<DisciplinaryCaseHistoryEntry>(
        (await apiClient.get<any>(`/disciplinary-cases/${id}/history`)).data,
      ),
  });

export const useCreateDisciplinaryCase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateDisciplinaryCasePayload) => {
      const { data } = await apiClient.post<any>(
        "/disciplinary-cases",
        payload,
      );
      return unwrapOne<DisciplinaryCase>(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disciplinary-cases"] });
    },
  });
};

export const useUpdateDisciplinaryCaseStage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, stage, notes }: DisciplinaryCaseStageUpdate) => {
      const { data } = await apiClient.patch<any>(
        `/disciplinary-cases/${id}/stage`,
        { stage, notes },
      );
      return unwrapOne<DisciplinaryCase>(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disciplinary-cases"] });
    },
  });
};

export const useCloseDisciplinaryCase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, outcome }: CloseDisciplinaryCasePayload) => {
      const { data } = await apiClient.patch<any>(
        `/disciplinary-cases/${id}/close`,
        { outcome },
      );
      return unwrapOne<DisciplinaryCase>(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disciplinary-cases"] });
    },
  });
};

export const useUpdateDisciplinaryCaseOptions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: DisciplinaryCaseOptions) => {
      const { data } = await apiClient.put<any>(
        "/disciplinary-cases/options",
        payload,
      );
      return unwrapOne<DisciplinaryCaseOptions>(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disciplinary-cases"] });
    },
  });
};

export const useUploadDisciplinaryCaseEvidence = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      caseId,
      file,
    }: {
      caseId: string;
      file: File;
    }) => {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await apiClient.post<any>(
        `/disciplinary-cases/${caseId}/evidence`,
        formData,
      );
      return unwrapOne<DisciplinaryCaseEvidence>(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disciplinary-cases"] });
    },
  });
};

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient, { new_url } from "./simpleApi";
import { get_user_value } from "@/store/authStore";

export type ImportEntity =
  | "contacts"
  | "companies"
  | "leads"
  | "products"
  | "services";

export type ImportMode = "sync" | "async";

export const IMPORT_SYNC_MAX_BYTES = 2 * 1024 * 1024;
export const IMPORT_ASYNC_MAX_BYTES = 100 * 1024 * 1024;

export const IMPORT_ENTITY_LABELS: Record<ImportEntity, string> = {
  contacts: "contacts",
  companies: "companies",
  leads: "leads",
  products: "products",
  services: "services",
};

const ENTITY_PATHS: Record<ImportEntity, string> = {
  contacts: "contacts",
  companies: "companies",
  leads: "leads",
  products: "products",
  services: "services",
};

const INVALIDATE_KEYS: Record<ImportEntity, string[]> = {
  contacts: ["contacts", "customers"],
  companies: ["companies"],
  leads: ["leads"],
  products: ["products"],
  services: ["services", "products"],
};

const TERMINAL_STATUSES = new Set([
  "completed",
  "complete",
  "succeeded",
  "success",
  "done",
  "failed",
  "error",
  "cancelled",
  "canceled",
]);

export interface ImportField {
  key: string;
  label: string;
  required: boolean;
  type?: string;
  format?: string;
  separator?: string;
  enumValues?: string[];
  description?: string;
  example?: string;
}

export interface ImportPlanQuota {
  limited?: boolean;
  current?: number;
  max?: number;
  remaining?: number;
}

export interface ImportPlan {
  bulkImportAllowed?: boolean;
  reason?: string;
  quota?: ImportPlanQuota;
}

export interface ImportLimits {
  syncMaxBytes?: number;
  asyncMaxBytes?: number;
  syncMaxRows?: number;
  asyncMaxRows?: number;
}

export interface ImportContract {
  entity: string;
  fields: ImportField[];
  headers: string[];
  limits: ImportLimits;
  plan?: ImportPlan;
  raw: unknown;
}

export interface ImportRowError {
  row?: number;
  field?: string;
  message: string;
}

export interface ImportResult {
  mode: ImportMode;
  jobId?: string;
  status?: string;
  imported?: number;
  failed?: number;
  skipped?: number;
  total?: number;
  message?: string;
  errors: ImportRowError[];
  raw: unknown;
}

export interface ImportJob extends ImportResult {
  progress?: number;
  processed?: number;
}

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

const asString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() ? value.trim() : undefined;

const asNumber = (value: unknown): number | undefined => {
  if (value === null || value === undefined || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const firstString = (
  record: Record<string, unknown> | null,
  keys: string[],
): string | undefined => {
  if (!record) return undefined;
  for (const key of keys) {
    const found = asString(record[key]);
    if (found) return found;
  }
  return undefined;
};

const firstNumber = (
  record: Record<string, unknown> | null,
  keys: string[],
): number | undefined => {
  if (!record) return undefined;
  for (const key of keys) {
    const found = asNumber(record[key]);
    if (found !== undefined) return found;
  }
  return undefined;
};

const humanize = (value: string) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/^\w/, (letter) => letter.toUpperCase());

export function unwrapImportPayload(value: unknown): unknown {
  let payload = value;
  for (let depth = 0; depth < 3; depth += 1) {
    const record = asRecord(payload);
    if (!record || record.data === undefined || record.data === null) break;
    payload = record.data;
  }
  return payload;
}

function readFields(payload: Record<string, unknown>): ImportField[] {
  const source = [payload.fields, payload.columns, payload.headers].find(
    Array.isArray,
  );
  if (!Array.isArray(source)) return [];

  return source
    .map((raw): ImportField | null => {
      if (typeof raw === "string") {
        return { key: raw, label: humanize(raw), required: false };
      }
      const item = asRecord(raw);
      if (!item) return null;
      const key = firstString(item, [
        "key",
        "name",
        "field",
        "header",
        "column",
      ]);
      if (!key) return null;
      const required =
        item.required === true ||
        item.required === "true" ||
        item.isRequired === true;
      const type = firstString(item, ["type", "fieldType", "dataType"]);
      const format = firstString(item, ["format"]);
      const separator = firstString(item, ["separator"]);
      const enumValues = Array.isArray(item.enumValues)
        ? item.enumValues.filter(
            (value): value is string => typeof value === "string",
          )
        : undefined;
      return {
        key,
        label:
          firstString(item, ["label", "title", "displayName"]) ?? humanize(key),
        required,
        ...(type ? { type } : {}),
        ...(format ? { format } : {}),
        ...(separator ? { separator } : {}),
        ...(enumValues && enumValues.length > 0 ? { enumValues } : {}),
        ...(firstString(item, ["description", "help", "hint"])
          ? { description: firstString(item, ["description", "help", "hint"]) }
          : {}),
        ...(firstString(item, ["example", "sample", "exampleValue"])
          ? {
              example: firstString(item, ["example", "sample", "exampleValue"]),
            }
          : {}),
      };
    })
    .filter((field): field is ImportField => field !== null);
}

function readLimits(payload: Record<string, unknown>): ImportLimits {
  const limits = asRecord(payload.limits) ?? asRecord(payload.limit) ?? {};
  const sync = asRecord(limits.sync) ?? {};
  const async = asRecord(limits.async) ?? {};
  const syncMaxBytes =
    firstNumber(sync, [
      "maxBytes",
      "maxFileSizeBytes",
      "maxFileSize",
      "maxSizeBytes",
    ]) ?? firstNumber(limits, ["syncMaxBytes", "maxSyncBytes"]);
  const asyncMaxBytes =
    firstNumber(async, [
      "maxBytes",
      "maxFileSizeBytes",
      "maxFileSize",
      "maxSizeBytes",
    ]) ??
    firstNumber(limits, ["asyncMaxBytes", "maxAsyncBytes", "maxFileSizeBytes"]);
  const syncMaxRows =
    firstNumber(sync, ["maxRows", "maxRowCount"]) ??
    firstNumber(limits, ["syncMaxRows", "maxRows"]);
  const asyncMaxRows =
    firstNumber(async, ["maxRows", "maxRowCount"]) ??
    firstNumber(limits, ["asyncMaxRows"]);

  return {
    ...(syncMaxBytes !== undefined ? { syncMaxBytes } : {}),
    ...(asyncMaxBytes !== undefined ? { asyncMaxBytes } : {}),
    ...(syncMaxRows !== undefined ? { syncMaxRows } : {}),
    ...(asyncMaxRows !== undefined ? { asyncMaxRows } : {}),
  };
}

function readPlan(payload: Record<string, unknown>): ImportPlan | undefined {
  const plan = asRecord(payload.plan);
  if (!plan) return undefined;
  const quota = asRecord(plan.quota);
  return {
    ...(typeof plan.bulkImportAllowed === "boolean"
      ? { bulkImportAllowed: plan.bulkImportAllowed }
      : {}),
    ...(firstString(plan, ["reason"])
      ? { reason: firstString(plan, ["reason"]) }
      : {}),
    ...(quota
      ? {
          quota: {
            ...(typeof quota.limited === "boolean"
              ? { limited: quota.limited }
              : {}),
            ...(asNumber(quota.current) !== undefined
              ? { current: asNumber(quota.current) }
              : {}),
            ...(asNumber(quota.max) !== undefined
              ? { max: asNumber(quota.max) }
              : {}),
            ...(asNumber(quota.remaining) !== undefined
              ? { remaining: asNumber(quota.remaining) }
              : {}),
          },
        }
      : {}),
  };
}

export function parseImportContract(
  response: unknown,
  entity: ImportEntity,
): ImportContract {
  const root = asRecord(unwrapImportPayload(response)) ?? {};
  const payload = asRecord(root.contract) ?? root;
  const fields = readFields(payload);
  const plan = readPlan(payload);
  return {
    entity: firstString(payload, ["entity", "resource", "type"]) ?? entity,
    fields,
    headers:
      fields.length > 0
        ? fields.map((field) => field.key)
        : (Array.isArray(payload.headers) ? payload.headers : []).filter(
            (header): header is string => typeof header === "string",
          ),
    limits: readLimits(payload),
    ...(plan ? { plan } : {}),
    raw: payload,
  };
}

function readErrors(payload: Record<string, unknown>): ImportRowError[] {
  const source = [
    payload.errors,
    payload.failures,
    payload.errorRows,
    payload.rejected,
  ].find(Array.isArray);
  if (!Array.isArray(source)) return [];

  return source.slice(0, 50).flatMap((raw): ImportRowError[] => {
    if (typeof raw === "string") return [{ message: raw }];
    const item = asRecord(raw);
    if (!item) return [];
    const message =
      firstString(item, ["message", "reason", "error", "detail"]) ??
      "Row could not be imported.";
    return [
      {
        message,
        ...(asNumber(item.row ?? item.rowNumber ?? item.index) !== undefined
          ? { row: asNumber(item.row ?? item.rowNumber ?? item.index) }
          : {}),
        ...(firstString(item, ["field", "column", "property"])
          ? { field: firstString(item, ["field", "column", "property"]) }
          : {}),
      },
    ];
  });
}

function readCounts(
  payload: Record<string, unknown>,
  errors: ImportRowError[],
) {
  const imported = firstNumber(payload, [
    "imported",
    "created",
    "inserted",
    "succeeded",
    "successCount",
    "importedCount",
    "accepted",
  ]);
  const failed =
    firstNumber(payload, [
      "failed",
      "failureCount",
      "failedCount",
      "errorCount",
      "rejectedCount",
    ]) ?? (errors.length > 0 ? errors.length : undefined);
  const skipped = firstNumber(payload, [
    "skipped",
    "duplicates",
    "duplicateCount",
    "ignored",
  ]);
  const total = firstNumber(payload, [
    "total",
    "totalRows",
    "rowCount",
    "records",
    "recordsReceived",
    "processedRows",
    "processed",
  ]);

  return {
    ...(imported !== undefined ? { imported } : {}),
    ...(failed !== undefined ? { failed } : {}),
    ...(skipped !== undefined ? { skipped } : {}),
    ...(total !== undefined ? { total } : {}),
  };
}

export function parseImportResult(
  response: unknown,
  mode: ImportMode,
): ImportResult {
  const root = asRecord(unwrapImportPayload(response)) ?? {};
  const payload = asRecord(root.result) ?? asRecord(root.job) ?? root;
  const errors = readErrors(payload);
  return {
    mode,
    ...(firstString(payload, ["jobId", "job_id", "id", "_id"])
      ? { jobId: firstString(payload, ["jobId", "job_id", "id", "_id"]) }
      : {}),
    ...(firstString(payload, ["status", "state"])
      ? { status: firstString(payload, ["status", "state"]) }
      : {}),
    ...readCounts(payload, errors),
    ...(firstString(payload, ["message", "detail", "note"])
      ? { message: firstString(payload, ["message", "detail", "note"]) }
      : {}),
    errors,
    raw: payload,
  };
}

export function isTerminalImportStatus(status?: string): boolean {
  return Boolean(status && TERMINAL_STATUSES.has(status.toLowerCase()));
}

export function parseImportJob(response: unknown): ImportJob {
  const root = asRecord(unwrapImportPayload(response)) ?? {};
  const payload = asRecord(root.job) ?? root;
  const result = parseImportResult(payload, "async");
  const processed =
    firstNumber(payload, [
      "processed",
      "processedRows",
      "rowsProcessed",
      "checked",
    ]) ??
    (result.imported !== undefined ||
    result.failed !== undefined ||
    result.skipped !== undefined
      ? (result.imported ?? 0) + (result.failed ?? 0) + (result.skipped ?? 0)
      : undefined);

  let progress = firstNumber(payload, ["progress", "percent", "percentage"]);
  if (progress !== undefined && progress > 0 && progress < 1) {
    progress *= 100;
  }
  if (progress === undefined && processed !== undefined && result.total) {
    progress = Math.min(100, Math.round((processed / result.total) * 100));
  }

  return {
    ...result,
    ...(processed !== undefined ? { processed } : {}),
    ...(progress !== undefined
      ? { progress: Math.max(0, Math.min(100, progress)) }
      : {}),
  };
}

export const useImportContract = (entity: ImportEntity) =>
  useQuery<ImportContract>({
    queryKey: ["import", "contract", entity],
    queryFn: async () => {
      const { data } = await apiClient.get<unknown>(
        `/import/contracts/${entity}`,
      );
      return parseImportContract(data, entity);
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

export const useImportJobs = (limit = 10) =>
  useQuery<ImportJob[]>({
    queryKey: ["import", "jobs", limit],
    queryFn: async () => {
      const { data } = await apiClient.get<unknown>("/import/jobs", {
        params: { limit },
      });
      const payload = unwrapImportPayload(data);
      const list = Array.isArray(payload)
        ? payload
        : (([
            asRecord(payload)?.jobs,
            asRecord(payload)?.items,
            asRecord(payload)?.results,
          ].find(Array.isArray) as unknown[] | undefined) ?? []);
      return list.map(parseImportJob);
    },
  });

export const useImportJob = (jobId: string | null) =>
  useQuery<ImportJob>({
    queryKey: ["import", "job", jobId],
    enabled: Boolean(jobId),
    refetchInterval: (query) =>
      isTerminalImportStatus(query.state.data?.status) ? false : 2000,
    queryFn: async () => {
      const { data } = await apiClient.get<unknown>(
        `/import/jobs/${encodeURIComponent(String(jobId))}`,
      );
      return parseImportJob(data);
    },
  });

export async function downloadImportTemplate(
  entity: ImportEntity,
): Promise<string> {
  const response = await apiClient.get<Blob>(`/import/templates/${entity}`, {
    responseType: "blob",
  });
  const disposition = String(response.headers?.["content-disposition"] ?? "");
  const match = /filename="?([^";]+)"?/i.exec(disposition);
  const filename = match?.[1] ?? `${entity}-import-template.csv`;
  const url = URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  return filename;
}

export const useDownloadImportTemplate = (entity: ImportEntity) =>
  useMutation({
    mutationFn: () => downloadImportTemplate(entity),
  });

export function resolveImportMode(
  file: File,
  contract?: ImportContract,
): ImportMode {
  const syncMax = contract?.limits.syncMaxBytes ?? IMPORT_SYNC_MAX_BYTES;
  return file.size > syncMax ? "async" : "sync";
}

export function importMaxBytes(contract?: ImportContract): number {
  return contract?.limits.asyncMaxBytes ?? IMPORT_ASYNC_MAX_BYTES;
}

export function importErrorMessage(error: unknown): string {
  const candidate = error as {
    response?: { data?: { message?: unknown } };
    message?: unknown;
  };
  const message = candidate?.response?.data?.message ?? candidate?.message;
  return typeof message === "string" && message.trim()
    ? message
    : "Import could not be started.";
}

function mergeImportJob(
  polled: ImportJob | undefined,
  live: ImportJob | null,
): ImportJob | undefined {
  if (!polled) return live ?? undefined;
  if (!live) return polled;
  return {
    ...polled,
    ...live,
    jobId: live.jobId ?? polled.jobId,
    raw: live.raw ?? polled.raw,
    errors: live.errors.length > 0 ? live.errors : polled.errors,
  };
}

function useImportJobStream(jobId: string | null) {
  const [live, setLive] = useState<ImportJob | null>(null);

  useEffect(() => {
    setLive(null);
    if (!jobId || typeof EventSource === "undefined") return;
    const token = get_user_value()?.accessToken;
    if (!token) return;

    const source = new EventSource(
      `${new_url}import/jobs/${encodeURIComponent(jobId)}/events?token=${encodeURIComponent(token)}`,
    );
    const handleEvent = (event: Event) => {
      const message = event as MessageEvent<string>;
      if (!message.data) return;
      try {
        setLive(parseImportJob(JSON.parse(message.data)));
      } catch {
        // Polling in useImportJob remains the source of truth for unknown events.
      }
    };

    source.onmessage = handleEvent;
    for (const name of ["progress", "status", "completed", "failed"]) {
      source.addEventListener(name, handleEvent);
    }
    source.onerror = () => source.close();
    return () => source.close();
  }, [jobId]);

  return live;
}

export function useEntityImport(entity: ImportEntity) {
  const queryClient = useQueryClient();
  const contractQuery = useImportContract(entity);
  const templateMutation = useDownloadImportTemplate(entity);
  const [jobId, setJobId] = useState<string | null>(null);
  const [mode, setMode] = useState<ImportMode>("sync");
  const jobQuery = useImportJob(jobId);
  const liveJob = useImportJobStream(jobId);
  const job = mergeImportJob(jobQuery.data, liveJob);

  const invalidateEntity = () => {
    for (const key of INVALIDATE_KEYS[entity]) {
      void queryClient.invalidateQueries({ queryKey: [key] });
    }
  };

  const mutation = useMutation<ImportResult, unknown, File>({
    mutationFn: async (file) => {
      const resolvedMode = resolveImportMode(file, contractQuery.data);
      setMode(resolvedMode);
      setJobId(null);

      const formData = new FormData();
      formData.append("file", file);
      const path = `/${ENTITY_PATHS[entity]}/import${
        resolvedMode === "async" ? "/async" : ""
      }`;
      const { data } = await apiClient.post<unknown>(path, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return parseImportResult(data, resolvedMode);
    },
    onSuccess: (result) => {
      invalidateEntity();
      if (result.mode === "async" && result.jobId) setJobId(result.jobId);
    },
  });

  useEffect(() => {
    if (isTerminalImportStatus(job?.status)) invalidateEntity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job?.status, entity, queryClient]);

  const reset = () => {
    mutation.reset();
    setJobId(null);
    setMode("sync");
  };

  return {
    contract: contractQuery.data,
    contractQuery,
    mode,
    result: mutation.data,
    job,
    jobQuery,
    isImporting: mutation.isPending,
    importError: mutation.error,
    importFile: mutation.mutateAsync,
    downloadTemplate: templateMutation.mutateAsync,
    isDownloadingTemplate: templateMutation.isPending,
    reset,
  };
}

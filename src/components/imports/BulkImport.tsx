import { useId, useRef, useState, type DragEvent } from "react";
import {
  CheckCircle2,
  Download,
  FileText,
  Loader2,
  RefreshCw,
  TriangleAlert,
  UploadCloud,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  IMPORT_ENTITY_LABELS,
  IMPORT_SYNC_MAX_BYTES,
  importErrorMessage,
  importMaxBytes,
  isTerminalImportStatus,
  useEntityImport,
  type ImportEntity,
  type ImportResult,
} from "@/api/importApi";

interface BulkImportProps {
  entity: ImportEntity;
  title?: string;
  description?: string;
  className?: string;
  bare?: boolean;
  onImported?: (result: ImportResult) => void;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function BulkImport({
  entity,
  title,
  description,
  className,
  bare = false,
  onImported,
}: BulkImportProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const importer = useEntityImport(entity);
  const label = IMPORT_ENTITY_LABELS[entity];
  const outcome = importer.job ?? importer.result;
  const maxBytes = importMaxBytes(importer.contract);
  const syncMaxBytes =
    importer.contract?.limits.syncMaxBytes ?? IMPORT_SYNC_MAX_BYTES;
  const fields = importer.contract?.fields ?? [];
  const isBusy = importer.isImporting;
  const jobIsRunning =
    Boolean(importer.job) && !isTerminalImportStatus(importer.job?.status);
  const progress = importer.job?.progress;
  const plan = importer.contract?.plan;
  const quotaRemaining = plan?.quota?.remaining;
  const planBlockedReason =
    plan?.bulkImportAllowed === false
      ? (plan.reason ?? "Bulk import is not available on your current plan.")
      : plan?.quota?.limited &&
          quotaRemaining !== undefined &&
          quotaRemaining <= 0
        ? "Bulk import runs for this period have been used up."
        : null;

  const selectFile = (nextFile: File | undefined) => {
    if (!nextFile) return;
    setLocalError(null);
    if (!nextFile.name.toLowerCase().endsWith(".csv")) {
      setLocalError("Choose a CSV file. Other file types are not supported.");
      return;
    }
    if (nextFile.size === 0) {
      setLocalError("That file is empty. Add at least one row and try again.");
      return;
    }
    if (nextFile.size > maxBytes) {
      setLocalError(
        `That file is ${formatBytes(nextFile.size)}. The limit is ${formatBytes(maxBytes)}.`,
      );
      return;
    }
    setFile(nextFile);
  };

  const handleDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setDragging(false);
    selectFile(event.dataTransfer.files?.[0]);
  };

  const startImport = async () => {
    if (!file) return;
    setLocalError(null);
    try {
      const result = await importer.importFile(file);
      onImported?.(result);
      if (result.mode === "async") {
        toast.success("Import started. Progress will appear here.");
      } else {
        toast.success(
          `${result.imported ?? 0} ${label} imported${
            result.failed ? `, ${result.failed} failed` : ""
          }.`,
        );
      }
    } catch (error) {
      toast.error(importErrorMessage(error));
    }
  };

  const downloadTemplate = async () => {
    try {
      await importer.downloadTemplate();
      toast.success("Import template downloaded.");
    } catch (error) {
      toast.error(importErrorMessage(error));
    }
  };

  const reset = () => {
    importer.reset();
    setFile(null);
    setLocalError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <section
      className={`${bare ? "" : "rounded-xl bg-base-100 p-5 shadow-sm sm:p-6"} ${className ?? ""}`}
      aria-labelledby={`${inputId}-title`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id={`${inputId}-title`} className="text-base font-semibold">
            {title ?? `Import ${label}`}
          </h2>
          <p className="mt-1 max-w-prose text-sm text-base-content/65">
            {description ??
              `Upload a CSV to add ${label} in bulk. Use the template to match the expected columns.`}
          </p>
        </div>
        <button
          type="button"
          className="btn btn-ghost btn-sm gap-2"
          onClick={downloadTemplate}
          disabled={importer.isDownloadingTemplate}
        >
          {importer.isDownloadingTemplate ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Download className="size-4" aria-hidden="true" />
          )}
          Template
        </button>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div>
          <input
            id={inputId}
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(event) => selectFile(event.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`flex min-h-44 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors focus-visible:ring-2 focus-visible:ring-primary ${
              dragging
                ? "border-primary bg-primary/5"
                : "border-base-300 bg-base-200/40 hover:border-primary/60 hover:bg-base-200/70"
            }`}
          >
            <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <UploadCloud className="size-5" aria-hidden="true" />
            </span>
            <span className="mt-3 text-sm font-semibold">
              Drop a CSV here or choose a file
            </span>
            <span className="mt-1 text-xs text-base-content/65">
              Only .csv files · up to {formatBytes(maxBytes)}
            </span>
          </button>

          {file && (
            <div className="mt-3 flex items-center gap-3 rounded-lg bg-base-200 px-3 py-2">
              <FileText
                className="size-5 shrink-0 text-primary"
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="text-xs text-base-content/65">
                  {formatBytes(file.size)}
                </p>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-xs btn-square"
                aria-label={`Remove ${file.name}`}
                onClick={() => {
                  setFile(null);
                  setLocalError(null);
                  if (inputRef.current) inputRef.current.value = "";
                }}
                disabled={isBusy}
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
          )}

          {planBlockedReason && (
            <p role="alert" className="mt-2 text-sm text-error">
              {planBlockedReason}
            </p>
          )}
          {localError && (
            <p role="alert" className="mt-2 text-sm text-error">
              {localError}
            </p>
          )}
          {Boolean(importer.importError) && (
            <p role="alert" className="mt-2 text-sm text-error">
              {importErrorMessage(importer.importError)}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="btn btn-primary gap-2"
              onClick={startImport}
              disabled={
                !file ||
                isBusy ||
                jobIsRunning ||
                Boolean(importer.result) ||
                Boolean(planBlockedReason)
              }
            >
              {isBusy ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <UploadCloud className="size-4" aria-hidden="true" />
              )}
              {isBusy ? "Starting import…" : `Import ${label}`}
            </button>
            {(importer.result || importer.job) && (
              <button
                type="button"
                className="btn btn-ghost gap-2"
                onClick={reset}
                disabled={jobIsRunning}
              >
                <RefreshCw className="size-4" aria-hidden="true" />
                Import another file
              </button>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-base-content/65">
            Expected columns
          </h3>
          {importer.contractQuery.isPending ? (
            <p className="mt-3 text-sm text-base-content/65" role="status">
              Loading column contract…
            </p>
          ) : importer.contractQuery.isError ? (
            <div className="mt-3 rounded-lg bg-base-200 p-3 text-sm">
              <p className="text-base-content/70">
                The column contract could not be loaded. You can still download
                the template and upload a CSV.
              </p>
              <button
                type="button"
                className="btn btn-ghost btn-xs mt-2 gap-1"
                onClick={() => void importer.contractQuery.refetch()}
              >
                <RefreshCw className="size-3.5" aria-hidden="true" />
                Try again
              </button>
            </div>
          ) : fields.length ? (
            <>
              <ul className="mt-3 max-h-44 space-y-2 overflow-y-auto pr-1 text-sm">
                {fields.map((field) => (
                  <li
                    key={field.key}
                    className="flex items-start justify-between gap-3"
                  >
                    <span className="min-w-0">
                      <span className="font-medium">{field.label}</span>
                      <span className="ml-2 text-xs text-base-content/55">
                        {field.key}
                      </span>
                      {(field.description || field.type || field.format) && (
                        <span className="mt-0.5 block text-xs text-base-content/60">
                          {field.description ??
                            [field.type, field.format]
                              .filter(Boolean)
                              .join(" · ")}
                          {field.separator &&
                            ` · separate values with "${field.separator}"`}
                        </span>
                      )}
                    </span>
                    {field.required && (
                      <span className="badge badge-sm badge-soft badge-primary shrink-0">
                        Required
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-base-content/60">
                Files up to {formatBytes(syncMaxBytes)} import immediately.
                Larger files run in the background with live progress.
              </p>
              {plan?.quota?.limited && quotaRemaining !== undefined && (
                <p className="mt-1 text-xs text-base-content/60">
                  Bulk import runs remaining:{" "}
                  <span className="font-semibold tabular-nums text-base-content">
                    {quotaRemaining}
                  </span>
                  {plan.quota.max !== undefined && ` of ${plan.quota.max}`}
                </p>
              )}
            </>
          ) : (
            <p className="mt-3 text-sm text-base-content/65">
              No column contract was returned. Use the downloaded template as
              the source of truth.
            </p>
          )}
        </div>
      </div>

      {importer.mode === "async" && (isBusy || importer.job) && (
        <div className="mt-5 rounded-xl bg-base-200/70 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold">
              {jobIsRunning ? "Import in progress" : "Background import"}
            </p>
            {progress !== undefined && (
              <p className="text-xs tabular-nums text-base-content/65">
                {Math.round(progress)}%
              </p>
            )}
          </div>
          {progress !== undefined ? (
            <div
              className="mt-2 h-1.5 overflow-hidden rounded-full bg-base-300"
              role="progressbar"
              aria-label="Import progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress)}
            >
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${Math.max(2, progress)}%` }}
              />
            </div>
          ) : (
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-base-300">
              <div className="h-full w-1/3 animate-pulse rounded-full bg-primary/60" />
            </div>
          )}
          {importer.job?.message && (
            <p className="mt-2 text-xs text-base-content/65">
              {importer.job.message}
            </p>
          )}
        </div>
      )}

      {outcome && (
        <div className="mt-4 rounded-xl bg-base-200/70 p-4" role="status">
          <div className="flex items-start gap-2">
            {outcome.failed ? (
              <TriangleAlert
                className="mt-0.5 size-4 shrink-0 text-warning"
                aria-hidden="true"
              />
            ) : (
              <CheckCircle2
                className="mt-0.5 size-4 shrink-0 text-primary"
                aria-hidden="true"
              />
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold">
                {jobIsRunning
                  ? "Import running"
                  : (outcome.message ??
                    (outcome.failed
                      ? "Import completed with some rows skipped."
                      : "Import completed."))}
              </p>
              <dl className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs text-base-content/70">
                {[
                  ["Imported", outcome.imported],
                  ["Skipped", outcome.skipped],
                  ["Failed", outcome.failed],
                  ["Total", outcome.total],
                ]
                  .filter(([, value]) => typeof value === "number")
                  .map(([name, value]) => (
                    <div
                      key={name as string}
                      className="flex items-center gap-1"
                    >
                      <dt>{name}:</dt>
                      <dd className="font-semibold tabular-nums text-base-content">
                        {value as number}
                      </dd>
                    </div>
                  ))}
              </dl>
            </div>
          </div>

          {outcome.errors.length > 0 && (
            <ul className="mt-3 space-y-1 border-t border-base-300 pt-3 text-xs text-base-content/70">
              {outcome.errors.slice(0, 5).map((error, index) => (
                <li key={`${error.row ?? "row"}-${index}`}>
                  {error.row !== undefined && (
                    <span className="font-semibold">Row {error.row}: </span>
                  )}
                  {error.field && (
                    <span className="font-medium">{error.field} — </span>
                  )}
                  {error.message}
                </li>
              ))}
              {outcome.errors.length > 5 && (
                <li>And {outcome.errors.length - 5} more errors.</li>
              )}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}

import { FileText, UploadCloud, XCircle } from "lucide-react";
import { useId } from "react";
import { toast } from "sonner";

export interface DocInfo {
  name: string;
  size: string;
}

interface DocUploaderProps {
  /** The currently attached document — shown as the current-doc card. */
  doc?: DocInfo;
  /** Called when a file is selected. */
  onNewFile: (file: File) => void;
  /** Called when the current document is removed via the doc card. */
  onRemoveDoc?: () => void;
  disabled?: boolean;
  /** Accepted file types for the file input. */
  accept?: string;
  /** Maximum document size in MB. */
  maxSizeMb?: number;
}

const DEFAULT_ACCEPT =
  "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,text/plain,image/*";
const DEFAULT_MAX_SIZE_MB = 10;

/**
 * Reusable document uploader (PDFs, Word documents, images, …) — the
 * documents analogue of `ImageUpload` in `src/components/images/ImageUpload.tsx`.
 */
export default function DocUploader({
  doc,
  onNewFile,
  onRemoveDoc,
  disabled = false,
  accept = DEFAULT_ACCEPT,
  maxSizeMb = DEFAULT_MAX_SIZE_MB,
}: DocUploaderProps) {
  const inputId = useId();

  const selectFile = (file: File | undefined) => {
    if (!file) return;
    if (file.size > maxSizeMb * 1024 * 1024) {
      toast.error(`Choose a document smaller than ${maxSizeMb} MB.`);
      return;
    }
    onNewFile(file);
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label
        htmlFor={inputId}
        className={`flex h-40 flex-col items-center justify-center rounded-lg border-2 border-dashed border-base-300 p-4 transition-colors hover:border-primary focus-within:border-primary ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
      >
        <input
          id={inputId}
          type="file"
          accept={accept}
          className="sr-only"
          disabled={disabled}
          onChange={(event) => {
            selectFile(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
        <UploadCloud className="size-10 text-primary" aria-hidden="true" />
        <span className="mt-2 font-semibold">Choose document</span>
        <span className="text-sm text-base-content/80">
          Up to {maxSizeMb} MB
        </span>
      </label>

      {doc ? (
        <div className="relative h-40 rounded-lg bg-base-200/80">
          <div className="flex h-full flex-col items-center justify-center gap-2 px-4">
            <FileText className="size-8 text-primary" aria-hidden="true" />
            <span
              className="truncate text-sm font-semibold text-emerald-600"
              title={doc.name}
            >
              {doc.name}
            </span>
            {doc.size && (
              <span className="text-xs text-base-content/80">{doc.size}</span>
            )}
          </div>
          <button
            type="button"
            className="btn btn-circle btn-error btn-sm absolute right-2 top-2"
            disabled={disabled}
            onClick={() => onRemoveDoc?.()}
            aria-label="Remove current file"
          >
            <XCircle className="size-5" />
          </button>
        </div>
      ) : null}
    </div>
  );
}

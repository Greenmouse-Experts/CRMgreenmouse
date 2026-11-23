import { useCallback, useMemo, useState } from "react";
import { uploadImage, uploadedFileUrl } from "@/api/imageApi";
import { extract_message } from "@/helpers/errors";

/** A document as expected by the backend (e.g. employee `documents[]`). */
export interface UploadedDocument {
  kind: string;
  url: string;
  publicId?: string;
  fileName: string;
}

export type DocumentUploadStatus = "uploading" | "done" | "error";

export interface DocumentUploadEntry {
  kind: string;
  fileName: string;
  /** Human-readable size for display (empty for seeded documents). */
  size: string;
  status: DocumentUploadStatus;
  error?: string;
  /** Present once the upload succeeded. */
  document?: UploadedDocument;
}

const formatSize = (bytes: number) =>
  `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

const entryFromDocument = (doc: UploadedDocument): DocumentUploadEntry => ({
  kind: doc.kind,
  fileName: doc.fileName || doc.url.split("/").pop() || "document",
  size: "",
  status: "done",
  document: doc,
});

/**
 * Reusable multi-document upload state.
 *
 * Files are uploaded to `POST /multimedia/upload` (Cloudinary — images, PDFs,
 * Word docs) as soon as they are selected, keyed by a caller-defined `kind`
 * (e.g. "cv", "contract"). Consume `documents` in the form payload once
 * `isUploading` is false and `hasErrors` is false.
 */
export function useDocumentUploads() {
  const [entries, setEntries] = useState<Record<string, DocumentUploadEntry>>(
    {},
  );

  /** Upload a file for the given kind, resolving with the backend document. */
  const upload = useCallback(
    async (kind: string, file: File): Promise<UploadedDocument> => {
      setEntries((prev) => ({
        ...prev,
        [kind]: {
          kind,
          fileName: file.name,
          size: formatSize(file.size),
          status: "uploading",
        },
      }));

      try {
        const response = await uploadImage(file);
        const url = uploadedFileUrl(response);
        if (!url) throw new Error("The upload returned no file URL.");

        const document: UploadedDocument = {
          kind,
          url,
          publicId:
            response.publicId ??
            response.data?.publicId ??
            response.payload?.publicId,
          fileName: file.name,
        };

        setEntries((prev) => ({
          ...prev,
          [kind]: { ...prev[kind], status: "done", error: undefined, document },
        }));
        return document;
      } catch (error) {
        setEntries((prev) => ({
          ...prev,
          [kind]: {
            ...prev[kind],
            status: "error",
            error: extract_message(error),
          },
        }));
        throw error;
      }
    },
    [],
  );

  /** Drop the document for a kind (before or after upload). */
  const remove = useCallback((kind: string) => {
    setEntries((prev) => {
      const copy = { ...prev };
      delete copy[kind];
      return copy;
    });
  }, []);

  /** Seed already-uploaded documents, e.g. when editing an existing record. */
  const seed = useCallback(
    (
      documents:
        | Array<{
            kind?: string;
            url: string;
            publicId?: string;
            fileName?: string;
          }>
        | undefined,
    ) => {
      setEntries(
        Object.fromEntries(
          (documents ?? [])
            .filter((doc) => doc?.url && doc?.kind)
            .map((doc) => [
              doc.kind as string,
              entryFromDocument({
                kind: doc.kind as string,
                url: doc.url,
                publicId: doc.publicId,
                fileName: doc.fileName ?? "",
              }),
            ]),
        ),
      );
    },
    [],
  );

  /** Completed documents, ready to send in a payload. */
  const documents = useMemo(
    () =>
      Object.values(entries).flatMap((entry) =>
        entry.status === "done" && entry.document ? [entry.document] : [],
      ),
    [entries],
  );

  const isUploading = Object.values(entries).some(
    (entry) => entry.status === "uploading",
  );
  const hasErrors = Object.values(entries).some(
    (entry) => entry.status === "error",
  );

  return { entries, upload, remove, seed, documents, isUploading, hasErrors };
}

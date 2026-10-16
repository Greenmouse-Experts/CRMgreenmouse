import { UploadCloud, XCircle } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { toast } from "sonner";

interface ImageUploadProps {
  image?: { url: string; path: string };
  setNew: (file: File | undefined) => void;
  setPrev?: (image: { url: string; path: string } | undefined) => void;
  disabled?: boolean;
  fit?: "contain" | "cover";
}

export default function ImageUpload({
  image,
  setNew,
  setPrev,
  disabled = false,
  fit = "cover",
}: ImageUploadProps) {
  const inputId = useId();
  const [previousImage, setPreviousImage] = useState(image);
  const [newImage, setNewImage] = useState<File>();
  const [previewUrl, setPreviewUrl] = useState<string>();

  useEffect(() => setPreviousImage(image), [image]);

  useEffect(() => {
    if (!newImage) {
      setPreviewUrl(undefined);
      return;
    }
    const url = URL.createObjectURL(newImage);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [newImage]);

  const selectFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      toast.error("Choose an image smaller than 5 MB.");
      return;
    }
    setNewImage(file);
    setNew(file);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex h-40 flex-col items-center justify-center rounded-lg border-2 border-dashed border-base-300 p-4 transition-colors hover:border-primary focus-within:border-primary">
          <input
            id={inputId}
            type="file"
            accept="image/*"
            className="sr-only"
            disabled={disabled}
            onChange={(event) => {
              selectFile(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
          <label
            htmlFor={inputId}
            className={`flex size-full flex-col items-center justify-center text-center ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
          >
            <UploadCloud className="size-10 text-primary" aria-hidden="true" />
            <span className="mt-2 font-semibold">Choose image</span>
            <span className="text-sm text-base-content/70">Up to 5 MB</span>
          </label>
        </div>

        {previewUrl ? (
          <div className="relative h-40 rounded-lg bg-base-200/40">
            <img
              className={`size-full rounded-lg ${fit === "contain" ? "object-contain" : "object-cover"}`}
              src={previewUrl}
              alt="New image preview"
            />
            <button
              type="button"
              className="btn btn-circle btn-error btn-sm absolute right-2 top-2"
              disabled={disabled}
              onClick={() => {
                setNewImage(undefined);
                setNew(undefined);
              }}
              aria-label="Remove new image"
            >
              <XCircle className="size-5" />
            </button>
          </div>
        ) : previousImage ? (
          <div className="relative h-40 rounded-lg bg-base-200/40">
            <img
              className={`size-full rounded-lg ${fit === "contain" ? "object-contain" : "object-cover"}`}
              src={previousImage.url}
              alt="Current image"
            />
            {setPrev && (
              <button
                type="button"
                className="btn btn-circle btn-error btn-sm absolute right-2 top-2"
                disabled={disabled}
                onClick={() => {
                  setPreviousImage(undefined);
                  setPrev(undefined);
                }}
                aria-label="Remove current image"
              >
                <XCircle className="size-5" />
              </button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

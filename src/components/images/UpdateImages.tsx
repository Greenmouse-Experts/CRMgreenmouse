import { XCircle, UploadCloud } from "lucide-react";
import { useEffect, useState, useId } from "react";

interface UpdateImagesProps {
  images?: { url: string; path: string }[];
  setNew: (item: any) => any;
  setPrev?: (item: any) => any;
}

export default function UpdateImages({
  images = [],
  setNew,
  setPrev,
}: UpdateImagesProps) {
  const inputId = useId();
  const [prevImages, setPrevImages] = useState<{ url: string; path: string }[]>(
    images || [],
  );

  useEffect(() => {
    setPrevImages(images || []);
  }, [images]);

  const [newImages, setNewImages] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const added = Array.from(files);
      const updated = [...newImages, ...added];
      setNewImages(updated);
      setNew(updated);
    }
  };

  const removeNewImage = (indexToRemove: number) => {
    const updated = newImages.filter((_, index) => index !== indexToRemove);
    setNewImages(updated);
    setNew(updated);
  };

  const removePrevImage = (path: string) => {
    const updated = prevImages.filter((img) => img.path !== path);
    setPrevImages(updated);
    if (setPrev) {
      setPrev(updated);
    }
  };

  return (
    <div className="w-full max-w-full p-1">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 w-full">
        {/* Upload Box */}
        <div className="min-w-0 w-full h-32 flex flex-col justify-center items-center border-2 border-dashed border-base-300 rounded-xl p-2 hover:border-primary transition-colors duration-200 bg-base-200/20">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            id={inputId}
            onChange={handleFileChange}
            multiple
          />
          <label
            htmlFor={inputId}
            className="flex flex-col items-center justify-center text-center cursor-pointer h-full w-full select-none"
          >
            <UploadCloud className="h-7 w-7 text-primary/70 mb-1" />
            <span className="text-xs font-semibold text-base-content leading-tight">
              Upload Images
            </span>
            <span className="text-[10px] text-base-content/50 mt-0.5">
              Click or drag
            </span>
          </label>
        </div>

        {/* Existing Images */}
        {prevImages?.map((image, index) => (
          <div
            key={image.path || index}
            className="relative min-w-0 w-full h-32 rounded-xl overflow-hidden border border-base-200 shadow-sm group bg-base-200/40"
          >
            <img
              className="size-full object-cover"
              src={image.url}
              alt={`Existing image ${index + 1}`}
            />
            <button
              type="button"
              className="btn btn-circle btn-error btn-xs absolute right-1.5 top-1.5 shadow z-10 opacity-90 hover:opacity-100 transition-opacity"
              onClick={() => removePrevImage(image.path)}
              aria-label="Remove existing image"
            >
              <XCircle className="size-3.5" />
            </button>
          </div>
        ))}

        {/* New Uploaded Images */}
        {newImages.map((image, index) => (
          <div
            key={`${image.name}-${index}`}
            className="relative min-w-0 w-full h-32 rounded-xl overflow-hidden border border-base-200 shadow-sm group bg-base-200/40"
          >
            <img
              className="size-full object-cover"
              src={URL.createObjectURL(image)}
              alt={`New image ${index + 1}`}
            />
            <button
              type="button"
              className="btn btn-circle btn-error btn-xs absolute right-1.5 top-1.5 shadow z-10 opacity-90 hover:opacity-100 transition-opacity"
              onClick={() => removeNewImage(index)}
              aria-label="Remove new image"
            >
              <XCircle className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

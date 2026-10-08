import { XCircle } from "lucide-react";
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
    <div className="space-y-4">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
        <div className="h-36 flex flex-col justify-center items-center border-2 border-dashed border-base-300 rounded-lg p-4 hover:border-primary transition-colors duration-200">
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
            className="flex flex-col items-center justify-center text-center cursor-pointer h-full w-full"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-base-content opacity-60"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 0115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <span className="mt-1 text-sm font-semibold text-base-content opacity-80">
              Upload Images
            </span>
            <span className="text-xs text-base-content opacity-60">
              Click or drop to select multiple
            </span>
          </label>
        </div>

        {prevImages?.map((image, index) => (
          <div key={image.path || index} className="relative h-36 w-full group">
            <img
              className="size-full object-cover rounded-lg shadow-md border border-base-200"
              src={image.url}
              alt={`Existing image ${index + 1}`}
            />
            <button
              type="button"
              className="btn btn-circle btn-error btn-xs absolute -right-2 -top-2 z-10"
              onClick={() => removePrevImage(image.path)}
              aria-label="Remove existing image"
            >
              <XCircle className="size-4" />
            </button>
          </div>
        ))}

        {newImages.map((image, index) => (
          <div
            key={`${image.name}-${index}`}
            className="relative h-36 w-full group"
          >
            <img
              className="size-full object-cover rounded-lg shadow-md border border-base-200"
              src={URL.createObjectURL(image)}
              alt={`New image ${index + 1}`}
            />
            <button
              type="button"
              className="btn btn-circle btn-error btn-xs absolute -right-2 -top-2 z-10"
              onClick={() => removeNewImage(index)}
              aria-label="Remove new image"
            >
              <XCircle className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

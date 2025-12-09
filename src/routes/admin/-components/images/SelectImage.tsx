import { X } from "lucide-react";
import { useState } from "react";

interface SelectImageProps {
  image: File | null;
  setImage: (image: File | null) => void;
}

export default function SelectImage({ image, setImage }: SelectImageProps) {
  return (
    <div className="w-full mx-auto max-w-[420px] aspect-video">
      {image ? (
        <>
          <div className="size-full relative">
            <button
              className="absolute btn btn-error right-0 btn-circle m-2"
              onClick={() => setImage(null)}
            >
              <X />
            </button>
            <img
              src={URL.createObjectURL(image)}
              className="size-full rounded-md"
              alt=""
            />{" "}
          </div>
        </>
      ) : (
        <>
          <label
            htmlFor="modal-select"
            className="grid place-items-center size-full ring text-lg cursor-pointer fieldset-label rounded-md"
          >
            Click to Select Image
          </label>
        </>
      )}
      <input
        onChange={(e) => setImage(e.target.files?.[0] || null)}
        type="file"
        className="hidden"
        id="modal-select"
      />
    </div>
  );
}

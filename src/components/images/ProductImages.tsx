import { useState } from "react";
import { Package } from "lucide-react";

interface ProductImagesProps {
  images?: string[];
  productName: string;
}

export function ProductImageStrip({
  images = [],
  productName,
  onClick,
}: ProductImagesProps & { onClick: () => void }) {
  const visibleImages = images.filter(Boolean);

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 rounded-lg text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      aria-label={`View ${productName} images (${visibleImages.length})`}
    >
      {visibleImages.length ? (
        <>
          <span className="flex -space-x-2">
            {visibleImages.slice(0, 3).map((url, index) => (
              <img
                key={`${url}-${index}`}
                src={url}
                alt=""
                loading="lazy"
                className="size-10 rounded-lg border-2 border-base-100 bg-base-200 object-cover"
              />
            ))}
          </span>
          <span className="text-xs font-medium text-base-content/70">
            {visibleImages.length} {visibleImages.length === 1 ? "image" : "images"}
          </span>
        </>
      ) : (
        <span className="flex items-center gap-2 text-xs text-base-content/60">
          <span className="flex size-10 items-center justify-center rounded-lg bg-base-200">
            <Package className="size-5" aria-hidden="true" />
          </span>
          No images
        </span>
      )}
    </button>
  );
}

export function ProductImageGallery({
  images = [],
  productName,
}: ProductImagesProps) {
  const visibleImages = images.filter(Boolean);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedImage = visibleImages[selectedIndex] ?? visibleImages[0];

  if (!selectedImage) {
    return (
      <div className="flex h-40 items-center justify-center gap-2 rounded-xl bg-base-200/50 text-sm text-base-content/60">
        <Package className="size-5" aria-hidden="true" /> No product images
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-sm font-semibold text-base-content">
          Product images ({visibleImages.length})
        </h4>
        <a
          href={selectedImage}
          target="_blank"
          rel="noopener noreferrer"
          className="link link-primary text-xs"
        >
          Open full size
        </a>
      </div>
      <div className="flex h-56 items-center justify-center overflow-hidden rounded-xl bg-base-200/50 sm:h-72">
        <img
          src={selectedImage}
          alt={`${productName} image ${selectedIndex + 1}`}
          className="size-full object-contain"
        />
      </div>
      {visibleImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Choose product image">
          {visibleImages.map((url, index) => (
            <button
              key={`${url}-${index}`}
              type="button"
              onClick={() => setSelectedIndex(index)}
              aria-label={`Show ${productName} image ${index + 1}`}
              aria-pressed={selectedIndex === index}
              className={`size-14 shrink-0 overflow-hidden rounded-lg border-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                selectedIndex === index ? "border-primary" : "border-base-200"
              }`}
            >
              <img src={url} alt="" loading="lazy" className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

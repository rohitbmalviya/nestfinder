"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { SafeImage } from "@/components/shared/safe-image";
import { cn } from "@/lib/utils";

interface GalleryImage {
  id: string;
  url: string;
  position: number;
}

interface PropertyGalleryProps {
  images: GalleryImage[];
  title: string;
}

export function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="aspect-video rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
        No images available
      </div>
    );
  }

  const primaryImage = images[activeIndex] ?? images[0];
  const showThumbs = images.slice(1, 4);
  const remaining = images.length - 4;

  function openLightbox(index: number) {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }

  function closeLightbox() {
    setLightboxOpen(false);
  }

  function prevImage() {
    setLightboxIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  }

  function nextImage() {
    setLightboxIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  }

  return (
    <>
      {/* Main gallery */}
      <div className="space-y-3">
        {/* Primary image */}
        <button
          className="relative w-full aspect-video overflow-hidden rounded-xl block focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => openLightbox(activeIndex)}
          aria-label={`Open gallery — ${title} image ${activeIndex + 1}`}
        >
          <SafeImage
            src={primaryImage.url}
            alt={`${title} — image ${activeIndex + 1}`}
            fill
            sizes="(max-width: 1024px) 100vw, 58vw"
            className="object-cover"
            priority={activeIndex === 0}
          />
        </button>

        {/* Thumbnails — desktop grid */}
        {images.length > 1 && (
          <div className="hidden md:grid grid-cols-3 gap-3">
            {showThumbs.map((img, i) => {
              const realIndex = i + 1;
              const isLast = i === 2 && remaining > 0;
              return (
                <button
                  key={img.id}
                  onClick={() => isLast ? openLightbox(realIndex) : setActiveIndex(realIndex)}
                  className={cn(
                    "relative aspect-[4/3] overflow-hidden rounded-lg focus-visible:ring-2 focus-visible:ring-ring",
                    activeIndex === realIndex && "ring-2 ring-primary"
                  )}
                  aria-label={
                    isLast
                      ? `View all ${images.length} photos`
                      : `${title} — image ${realIndex + 1}`
                  }
                >
                  <SafeImage
                    src={img.url}
                    alt={`${title} — image ${realIndex + 1}`}
                    fill
                    sizes="25vw"
                    className="object-cover"
                  />
                  {isLast && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white text-lg font-semibold">
                        +{remaining + 1} more
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Thumbnails — mobile horizontal scroll */}
        {images.length > 1 && (
          <div className="flex md:hidden gap-2 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setActiveIndex(i)}
                className={cn(
                  "relative shrink-0 w-20 h-14 overflow-hidden rounded-md focus-visible:ring-2 focus-visible:ring-ring",
                  activeIndex === i && "ring-2 ring-primary"
                )}
                aria-label={`${title} — thumbnail ${i + 1}`}
              >
                <SafeImage
                  src={img.url}
                  alt={`${title} — thumbnail ${i + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          role="dialog"
          aria-modal
          aria-label="Image gallery"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
            aria-label="Close gallery"
          >
            <X size={20} />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
            className="absolute left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
            aria-label="Previous image"
          >
            <ChevronLeft size={24} />
          </button>

          <div
            className="max-w-4xl max-h-[85vh] w-full px-16"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-video rounded-xl overflow-hidden">
              <SafeImage
                src={images[lightboxIndex]?.url}
                alt={`${title} — image ${lightboxIndex + 1}`}
                fill
                sizes="90vw"
                className="object-contain"
                priority
              />
            </div>
            <p className="text-center text-white/60 text-sm mt-3">
              {lightboxIndex + 1} / {images.length}
            </p>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
            className="absolute right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
            aria-label="Next image"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      )}
    </>
  );
}

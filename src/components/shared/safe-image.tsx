"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface SafeImageProps {
  src: string | null | undefined;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
  unoptimized?: boolean;
}

const PROPERTY_FALLBACKS = [
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
  "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800&q=80",
  "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&q=80",
  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80",
];

const CITY_FALLBACKS: Record<string, string> = {
  mumbai: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600&q=80",
  bangalore: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=600&q=80",
  delhi: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600&q=80",
  pune: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=600&q=80",
  hyderabad: "https://images.unsplash.com/photo-1605371924599-2d0365da1ae0?w=600&q=80",
  chennai: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&q=80",
  kolkata: "https://images.unsplash.com/photo-1558431382-27e303142255?w=600&q=80",
  ahmedabad: "https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=600&q=80",
};

function resolveImageUrl(src: string | null | undefined): string | null | undefined {
  if (!src) return src;
  if (!src.includes("picsum.photos")) return src;

  const lower = src.toLowerCase();
  for (const [key, url] of Object.entries(CITY_FALLBACKS)) {
    if (lower.includes(key)) return url;
  }

  let hash = 0;
  for (let i = 0; i < src.length; i++) {
    hash = (hash << 5) - hash + src.charCodeAt(i);
    hash |= 0;
  }
  return PROPERTY_FALLBACKS[Math.abs(hash) % PROPERTY_FALLBACKS.length];
}

export function SafeImage({
  src,
  alt,
  fill,
  width,
  height,
  className,
  sizes,
  priority,
  unoptimized,
}: SafeImageProps) {
  const [errored, setErrored] = useState(false);
  const safeSrc = resolveImageUrl(src);
  const isPicsum = typeof safeSrc === "string" && safeSrc.includes("picsum.photos");
  const isUnoptimized = unoptimized ?? isPicsum;

  const initials = alt
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (!safeSrc || errored) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground text-sm font-medium select-none",
          className
        )}
        aria-label={alt}
        role="img"
      >
        {initials}
      </div>
    );
  }

  if (fill) {
    return (
      <Image
        src={safeSrc}
        alt={alt}
        fill
        sizes={sizes ?? "(max-width: 768px) 100vw, 50vw"}
        className={className}
        onError={() => setErrored(true)}
        priority={priority}
        unoptimized={isUnoptimized}
      />
    );
  }

  return (
    <Image
      src={safeSrc}
      alt={alt}
      width={width ?? 800}
      height={height ?? 600}
      className={className}
      onError={() => setErrored(true)}
      priority={priority}
      unoptimized={isUnoptimized}
    />
  );
}

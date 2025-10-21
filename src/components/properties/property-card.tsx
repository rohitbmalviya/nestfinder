import Link from "next/link";
import { BedDouble, Bath, Ruler } from "lucide-react";
import { SafeImage } from "@/components/shared/safe-image";
import { FavoriteButton } from "@/components/properties/favorite-button";
import { formatPaiseCompact } from "@/lib/payments";
import type { PropertyCard as PropertyCardType } from "@/lib/actions/properties";

interface PropertyCardProps {
  property: PropertyCardType;
  showStatus?: boolean;
  isLoggedIn?: boolean;
  /** Set for above-the-fold cards so their cover image loads eagerly (LCP). */
  priority?: boolean;
}

function listingBadgeStyle(listingType: string) {
  if (listingType === "SALE") {
    return {
      background: "oklch(0.30 0.10 242)",
      color: "oklch(0.97 0.003 68)",
    };
  }
  return {
    background: "oklch(0.52 0.14 230)",
    color: "oklch(0.97 0 0)",
  };
}

function statusBadgeStyle(status: string) {
  if (status === "ACTIVE") {
    return {
      background: "oklch(0.60 0.18 145)",
      color: "oklch(0.97 0 0)",
      label: "Active",
    };
  }
  if (status === "SOLD") {
    return {
      background: "oklch(0.72 0.14 68)",
      color: "oklch(0.12 0.04 68)",
      label: "Sold",
    };
  }
  return {
    background: "oklch(0.52 0.14 230)",
    color: "oklch(0.97 0 0)",
    label: "Rented",
  };
}

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  HOUSE: "House",
  APARTMENT: "Apartment",
  VILLA: "Villa",
  PLOT: "Plot",
  COMMERCIAL: "Commercial",
};

export function PropertyCard({
  property,
  showStatus = false,
  isLoggedIn = false,
  priority = false,
}: PropertyCardProps) {
  const listingStyle = listingBadgeStyle(property.listingType);
  const statusInfo = statusBadgeStyle(property.status);

  return (
    <article className="rounded-lg border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Cover Image */}
      <Link href={`/properties/${property.slug}`} tabIndex={-1} aria-hidden>
        <div className="relative aspect-video overflow-hidden rounded-t-lg">
          <div className="absolute inset-0 transition-transform duration-300 hover:scale-105">
            <SafeImage
              src={property.coverImage}
              alt={`${property.title} — cover image`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover w-full h-full"
              priority={priority}
            />
          </div>

          {/* Top-left badges */}
          <div className="absolute top-3 left-3 flex gap-1.5 z-10">
            <span
              className="inline-flex items-center rounded-sm px-2 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-[0.08em]"
              style={{
                background: "oklch(0.93 0.03 242)",
                color: "oklch(0.26 0.09 242)",
              }}
            >
              {PROPERTY_TYPE_LABELS[property.propertyType] ?? property.propertyType}
            </span>
            <span
              className="inline-flex items-center rounded-sm px-2 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-[0.08em]"
              style={listingStyle}
            >
              {property.listingType === "SALE" ? "Sale" : "Rent"}
            </span>
          </div>

          {/* Favourite button — top right */}
          <div className="absolute top-2 right-2 z-10">
            <FavoriteButton
              propertyId={property.id}
              isFavorited={property.isFavorited}
              isLoggedIn={isLoggedIn}
            />
          </div>
        </div>
      </Link>

      {/* Card body */}
      <Link href={`/properties/${property.slug}`} className="block p-4 hover:bg-muted/30 transition-colors">
        {/* Price row */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <p
            className="text-xl font-bold leading-tight"
            style={{ color: "var(--foreground)" }}
          >
            {formatPaiseCompact(property.pricePaise)}
            {property.listingType === "RENT" && (
              <span className="text-sm font-normal text-muted-foreground ml-1">
                /mo
              </span>
            )}
          </p>
          {showStatus && (
            <span
              className="shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.75rem] font-semibold uppercase tracking-[0.07em]"
              style={{
                background: statusInfo.background,
                color: statusInfo.color,
              }}
            >
              {statusInfo.label}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base font-medium leading-snug line-clamp-2 mb-1">
          {property.title}
        </h3>

        {/* Address */}
        <p className="text-sm text-muted-foreground truncate mb-3">
          {property.address}, {property.city}
        </p>

        {/* Specs row */}
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <BedDouble size={14} />
            {property.bedrooms} bed
          </span>
          <span className="text-muted-foreground/50">·</span>
          <span className="flex items-center gap-1">
            <Bath size={14} />
            {property.bathrooms} bath
          </span>
          <span className="text-muted-foreground/50">·</span>
          <span className="flex items-center gap-1">
            <Ruler size={14} />
            {property.areaSqft.toLocaleString("en-IN")} sq ft
          </span>
        </div>
      </Link>
    </article>
  );
}

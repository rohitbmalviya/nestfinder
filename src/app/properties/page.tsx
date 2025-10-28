export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { getCurrentUser } from "@/lib/session";
import { getProperties, getCities } from "@/lib/actions/properties";
import { PropertyCard } from "@/components/properties/property-card";
import { PropertyGridSkeleton } from "@/components/properties/property-card-skeleton";
import { PropertiesFilterBar } from "@/components/properties/properties-filter-bar";
import { PropertiesPagination } from "@/components/properties/properties-pagination";
import { Heart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse Properties",
  description: "Search and filter properties for sale and rent across India.",
};

interface SearchParams {
  listingType?: string;
  propertyType?: string;
  city?: string;
  minPrice?: string;
  maxPrice?: string;
  bedrooms?: string;
  search?: string;
  sort?: string;
  page?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

function toSort(val: string | undefined): "price_asc" | "price_desc" | "newest" {
  if (val === "price_asc" || val === "price_desc" || val === "newest") return val;
  return "newest";
}

async function PropertiesResults({
  searchParams,
  isLoggedIn,
}: {
  searchParams: SearchParams;
  isLoggedIn: boolean;
}) {
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);
  const minPrice = searchParams.minPrice
    ? Math.round(parseFloat(searchParams.minPrice) * 100)
    : undefined;
  const maxPrice = searchParams.maxPrice
    ? Math.round(parseFloat(searchParams.maxPrice) * 100)
    : undefined;
  const bedrooms = searchParams.bedrooms
    ? parseInt(searchParams.bedrooms, 10)
    : undefined;

  const listingTypeParam = searchParams.listingType;
  const listingType =
    listingTypeParam === "SALE" || listingTypeParam === "RENT"
      ? listingTypeParam
      : undefined;

  const propertyTypeParam = searchParams.propertyType;
  const propertyType =
    propertyTypeParam === "HOUSE" ||
    propertyTypeParam === "APARTMENT" ||
    propertyTypeParam === "VILLA" ||
    propertyTypeParam === "PLOT" ||
    propertyTypeParam === "COMMERCIAL"
      ? propertyTypeParam
      : undefined;

  const result = await getProperties({
    listingType,
    propertyType,
    city: searchParams.city || undefined,
    minPrice,
    maxPrice,
    bedrooms: isNaN(bedrooms as number) ? undefined : bedrooms,
    search: searchParams.search || undefined,
    sort: toSort(searchParams.sort),
    page,
    limit: 12,
  });

  if (result.properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div
          className="flex items-center justify-center w-20 h-20 rounded-full mb-6"
          style={{ background: "oklch(0.93 0.03 242)" }}
        >
          <Heart size={36} style={{ color: "oklch(0.48 0.02 242)" }} />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          No properties found
        </h2>
        <p className="text-sm text-muted-foreground max-w-sm mb-6">
          Try adjusting your filters or exploring another city.
        </p>
        <Link href="/properties">
          <Button variant="outline">Clear all filters</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <p className="text-sm text-muted-foreground mb-4">
        {result.total.toLocaleString("en-IN")}{" "}
        {result.total === 1 ? "property" : "properties"} found
        {searchParams.city ? ` in ${searchParams.city}` : ""}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {result.properties.map((property, index) => (
          <PropertyCard
            key={property.id}
            property={property}
            isLoggedIn={isLoggedIn}
            priority={index < 3}
          />
        ))}
      </div>

      {result.totalPages > 1 && (
        <div className="mt-10">
          <PropertiesPagination
            currentPage={result.page}
            totalPages={result.totalPages}
            searchParams={searchParams as Record<string, string | undefined>}
          />
        </div>
      )}
    </>
  );
}

export default async function PropertiesPage({ searchParams }: PageProps) {
  const [user, cities, resolvedSearchParams] = await Promise.all([
    getCurrentUser(),
    getCities(),
    searchParams,
  ]);

  const isLoggedIn = user !== null;

  return (
    <div className="min-h-screen bg-background">
      {/* Filter bar */}
      <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PropertiesFilterBar
            cities={cities}
            searchParams={resolvedSearchParams}
          />
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<PropertyGridSkeleton count={12} />}>
          <PropertiesResults
            searchParams={resolvedSearchParams}
            isLoggedIn={isLoggedIn}
          />
        </Suspense>
      </div>
    </div>
  );
}

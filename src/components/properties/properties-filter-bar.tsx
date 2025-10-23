"use client";

import { useRouter, usePathname } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterBarProps {
  cities: string[];
  searchParams: {
    listingType?: string;
    propertyType?: string;
    city?: string;
    minPrice?: string;
    maxPrice?: string;
    bedrooms?: string;
    search?: string;
    sort?: string;
    page?: string;
  };
}

const PROPERTY_TYPES = [
  { value: "__all__", label: "All Types" },
  { value: "HOUSE", label: "House" },
  { value: "APARTMENT", label: "Apartment" },
  { value: "VILLA", label: "Villa" },
  { value: "PLOT", label: "Plot" },
  { value: "COMMERCIAL", label: "Commercial" },
];

const BEDROOM_OPTIONS = [
  { value: "__all__", label: "Any Beds" },
  { value: "1", label: "1+ Beds" },
  { value: "2", label: "2+ Beds" },
  { value: "3", label: "3+ Beds" },
  { value: "4", label: "4+ Beds" },
  { value: "5", label: "5+ Beds" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

export function PropertiesFilterBar({ cities, searchParams }: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [listingType, setListingType] = useState(
    searchParams.listingType ?? ""
  );
  const [propertyType, setPropertyType] = useState(
    searchParams.propertyType ?? ""
  );
  const [city, setCity] = useState(searchParams.city ?? "");
  const [bedrooms, setBedrooms] = useState(searchParams.bedrooms ?? "");
  const [minPrice, setMinPrice] = useState(searchParams.minPrice ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.maxPrice ?? "");
  const [search, setSearch] = useState(searchParams.search ?? "");
  const [sort, setSort] = useState(searchParams.sort ?? "newest");

  const pushFilters = useCallback(
    (overrides: Record<string, string>) => {
      const params = new URLSearchParams();

      const values: Record<string, string> = {
        listingType,
        propertyType,
        city,
        bedrooms,
        minPrice,
        maxPrice,
        search,
        sort,
        ...overrides,
      };

      // reset page on filter change
      for (const [k, v] of Object.entries(values)) {
        if (v && v !== "__all__") params.set(k, v);
      }

      router.push(`${pathname}?${params.toString()}`);
    },
    [listingType, propertyType, city, bedrooms, minPrice, maxPrice, search, sort, router, pathname]
  );

  // Sync local state when external searchParams change
  useEffect(() => {
    setListingType(searchParams.listingType ?? "");
    setPropertyType(searchParams.propertyType ?? "");
    setCity(searchParams.city ?? "");
    setBedrooms(searchParams.bedrooms ?? "");
    setMinPrice(searchParams.minPrice ?? "");
    setMaxPrice(searchParams.maxPrice ?? "");
    setSearch(searchParams.search ?? "");
    setSort(searchParams.sort ?? "newest");
  }, [searchParams]);

  function handleListingType(val: "SALE" | "RENT" | "") {
    setListingType(val);
    pushFilters({ listingType: val });
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    pushFilters({});
  }

  return (
    <div className="py-3">
      {/* Row 1: Buy/Rent toggle + Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Buy / Rent toggle */}
        <div className="flex rounded-lg border border-border overflow-hidden">
          {(["", "SALE", "RENT"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => handleListingType(type)}
              className="px-3 py-1.5 text-xs font-medium transition-colors"
              style={
                listingType === type
                  ? {
                      background: "oklch(0.30 0.10 242)",
                      color: "oklch(0.97 0.003 68)",
                    }
                  : undefined
              }
            >
              {type === "" ? "All" : type === "SALE" ? "Buy" : "Rent"}
            </button>
          ))}
        </div>

        {/* City select */}
        <Select
          value={city || null}
          onValueChange={(v) => {
            const val = v === "__all__" ? "" : (v ?? "");
            setCity(val);
            pushFilters({ city: val });
          }}
        >
          <SelectTrigger className="w-36 h-11 text-sm" aria-label="City">
            <SelectValue placeholder="Please select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Cities</SelectItem>
            {cities.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Property type */}
        <Select
          items={PROPERTY_TYPES}
          value={propertyType || null}
          onValueChange={(v) => {
            const val = v === "__all__" ? "" : (v ?? "");
            setPropertyType(val);
            pushFilters({ propertyType: val });
          }}
        >
          <SelectTrigger className="w-36 h-11 text-sm" aria-label="Property type">
            <SelectValue placeholder="Please select" />
          </SelectTrigger>
          <SelectContent>
            {PROPERTY_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Bedrooms */}
        <Select
          items={BEDROOM_OPTIONS}
          value={bedrooms || null}
          onValueChange={(v) => {
            const val = v === "__all__" ? "" : (v ?? "");
            setBedrooms(val);
            pushFilters({ bedrooms: val });
          }}
        >
          <SelectTrigger className="w-28 h-11 text-sm" aria-label="Bedrooms">
            <SelectValue placeholder="Please select" />
          </SelectTrigger>
          <SelectContent>
            {BEDROOM_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Price range */}
        <div className="flex items-center gap-1">
          <SlidersHorizontal size={14} className="text-muted-foreground shrink-0" />
          <Input
            type="number"
            placeholder="Min ₹"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            onBlur={() => pushFilters({})}
            className="w-24 h-11 text-sm"
            aria-label="Minimum price in rupees"
            min={0}
          />
          <span className="text-muted-foreground text-xs">–</span>
          <Input
            type="number"
            placeholder="Max ₹"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            onBlur={() => pushFilters({})}
            className="w-24 h-11 text-sm"
            aria-label="Maximum price in rupees"
            min={0}
          />
        </div>

        {/* Search input */}
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-40">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <Input
              type="search"
              placeholder="Search properties..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-11 text-sm"
              aria-label="Search properties"
            />
          </div>
        </form>

        {/* Sort — right-aligned */}
        <div className="ml-auto">
          <Select
            items={SORT_OPTIONS}
            value={sort}
            onValueChange={(v) => {
              const val = v ?? "newest";
              setSort(val);
              pushFilters({ sort: val });
            }}
          >
            <SelectTrigger className="w-44 h-11 text-sm" aria-label="Sort by">
              <SelectValue placeholder="Newest first" />
            </SelectTrigger>
            <SelectContent align="end">
              {SORT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PROPERTY_TYPES = [
  { value: "", label: "All Types" },
  { value: "HOUSE", label: "House" },
  { value: "APARTMENT", label: "Apartment" },
  { value: "VILLA", label: "Villa" },
  { value: "PLOT", label: "Plot" },
  { value: "COMMERCIAL", label: "Commercial" },
];

export function HeroSearch() {
  const router = useRouter();
  const [listingType, setListingType] = useState<"SALE" | "RENT">("SALE");
  const [propertyType, setPropertyType] = useState<string>("");
  const [location, setLocation] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set("listingType", listingType);
    if (propertyType && propertyType !== "__all__") params.set("propertyType", propertyType);
    if (location.trim()) params.set("search", location.trim());
    router.push(`/properties?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSearch}
      className="bg-card rounded-xl shadow-2xl p-4 md:p-6"
    >
      {/* Buy / Rent toggle */}
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setListingType("SALE")}
          className="px-5 py-2 rounded-lg text-sm font-medium transition-all"
          style={
            listingType === "SALE"
              ? {
                  background: "oklch(0.30 0.10 242)",
                  color: "oklch(0.97 0.003 68)",
                }
              : {
                  background: "oklch(0.93 0.03 242)",
                  color: "oklch(0.26 0.09 242)",
                }
          }
        >
          Buy
        </button>
        <button
          type="button"
          onClick={() => setListingType("RENT")}
          className="px-5 py-2 rounded-lg text-sm font-medium transition-all"
          style={
            listingType === "RENT"
              ? {
                  background: "oklch(0.30 0.10 242)",
                  color: "oklch(0.97 0.003 68)",
                }
              : {
                  background: "oklch(0.93 0.03 242)",
                  color: "oklch(0.26 0.09 242)",
                }
          }
        >
          Rent
        </button>
      </div>

      {/* Search fields */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <Input
            type="text"
            placeholder="City or locality..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="pl-9 h-11"
            aria-label="Search by city or locality"
          />
        </div>

        <Select
          value={propertyType || undefined}
          onValueChange={(v) => setPropertyType(v === "__all__" ? "" : (v ?? ""))}
        >
          <SelectTrigger className="w-full md:w-44 h-11" aria-label="Property type">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            {PROPERTY_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value || "__all__"}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button type="submit" className="h-11 px-6 whitespace-nowrap">
          <Search size={16} className="mr-1.5" />
          Search Properties
        </Button>
      </div>
    </form>
  );
}

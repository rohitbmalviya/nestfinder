"use client";

import { useState, useTransition } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v3";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { createListing, updateListing, updateListingStatus } from "@/lib/actions/agent";
import type { AgentListingDetail } from "@/lib/actions/agent";

const AMENITY_OPTIONS = [
  "Parking",
  "Pool",
  "Gym",
  "Security",
  "WiFi",
  "Power",
  "Lift",
  "Garden",
  "Balcony",
  "Modular Kitchen",
  "Air Conditioning",
  "24/7 Water",
];

const schema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(150),
  description: z.string().min(20, "Description must be at least 20 characters").max(5000),
  propertyType: z.enum(["HOUSE", "APARTMENT", "VILLA", "PLOT", "COMMERCIAL"]),
  listingType: z.enum(["SALE", "RENT"]),
  priceRupees: z
    .string()
    .min(1, "Price is required")
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Must be a positive number"),
  bedrooms: z.string().min(1, "Required").refine((v) => !isNaN(Number(v)) && Number(v) >= 0),
  bathrooms: z.string().min(1, "Required").refine((v) => !isNaN(Number(v)) && Number(v) >= 0),
  areaSqft: z.string().min(1, "Required").refine((v) => !isNaN(Number(v)) && Number(v) > 0),
  address: z.string().min(5).max(300),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  pincode: z.string().min(4).max(10),
  lat: z.string().refine((v) => !isNaN(Number(v)) && Number(v) >= -90 && Number(v) <= 90, "Must be between -90 and 90"),
  lng: z.string().refine((v) => !isNaN(Number(v)) && Number(v) >= -180 && Number(v) <= 180, "Must be between -180 and 180"),
  amenities: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  status: z.enum(["ACTIVE", "SOLD", "RENTED"]).optional(),
  images: z
    .array(z.object({ url: z.string().url("Invalid URL") }))
    .min(1, "At least one image is required")
    .max(10),
});

type FormData = z.infer<typeof schema>;

interface ListingFormProps {
  mode: "create" | "edit";
  listing?: AgentListingDetail;
}

export function ListingForm({ mode, listing }: ListingFormProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    listing?.amenities ? listing.amenities.split(",").map((a) => a.trim()).filter(Boolean) : []
  );

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: listing?.title ?? "",
      description: listing?.description ?? "",
      propertyType: listing?.propertyType ?? "APARTMENT",
      listingType: listing?.listingType ?? "SALE",
      priceRupees: listing ? String(listing.pricePaise / 100) : "",
      bedrooms: listing ? String(listing.bedrooms) : "",
      bathrooms: listing ? String(listing.bathrooms) : "",
      areaSqft: listing ? String(listing.areaSqft) : "",
      address: listing?.address ?? "",
      city: listing?.city ?? "",
      state: listing?.state ?? "",
      pincode: listing?.pincode ?? "",
      lat: listing ? String(listing.lat) : "",
      lng: listing ? String(listing.lng) : "",
      featured: listing?.featured ?? false,
      status: (listing?.status as "ACTIVE" | "SOLD" | "RENTED") ?? "ACTIVE",
      images: listing?.images.length
        ? listing.images.map((img) => ({ url: img.url }))
        : [{ url: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "images",
  });

  const watchedFeatured = watch("featured");

  function toggleAmenity(amenity: string) {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  }

  async function onSubmit(data: FormData) {
    const pricePaise = Math.round(Number(data.priceRupees) * 100);
    const amenitiesStr = selectedAmenities.join(",");

    const payload = {
      title: data.title,
      description: data.description,
      propertyType: data.propertyType,
      listingType: data.listingType,
      pricePaise,
      bedrooms: parseInt(data.bedrooms, 10),
      bathrooms: parseInt(data.bathrooms, 10),
      areaSqft: parseInt(data.areaSqft, 10),
      address: data.address,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      lat: Number(data.lat),
      lng: Number(data.lng),
      amenities: amenitiesStr,
      featured: data.featured ?? false,
      images: data.images
        .filter((img) => img.url.trim() !== "")
        .map((img, i) => ({ url: img.url, position: i })),
    };

    if (payload.images.length === 0) {
      toast.error("At least one image URL is required");
      return;
    }

    startTransition(async () => {
      try {
        if (mode === "create") {
          const result = await createListing(payload);
          if (result.success) {
            // Update status if not ACTIVE (create always creates ACTIVE)
            if (data.status && data.status !== "ACTIVE") {
              await updateListingStatus(result.data.listingId, data.status);
            }
            toast.success("Listing created successfully!");
            router.push("/agent/listings");
          } else {
            if (result.fieldErrors) {
              for (const msgs of Object.values(result.fieldErrors)) {
                for (const msg of msgs) toast.error(msg);
              }
            } else {
              toast.error(result.error ?? "Failed to create listing");
            }
          }
        } else if (listing) {
          const result = await updateListing(listing.id, payload);
          if (result.success) {
            // Update status separately
            if (data.status) {
              await updateListingStatus(listing.id, data.status);
            }
            toast.success("Listing updated successfully!");
            router.push("/agent/listings");
          } else {
            toast.error(result.error ?? "Failed to update listing");
          }
        }
      } catch {
        toast.error("Something went wrong");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="grid grid-cols-12 gap-6">
        {/* ── Left column ── */}
        <div className="col-span-12 lg:col-span-8 space-y-5">
          {/* Title */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h2 className="text-sm font-semibold text-foreground">
              Basic Information
            </h2>

            <div>
              <Label htmlFor="lf-title" className="text-xs text-muted-foreground mb-1.5 block">
                Property Title
              </Label>
              <Input
                id="lf-title"
                placeholder="Spacious 3BHK Apartment in Bandra West"
                aria-invalid={!!errors.title}
                {...register("title")}
              />
              {errors.title && (
                <p className="text-xs text-destructive mt-1" role="alert">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="lf-description" className="text-xs text-muted-foreground mb-1.5 block">
                Description
              </Label>
              <Textarea
                id="lf-description"
                rows={5}
                placeholder="Describe the property, neighbourhood, and key selling points..."
                aria-invalid={!!errors.description}
                {...register("description")}
              />
              {errors.description && (
                <p className="text-xs text-destructive mt-1" role="alert">
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Location</h2>

            <div>
              <Label htmlFor="lf-address" className="text-xs text-muted-foreground mb-1.5 block">
                Full Address
              </Label>
              <Input
                id="lf-address"
                placeholder="12, Marine Drive, Churchgate"
                aria-invalid={!!errors.address}
                {...register("address")}
              />
              {errors.address && (
                <p className="text-xs text-destructive mt-1" role="alert">
                  {errors.address.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="lf-city" className="text-xs text-muted-foreground mb-1.5 block">
                  City
                </Label>
                <Input
                  id="lf-city"
                  placeholder="Mumbai"
                  aria-invalid={!!errors.city}
                  {...register("city")}
                />
                {errors.city && (
                  <p className="text-xs text-destructive mt-1" role="alert">
                    {errors.city.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="lf-state" className="text-xs text-muted-foreground mb-1.5 block">
                  State
                </Label>
                <Input
                  id="lf-state"
                  placeholder="Maharashtra"
                  aria-invalid={!!errors.state}
                  {...register("state")}
                />
                {errors.state && (
                  <p className="text-xs text-destructive mt-1" role="alert">
                    {errors.state.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="lf-pincode" className="text-xs text-muted-foreground mb-1.5 block">
                  Pincode
                </Label>
                <Input
                  id="lf-pincode"
                  placeholder="400001"
                  aria-invalid={!!errors.pincode}
                  {...register("pincode")}
                />
                {errors.pincode && (
                  <p className="text-xs text-destructive mt-1" role="alert">
                    {errors.pincode.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="lf-lat" className="text-xs text-muted-foreground mb-1.5 block">
                  Latitude
                </Label>
                <Input
                  id="lf-lat"
                  placeholder="18.9388"
                  type="number"
                  step="any"
                  aria-invalid={!!errors.lat}
                  {...register("lat")}
                />
                {errors.lat && (
                  <p className="text-xs text-destructive mt-1" role="alert">
                    {errors.lat.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="lf-lng" className="text-xs text-muted-foreground mb-1.5 block">
                  Longitude
                </Label>
                <Input
                  id="lf-lng"
                  placeholder="72.8354"
                  type="number"
                  step="any"
                  aria-invalid={!!errors.lng}
                  {...register("lng")}
                />
                {errors.lng && (
                  <p className="text-xs text-destructive mt-1" role="alert">
                    {errors.lng.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">
              Amenities
            </h2>
            <div className="flex flex-wrap gap-2">
              {AMENITY_OPTIONS.map((amenity) => {
                const selected = selectedAmenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors border"
                    style={
                      selected
                        ? {
                            background: "oklch(0.30 0.10 242)",
                            color: "oklch(0.97 0.003 68)",
                            borderColor: "oklch(0.30 0.10 242)",
                          }
                        : {
                            borderColor: "var(--border)",
                            color: "var(--muted-foreground)",
                          }
                    }
                    aria-pressed={selected}
                  >
                    {amenity}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Images */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">
                Property Images
              </h2>
              {fields.length < 10 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ url: "" })}
                  className="gap-1"
                >
                  <Plus size={14} />
                  Add Image
                </Button>
              )}
            </div>

            {errors.images && !Array.isArray(errors.images) && (
              <p className="text-xs text-destructive" role="alert">
                {errors.images.message}
              </p>
            )}

            <div className="space-y-2">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-5 shrink-0 text-right">
                    {index + 1}.
                  </span>
                  <Input
                    type="url"
                    placeholder="https://picsum.photos/seed/property/800/600"
                    aria-label={`Image URL ${index + 1}`}
                    aria-invalid={!!errors.images?.[index]?.url}
                    {...register(`images.${index}.url`)}
                  />
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => remove(index)}
                      aria-label={`Remove image ${index + 1}`}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                    >
                      <Trash2 size={14} />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Enter image URLs (e.g. from picsum.photos). First image will be the cover.
            </p>
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="col-span-12 lg:col-span-4 space-y-5">
          {/* Property details */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h2 className="text-sm font-semibold text-foreground">
              Property Details
            </h2>

            <div>
              <Label htmlFor="lf-property-type" className="text-xs text-muted-foreground mb-1.5 block">
                Property Type
              </Label>
              <Select
                defaultValue={listing?.propertyType ?? "APARTMENT"}
                onValueChange={(v) => {
                  const val = v ?? "APARTMENT";
                  setValue("propertyType", val as FormData["propertyType"]);
                }}
              >
                <SelectTrigger id="lf-property-type" className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {["HOUSE", "APARTMENT", "VILLA", "PLOT", "COMMERCIAL"].map((t) => (
                    <SelectItem key={t} value={t}>
                      {t.charAt(0) + t.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1.5">Listing Type</p>
              <div className="flex rounded-lg border border-border overflow-hidden">
                {(["SALE", "RENT"] as const).map((type) => {
                  const currentType = watch("listingType");
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setValue("listingType", type)}
                      className="flex-1 py-2 text-sm font-medium transition-colors"
                      style={
                        currentType === type
                          ? {
                              background: "oklch(0.30 0.10 242)",
                              color: "oklch(0.97 0.003 68)",
                            }
                          : undefined
                      }
                    >
                      {type === "SALE" ? "For Sale" : "For Rent"}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label htmlFor="lf-price" className="text-xs text-muted-foreground mb-1.5 block">
                Price (₹)
              </Label>
              <Input
                id="lf-price"
                type="number"
                min={0}
                placeholder="8500000"
                aria-invalid={!!errors.priceRupees}
                {...register("priceRupees")}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter amount in rupees. For rent, enter monthly amount.
              </p>
              {errors.priceRupees && (
                <p className="text-xs text-destructive mt-1" role="alert">
                  {errors.priceRupees.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="lf-beds" className="text-xs text-muted-foreground mb-1.5 block">
                  Bedrooms
                </Label>
                <Input
                  id="lf-beds"
                  type="number"
                  min={0}
                  placeholder="3"
                  aria-invalid={!!errors.bedrooms}
                  {...register("bedrooms")}
                />
                {errors.bedrooms && (
                  <p className="text-xs text-destructive mt-1" role="alert">
                    {errors.bedrooms.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="lf-baths" className="text-xs text-muted-foreground mb-1.5 block">
                  Bathrooms
                </Label>
                <Input
                  id="lf-baths"
                  type="number"
                  min={0}
                  placeholder="2"
                  aria-invalid={!!errors.bathrooms}
                  {...register("bathrooms")}
                />
                {errors.bathrooms && (
                  <p className="text-xs text-destructive mt-1" role="alert">
                    {errors.bathrooms.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="lf-area" className="text-xs text-muted-foreground mb-1.5 block">
                Area (sq ft)
              </Label>
              <Input
                id="lf-area"
                type="number"
                min={1}
                placeholder="1450"
                aria-invalid={!!errors.areaSqft}
                {...register("areaSqft")}
              />
              {errors.areaSqft && (
                <p className="text-xs text-destructive mt-1" role="alert">
                  {errors.areaSqft.message}
                </p>
              )}
            </div>
          </div>

          {/* Status & options */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h2 className="text-sm font-semibold text-foreground">
              Listing Settings
            </h2>

            <div>
              <Label htmlFor="lf-status" className="text-xs text-muted-foreground mb-1.5 block">
                Status
              </Label>
              <Select
                defaultValue={listing?.status ?? "ACTIVE"}
                onValueChange={(v) => {
                  const val = v ?? "ACTIVE";
                  setValue("status", val as FormData["status"]);
                }}
              >
                <SelectTrigger id="lf-status" className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="SOLD">Sold</SelectItem>
                  <SelectItem value="RENTED">Rented</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="lf-featured" className="text-sm font-medium block">
                  Featured Listing
                </Label>
                <p className="text-xs text-muted-foreground">
                  Show on the landing page hero
                </p>
              </div>
              <Switch
                id="lf-featured"
                checked={watchedFeatured}
                onCheckedChange={(checked) => setValue("featured", checked)}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button type="submit" disabled={isSubmitting} className="w-full h-11">
              {isSubmitting
                ? mode === "create"
                  ? "Creating…"
                  : "Saving…"
                : mode === "create"
                ? "Create Listing"
                : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full h-11"
              onClick={() => router.push("/agent/listings")}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

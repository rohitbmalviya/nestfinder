export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import {
  BedDouble,
  Bath,
  Ruler,
  Home,
  Phone,
  Car,
  Droplets,
  Dumbbell,
  Shield,
  Wifi,
  Zap,
  MapPin,
  ChevronRight,
} from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { getPropertyBySlug } from "@/lib/actions/properties";
import { formatPaise } from "@/lib/payments";
import { PropertyGallery } from "@/components/properties/property-gallery";
import { EnquiryForm } from "@/components/properties/enquiry-form";
import { DetailFavoriteButton } from "@/components/properties/detail-favorite-button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const AMENITY_ICONS: Record<string, React.ElementType> = {
  Parking: Car,
  Pool: Droplets,
  Gym: Dumbbell,
  Security: Shield,
  WiFi: Wifi,
  Power: Zap,
};

function statusBadgeStyle(status: string) {
  if (status === "ACTIVE") {
    return { bg: "oklch(0.60 0.18 145)", color: "oklch(0.97 0 0)", label: "Available" };
  }
  if (status === "SOLD") {
    return { bg: "oklch(0.72 0.14 68)", color: "oklch(0.12 0.04 68)", label: "Sold" };
  }
  return { bg: "oklch(0.52 0.14 230)", color: "oklch(0.97 0 0)", label: "Rented" };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) return { title: "Property Not Found" };
  return {
    title: property.title,
    description: property.description.slice(0, 160),
  };
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const [user, property] = await Promise.all([
    getCurrentUser(),
    getPropertyBySlug(slug),
  ]);

  if (!property) notFound();

  const isLoggedIn = user !== null;
  const statusInfo = statusBadgeStyle(property.status);

  const agentInitials = property.agent.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${property.lng - 0.01},${property.lat - 0.01},${property.lng + 0.01},${property.lat + 0.01}&layer=mapnik&marker=${property.lat},${property.lng}`;
  const mapLink = `https://www.openstreetmap.org/?mlat=${property.lat}&mlon=${property.lng}#map=15/${property.lat}/${property.lng}`;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="py-3 text-sm text-muted-foreground flex items-center gap-1.5"
        >
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <ChevronRight size={14} className="shrink-0" />
          <Link
            href="/properties"
            className="hover:text-foreground transition-colors"
          >
            Properties
          </Link>
          <ChevronRight size={14} className="shrink-0" />
          <Link
            href={`/properties?city=${encodeURIComponent(property.city)}`}
            className="hover:text-foreground transition-colors"
          >
            {property.city}
          </Link>
          <ChevronRight size={14} className="shrink-0" />
          <span className="text-foreground truncate max-w-48">
            {property.title}
          </span>
        </nav>

        {/* Main grid */}
        <div className="grid grid-cols-12 gap-8 pb-16">
          {/* ── Left column ── */}
          <div className="col-span-12 lg:col-span-7 space-y-8">
            {/* Gallery */}
            <PropertyGallery
              images={property.images}
              title={property.title}
            />

            {/* Mobile: price + status */}
            <div className="lg:hidden">
              <div className="flex items-center gap-3 mb-2">
                <p
                  className="text-2xl font-bold"
                  style={{ color: "oklch(0.72 0.14 68)" }}
                >
                  {formatPaise(property.pricePaise)}
                  {property.listingType === "RENT" && (
                    <span className="text-base font-normal text-muted-foreground ml-1">
                      /mo
                    </span>
                  )}
                </p>
                <span
                  className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-[0.07em]"
                  style={{
                    background: statusInfo.bg,
                    color: statusInfo.color,
                  }}
                >
                  {statusInfo.label}
                </span>
              </div>
              <h1 className="text-xl font-bold text-foreground mb-1">
                {property.title}
              </h1>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin size={14} />
                {property.address}, {property.city}, {property.state}
              </p>
            </div>

            {/* Specs strip — mobile */}
            <div className="lg:hidden grid grid-cols-2 gap-4">
              <SpecItem icon={BedDouble} label={`${property.bedrooms} Beds`} />
              <SpecItem icon={Bath} label={`${property.bathrooms} Baths`} />
              <SpecItem
                icon={Ruler}
                label={`${property.areaSqft.toLocaleString("en-IN")} sq ft`}
              />
              <SpecItem icon={Home} label={property.propertyType} />
            </div>

            {/* Description */}
            <section aria-labelledby="description-heading">
              <h2
                id="description-heading"
                className="text-lg font-semibold text-foreground mb-3"
              >
                About this property
              </h2>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </section>

            {/* Amenities */}
            {property.amenities.length > 0 && (
              <section aria-labelledby="amenities-heading">
                <h2
                  id="amenities-heading"
                  className="text-lg font-semibold text-foreground mb-3"
                >
                  Amenities
                </h2>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((amenity) => {
                    const Icon = AMENITY_ICONS[amenity];
                    return (
                      <Badge
                        key={amenity}
                        variant="secondary"
                        className="flex items-center gap-1.5 text-sm px-3 py-1 h-auto"
                      >
                        {Icon && <Icon size={13} />}
                        {amenity}
                      </Badge>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Map embed */}
            <section aria-labelledby="location-heading">
              <h2
                id="location-heading"
                className="text-lg font-semibold text-foreground mb-3"
              >
                Location
              </h2>
              <div className="relative w-full overflow-hidden rounded-xl border border-border">
                <div className="aspect-[16/9] md:aspect-[21/9]">
                  <iframe
                    src={mapSrc}
                    className="w-full h-full"
                    style={{ border: 0 }}
                    loading="lazy"
                    title="Property location map"
                    aria-label={`Map showing location of ${property.title}`}
                  />
                </div>
                <a
                  href={mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-3 right-3 text-xs bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-border text-primary hover:bg-background transition-colors"
                >
                  View larger map ↗
                </a>
              </div>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <MapPin size={12} />
                {property.address}, {property.city}, {property.state} —{" "}
                {property.pincode}
              </p>
            </section>

            {/* Mobile: enquiry form */}
            <div className="lg:hidden">
              <EnquiryForm
                propertyId={property.id}
                user={user ? { name: user.name, email: user.email } : null}
              />
            </div>
          </div>

          {/* ── Right sidebar ── */}
          <div className="col-span-12 lg:col-span-5">
            <div className="sticky top-24 space-y-4">
              {/* Price card */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-[0.08em] font-semibold mb-1">
                        {property.listingType === "RENT"
                          ? "Monthly Rent"
                          : "Asking Price"}
                      </p>
                      <p
                        className="text-3xl font-bold"
                        style={{ color: "oklch(0.72 0.14 68)" }}
                      >
                        {formatPaise(property.pricePaise)}
                        {property.listingType === "RENT" && (
                          <span className="text-base font-normal text-muted-foreground ml-1">
                            /mo
                          </span>
                        )}
                      </p>
                    </div>
                    <span
                      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-[0.07em] shrink-0"
                      style={{
                        background: statusInfo.bg,
                        color: statusInfo.color,
                      }}
                    >
                      {statusInfo.label}
                    </span>
                  </div>
                  <h1 className="mt-3 text-lg font-bold text-foreground leading-snug">
                    {property.title}
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                    <MapPin size={13} />
                    {property.address}, {property.city}
                  </p>
                </div>

                {/* Specs grid */}
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
                  <SpecItem icon={BedDouble} label={`${property.bedrooms} Beds`} />
                  <SpecItem icon={Bath} label={`${property.bathrooms} Baths`} />
                  <SpecItem
                    icon={Ruler}
                    label={`${property.areaSqft.toLocaleString("en-IN")} sq ft`}
                  />
                  <SpecItem icon={Home} label={property.propertyType} />
                </div>

                {/* Favourite button */}
                <div className="pt-2 border-t border-border">
                  <DetailFavoriteButton
                    propertyId={property.id}
                    isFavorited={property.isFavorited}
                    isLoggedIn={isLoggedIn}
                  />
                </div>
              </div>

              {/* Agent contact card */}
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-[0.08em] mb-4">
                  Listed by
                </h3>
                <div className="flex items-start gap-3">
                  <Avatar className="w-12 h-12 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                      {agentInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">
                      {property.agent.name}
                    </p>
                    {property.agent.agencyName && (
                      <p className="text-sm text-muted-foreground truncate">
                        {property.agent.agencyName}
                      </p>
                    )}
                    {property.agent.phone && (
                      <a
                        href={`tel:${property.agent.phone}`}
                        className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mt-1"
                        aria-label={`Call ${property.agent.name}`}
                      >
                        <Phone size={13} />
                        {property.agent.phone}
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Enquiry form — desktop */}
              <div className="hidden lg:block">
                <EnquiryForm
                  propertyId={property.id}
                  user={user ? { name: user.name, email: user.email } : null}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky bottom bar for favourite */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 z-20">
        <DetailFavoriteButton
          propertyId={property.id}
          isFavorited={property.isFavorited}
          isLoggedIn={isLoggedIn}
          fullWidth
        />
      </div>
    </div>
  );
}

function SpecItem({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={16} className="text-muted-foreground shrink-0" />
      <span className="text-sm text-foreground capitalize">{label}</span>
    </div>
  );
}

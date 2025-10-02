export const dynamic = "force-dynamic";

import Link from "next/link";
import { Search, Heart, MessageSquare, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PropertyCard } from "@/components/properties/property-card";
import { HeroSearch } from "@/components/properties/hero-search";
import { getCurrentUser } from "@/lib/session";
import {
  getFeaturedProperties,
  getCityCounts,
} from "@/lib/actions/properties";

const CITY_IMAGES: Record<string, string> = {
  Mumbai: "https://picsum.photos/seed/mumbai-city/600/400",
  Bangalore: "https://picsum.photos/seed/bangalore-city/600/400",
  Delhi: "https://picsum.photos/seed/delhi-city/600/400",
  Pune: "https://picsum.photos/seed/pune-city/600/400",
  Hyderabad: "https://picsum.photos/seed/hyderabad-city/600/400",
  Chennai: "https://picsum.photos/seed/chennai-city/600/400",
  Kolkata: "https://picsum.photos/seed/kolkata-city/600/400",
  Ahmedabad: "https://picsum.photos/seed/ahmedabad-city/600/400",
};

export default async function LandingPage() {
  const [user, featured, cityCounts] = await Promise.all([
    getCurrentUser(),
    getFeaturedProperties(6),
    getCityCounts(),
  ]);

  const isLoggedIn = user !== null;

  return (
    <div className="flex flex-col">
      {/* ─── Hero ─────────────────────────────────────────── */}
      <section
        className="relative min-h-[90vh] flex items-center justify-center"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.20 0.08 242) 0%, oklch(0.12 0.025 242) 100%)",
        }}
      >
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(oklch(1 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-24 text-center">
          <p
            className="text-sm font-semibold uppercase tracking-[0.15em] mb-4"
            style={{ color: "oklch(0.72 0.14 68)" }}
          >
            Premium Real Estate
          </p>
          <h1
            className="font-bold text-white leading-tight mb-6"
            style={{
              fontSize: "clamp(2.5rem, 4vw + 1rem, 4rem)",
              lineHeight: 1.1,
            }}
          >
            Find Your Perfect
            <br />
            <span style={{ color: "oklch(0.72 0.14 68)" }}>Home in India</span>
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Discover thousands of properties across Mumbai, Bangalore, Delhi,
            Pune, and beyond. Buy, rent, or list — all in one trusted portal.
          </p>

          {/* Search bar */}
          <div className="max-w-3xl mx-auto">
            <HeroSearch />
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-12 text-white/60 text-sm">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">15,000+</p>
              <p>Active Listings</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">50+</p>
              <p>Cities</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">10,000+</p>
              <p>Happy Customers</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Featured Properties ───────────────────────────── */}
      {featured.length > 0 && (
        <section className="py-16 bg-background">
          <div className="container mx-auto px-6 md:px-12 lg:px-16 max-w-7xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">
                  Featured Properties
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Handpicked premium listings
                </p>
              </div>
              <Link href="/properties">
                <Button variant="ghost" size="sm" className="gap-1.5">
                  Browse all
                  <ArrowRight size={14} />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((property, index) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  isLoggedIn={isLoggedIn}
                  priority={index < 3}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Browse by City ────────────────────────────────── */}
      {cityCounts.length > 0 && (
        <section className="py-12 bg-muted">
          <div className="container mx-auto px-6 md:px-12 lg:px-16 max-w-7xl">
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Explore by City
            </h2>
            <p className="text-sm text-muted-foreground mb-8">
              Find properties in India&apos;s most sought-after cities
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {cityCounts.map(({ city, count }) => (
                <Link
                  key={city}
                  href={`/properties?city=${encodeURIComponent(city)}`}
                  className="group block"
                >
                  <div className="relative aspect-square overflow-hidden rounded-xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        CITY_IMAGES[city] ??
                        `https://picsum.photos/seed/${city.toLowerCase()}/400/400`
                      }
                      alt={city}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                      <h3 className="text-white font-semibold text-base text-center">
                        {city}
                      </h3>
                      <p className="text-white/70 text-xs mt-0.5">
                        {count} {count === 1 ? "listing" : "listings"}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── How it Works ──────────────────────────────────── */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-6 md:px-12 lg:px-16 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-semibold text-foreground">
              How NestFinder Works
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Simple, transparent, and trusted
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Search,
                title: "Search Properties",
                desc: "Use filters to find homes that match your budget, location, and lifestyle.",
              },
              {
                icon: Heart,
                title: "Save Favourites",
                desc: "Shortlist properties you love and revisit them any time from your account.",
              },
              {
                icon: MessageSquare,
                title: "Contact the Agent",
                desc: "Send a direct enquiry to the listing agent and get a response fast.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="flex flex-col items-center text-center p-6 rounded-xl border border-border bg-card"
              >
                <div
                  className="flex items-center justify-center w-14 h-14 rounded-xl mb-4"
                  style={{ background: "oklch(0.94 0.04 68)" }}
                >
                  <Icon
                    size={24}
                    style={{ color: "oklch(0.30 0.10 242)" }}
                  />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ────────────────────────────────────── */}
      <section
        className="py-16"
        style={{ background: "oklch(0.30 0.10 242)" }}
      >
        <div className="container mx-auto px-6 md:px-12 lg:px-16 max-w-7xl text-center">
          <h2 className="text-2xl font-semibold text-white mb-3">
            Are You a Property Agent?
          </h2>
          <p className="text-white/70 text-base max-w-xl mx-auto mb-8 leading-relaxed">
            List your properties on NestFinder and connect with thousands of
            motivated buyers and renters across India.
          </p>
          <Link href="/register?role=AGENT">
            <Button
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-primary px-8 h-11"
            >
              Start Listing Today
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Link from "next/link";
import { Heart } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { getMyFavorites } from "@/lib/actions/favorites";
import { PropertyCard } from "@/components/properties/property-card";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Saved Properties",
  description: "Your saved and favourited properties on NestFinder.",
};

export default async function FavoritesPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?returnUrl=/favorites");
  }

  const favorites = await getMyFavorites();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">
            Your Saved Properties
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {favorites.length === 0
              ? "No properties saved yet"
              : `${favorites.length} ${
                  favorites.length === 1 ? "property" : "properties"
                } saved`}
          </p>
        </div>

        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div
              className="flex items-center justify-center w-20 h-20 rounded-full mb-6"
              style={{ background: "oklch(0.94 0.04 68)" }}
            >
              <Heart
                size={36}
                style={{ color: "oklch(0.72 0.14 68)" }}
              />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              No saved properties yet
            </h2>
            <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
              Browse properties and tap the heart icon to save them here for
              easy access later.
            </p>
            <Link href="/properties">
              <Button>Browse Properties</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                isLoggedIn={true}
                showStatus={property.status !== "ACTIVE"}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

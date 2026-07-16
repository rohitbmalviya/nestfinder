'use server'
// ============================================================
// NestFinder — Favorites server actions
//
// toggleFavorite  → upsert-or-delete on (userId, propertyId)
// getMyFavorites  → returns property cards for the current user
// ============================================================

import { z } from 'zod'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/session'
import type { PropertyCard } from '@/lib/actions/properties'
import type { ActionResult } from '@/lib/auth'

// ─── toggleFavorite ────────────────────────────────────────────────────────────

const ToggleFavoriteSchema = z.object({
  propertyId: z.string().min(1, 'Property ID is required'),
})

export type ToggleFavoriteResult = ActionResult<{ favorited: boolean }>

/**
 * Toggles a property in/out of the current user's favorites.
 * Requires authentication (throws UNAUTHENTICATED if not logged in).
 *
 * Returns { favorited: true } when the property was added.
 * Returns { favorited: false } when the property was removed.
 */
export async function toggleFavorite(
  propertyId: string
): Promise<ToggleFavoriteResult> {
  const user = await requireUser()

  const parsed = ToggleFavoriteSchema.safeParse({ propertyId })
  if (!parsed.success) {
    return { success: false, error: 'Invalid property ID' }
  }

  // Check property exists
  const property = await db.property.findUnique({
    where: { id: propertyId },
    select: { id: true },
  })
  if (!property) {
    return { success: false, error: 'Property not found' }
  }

  // Check if already favorited
  const existing = await db.favorite.findUnique({
    where: {
      userId_propertyId: { userId: user.id, propertyId },
    },
  })

  if (existing) {
    // Remove the favorite
    await db.favorite.delete({
      where: { userId_propertyId: { userId: user.id, propertyId } },
    })
    return { success: true, data: { favorited: false } }
  } else {
    // Add the favorite
    await db.favorite.create({
      data: { userId: user.id, propertyId },
    })
    return { success: true, data: { favorited: true } }
  }
}

// ─── getMyFavorites ────────────────────────────────────────────────────────────

/**
 * Returns all favorited property cards for the current user.
 * Requires authentication (throws UNAUTHENTICATED if not logged in).
 */
export async function getMyFavorites(): Promise<PropertyCard[]> {
  const user = await requireUser()

  const favs = await db.favorite.findMany({
    where: { userId: user.id },
    include: {
      property: {
        include: {
          images: {
            orderBy: { position: 'asc' },
            take: 1,
          },
        },
      },
    },
    orderBy: { id: 'desc' },
  })

  // Include ALL favorited properties regardless of status — a property that
  // has since been SOLD or RENTED is still meaningful to the user (they
  // can see what happened to it). The PropertyCard already renders a
  // status badge when showStatus is passed.
  return favs
    .map((f) => {
      const prop = f.property
      const coverImage =
        prop.images.length > 0 ? prop.images[0].url : null

      return {
        id: prop.id,
        title: prop.title,
        slug: prop.slug,
        propertyType: prop.propertyType,
        listingType: prop.listingType,
        pricePaise: Number(prop.pricePaise),
        bedrooms: prop.bedrooms,
        bathrooms: prop.bathrooms,
        areaSqft: prop.areaSqft,
        city: prop.city,
        state: prop.state,
        address: prop.address,
        featured: prop.featured,
        status: prop.status,
        coverImage,
        isFavorited: true, // by definition — these are the user's favorites
        createdAt: prop.createdAt,
      } satisfies PropertyCard
    })
}

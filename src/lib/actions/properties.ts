'use server'
// ============================================================
// NestFinder — Property query actions
//
// All public queries scope status: 'ACTIVE'.
// Cover image = image with lowest position (position 0).
// isFavorited flag is attached when a user session exists.
// amenities is stored comma-separated; we parse it to string[].
// ============================================================

import { z } from 'zod'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'
import { PropertyStatus } from '@/generated/prisma/enums'
import type { PropertyType, ListingType } from '@/generated/prisma/enums'
import { Prisma } from '@/generated/prisma/client'

// ─── Shared types ─────────────────────────────────────────────────────────────

export type PropertyCard = {
  id: string
  title: string
  slug: string
  propertyType: PropertyType
  listingType: ListingType
  pricePaise: number
  bedrooms: number
  bathrooms: number
  areaSqft: number
  city: string
  state: string
  address: string
  featured: boolean
  status: string
  coverImage: string | null
  isFavorited: boolean
  createdAt: Date
}

export type AgentInfo = {
  id: string
  name: string
  phone: string | null
  agencyName: string | null
  avatarUrl: string | null
}

export type PropertyDetail = {
  id: string
  title: string
  slug: string
  description: string
  propertyType: PropertyType
  listingType: ListingType
  pricePaise: number
  bedrooms: number
  bathrooms: number
  areaSqft: number
  address: string
  city: string
  state: string
  pincode: string
  lat: number
  lng: number
  status: string
  featured: boolean
  amenities: string[]
  images: { id: string; url: string; position: number }[]
  agent: AgentInfo
  isFavorited: boolean
  createdAt: Date
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseAmenities(raw: string): string[] {
  if (!raw || raw.trim() === '') return []
  return raw.split(',').map((s) => s.trim()).filter(Boolean)
}

async function getCurrentUserId(): Promise<string | null> {
  const session = await getSession()
  return session?.userId ?? null
}

async function getFavoritedPropertyIds(
  userId: string,
  propertyIds: string[]
): Promise<Set<string>> {
  if (propertyIds.length === 0) return new Set()
  const favs = await db.favorite.findMany({
    where: { userId, propertyId: { in: propertyIds } },
    select: { propertyId: true },
  })
  return new Set(favs.map((f) => f.propertyId))
}

function toCoverImage(
  images: { url: string; position: number }[]
): string | null {
  if (images.length === 0) return null
  const sorted = [...images].sort((a, b) => a.position - b.position)
  return sorted[0].url
}

// ─── getProperties ────────────────────────────────────────────────────────────

const GetPropertiesSchema = z.object({
  listingType: z.enum(['SALE', 'RENT']).optional(),
  propertyType: z
    .enum(['HOUSE', 'APARTMENT', 'VILLA', 'PLOT', 'COMMERCIAL'])
    .optional(),
  city: z.string().optional(),
  minPrice: z.number().int().nonnegative().optional(),
  maxPrice: z.number().int().nonnegative().optional(),
  bedrooms: z.number().int().nonnegative().optional(),
  search: z.string().optional(),
  sort: z.enum(['price_asc', 'price_desc', 'newest']).optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
})

export type GetPropertiesInput = z.infer<typeof GetPropertiesSchema>

export type GetPropertiesResult = {
  properties: PropertyCard[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export async function getProperties(
  input: GetPropertiesInput = {}
): Promise<GetPropertiesResult> {
  const parsed = GetPropertiesSchema.safeParse(input)
  if (!parsed.success) {
    return { properties: [], total: 0, page: 1, limit: 12, totalPages: 0 }
  }

  const {
    listingType,
    propertyType,
    city,
    minPrice,
    maxPrice,
    bedrooms,
    search,
    sort = 'newest',
    page = 1,
    limit = 12,
  } = parsed.data

  const where: Prisma.PropertyWhereInput = {
    status: PropertyStatus.ACTIVE,
    ...(listingType ? { listingType } : {}),
    ...(propertyType ? { propertyType } : {}),
    ...(city ? { city } : {}),
    ...(minPrice !== undefined || maxPrice !== undefined
      ? {
          pricePaise: {
            ...(minPrice !== undefined ? { gte: minPrice } : {}),
            ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
          },
        }
      : {}),
    ...(bedrooms !== undefined ? { bedrooms: { gte: bedrooms } } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search } },
            { city: { contains: search } },
            { address: { contains: search } },
            { description: { contains: search } },
          ],
        }
      : {}),
  }

  const orderBy: Prisma.PropertyOrderByWithRelationInput =
    sort === 'price_asc'
      ? { pricePaise: 'asc' }
      : sort === 'price_desc'
        ? { pricePaise: 'desc' }
        : { createdAt: 'desc' }

  const skip = (page - 1) * limit

  const [total, rows] = await Promise.all([
    db.property.count({ where }),
    db.property.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        propertyType: true,
        listingType: true,
        pricePaise: true,
        bedrooms: true,
        bathrooms: true,
        areaSqft: true,
        city: true,
        state: true,
        address: true,
        featured: true,
        status: true,
        createdAt: true,
        images: { select: { url: true, position: true }, orderBy: { position: 'asc' }, take: 1 },
      },
    }),
  ])

  const userId = await getCurrentUserId()
  const propertyIds = rows.map((r) => r.id)
  const favoritedIds = userId
    ? await getFavoritedPropertyIds(userId, propertyIds)
    : new Set<string>()

  const properties: PropertyCard[] = rows.map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    propertyType: row.propertyType,
    listingType: row.listingType,
    pricePaise: Number(row.pricePaise),
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    areaSqft: row.areaSqft,
    city: row.city,
    state: row.state,
    address: row.address,
    featured: row.featured,
    status: row.status,
    coverImage: toCoverImage(row.images),
    isFavorited: favoritedIds.has(row.id),
    createdAt: row.createdAt,
  }))

  return {
    properties,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

// ─── getPropertyBySlug ────────────────────────────────────────────────────────

export async function getPropertyBySlug(
  slug: string
): Promise<PropertyDetail | null> {
  if (!slug) return null

  // No status filter here — SOLD and RENTED properties must still be
  // viewable at /properties/[slug] (they show a status badge instead of
  // being hidden). The ACTIVE filter lives only in getProperties() and
  // getFeaturedProperties() which drive the public browse/search pages.
  const row = await db.property.findFirst({
    where: { slug },
    include: {
      images: { orderBy: { position: 'asc' } },
      agent: {
        select: {
          id: true,
          name: true,
          phone: true,
          agencyName: true,
          avatarUrl: true,
        },
      },
    },
  })

  if (!row) return null

  const userId = await getCurrentUserId()
  let isFavorited = false
  if (userId) {
    const fav = await db.favorite.findUnique({
      where: { userId_propertyId: { userId, propertyId: row.id } },
    })
    isFavorited = fav !== null
  }

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    propertyType: row.propertyType,
    listingType: row.listingType,
    pricePaise: Number(row.pricePaise),
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    areaSqft: row.areaSqft,
    address: row.address,
    city: row.city,
    state: row.state,
    pincode: row.pincode,
    lat: row.lat,
    lng: row.lng,
    status: row.status,
    featured: row.featured,
    amenities: parseAmenities(row.amenities),
    images: row.images.map((img) => ({
      id: img.id,
      url: img.url,
      position: img.position,
    })),
    agent: row.agent,
    isFavorited,
    createdAt: row.createdAt,
  }
}

// ─── getFeaturedProperties ────────────────────────────────────────────────────

export async function getFeaturedProperties(
  limit = 6
): Promise<PropertyCard[]> {
  const rows = await db.property.findMany({
    where: { status: PropertyStatus.ACTIVE, featured: true },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      title: true,
      slug: true,
      propertyType: true,
      listingType: true,
      pricePaise: true,
      bedrooms: true,
      bathrooms: true,
      areaSqft: true,
      city: true,
      state: true,
      address: true,
      featured: true,
      status: true,
      createdAt: true,
      images: { select: { url: true, position: true }, orderBy: { position: 'asc' }, take: 1 },
    },
  })

  const userId = await getCurrentUserId()
  const propertyIds = rows.map((r) => r.id)
  const favoritedIds = userId
    ? await getFavoritedPropertyIds(userId, propertyIds)
    : new Set<string>()

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    propertyType: row.propertyType,
    listingType: row.listingType,
    pricePaise: Number(row.pricePaise),
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    areaSqft: row.areaSqft,
    city: row.city,
    state: row.state,
    address: row.address,
    featured: row.featured,
    status: row.status,
    coverImage: toCoverImage(row.images),
    isFavorited: favoritedIds.has(row.id),
    createdAt: row.createdAt,
  }))
}

// ─── getCities ────────────────────────────────────────────────────────────────

/** Returns all distinct cities that have at least one ACTIVE property. */
export async function getCities(): Promise<string[]> {
  const rows = await db.property.findMany({
    where: { status: PropertyStatus.ACTIVE },
    select: { city: true },
    distinct: ['city'],
    orderBy: { city: 'asc' },
  })
  return rows.map((r) => r.city)
}

// ─── getCityCounts ────────────────────────────────────────────────────────────

/** Returns city → listing count for the browse-by-city section on the landing page. */
export async function getCityCounts(): Promise<
  { city: string; count: number }[]
> {
  const rows = await db.property.groupBy({
    by: ['city'],
    where: { status: PropertyStatus.ACTIVE },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 8,
  })
  return rows.map((r) => ({ city: r.city, count: r._count.id }))
}

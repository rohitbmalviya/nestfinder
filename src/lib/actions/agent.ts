'use server'
// ============================================================
// NestFinder — Agent server actions
//
// ALL actions enforce requireRole(Role.AGENT) and scope all
// queries to the authenticated agent's own data (agentId).
//
// No row-level security in SQLite — we enforce it here in code.
// ============================================================

import { z } from 'zod'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/session'
import { Role, PropertyStatus, EnquiryStatus } from '@/generated/prisma/enums'
import { subDays, format, eachDayOfInterval } from 'date-fns'
import type { ActionResult } from '@/lib/auth'
import type { PropertyType, ListingType } from '@/generated/prisma/enums'

// ─── Shared types ─────────────────────────────────────────────────────────────

export type AgentStats = {
  activeListings: number
  totalListings: number
  totalEnquiries: number
  newEnquiries: number
}

export type EnquiriesSeriesPoint = {
  date: string  // "YYYY-MM-DD"
  count: number
}

export type AgentListing = {
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
  status: string
  featured: boolean
  createdAt: Date
  coverImage: string | null
  enquiryCount: number
}

export type AgentListingDetail = {
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
  amenities: string
  images: { id: string; url: string; position: number }[]
  createdAt: Date
}

export type AgentEnquiry = {
  id: string
  propertyId: string
  propertyTitle: string
  propertySlug: string
  name: string
  email: string
  phone: string
  message: string
  status: string
  createdAt: Date
  enquirerName: string | null   // logged-in user's name if userId is set
  enquirerEmail: string | null
}

// ─── Validation schemas ────────────────────────────────────────────────────────

const ListingInputSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(150),
  description: z.string().min(20, 'Description too short').max(5000),
  propertyType: z.enum(['HOUSE', 'APARTMENT', 'VILLA', 'PLOT', 'COMMERCIAL']),
  listingType: z.enum(['SALE', 'RENT']),
  pricePaise: z.number().int().positive('Price must be positive'),
  bedrooms: z.number().int().min(0).max(50),
  bathrooms: z.number().int().min(0).max(50),
  areaSqft: z.number().int().positive('Area must be positive'),
  address: z.string().min(5).max(300),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  pincode: z.string().min(4).max(10),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  amenities: z.string().max(1000).optional().default(''),
  featured: z.boolean().optional().default(false),
  images: z
    .array(
      z.object({
        url: z.string().url('Invalid image URL'),
        position: z.number().int().nonnegative(),
      })
    )
    .min(1, 'At least one image is required')
    .max(10, 'Maximum 10 images allowed'),
})

export type CreateListingInput = z.infer<typeof ListingInputSchema>
export type UpdateListingInput = Partial<Omit<CreateListingInput, 'images'>> & {
  images?: { url: string; position: number }[]
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function slugify(title: string, id: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
  // Append a short unique suffix derived from the cuid to avoid collisions
  const suffix = id.slice(-6)
  return `${base}-${suffix}`
}

// ─── getAgentStats ────────────────────────────────────────────────────────────

/**
 * Returns KPI stats for the agent dashboard:
 * - activeListings: ACTIVE properties owned by the agent
 * - totalListings: all properties owned by the agent
 * - totalEnquiries: all enquiries on the agent's properties
 * - newEnquiries: enquiries with status NEW
 */
export async function getAgentStats(): Promise<AgentStats> {
  const agent = await requireRole(Role.AGENT)

  const [activeListings, totalListings, totalEnquiries, newEnquiries] =
    await Promise.all([
      db.property.count({
        where: { agentId: agent.id, status: PropertyStatus.ACTIVE },
      }),
      db.property.count({ where: { agentId: agent.id } }),
      db.enquiry.count({
        where: { property: { agentId: agent.id } },
      }),
      db.enquiry.count({
        where: {
          property: { agentId: agent.id },
          status: EnquiryStatus.NEW,
        },
      }),
    ])

  return { activeListings, totalListings, totalEnquiries, newEnquiries }
}

// ─── getEnquiriesSeries ───────────────────────────────────────────────────────

/**
 * Returns a gapless 30-day series of daily enquiry counts for recharts.
 * Days with no enquiries are included with count 0.
 */
export async function getEnquiriesSeries(): Promise<EnquiriesSeriesPoint[]> {
  const agent = await requireRole(Role.AGENT)

  const now = new Date()
  const start = subDays(now, 29) // 30 days inclusive

  // Fetch raw enquiries in the window
  const enquiries = await db.enquiry.findMany({
    where: {
      property: { agentId: agent.id },
      createdAt: { gte: start },
    },
    select: { createdAt: true },
  })

  // Build a map date → count
  const countMap = new Map<string, number>()
  for (const enq of enquiries) {
    const key = format(enq.createdAt, 'yyyy-MM-dd')
    countMap.set(key, (countMap.get(key) ?? 0) + 1)
  }

  // Generate gapless range
  const days = eachDayOfInterval({ start, end: now })
  return days.map((day) => {
    const key = format(day, 'yyyy-MM-dd')
    return { date: key, count: countMap.get(key) ?? 0 }
  })
}

// ─── getMyListings ────────────────────────────────────────────────────────────

/**
 * Returns all listings owned by the agent, with enquiry counts per listing.
 */
export async function getMyListings(): Promise<AgentListing[]> {
  const agent = await requireRole(Role.AGENT)

  const rows = await db.property.findMany({
    where: { agentId: agent.id },
    orderBy: { createdAt: 'desc' },
    include: {
      images: { orderBy: { position: 'asc' }, take: 1 },
      _count: { select: { enquiries: true } },
    },
  })

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    propertyType: row.propertyType,
    listingType: row.listingType,
    pricePaise: row.pricePaise,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    areaSqft: row.areaSqft,
    city: row.city,
    state: row.state,
    status: row.status,
    featured: row.featured,
    createdAt: row.createdAt,
    coverImage: row.images.length > 0 ? row.images[0].url : null,
    enquiryCount: row._count.enquiries,
  }))
}

// ─── getListingById ───────────────────────────────────────────────────────────

/**
 * Returns a single listing owned by the agent (with all images).
 * Returns null if not found OR if the property belongs to a different agent.
 */
export async function getListingById(
  id: string
): Promise<AgentListingDetail | null> {
  const agent = await requireRole(Role.AGENT)

  const row = await db.property.findFirst({
    where: { id, agentId: agent.id },
    include: { images: { orderBy: { position: 'asc' } } },
  })

  if (!row) return null

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    propertyType: row.propertyType,
    listingType: row.listingType,
    pricePaise: row.pricePaise,
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
    amenities: row.amenities,
    images: row.images.map((img) => ({
      id: img.id,
      url: img.url,
      position: img.position,
    })),
    createdAt: row.createdAt,
  }
}

// ─── createListing ────────────────────────────────────────────────────────────

export type CreateListingResult = ActionResult<{
  listingId: string
  slug: string
}>

/**
 * Creates a new property listing for the authenticated agent.
 * Slug is auto-generated from title + id suffix.
 * Images are created in a nested write (cascade).
 */
export async function createListing(
  input: CreateListingInput
): Promise<CreateListingResult> {
  const agent = await requireRole(Role.AGENT)

  const parsed = ListingInputSchema.safeParse(input)
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors as Record<
      string,
      string[]
    >
    return { success: false, error: 'Validation failed', fieldErrors }
  }

  const {
    title,
    description,
    propertyType,
    listingType,
    pricePaise,
    bedrooms,
    bathrooms,
    areaSqft,
    address,
    city,
    state,
    pincode,
    lat,
    lng,
    amenities,
    featured,
    images,
  } = parsed.data

  try {
    // Generate a temporary slug based on title; we'll update with the actual id
    const tempSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60)

    const property = await db.property.create({
      data: {
        title,
        slug: `${tempSlug}-${Date.now().toString(36)}`,
        description,
        propertyType,
        listingType,
        pricePaise,
        bedrooms,
        bathrooms,
        areaSqft,
        address,
        city,
        state,
        pincode,
        lat,
        lng,
        amenities: amenities ?? '',
        featured: featured ?? false,
        agentId: agent.id,
        status: PropertyStatus.ACTIVE,
        images: {
          create: images.map((img) => ({
            url: img.url,
            position: img.position,
          })),
        },
      },
    })

    // Update slug to use actual id for uniqueness guarantee
    const finalSlug = slugify(title, property.id)
    const updated = await db.property.update({
      where: { id: property.id },
      data: { slug: finalSlug },
    })

    return { success: true, data: { listingId: updated.id, slug: updated.slug } }
  } catch (err) {
    console.error('[createListing]', err)
    return {
      success: false,
      error: 'Failed to create listing. Please try again.',
    }
  }
}

// ─── updateListing ────────────────────────────────────────────────────────────

const UpdateListingSchema = ListingInputSchema.partial()

export type UpdateListingResult = ActionResult<{ listingId: string }>

/**
 * Updates a listing owned by the agent.
 * If images are provided, existing images are deleted and replaced.
 */
export async function updateListing(
  id: string,
  input: UpdateListingInput
): Promise<UpdateListingResult> {
  const agent = await requireRole(Role.AGENT)

  // Verify ownership
  const existing = await db.property.findFirst({
    where: { id, agentId: agent.id },
    select: { id: true },
  })
  if (!existing) {
    return { success: false, error: 'Listing not found or access denied' }
  }

  const parsed = UpdateListingSchema.safeParse(input)
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors as Record<
      string,
      string[]
    >
    return { success: false, error: 'Validation failed', fieldErrors }
  }

  const { images, ...rest } = parsed.data

  try {
    await db.$transaction(async (tx) => {
      // Update property scalar fields
      await tx.property.update({
        where: { id },
        data: { ...rest },
      })

      // Replace images if provided
      if (images && images.length > 0) {
        await tx.propertyImage.deleteMany({ where: { propertyId: id } })
        await tx.propertyImage.createMany({
          data: images.map((img) => ({
            propertyId: id,
            url: img.url,
            position: img.position,
          })),
        })
      }
    })

    return { success: true, data: { listingId: id } }
  } catch (err) {
    console.error('[updateListing]', err)
    return {
      success: false,
      error: 'Failed to update listing. Please try again.',
    }
  }
}

// ─── updateListingStatus ──────────────────────────────────────────────────────

const StatusSchema = z.enum(['ACTIVE', 'SOLD', 'RENTED'])

export type UpdateListingStatusResult = ActionResult<{ listingId: string }>

/**
 * Updates just the status of a listing.
 * Scoped to the agent's own listings.
 */
export async function updateListingStatus(
  id: string,
  status: string
): Promise<UpdateListingStatusResult> {
  const agent = await requireRole(Role.AGENT)

  const parsedStatus = StatusSchema.safeParse(status)
  if (!parsedStatus.success) {
    return {
      success: false,
      error: 'Invalid status. Must be ACTIVE, SOLD, or RENTED',
    }
  }

  const existing = await db.property.findFirst({
    where: { id, agentId: agent.id },
    select: { id: true },
  })
  if (!existing) {
    return { success: false, error: 'Listing not found or access denied' }
  }

  await db.property.update({
    where: { id },
    data: { status: parsedStatus.data },
  })

  return { success: true, data: { listingId: id } }
}

// ─── deleteListing ────────────────────────────────────────────────────────────

export type DeleteListingResult = ActionResult<void>

/**
 * Deletes a listing and cascades to images, favorites, and enquiries.
 * Only the owning agent can delete.
 */
export async function deleteListing(id: string): Promise<DeleteListingResult> {
  const agent = await requireRole(Role.AGENT)

  const existing = await db.property.findFirst({
    where: { id, agentId: agent.id },
    select: { id: true },
  })
  if (!existing) {
    return { success: false, error: 'Listing not found or access denied' }
  }

  try {
    await db.property.delete({ where: { id } })
    return { success: true, data: undefined }
  } catch (err) {
    console.error('[deleteListing]', err)
    return {
      success: false,
      error: 'Failed to delete listing. Please try again.',
    }
  }
}

// ─── getMyEnquiries ────────────────────────────────────────────────────────────

const GetEnquiriesSchema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'CLOSED']).optional(),
})

export type GetMyEnquiriesInput = z.infer<typeof GetEnquiriesSchema>

/**
 * Returns all enquiries on the agent's properties.
 * Optionally filtered by status.
 * Includes property info and enquirer info (if logged-in user).
 */
export async function getMyEnquiries(
  input: GetMyEnquiriesInput = {}
): Promise<AgentEnquiry[]> {
  const agent = await requireRole(Role.AGENT)

  const parsed = GetEnquiriesSchema.safeParse(input)
  const statusFilter = parsed.success ? parsed.data.status : undefined

  const rows = await db.enquiry.findMany({
    where: {
      property: { agentId: agent.id },
      ...(statusFilter ? { status: statusFilter as EnquiryStatus } : {}),
    },
    orderBy: { createdAt: 'desc' },
    include: {
      property: { select: { id: true, title: true, slug: true } },
      user: { select: { name: true, email: true } },
    },
  })

  return rows.map((row) => ({
    id: row.id,
    propertyId: row.propertyId,
    propertyTitle: row.property.title,
    propertySlug: row.property.slug,
    name: row.name,
    email: row.email,
    phone: row.phone,
    message: row.message,
    status: row.status,
    createdAt: row.createdAt,
    enquirerName: row.user?.name ?? null,
    enquirerEmail: row.user?.email ?? null,
  }))
}

// ─── updateEnquiryStatus ───────────────────────────────────────────────────────

const EnquiryStatusSchema = z.enum(['NEW', 'CONTACTED', 'CLOSED'])

export type UpdateEnquiryStatusResult = ActionResult<{ enquiryId: string }>

/**
 * Updates the status of an enquiry.
 * Enforces that the enquiry is for one of the agent's properties.
 */
export async function updateEnquiryStatus(
  enquiryId: string,
  status: string
): Promise<UpdateEnquiryStatusResult> {
  const agent = await requireRole(Role.AGENT)

  const parsedStatus = EnquiryStatusSchema.safeParse(status)
  if (!parsedStatus.success) {
    return {
      success: false,
      error: 'Invalid status. Must be NEW, CONTACTED, or CLOSED',
    }
  }

  // Verify the enquiry belongs to the agent's property
  const enquiry = await db.enquiry.findFirst({
    where: {
      id: enquiryId,
      property: { agentId: agent.id },
    },
    select: { id: true },
  })
  if (!enquiry) {
    return { success: false, error: 'Enquiry not found or access denied' }
  }

  await db.enquiry.update({
    where: { id: enquiryId },
    data: { status: parsedStatus.data },
  })

  return { success: true, data: { enquiryId } }
}

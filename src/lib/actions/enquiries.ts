'use server'
// ============================================================
// NestFinder — Enquiry server actions (public side)
//
// createEnquiry  → works for guests AND logged-in users.
//                  Guest: userId omitted (NULL in DB).
//                  Logged-in: userId attached automatically.
// ============================================================

import { z } from 'zod'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'
import type { ActionResult } from '@/lib/auth'

// ─── createEnquiry ─────────────────────────────────────────────────────────────

const CreateEnquirySchema = z.object({
  propertyId: z.string().min(1, 'Property ID is required'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.email('Invalid email address'),
  phone: z
    .string()
    .min(10, 'Phone must be at least 10 digits')
    .max(15, 'Phone too long'),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message too long'),
})

export type CreateEnquiryInput = z.infer<typeof CreateEnquirySchema>
export type CreateEnquiryResult = ActionResult<{ enquiryId: string }>

/**
 * Submits a property enquiry.
 *
 * Works for both guests and logged-in users:
 * - Guest: no auth required. userId is omitted (NULL stored in DB).
 * - Logged-in user: userId is automatically attached from session.
 *
 * Input is always validated. Duplicate enquiries from the same user
 * for the same property are allowed (they may have new questions).
 */
export async function createEnquiry(
  input: CreateEnquiryInput
): Promise<CreateEnquiryResult> {
  const parsed = CreateEnquirySchema.safeParse(input)
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors as Record<
      string,
      string[]
    >
    return { success: false, error: 'Validation failed', fieldErrors }
  }

  const { propertyId, name, email, phone, message } = parsed.data

  // Verify property exists (no status filter — allow enquiry on any property
  // the detail page showed, but practically detail page only shows ACTIVE)
  const property = await db.property.findUnique({
    where: { id: propertyId },
    select: { id: true },
  })
  if (!property) {
    return { success: false, error: 'Property not found' }
  }

  // Attach userId if logged in — never required
  const session = await getSession()
  const userId = session?.userId ?? undefined

  try {
    const enquiry = await db.enquiry.create({
      data: {
        propertyId,
        name,
        email,
        phone,
        message,
        // Prisma omits the field from INSERT when undefined → NULL in DB
        ...(userId !== undefined ? { userId } : {}),
      },
    })

    return { success: true, data: { enquiryId: enquiry.id } }
  } catch (err) {
    console.error('[createEnquiry]', err)
    return {
      success: false,
      error: 'Failed to submit enquiry. Please try again.',
    }
  }
}

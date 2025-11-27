// ============================================================
// NestFinder — Next.js 16 Proxy (replaces middleware.ts)
//
// Route protection:
//  /favorites       → any authenticated user (USER or AGENT)
//  /agent           → AGENT role only → non-agents redirect to /properties
//  /agent/*         → AGENT role only → non-agents redirect to /properties
//  /login           → redirect to /properties if already logged in (USER)
//                     redirect to /agent if already logged in (AGENT)
//  /register        → redirect to /properties if already logged in (USER)
//                     redirect to /agent if already logged in (AGENT)
//
// Unauthenticated users hitting protected routes →
//   /login?returnUrl=<pathname>
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const COOKIE_NAME = 'nf_session'

function getEncodedSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET ?? ''
  return new TextEncoder().encode(secret)
}

interface SessionClaims {
  userId: string
  role: 'USER' | 'AGENT'
  expiresAt: number
}

async function verifySession(token: string): Promise<SessionClaims | null> {
  try {
    const { payload } = await jwtVerify(token, getEncodedSecret(), {
      algorithms: ['HS256'],
    })
    return payload as unknown as SessionClaims
  } catch {
    return null
  }
}

// Route prefix lists
const USER_ROUTES = ['/favorites']
const AGENT_ROUTES = ['/agent']
const PUBLIC_AUTH_ROUTES = ['/login', '/register']

function matchesPrefix(pathname: string, prefixes: string[]): boolean {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + '/')
  )
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl

  const cookieToken = request.cookies.get(COOKIE_NAME)?.value
  const session = cookieToken ? await verifySession(cookieToken) : null
  const isAuthed = session !== null

  // Authenticated users visiting /login or /register → redirect by role
  if (isAuthed && matchesPrefix(pathname, PUBLIC_AUTH_ROUTES)) {
    const dest = session.role === 'AGENT' ? '/agent' : '/properties'
    return NextResponse.redirect(new URL(dest, request.url))
  }

  // /agent, /agent/* → must be AGENT
  if (matchesPrefix(pathname, AGENT_ROUTES)) {
    if (!isAuthed) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('returnUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
    if (session.role !== 'AGENT') {
      // Authenticated USER trying to access agent area → redirect to properties
      return NextResponse.redirect(new URL('/properties', request.url))
    }
  }

  // /favorites → any authenticated user
  if (matchesPrefix(pathname, USER_ROUTES)) {
    if (!isAuthed) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('returnUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static  (static files)
     * - _next/image   (image optimization)
     * - favicon.ico
     * - public assets (*.png, *.svg, *.jpg, *.ico, *.webp)
     * - /api routes   (handled by route handlers)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|svg|jpg|jpeg|gif|webp|ico)$|api/).*)',
  ],
}

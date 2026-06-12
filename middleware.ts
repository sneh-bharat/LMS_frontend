import { NextRequest, NextResponse } from 'next/server';

/**
 * Public routes — no authentication required.
 * All other routes require a valid `auth_token` cookie.
 *
 * IMPORTANT: This middleware enforces protection ONLY after the project
 * migrates from localStorage tokens to httpOnly cookies (Phase 3).
 * Until then, this middleware adds security headers and leaves auth to
 * the client-side RoleGuard / DoctorGuard components.
 *
 * Migration note: See PROJECT_MIGRATION_GUIDE.md § "Token Storage Migration"
 */

const PUBLIC_PATHS = ['/login', '/doctor-login'];

const SECURITY_HEADERS: Record<string, string> = {
  'X-DNS-Prefetch-Control': 'on',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'X-XSS-Protection': '1; mode=block',
};

function addSecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Always allow Next.js internals and static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/api') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  const response = NextResponse.next();

  // Add security headers to every response
  addSecurityHeaders(response);

  // ─────────────────────────────────────────────────────────────
  // PHASE 3 GATE: Uncomment after migrating tokens to httpOnly cookies.
  // Until then, client-side RoleGuard handles auth redirects.
  // ─────────────────────────────────────────────────────────────
  //
  // const isPublic = PUBLIC_PATHS.some(p => pathname.startsWith(p));
  // if (!isPublic) {
  //   const token = request.cookies.get('auth_token');
  //   if (!token) {
  //     const loginUrl = new URL('/login', request.url);
  //     loginUrl.searchParams.set('from', pathname);
  //     return addSecurityHeaders(NextResponse.redirect(loginUrl));
  //   }
  //   const role = request.cookies.get('auth_role')?.value ?? '';
  //   const isDoctorRoute = pathname.startsWith('/forDoctors') || pathname.startsWith('/doctor-profile');
  //   if (isDoctorRoute && role !== 'DOCTOR') {
  //     return addSecurityHeaders(NextResponse.redirect(new URL('/doctor-login', request.url)));
  //   }
  //   const ADMIN_ROLES = ['SUPER_ADMIN','ADMIN','BRANCH_MANAGER','PATHOLOGIST',
  //     'LAB_TECHNICIAN','LAB_COORDINATOR','BLOOD_COLLECTOR','RECEPTIONIST'];
  //   if (!isDoctorRoute && !ADMIN_ROLES.includes(role)) {
  //     return addSecurityHeaders(NextResponse.redirect(new URL('/login', request.url)));
  //   }
  // }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/pricing',
  '/faq',
  '/terms',
  '/privacy',
  '/methodology',
  '/promo',
  '/robots.txt',
  '/sitemap.xml',
];

// Routes that require authentication
const protectedRoutes = [
  '/oracle',
  '/account',
  '/symbol-analyzer',
  '/performance',
  '/admin',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow all public routes and API routes
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    publicRoutes.includes(pathname) ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|eot)$/)
  ) {
    return NextResponse.next();
  }

  // Check authentication for protected routes
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    const userEmail = request.cookies.get('user_email');
    const nextAuthSession = request.cookies.get('next-auth.session-token') || 
                           request.cookies.get('__Secure-next-auth.session-token');

    // If not authenticated, redirect to login
    if (!userEmail && !nextAuthSession) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};

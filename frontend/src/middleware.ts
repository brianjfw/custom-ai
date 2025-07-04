import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/profile(.*)',
  '/settings(.*)',
  '/api/trpc(.*)',
  '/ai(.*)',
  '/customers(.*)',
  '/jobs(.*)',
  '/analytics(.*)',
  '/integrations(.*)',
]);

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/public(.*)',
  '/api/webhooks(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const { nextUrl } = req;

  // Allow access to public routes
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // If user is not authenticated and trying to access protected route
  if (!userId && isProtectedRoute(req)) {
    // Redirect to sign-in page with return URL
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  // If user is authenticated and trying to access auth pages, redirect to dashboard
  if (userId && (nextUrl.pathname === '/sign-in' || nextUrl.pathname === '/sign-up')) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Allow access to all other routes
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
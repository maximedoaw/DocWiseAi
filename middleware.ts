import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher(['/project(.*)']);

export default clerkMiddleware(async (auth, req) => {
  const { userId, redirectToSignIn } = await auth();
  const url = req.nextUrl;

  // 1. Check Cookie first (Fastest)
  const onboardingCookie = req.cookies.get('onboarding_complete');
  const isOnboarded = onboardingCookie?.value === 'true';

  // If user is logged in
  if (userId) {
    // 1. If on Landing Page ('/')
    if (url.pathname === '/') {
      if (isOnboarded) {
        return Response.redirect(new URL('/projects', req.url));
      } else {
        return Response.redirect(new URL('/onboarding', req.url));
      }
    }

    // 2. If on Onboarding Page ('/onboarding')
    if (url.pathname === '/onboarding') {
      if (isOnboarded) {
        return Response.redirect(new URL('/projects', req.url));
      }
      // If NOT onboarded, let them stay here.
      // The Page Component will do a double-check against DB to be sure.
    }

    // 3. Protect other routes (like /projects) if not onboarded
    if (isProtectedRoute(req) && url.pathname !== '/onboarding' && !isOnboarded) {
      return Response.redirect(new URL('/onboarding', req.url));
    }
  }

  if (isProtectedRoute(req)) await auth.protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};

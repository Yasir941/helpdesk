import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// 1. Define which routes are private
const isProtectedRoute = createRouteMatcher(['/dashboard(.*)'])

// 2. Export as 'proxy' (Next.js 16 convention)
export const proxy = clerkMiddleware(async (auth, req) => {
  // 3. If the user is going to the dashboard, ensure they are logged in
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Standard Next.js matcher to ignore static assets
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
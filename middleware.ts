import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)', '/']) //because our home page will be publicly availabel
//(.*) -> catch all the routes starting with sign-in


//creating podcats and all other pagees are private



export default clerkMiddleware((auth, req) => {
  // Restrict admin route to users with specific role
  if (isPublicRoute(req)) auth().protect()

})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
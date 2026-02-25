import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProRoute = createRouteMatcher([
  '/pro-welcome(.*)',
  '/advanced-calculator(.*)',
  '/sequence-tester(.*)',
  '/scenario-compare(.*)',
  '/pdf-report(.*)',
])

const isAuthRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth()

  // If hitting a Pro route
  if (isProRoute(req)) {
    // Not logged in → redirect to sign-in
    if (!userId) {
      const signInUrl = new URL('/sign-in', req.url)
      signInUrl.searchParams.set('redirect_url', req.url)
      return NextResponse.redirect(signInUrl)
    }

    // Logged in but not Pro → redirect to pricing
    const isPro = (sessionClaims?.metadata as any)?.isPro === true
    if (!isPro) {
      return NextResponse.redirect(new URL('/pricing', req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}

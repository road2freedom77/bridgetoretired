import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProRoute = createRouteMatcher([
  '/pro-welcome(.*)',
  '/advanced-calculator(.*)',
  '/sequence-tester(.*)',
  '/scenario-compare(.*)',
  '/pdf-report(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (isProRoute(req)) {
    const { userId, sessionClaims } = await auth()

    if (!userId) {
      const signInUrl = new URL('/sign-in', req.url)
      signInUrl.searchParams.set('redirect_url', req.url)
      return NextResponse.redirect(signInUrl)
    }

    const isPro = (sessionClaims?.metadata as any)?.isPro === true
    if (!isPro) {
      return NextResponse.redirect(new URL('/pricing', req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/pro-welcome(.*)',
    '/advanced-calculator(.*)',
    '/sequence-tester(.*)',
    '/scenario-compare(.*)',
    '/pdf-report(.*)',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/api/webhooks/(.*)',
  ],
}

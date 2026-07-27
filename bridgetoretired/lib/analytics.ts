// lib/analytics.ts
// GA4 key events for BridgeToRetired conversion tracking
// After deploying: mark calculator_used, pro_cta_click, begin_checkout, xls_purchase
// as Key Events in GA4 Admin → Events → toggle "Mark as key event"

declare global {
  interface Window {
    gtag: (...args: any[]) => void
  }
}

function trackEvent(name: string, params?: Record<string, any>) {
  if (typeof window === 'undefined') return
  if (typeof window.gtag !== 'function') return
  window.gtag('event', name, params)
}

// ── 1. calculator_used ────────────────────────────────────────────────────────
// Fires once per tool per session on first slider/input interaction.
// Uses sessionStorage to prevent duplicate fires.
export function trackCalculatorUsed(toolName: string) {
  if (typeof window === 'undefined') return
  const key = `btr_calc_tracked_${toolName}`
  if (sessionStorage.getItem(key)) return
  sessionStorage.setItem(key, '1')
  trackEvent('calculator_used', {
    tool_name: toolName,
    page_path: window.location.pathname,
  })
}

// ── 2. pro_cta_click ──────────────────────────────────────────────────────────
// Fires on any Pro CTA click: upsell blocks, pricing page, pro gates, stress hook.
// ctaLocation examples:
//   'pricing-xls-card', 'pricing-online-pro-card', 'pricing-final-xls'
//   'pricing-final-online-pro', 'pricing-planner-callout', 'pricing-xls-callout'
export function trackProCtaClick(ctaLocation: string) {
  trackEvent('pro_cta_click', {
    cta_location: ctaLocation,
    page_path: typeof window !== 'undefined' ? window.location.pathname : '',
  })
}

// ── 3. begin_checkout ─────────────────────────────────────────────────────────
// Fires when user clicks any Stripe checkout button.
// plan: 'monthly' | 'annual'   price: 15 | 97
export function trackBeginCheckout(plan: 'monthly' | 'annual', price: number) {
  trackEvent('begin_checkout', {
    plan,
    price,
    currency: 'USD',
  })
}

// ── 4. sign_up_complete ───────────────────────────────────────────────────────
// Fires on /home first load after Clerk signup.
export function trackSignUpComplete(method: 'email' | 'google') {
  trackEvent('sign_up_complete', { method })
}

// ── 5. xls_purchase ───────────────────────────────────────────────────────────
// Fires once on /xls-download when the Stripe session verifies as paid.
// Deduped per session_id via sessionStorage so refreshes don't double-fire.
export function trackXlsPurchase(sessionId: string) {
  if (typeof window === 'undefined') return
  const key = `btr_xls_purchase_${sessionId}`
  if (sessionStorage.getItem(key)) return
  sessionStorage.setItem(key, '1')
  trackEvent('xls_purchase', {
    value: 39,
    currency: 'USD',
    product: 'pro-excel-v3',
  })
}

// ── 6. xls_download ───────────────────────────────────────────────────────────
// Fires on each click of the download button on /xls-download.
export function trackXlsDownload() {
  trackEvent('xls_download', {
    product: 'pro-excel-v3',
  })
}
// lib/analytics.ts
// GA4 key events for BridgeToRetired conversion tracking
// After deploying: mark calculator_used, pro_cta_click, begin_checkout as Key Events
// in GA4 Admin → Events → toggle "Mark as key event"

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
//   'pricing-hero', 'pricing-planner-callout', 'pricing-final-cta'
//   'fire-calculator-upsell', 'bridge-health-gate', 'stress-hook'
//   'withdrawal-optimizer-upsell', 'sepp-toolkit-upsell', 'roth-ladder-upsell'
export function trackProCtaClick(ctaLocation: string) {
  trackEvent('pro_cta_click', {
    cta_location: ctaLocation,
    page_path: typeof window !== 'undefined' ? window.location.pathname : '',
  })
}

// ── 3. begin_checkout ─────────────────────────────────────────────────────────
// Fires when user clicks any Stripe checkout button.
// plan: 'monthly' | 'annual'   price: 9 | 97
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
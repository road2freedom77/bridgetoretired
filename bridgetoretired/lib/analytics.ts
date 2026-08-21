// lib/analytics.ts
// ─── BridgeToRetired V4 Analytics Layer ───────────────────────────────────────
// Single source of truth for all GA4 events.
// Rules:
//   1. Every event fires once per session/action (deduped via sessionStorage)
//   2. Product type and source are attributable
//   3. No exact balances, DOB, notes, or PII enter analytics
//   4. Analytics failure must never block checkout or calculations
//   5. UTM/source attribution preserved where available
//
// After deploying: mark these as Key Events in GA4 Admin → Events:
//   pricing_view, pro_cta_click, checkout_start, checkout_complete,
//   xls_purchase, xls_download, online_pro_start, tool_complete,
//   scenario_save, scenario_compare

declare global {
  interface Window {
    gtag: (...args: any[]) => void
  }
}

// ─── Core ─────────────────────────────────────────────────────────────────────

function trackEvent(name: string, params?: Record<string, any>) {
  try {
    if (typeof window === 'undefined') return
    if (typeof window.gtag !== 'function') return
    window.gtag('event', name, {
      ...params,
      ...getUtmParams(),
    })
  } catch {
    // Analytics failure must never block UI
  }
}

function dedup(key: string): boolean {
  if (typeof window === 'undefined') return true
  try {
    if (sessionStorage.getItem(key)) return true
    sessionStorage.setItem(key, '1')
    return false
  } catch {
    return false
  }
}

function getUtmParams(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  try {
    const params = new URLSearchParams(window.location.search)
    const utm: Record<string, string> = {}
    for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) {
      const val = params.get(key)
      if (val) utm[key] = val
    }
    return utm
  } catch {
    return {}
  }
}

function getPagePath(): string {
  return typeof window !== 'undefined' ? window.location.pathname : ''
}

// ─── Product Types ────────────────────────────────────────────────────────────

export type ProductType = 'online-pro-monthly' | 'online-pro-annual' | 'pro-excel-v3'

// ─── 1. pricing_view ─────────────────────────────────────────────────────────
// Fires once per session on /pricing page load.
export function trackPricingView() {
  if (dedup('btr_pricing_view')) return
  trackEvent('pricing_view', {
    page_path: getPagePath(),
  })
}

// ─── 2. pro_cta_click ────────────────────────────────────────────────────────
// Fires on any Pro CTA click: upsell blocks, pricing cards, pro gates.
// No dedup — each click is intentional.
export function trackProCtaClick(ctaLocation: string, product?: ProductType) {
  trackEvent('pro_cta_click', {
    cta_location: ctaLocation,
    product: product ?? '',
    page_path: getPagePath(),
  })
}

// ─── 3. checkout_start ───────────────────────────────────────────────────────
// Fires when user clicks a Stripe checkout/payment link.
export function trackCheckoutStart(product: ProductType, price: number) {
  trackEvent('checkout_start', {
    product,
    price,
    currency: 'USD',
    page_path: getPagePath(),
  })
}

// ── Legacy alias (remove after all callsites migrate) ──
export function trackBeginCheckout(plan: 'monthly' | 'annual', price: number) {
  const product: ProductType = plan === 'annual' ? 'online-pro-annual' : 'online-pro-monthly'
  trackCheckoutStart(product, price)
}

// ─── 4. checkout_complete ────────────────────────────────────────────────────
// Fires once on successful post-payment page load (pro-welcome or xls-download).
// Deduped per session_id.
export function trackCheckoutComplete(product: ProductType, sessionId: string, value: number) {
  if (dedup(`btr_checkout_complete_${sessionId}`)) return
  trackEvent('checkout_complete', {
    product,
    value,
    currency: 'USD',
  })
}

// ─── 5. xls_purchase ────────────────────────────────────────────────────────
// Fires once on /xls-download when Stripe session verifies as paid.
export function trackXlsPurchase(sessionId: string) {
  if (dedup(`btr_xls_purchase_${sessionId}`)) return
  trackEvent('xls_purchase', {
    product: 'pro-excel-v3' as ProductType,
    value: 39,
    currency: 'USD',
  })
}

// ─── 6. xls_download ────────────────────────────────────────────────────────
// Fires on each download button click. No dedup — each download is intentional.
export function trackXlsDownload() {
  trackEvent('xls_download', {
    product: 'pro-excel-v3' as ProductType,
  })
}

// ─── 7. online_pro_start ────────────────────────────────────────────────────
// Fires once when a new Online Pro subscription activates (pro-welcome page).
// Deduped per session_id.
export function trackOnlineProStart(sessionId: string, plan: 'monthly' | 'annual', value: number) {
  if (dedup(`btr_online_pro_start_${sessionId}`)) return
  trackEvent('online_pro_start', {
    product: plan === 'annual' ? 'online-pro-annual' : 'online-pro-monthly' as ProductType,
    plan,
    value,
    currency: 'USD',
  })
}

// ─── 8. tool_complete ───────────────────────────────────────────────────────
// Fires once per tool per session when a free tool produces a result.
// toolName: slug matching the /tools/* route.
export function trackToolComplete(toolName: string) {
  if (dedup(`btr_tool_complete_${toolName}`)) return
  trackEvent('tool_complete', {
    tool_name: toolName,
    page_path: getPagePath(),
  })
}

// ── Legacy calculator_used (fires on first interaction, not result) ──
export function trackCalculatorUsed(toolName: string) {
  if (dedup(`btr_calc_tracked_${toolName}`)) return
  trackEvent('calculator_used', {
    tool_name: toolName,
    page_path: getPagePath(),
  })
}

// ─── 9. scenario_save ──────────────────────────────────────────────────────
// Fires on successful scenario save (create or update).
// source: 'planner' | 'compare' | 'what-if'
export function trackScenarioSave(source: string, isNew: boolean) {
  trackEvent('scenario_save', {
    source,
    action: isNew ? 'create' : 'update',
    page_path: getPagePath(),
  })
}

// ─── 10. scenario_compare ───────────────────────────────────────────────────
// Fires once per session on /scenario-compare when ≥2 scenarios are loaded.
export function trackScenarioCompare(scenarioCount: number, goal: string) {
  if (dedup('btr_scenario_compare')) return
  trackEvent('scenario_compare', {
    scenario_count: scenarioCount,
    goal,
    page_path: getPagePath(),
  })
}

// ─── 11. what_if_run (stub — F2-01) ────────────────────────────────────────
// Fires when a What-If preset is executed against the active scenario.
export function trackWhatIfRun(presetName: string) {
  trackEvent('what_if_run', {
    preset: presetName,
    page_path: getPagePath(),
  })
}

// ─── 12. tax_optimizer_run (stub — T3-01) ───────────────────────────────────
// Fires when the Bridge Tax Optimizer produces a result.
export function trackTaxOptimizerRun(objective: string) {
  trackEvent('tax_optimizer_run', {
    objective,
    page_path: getPagePath(),
  })
}

// ─── sign_up_complete (legacy, not in V4 spec but retained) ─────────────────
export function trackSignUpComplete(method: 'email' | 'google') {
  trackEvent('sign_up_complete', { method })
}
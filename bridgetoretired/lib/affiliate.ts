// lib/affiliate.ts
// Wraps every affiliate click with UTM + analytics event

export interface AffiliateLink {
  id:       string   // unique slug for tracking
  name:     string
  url:      string   // your actual affiliate URL
  utm:      { source: string; medium: string; campaign: string }
}

export function buildAffUrl(link: AffiliateLink): string {
  const u = new URL(link.url)
  u.searchParams.set('utm_source',   link.utm.source)
  u.searchParams.set('utm_medium',   link.utm.medium)
  u.searchParams.set('utm_campaign', link.utm.campaign)
  return u.toString()
}

// ── Replace the placeholder URLs below with your real affiliate links ──
export const AFFILIATE_LINKS: AffiliateLink[] = [
  {
    id: 'empower',
    name: 'Empower',
    url: 'https://YOUR-EMPOWER-AFFILIATE-LINK.com',
    utm: { source: 'bridgetoretired', medium: 'affiliate', campaign: 'empower-tools' },
  },
  {
    id: 'boldin',
    name: 'Boldin',
    url: 'https://YOUR-BOLDIN-AFFILIATE-LINK.com',
    utm: { source: 'bridgetoretired', medium: 'affiliate', campaign: 'boldin-tools' },
  },
  {
    id: 'm1',
    name: 'M1 Finance',
    url: 'https://YOUR-M1-AFFILIATE-LINK.com',
    utm: { source: 'bridgetoretired', medium: 'affiliate', campaign: 'm1-tools' },
  },
  {
    id: 'fidelity',
    name: 'Fidelity',
    url: 'https://YOUR-FIDELITY-AFFILIATE-LINK.com',
    utm: { source: 'bridgetoretired', medium: 'affiliate', campaign: 'fidelity-tools' },
  },
  {
    id: 'turbotax',
    name: 'TurboTax',
    url: 'https://YOUR-TURBOTAX-AFFILIATE-LINK.com',
    utm: { source: 'bridgetoretired', medium: 'affiliate', campaign: 'turbotax-tools' },
  },
  {
    id: 'betterment',
    name: 'Betterment',
    url: 'https://YOUR-BETTERMENT-AFFILIATE-LINK.com',
    utm: { source: 'bridgetoretired', medium: 'affiliate', campaign: 'betterment-tools' },
  },
]

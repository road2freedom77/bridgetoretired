// app/sitemap.ts
// Dynamic sitemap for bridgetoretired.com
// Serves /sitemap.xml — replaces the old hand-maintained public/sitemap.xml.
// Pulls blog posts from BOTH sources automatically:
//   1. Supabase blog_posts (admin-published) — with real updated_at lastmod
//   2. Contentlayer markdown posts (content/posts/) — deduped against Supabase
// Static routes (core pages, tools, guides) are listed explicitly below.
// New admin posts appear automatically on next revalidation — no manual edits.

import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'
import { allPosts } from 'contentlayer/generated'

export const revalidate = 3600

const BASE = 'https://bridgetoretired.com'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Static routes — add new tools/pages here when you ship them
const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { path: '',            priority: 1.0, changeFrequency: 'weekly'  },
  { path: '/about',      priority: 0.8, changeFrequency: 'monthly' },
  { path: '/blog',       priority: 0.9, changeFrequency: 'daily'   },
  { path: '/pricing',    priority: 0.9, changeFrequency: 'monthly' },
  { path: '/privacy',    priority: 0.3, changeFrequency: 'yearly'  },
  { path: '/terms',      priority: 0.3, changeFrequency: 'yearly'  },
  { path: '/disclosures',priority: 0.3, changeFrequency: 'yearly'  },
  { path: '/tools',      priority: 0.9, changeFrequency: 'weekly'  },
  { path: '/guides/bridge-planner-walkthrough', priority: 0.8, changeFrequency: 'monthly' },
  // Tools
  { path: '/tools/bridge-strategy-calculator',        priority: 0.9, changeFrequency: 'monthly' },
  { path: '/tools/early-retirement-age-calculator',   priority: 0.9, changeFrequency: 'monthly' },
  { path: '/tools/bridge-health-check',               priority: 0.9, changeFrequency: 'monthly' },
  { path: '/tools/retirement-readiness-score',        priority: 0.8, changeFrequency: 'monthly' },
  { path: '/tools/taxable-brokerage-gap-calculator',  priority: 0.8, changeFrequency: 'monthly' },
  { path: '/tools/coast-fire-calculator',             priority: 0.8, changeFrequency: 'monthly' },
  { path: '/tools/72t-vs-roth-ladder',                priority: 0.8, changeFrequency: 'monthly' },
  { path: '/tools/hourly-to-annual-salary-calculator',priority: 0.8, changeFrequency: 'monthly' },
  { path: '/tools/72t-sepp-calculator',               priority: 0.8, changeFrequency: 'monthly' },
  { path: '/tools/fire-number-calculator',            priority: 0.8, changeFrequency: 'monthly' },
  { path: '/tools/withdrawal-order-optimizer',        priority: 0.8, changeFrequency: 'monthly' },
  { path: '/tools/social-security-calculator',        priority: 0.8, changeFrequency: 'monthly' },
  { path: '/tools/aca-subsidy-estimator',             priority: 0.8, changeFrequency: 'monthly' },
  { path: '/tools/roth-conversion-ladder-calculator', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/tools/sequence-of-returns-simulator',     priority: 0.8, changeFrequency: 'monthly' },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Supabase posts (published, not scheduled for future)
  const { data: sbPosts } = await supabase
    .from('blog_posts')
    .select('slug, published_at, updated_at')
    .eq('published', true)
    .lte('published_at', new Date().toISOString())

  const sbEntries: MetadataRoute.Sitemap = (sbPosts ?? []).map(p => ({
    url: `${BASE}/blog/${p.slug}`,
    lastModified: new Date(p.updated_at ?? p.published_at),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  // 2. Contentlayer posts — skip slugs already in Supabase (Supabase wins)
  const sbSlugs = new Set((sbPosts ?? []).map(p => p.slug))
  const clEntries: MetadataRoute.Sitemap = allPosts
    .filter(p => !sbSlugs.has(p.slug))
    .map(p => ({
      url: `${BASE}/blog/${p.slug}`,
      lastModified: new Date(p.date),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }))

  // 3. Static routes
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map(r => ({
    url: `${BASE}${r.path}`,
    lastModified: new Date(),
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }))

  return [...staticEntries, ...sbEntries, ...clEntries]
}
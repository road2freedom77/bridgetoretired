// app/feed.xml/route.ts
// RSS 2.0 feed for bridgetoretired.com — served at /feed.xml
// Merges blog posts from both sources (same pattern as app/sitemap.ts):
//   1. Supabase blog_posts (admin-published)
//   2. Contentlayer markdown posts — deduped against Supabase (Supabase wins)
// Sorted by date descending, capped at the 30 most recent posts.
// Consumed by feed readers, aggregators, and newsletter automations.

import { createClient } from '@supabase/supabase-js'
import { allPosts } from 'contentlayer/generated'

export const revalidate = 3600

const BASE = 'https://bridgetoretired.com'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Escape XML special characters for safe embedding in the feed
function esc(s: string): string {
  return (s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

interface FeedItem {
  slug: string
  title: string
  description: string
  date: string
  category: string
}

export async function GET() {
  // 1. Supabase posts (published, not scheduled for future)
  const { data: sbPosts } = await supabase
    .from('blog_posts')
    .select('slug, title, description, published_at, category')
    .eq('published', true)
    .lte('published_at', new Date().toISOString())

  const sbItems: FeedItem[] = (sbPosts ?? []).map(p => ({
    slug: p.slug,
    title: p.title,
    description: p.description ?? '',
    date: p.published_at,
    category: p.category ?? 'General',
  }))

  // 2. Contentlayer posts — skip slugs already in Supabase
  const sbSlugs = new Set(sbItems.map(p => p.slug))
  const clItems: FeedItem[] = allPosts
    .filter(p => !sbSlugs.has(p.slug))
    .map(p => ({
      slug: p.slug,
      title: p.title,
      description: p.description,
      date: p.date,
      category: p.category,
    }))

  // 3. Merge, sort newest first, cap at 30
  const items = [...sbItems, ...clItems]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 30)

  const lastBuildDate = items.length
    ? new Date(items[0].date).toUTCString()
    : new Date().toUTCString()

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>BridgeToRetired</title>
    <link>${BASE}</link>
    <description>Guides, calculators, and strategy for early retirement — bridge planning, Roth conversions, 72(t), healthcare, and Social Security timing.</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${BASE}/feed.xml" rel="self" type="application/rss+xml"/>
${items.map(item => `    <item>
      <title>${esc(item.title)}</title>
      <link>${BASE}/blog/${item.slug}</link>
      <guid isPermaLink="true">${BASE}/blog/${item.slug}</guid>
      <pubDate>${new Date(item.date).toUTCString()}</pubDate>
      <category>${esc(item.category)}</category>
      <description>${esc(item.description)}</description>
    </item>`).join('\n')}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
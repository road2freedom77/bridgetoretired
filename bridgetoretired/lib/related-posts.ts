// lib/related-posts.ts
// Fetches related posts (same category) for the bottom-of-article block.
// Merges both content sources — Supabase blog_posts and contentlayer MDX —
// using the same dedup pattern as app/sitemap.ts (Supabase wins on slug).
// Returns up to `limit` posts from the same category, newest first,
// excluding the current post. Falls back to newest posts from any
// category when the category has too few siblings.

import { createClient } from '@supabase/supabase-js'
import { allPosts } from 'contentlayer/generated'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface RelatedPost {
  slug: string
  title: string
  description: string
  category: string
  date: string
  readTime: string
}

export async function getRelatedPosts(
  currentSlug: string,
  category: string | null,
  limit = 3
): Promise<RelatedPost[]> {
  // 1. All published Supabase posts (light columns only)
  const { data: sbPosts } = await supabase
    .from('blog_posts')
    .select('slug, title, description, category, published_at, read_time')
    .eq('published', true)
    .lte('published_at', new Date().toISOString())

  const sbItems: RelatedPost[] = (sbPosts ?? []).map(p => ({
    slug: p.slug,
    title: p.title,
    description: p.description ?? '',
    category: p.category ?? 'General',
    date: p.published_at,
    readTime: p.read_time ?? '5 min read',
  }))

  // 2. Contentlayer posts, deduped against Supabase
  const sbSlugs = new Set(sbItems.map(p => p.slug))
  const clItems: RelatedPost[] = allPosts
    .filter(p => !sbSlugs.has(p.slug))
    .map(p => ({
      slug: p.slug,
      title: p.title,
      description: p.description,
      category: p.category,
      date: p.date,
      readTime: p.readTime,
    }))

  // 3. Merge, drop current post, sort newest first
  const pool = [...sbItems, ...clItems]
    .filter(p => p.slug !== currentSlug)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // 4. Same-category first; top up with newest from other categories if short
  const sameCategory = category ? pool.filter(p => p.category === category) : []
  const picked = sameCategory.slice(0, limit)

  if (picked.length < limit) {
    const pickedSlugs = new Set(picked.map(p => p.slug))
    for (const p of pool) {
      if (picked.length >= limit) break
      if (!pickedSlugs.has(p.slug)) picked.push(p)
    }
  }

  return picked
}
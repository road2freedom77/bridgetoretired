// components/blog/RelatedPosts.tsx
// "More in [Category]" block rendered at the bottom of each blog post.
// Receives pre-fetched posts from the server component (app/blog/[slug]/page.tsx
// via lib/related-posts.ts). Card style matches the /blog listing grid.

import Link from 'next/link'
import { format } from 'date-fns'
import type { RelatedPost } from '@/lib/related-posts'

export default function RelatedPosts({
  posts,
  category,
}: {
  posts: RelatedPost[]
  category: string | null
}) {
  if (!posts.length) return null

  return (
    <div className="mt-16">
      <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.24em] uppercase text-gold mb-6">
        <span className="block w-6 h-px bg-gold" />
        {category ? `More in ${category}` : 'More from the Blog'}
      </div>
      <div className="grid sm:grid-cols-3 gap-5">
        {posts.map(post => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group bg-ink border border-white/[0.07] rounded-xl p-5 hover:border-gold/20 hover:-translate-y-1 transition-all duration-300"
          >
            <div className="font-mono text-[9px] tracking-widest uppercase text-gold mb-2">
              {post.category}
            </div>
            <h3 className="font-syne font-semibold text-[14px] tracking-tight text-white mb-3 leading-snug group-hover:text-gold/90 transition-colors">
              {post.title}
            </h3>
            <p className="text-white/45 text-[12px] leading-[1.7] mb-4 line-clamp-2">
              {post.description}
            </p>
            <div className="flex items-center gap-3 font-mono text-[9.5px] text-white/25">
              <span>{format(new Date(post.date), 'MMM d, yyyy')}</span>
              <span>·</span>
              <span>{post.readTime}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
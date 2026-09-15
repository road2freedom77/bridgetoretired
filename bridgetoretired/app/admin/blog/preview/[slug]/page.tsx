// app/admin/blog/preview/[slug]/page.tsx
// Admin-only draft preview. Renders any post (draft, scheduled, or published)
// exactly as the public [slug] page would — same BlogRenderer, same layout
// styling — but fetched with the service role so unpublished rows resolve.
// Access: hardcoded admin Clerk ID only; everyone else (and crawlers) gets 404.
// noindex + not linked publicly; does not touch public ISR caching.

import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import Link from 'next/link'
import type { Metadata } from 'next'
import BlogRenderer from '@/components/blog/BlogRenderer'

const ADMIN_USER_ID = 'user_3Ev0Q9ORn9oZwaXGROJq4bniaBI'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const dynamic = 'force-dynamic' // always fresh — no caching of drafts

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

interface Props { params: { slug: string } }

export default async function PreviewPage({ params }: Props) {
  const { userId } = await auth()
  if (userId !== ADMIN_USER_ID) notFound()

  const { data: post } = await supabaseAdmin
    .from('blog_posts')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (!post) notFound()

  const status = !post.published
    ? 'DRAFT'
    : new Date(post.published_at) > new Date()
      ? `SCHEDULED · ${format(new Date(post.published_at), 'MMM d, yyyy HH:mm')}`
      : 'PUBLISHED'

  return (
    <div className="min-h-screen bg-black">
      {/* Preview banner — admin-only context strip */}
      <div className="bg-gold text-black px-5 py-2 flex items-center justify-between font-mono text-[11px] font-semibold tracking-wider">
        <span>PREVIEW MODE · {status}</span>
        <div className="flex gap-4">
          <Link href="/admin/blog" className="underline underline-offset-2">← Back to Admin</Link>
          {post.published && new Date(post.published_at) <= new Date() && (
            <a href={`/blog/${post.slug}`} className="underline underline-offset-2">View Live →</a>
          )}
        </div>
      </div>

      <div className="bg-navy border-b border-white/[0.06]">
        <div className="max-w-3xl mx-auto px-5 pt-14 pb-12">
          <div className="font-mono text-[9px] tracking-widest uppercase text-gold mb-4">
            {post.category ?? 'Uncategorized'}
          </div>
          <h1 className="font-syne font-bold text-[clamp(26px,4vw,46px)] tracking-tight text-white leading-tight mb-5">
            {post.title}
          </h1>
          <p className="text-white/55 text-[15px] leading-relaxed mb-6">
            {post.description}
          </p>
          <div className="flex items-center gap-4 font-mono text-[10px] text-white/30">
            <span>{format(new Date(post.published_at), 'MMMM d, yyyy')}</span>
            <span>·</span>
            <span>{post.read_time ?? '— min read'}</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 py-14">
        <article className="prose-dark">
          <BlogRenderer content={post.content} slug={post.slug} />
        </article>
      </div>
    </div>
  )
}
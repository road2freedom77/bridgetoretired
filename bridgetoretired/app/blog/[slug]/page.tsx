import { getAllPosts, getPostBySlug } from '@/lib/blog'
import { notFound }                   from 'next/navigation'
import { format }                     from 'date-fns'
import type { Metadata }              from 'next'
import Link                           from 'next/link'

interface Props { params: { slug: string } }

export async function generateStaticParams() {
  return getAllPosts().map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostBySlug(params.slug)
  if (!post) return {}
  return {
    title:       post.title,
    description: post.description,
    openGraph: {
      title:         post.title,
      description:   post.description,
      type:          'article',
      publishedTime: post.date,
    },
  }
}

export default async function PostPage({ params }: Props) {
  const post = await getPostBySlug(params.slug)
  if (!post) notFound()

  return (
    <div className="min-h-screen bg-black">
      <div className="bg-navy border-b border-white/[0.06]">
        <div className="max-w-3xl mx-auto px-5 pt-14 pb-12">
          <Link
            href="/blog"
            className="font-mono text-[10px] tracking-widest uppercase text-white/30 hover:text-gold transition-colors flex items-center gap-2 mb-8"
          >
            ← Back to Blog
          </Link>
          <div className="font-mono text-[9px] tracking-widest uppercase text-gold mb-4">
            {post.category}
          </div>
          <h1 className="font-syne font-bold text-[clamp(26px,4vw,46px)] tracking-tight text-white leading-tight mb-5">
            {post.title}
          </h1>
          <p className="text-white/55 text-[15px] leading-relaxed mb-6">{post.description}</p>
          <div className="flex items-center gap-4 font-mono text-[10px] text-white/30">
            <span>{format(new Date(post.date), 'MMMM d, yyyy')}</span>
            <span>·</span>
            <span>{post.readTime}</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 py-14">
        <article
          className="prose-dark"
          dangerouslySetInnerHTML={{ __html: post.content ?? '' }}
        />

        <div className="mt-16 bg-ink border border-white/[0.07] rounded-xl p-7 text-center">
          <div className="font-mono text-[9px] tracking-widest uppercase text-gold mb-3">Free Tool</div>
          <h3 className="font-syne font-bold text-[20px] tracking-tight text-white mb-3">
            Model this in the Bridge Planner
          </h3>
          <p className="text-white/50 text-[13px] mb-5 leading-relaxed">
            Download the free spreadsheet and run your own numbers.
          </p>
          <Link
            href="/#download"
            className="inline-block bg-gold text-black font-syne font-semibold text-[12px] tracking-wide px-6 py-3 rounded hover:opacity-85 transition-opacity"
          >
            Download Free Planner →
          </Link>
        </div>
      </div>
    </div>
  )
}

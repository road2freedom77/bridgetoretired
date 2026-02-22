import Link from 'next/link'
import { format } from 'date-fns'
import type { Post } from 'contentlayer/generated'

export function BlogPreview({ posts }: { posts: Post[] }) {
  const [featured, ...rest] = posts
  return (
    <section id="blog" className="py-24 px-5 bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between gap-5 mb-12 flex-wrap">
          <div>
            <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.24em] uppercase text-gold mb-4">
              <span className="block w-6 h-px bg-gold" />
              Latest Posts
            </div>
            <h2 className="font-syne font-bold text-[clamp(28px,3.5vw,44px)] tracking-tight text-white">
              From the Blog
            </h2>
          </div>
          <Link href="/blog" className="font-mono text-[11px] tracking-widest uppercase text-white/35 hover:text-white flex items-center gap-2 group transition-colors">
            All Articles
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        <div className="grid lg:grid-cols-[1.6fr_1fr] gap-5">
          {featured && (
            <Link href={featured.url} className="group bg-ink border border-white/[0.07] rounded-xl overflow-hidden hover:border-gold/20 hover:-translate-y-1 transition-all duration-300">
              <div className="h-56 bg-slate flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_30%_50%,rgba(232,184,75,0.1),transparent)]" />
                <div className="font-syne font-black text-[110px] text-gold/[0.06] absolute right-3 bottom-0 leading-none">01</div>
                <span className="text-6xl relative z-10">🌉</span>
                <div className="absolute top-4 left-4">
                  <span className="font-mono text-[8px] tracking-widest uppercase bg-gold/10 text-gold border border-gold/25 px-2 py-1 rounded">
                    Featured
                  </span>
                </div>
              </div>
              <div className="p-7">
                <div className="font-mono text-[9px] tracking-widest uppercase text-gold mb-3">{featured.category}</div>
                <h3 className="font-syne font-bold text-[20px] tracking-tight text-white leading-tight mb-3 group-hover:text-gold/90 transition-colors">
                  {featured.title}
                </h3>
                <p className="text-white/45 text-[13px] leading-[1.75] mb-5">{featured.description}</p>
                <div className="flex gap-4 font-mono text-[10px] text-white/25">
                  <span>{format(new Date(featured.date), 'MMM d, yyyy')}</span>
                  <span>·</span>
                  <span>{featured.readTime}</span>
                </div>
              </div>
            </Link>
          )}

          <div className="flex flex-col gap-4">
            {rest.map(post => (
              <Link key={post.slug} href={post.url} className="group bg-ink border border-white/[0.07] rounded-xl p-5 hover:border-gold/15 hover:translate-x-1 transition-all duration-200">
                <div className="font-mono text-[8.5px] tracking-widest uppercase text-gold mb-2">{post.category}</div>
                <div className="font-syne font-semibold text-[13px] tracking-tight text-white mb-2 leading-snug group-hover:text-gold/90 transition-colors">
                  {post.title}
                </div>
                <div className="font-mono text-[9.5px] text-white/25">
                  {format(new Date(post.date), 'MMM d, yyyy')} · {post.readTime}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}


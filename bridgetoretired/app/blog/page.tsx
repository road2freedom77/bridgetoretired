import { getAllPosts }  from '@/lib/blog'
import { format }       from 'date-fns'
import Link             from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog – Early Retirement Guides & Strategy',
  description: 'In-depth guides on bridge strategies, Roth conversions, tax planning, and everything FIRE for early retirees.',
}

export default function BlogPage() {
  const posts    = getAllPosts()
  const featured = posts.find(p => p.featured) ?? posts[0]
  const rest     = posts.filter(p => p !== featured)

  return (
    <div className="min-h-screen bg-black">
      <div className="bg-navy border-b border-white/[0.06] py-16 px-5">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.24em] uppercase text-gold mb-4">
            <span className="block w-6 h-px bg-gold" />
            The Blog
          </div>
          <h1 className="font-syne font-bold text-[clamp(32px,4vw,54px)] tracking-tight text-white mb-3">
            Early Retirement Guides
          </h1>
          <p className="text-white/50 text-[15px] max-w-lg leading-relaxed">
            In-depth, research-backed guides on bridge strategy, tax efficiency, and the FIRE path.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 py-16">
        {featured && (
          <div className="mb-14">
            <div className="font-mono text-[9px] tracking-widest uppercase text-white/30 mb-5">Featured</div>
            <Link href={`/blog/${featured.slug}`} className="group block bg-ink border border-white/[0.07] rounded-xl overflow-hidden hover:border-gold/20 transition-all duration-300">
              <div className="grid md:grid-cols-[1fr_1.4fr]">
                <div className="h-56 md:h-full bg-slate flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_30%_50%,rgba(232,184,75,0.1),transparent)]" />
                  <div className="font-syne font-black text-[120px] text-gold/[0.06] absolute right-4 bottom-0 leading-none">01</div>
                  <span className="text-6xl relative z-10">🌉</span>
                </div>
                <div className="p-8 md:p-10">
                  <div className="font-mono text-[9px] tracking-widest uppercase text-gold mb-3">{featured.category}</div>
                  <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-4 leading-tight group-hover:text-gold/90 transition-colors">
                    {featured.title}
                  </h2>
                  <p className="text-white/50 text-[14px] leading-[1.75] mb-6">{featured.description}</p>
                  <div className="flex items-center gap-4 font-mono text-[10px] text-white/30">
                    <span>{format(new Date(featured.date), 'MMM d, yyyy')}</span>
                    <span>·</span>
                    <span>{featured.readTime}</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {rest.map(post => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group bg-ink border border-white/[0.07] rounded-xl overflow-hidden hover:border-gold/20 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="h-36 bg-slate flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(232,184,75,0.07),transparent)]" />
                <span className="text-4xl relative z-10">📊</span>
              </div>
              <div className="p-5 pb-6">
                <div className="font-mono text-[9px] tracking-widest uppercase text-gold mb-2">{post.category}</div>
                <h3 className="font-syne font-semibold text-[15px] tracking-tight text-white mb-3 leading-snug group-hover:text-gold/90 transition-colors">
                  {post.title}
                </h3>
                <p className="text-white/45 text-[12px] leading-[1.7] mb-4 line-clamp-2">{post.description}</p>
                <div className="flex items-center gap-3 font-mono text-[9.5px] text-white/25">
                  <span>{format(new Date(post.date), 'MMM d, yyyy')}</span>
                  <span>·</span>
                  <span>{post.readTime}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

import { createClient }  from '@supabase/supabase-js'
import { notFound }       from 'next/navigation'
import { format }         from 'date-fns'
import type { Metadata }  from 'next'
import Link               from 'next/link'
import Script             from 'next/script'
import BlogRenderer       from '@/components/blog/BlogRenderer'

export const revalidate = 3600 // 1hr ISR — keeps Vercel ISR writes low

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Props { params: { slug: string } }

export async function generateStaticParams() {
  const { data } = await supabase
    .from('blog_posts')
    .select('slug')
    .eq('published', true)
  return (data ?? []).map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data: post } = await supabase
    .from('blog_posts')
    .select('title, description, published_at')
    .eq('slug', params.slug)
    .eq('published', true)
    .single()

  if (!post) return {}

  const url = `https://bridgetoretired.com/blog/${params.slug}`
  return {
    title:       post.title,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      title:         post.title,
      description:   post.description,
      type:          'article',
      publishedTime: post.published_at,
      url,
    },
  }
}

export default async function PostPage({ params }: Props) {
  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', params.slug)
    .eq('published', true)
    .lte('published_at', new Date().toISOString())
    .single()

  if (!post) notFound()

  const url = `https://bridgetoretired.com/blog/${params.slug}`

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    author: {
      '@type': 'Organization',
      name: 'BridgeToRetired',
    },
    publisher: {
      '@type': 'Organization',
      name: 'BridgeToRetired',
      logo: {
        '@type': 'ImageObject',
        url: 'https://bridgetoretired.com/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    datePublished: post.published_at,
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bridgetoretired.com/' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://bridgetoretired.com/blog' },
      { '@type': 'ListItem', position: 3, name: post.title, item: url },
    ],
  }

  return (
    <div className="min-h-screen bg-black">
      <Script id="schema-article" type="application/ld+json" strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <Script id="schema-breadcrumb" type="application/ld+json" strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="bg-navy border-b border-white/[0.06]">
        <div className="max-w-3xl mx-auto px-5 pt-14 pb-12">
          <Link href="/blog" className="font-mono text-[10px] tracking-widest uppercase text-white/30 hover:text-gold transition-colors flex items-center gap-2 mb-8">
            ← Back to Blog
          </Link>
          <div className="font-mono text-[9px] tracking-widest uppercase text-gold mb-4">
            {post.category}
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
            <span>{post.read_time}</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 py-14">
        <article>
          <BlogRenderer content={post.content} />
        </article>

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
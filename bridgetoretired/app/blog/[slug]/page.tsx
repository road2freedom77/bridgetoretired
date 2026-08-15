import { createClient }        from '@supabase/supabase-js'
import { allPosts }             from 'contentlayer/generated'
import { notFound }             from 'next/navigation'
import { format }               from 'date-fns'
import { useMDXComponent }      from 'next-contentlayer2/hooks'
import type { Metadata }        from 'next'
import Link                     from 'next/link'
import Script                   from 'next/script'
import BlogRenderer              from '@/components/blog/BlogRenderer'
import SequenceOfReturnsSimulator from '@/components/SequenceOfReturnsSimulator'
import BridgeStrategyVisualizer   from '@/components/BridgeStrategyVisualizer'
import RothLadderBuilder          from '@/components/RothLadderBuilder'
import ACASubsidyEstimator        from '@/components/ACASubsidyEstimator'
import SocialSecurityCalculator   from '@/components/SocialSecurityCalculator'
import FIRENumberCalculator       from '@/components/FIRENumberCalculator'
import WithdrawalOrderOptimizer   from '@/components/WithdrawalOrderOptimizer'
import TaxBracketVisualizer       from '@/components/TaxBracketVisualizer'
import TaxableBrokerageAnalyzer   from '@/components/TaxableBrokerageAnalyzer'
import SEPPCalculator             from '@/components/SEPPCalculator'
import FinanceTable               from '@/components/FinanceTable'

export const revalidate = 3600
export const dynamicParams = true

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const MDX_COMPONENTS = {
  SequenceOfReturnsSimulator,
  BridgeStrategyVisualizer,
  RothLadderBuilder,
  ACASubsidyEstimator,
  SocialSecurityCalculator,
  FIRENumberCalculator,
  WithdrawalOrderOptimizer,
  TaxBracketVisualizer,
  TaxableBrokerageAnalyzer,
  SEPPCalculator,
  FinanceTable,
}

interface Props { params: { slug: string } }

// ── generateStaticParams: union of Supabase slugs + contentlayer slugs ────────
export async function generateStaticParams() {
  const { data } = await supabase
    .from('blog_posts')
    .select('slug')
    .eq('published', true)

  const supabaseSlugs = (data ?? []).map(p => ({ slug: p.slug }))
  const contentlayerSlugs = allPosts.map(p => ({ slug: p.slug }))

  // Deduplicate — Supabase takes precedence for overlapping slugs
  const seen = new Set(supabaseSlugs.map(s => s.slug))
  const uniqueContentlayer = contentlayerSlugs.filter(s => !seen.has(s.slug))

  return [...supabaseSlugs, ...uniqueContentlayer]
}

// ── generateMetadata: Supabase first, contentlayer fallback ──────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const url = `https://bridgetoretired.com/blog/${params.slug}`

  // Try Supabase first
  const { data: sbPost } = await supabase
    .from('blog_posts')
    .select('title, description, published_at')
    .eq('slug', params.slug)
    .eq('published', true)
    .single()

  if (sbPost) {
    return {
      title:       sbPost.title,
      description: sbPost.description,
      alternates:  { canonical: url },
      openGraph: {
        title:         sbPost.title,
        description:   sbPost.description,
        type:          'article',
        publishedTime: sbPost.published_at,
        url,
      },
    }
  }

  // Fallback to contentlayer
  const clPost = allPosts.find(p => p.slug === params.slug)
  if (!clPost) return {}

  return {
    title:       clPost.title,
    description: clPost.description,
    alternates:  { canonical: url },
    openGraph: {
      title:         clPost.title,
      description:   clPost.description,
      type:          'article',
      publishedTime: clPost.date,
      url,
    },
  }
}

// ── MDX renderer wrapper (needs hook — must be client-like pattern) ───────────
function MDXContent({ code }: { code: string }) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const Component = useMDXComponent(code)
  return <Component components={MDX_COMPONENTS} />
}

// ── Shared article body layout ────────────────────────────────────────────────
function PostLayout({
  slug, title, description, category, date, readTime, children, url,
  articleSchema, breadcrumbSchema,
}: {
  slug: string
  title: string
  description: string
  category: string
  date: string
  readTime: string
  children: React.ReactNode
  url: string
  articleSchema: object
  breadcrumbSchema: object
}) {
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
            {category}
          </div>
          <h1 className="font-syne font-bold text-[clamp(26px,4vw,46px)] tracking-tight text-white leading-tight mb-5">
            {title}
          </h1>
          <p className="text-white/55 text-[15px] leading-relaxed mb-6">
            {description}
          </p>
          <div className="flex items-center gap-4 font-mono text-[10px] text-white/30">
            <span>{format(new Date(date), 'MMMM d, yyyy')}</span>
            <span>·</span>
            <span>{readTime}</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 py-14">
        <article className="prose-dark">
          {children}
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

// ── Main page component ───────────────────────────────────────────────────────
export default async function PostPage({ params }: Props) {
  const url = `https://bridgetoretired.com/blog/${params.slug}`

  // ── Try Supabase first ──────────────────────────────────────────────────────
  const { data: sbPost } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', params.slug)
    .eq('published', true)
    .lte('published_at', new Date().toISOString())
    .single()

  if (sbPost) {
    const articleSchema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: sbPost.title,
      description: sbPost.description,
      author: { '@type': 'Organization', name: 'BridgeToRetired' },
      publisher: {
        '@type': 'Organization',
        name: 'BridgeToRetired',
        logo: { '@type': 'ImageObject', url: 'https://bridgetoretired.com/logo.png' },
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      datePublished: sbPost.published_at,
    }
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bridgetoretired.com/' },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://bridgetoretired.com/blog' },
        { '@type': 'ListItem', position: 3, name: sbPost.title, item: url },
      ],
    }

    return (
      <PostLayout
        slug={params.slug}
        title={sbPost.title}
        description={sbPost.description}
        category={sbPost.category}
        date={sbPost.published_at}
        readTime={sbPost.read_time}
        url={url}
        articleSchema={articleSchema}
        breadcrumbSchema={breadcrumbSchema}
      >
        <BlogRenderer content={sbPost.content} slug={params.slug} />
      </PostLayout>
    )
  }

  // ── Fallback to contentlayer ────────────────────────────────────────────────
  const clPost = allPosts.find(p => p.slug === params.slug)
  if (!clPost) notFound()

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: clPost.title,
    description: clPost.description,
    author: { '@type': 'Organization', name: 'BridgeToRetired' },
    publisher: {
      '@type': 'Organization',
      name: 'BridgeToRetired',
      logo: { '@type': 'ImageObject', url: 'https://bridgetoretired.com/logo.png' },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    datePublished: clPost.date,
  }
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bridgetoretired.com/' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://bridgetoretired.com/blog' },
      { '@type': 'ListItem', position: 3, name: clPost.title, item: url },
    ],
  }

  return (
    <PostLayout
      slug={params.slug}
      title={clPost.title}
      description={clPost.description}
      category={clPost.category}
      date={clPost.date}
      readTime={clPost.readTime}
      url={url}
      articleSchema={articleSchema}
      breadcrumbSchema={breadcrumbSchema}
    >
      <MDXContent code={clPost.body.code} />
    </PostLayout>
  )
}
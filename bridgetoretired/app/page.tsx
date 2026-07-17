import { createClient }  from '@supabase/supabase-js'
import { Hero }          from '@/components/Hero'
import { HowItWorks }    from '@/components/HowItWorks'
import { Calculator }    from '@/components/Calculator'
import { Newsletter }    from '@/components/Newsletter'
import { BlogPreview }   from '@/components/BlogPreview'
import { TopicPillars }  from '@/components/TopicPillars'
import { getAllPosts }    from '@/lib/blog'

export const revalidate = 3600

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function HomePage() {
  const { data: sbPosts } = await supabase
    .from('blog_posts')
    .select('slug, title, description, published_at, category, read_time, featured')
    .eq('published', true)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })

  const supabasePosts = (sbPosts ?? []).map(p => ({
    slug:        p.slug,
    title:       p.title,
    description: p.description ?? '',
    date:        p.published_at,
    category:    p.category ?? 'General',
    readTime:    p.read_time ?? '5 min read',
    featured:    p.featured ?? false,
  }))

  const sbSlugs  = new Set(supabasePosts.map(p => p.slug))
  const mdxPosts = getAllPosts().filter(p => !sbSlugs.has(p.slug))

  const posts = [...supabasePosts, ...mdxPosts]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  return (
    <>
      <Hero />
      <HowItWorks />
      <Calculator />
      <Newsletter />
      <TopicPillars />
      <BlogPreview posts={posts} />
    </>
  )
}
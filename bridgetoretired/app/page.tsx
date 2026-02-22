import { Hero }          from '@/components/Hero'
import { HowItWorks }    from '@/components/HowItWorks'
import { Calculator }    from '@/components/Calculator'
import { AffiliateTools } from '@/components/AffiliateTools'
import { Newsletter }    from '@/components/Newsletter'
import { BlogPreview }   from '@/components/BlogPreview'
import { TopicPillars }  from '@/components/TopicPillars'
import { allPosts }      from 'contentlayer/generated'
import { compareDesc }   from 'date-fns'

export default function HomePage() {
  const posts = allPosts
    .sort((a, b) => compareDesc(new Date(a.date), new Date(b.date)))
    .slice(0, 5)

  return (
    <>
      <Hero />
      <HowItWorks />
      <Calculator />
      <AffiliateTools />
      <Newsletter />
      <TopicPillars />
      <BlogPreview posts={posts} />
    </>
  )
}

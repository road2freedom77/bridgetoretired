import { Hero }           from '@/components/Hero'
import { HowItWorks }     from '@/components/HowItWorks'
import { Calculator }     from '@/components/Calculator'
// import { AffiliateTools } from '@/components/AffiliateTools'  // Uncomment when affiliates approved
import { Newsletter }     from '@/components/Newsletter'
import { BlogPreview }    from '@/components/BlogPreview'
import { TopicPillars }   from '@/components/TopicPillars'
import { getAllPosts }     from '@/lib/blog'

export default function HomePage() {
  const posts = getAllPosts().slice(0, 5)
  return (
    <>
      <Hero />
      <HowItWorks />
      <Calculator />
      {/* Tools section hidden until affiliate links are live */}
      {/* <AffiliateTools /> */}
      <Newsletter />
      <TopicPillars />
      <BlogPreview posts={posts} />
    </>
  )
}

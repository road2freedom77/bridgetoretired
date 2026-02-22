import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Affiliate Disclosures – BridgeToRetired',
  description: 'Full affiliate disclosure for BridgeToRetired.com — how we earn commissions and our editorial standards.',
}

const LAST_UPDATED = 'February 22, 2025'
const EMAIL = 'hello@bridgetoretired.com'

export default function DisclosuresPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="bg-navy border-b border-white/[0.06] py-16 px-5">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.24em] uppercase text-gold mb-4">
            <span className="block w-6 h-px bg-gold" />
            Legal
          </div>
          <h1 className="font-syne font-bold text-[clamp(28px,4vw,46px)] tracking-tight text-white mb-3">
            Affiliate Disclosures
          </h1>
          <p className="font-mono text-[11px] text-white/30">Last updated: {LAST_UPDATED}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 py-14">
        <div className="prose-dark space-y-10">

          {/* FTC statement */}
          <div className="bg-gold/10 border border-gold/25 rounded-xl p-6">
            <div className="font-mono text-[9px] tracking-widest uppercase text-gold mb-3">
              FTC Required Disclosure
            </div>
            <p className="text-white/75 text-[14px] leading-[1.85]">
              BridgeToRetired.com participates in affiliate marketing programs. This means we may
              earn a commission when you click certain links on this Site and subsequently sign up
              for, purchase, or open an account with a third-party product or service — at{' '}
              <strong className="text-white">no additional cost to you</strong>. This disclosure
              is made in accordance with the Federal Trade Commission's guidelines on endorsements
              and testimonials (16 CFR Part 255).
            </p>
          </div>

          {[
            {
              title: 'What "Affiliate Link" Means',
              content: (
                <p className="text-white/60 text-[15px] leading-[1.85]">
                  An affiliate link is a tracked URL that tells a company you arrived from our
                  site. If you go on to sign up or make a purchase, we may receive a referral
                  fee. The price you pay is identical to going directly — we never mark up
                  products or receive kickbacks that increase your cost.
                </p>
              ),
            },
            {
              title: 'How We Choose What to Recommend',
              content: (
                <div className="space-y-4 text-white/60 text-[15px] leading-[1.85]">
                  <p>
                    Affiliate commission rates do <strong className="text-white">not</strong> determine
                    what we recommend. Our standard for any recommendation:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>We only recommend products we believe are genuinely useful for early retirees</li>
                    <li>We do not accept payment to feature or favorably review any product</li>
                    <li>We do not guarantee placement or rankings in exchange for compensation</li>
                    <li>If we stop believing a product is worth recommending, we remove it regardless of commission rates</li>
                  </ul>
                  <p>
                    That said — a financial incentive exists on every affiliate link. Read our
                    recommendations critically, do your own research, and make decisions based
                    on your specific situation.
                  </p>
                </div>
              ),
            },
            {
              title: 'How to Identify Affiliate Links',
              content: (
                <p className="text-white/60 text-[15px] leading-[1.85]">
                  Where affiliate links appear on this Site, they are marked with{' '}
                  <code className="font-mono text-[12px] bg-white/[0.06] px-1.5 py-0.5 rounded border border-white/10">rel="sponsored"</code>{' '}
                  in the HTML and carry UTM tracking parameters. Any section labeled "Tools,"
                  "Recommended Resources," or similar may contain affiliate links. Individual
                  blog posts will note when affiliate links are present.
                </p>
              ),
            },
            {
              title: 'No Sponsored Content',
              content: (
                <p className="text-white/60 text-[15px] leading-[1.85]">
                  We do not publish sponsored posts, paid reviews, or advertiser-directed
                  content. Companies cannot pay to be featured in our articles or guides.
                  All editorial content is written independently.
                </p>
              ),
            },
            {
              title: 'Third-Party Tools & Services',
              content: (
                <p className="text-white/60 text-[15px] leading-[1.85]">
                  When we recommend third-party tools — financial planning software, brokerages,
                  tax tools, or other services — those recommendations may be accompanied by
                  affiliate links. Each third-party service has its own terms of service and
                  privacy policy. We encourage you to review them before signing up for anything.
                </p>
              ),
            },
            {
              title: 'Questions',
              content: (
                <p className="text-white/60 text-[15px] leading-[1.85]">
                  If you have questions about our affiliate relationships or editorial standards,
                  contact us at{' '}
                  <a href={`mailto:${EMAIL}`} className="text-gold underline">{EMAIL}</a>.
                  We're happy to clarify any relationship or explain why we do or don't
                  recommend a particular product.
                </p>
              ),
            },
          ].map(({ title, content }) => (
            <div key={title}>
              <h2 className="font-syne font-bold text-[20px] tracking-tight text-white mb-4">
                {title}
              </h2>
              {content}
            </div>
          ))}

          <div className="border-t border-white/[0.07] pt-8 flex flex-wrap gap-5">
            <Link href="/privacy" className="font-mono text-[11px] text-gold hover:opacity-75 transition-opacity">
              Privacy Policy →
            </Link>
            <Link href="/terms" className="font-mono text-[11px] text-gold hover:opacity-75 transition-opacity">
              Terms of Use →
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}

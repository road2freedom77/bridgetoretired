import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Affiliate Disclosures – BridgeToRetired',
  description: 'Full affiliate disclosure for BridgeToRetired.com — who we partner with, how we earn commissions, and our editorial standards.',
}

const LAST_UPDATED = 'February 22, 2025'
const EMAIL = 'hello@bridgetoretired.com'

const partners = [
  {
    name: 'Empower (formerly Personal Capital)',
    type: 'Portfolio tracking & retirement planning',
    relationship: 'Affiliate — we may earn a commission when you sign up for a free account',
    why: 'Genuinely the most comprehensive free portfolio tracker available. Used by a large portion of the FIRE community for net worth tracking and retirement projections.',
  },
  {
    name: 'Boldin (formerly NewRetirement)',
    type: 'Retirement scenario planning software',
    relationship: 'Affiliate — we may earn a commission on paid plan sign-ups',
    why: 'The most detailed retirement planning tool we\'ve found for early retirees. Handles Roth conversions, SS timing, healthcare costs, and partial retirement scenarios better than anything else.',
  },
  {
    name: 'M1 Finance',
    type: 'Automated investing & brokerage',
    relationship: 'Affiliate — we may earn a commission when you open an account',
    why: 'A solid option for automating a low-cost index portfolio in a taxable account. The "pie" rebalancing system works well for passive bridge account management.',
  },
  {
    name: 'Fidelity',
    type: 'Brokerage & retirement accounts',
    relationship: 'Affiliate — we may earn a commission on referrals',
    why: 'Zero-expense-ratio index funds and excellent IRA options. One of the most widely used and trusted brokerages in the FIRE community.',
  },
  {
    name: 'TurboTax',
    type: 'Tax preparation software',
    relationship: 'Affiliate — we may earn a commission on purchases',
    why: 'Early retirement tax situations — Roth conversions, capital gains, multi-account withdrawals — are genuinely complex. TurboTax Premium handles them well.',
  },
  {
    name: 'Betterment',
    type: 'Robo-advisor & IRA management',
    relationship: 'Affiliate — we may earn a commission when you open an account',
    why: 'Tax-loss harvesting and automated rebalancing are valuable for hands-off taxable account management. Good option for people who don\'t want to manage their own portfolio.',
  },
]

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
              <strong className="text-white">no additional cost to you</strong>. These commissions
              help fund the free tools and content we provide. This disclosure is made in accordance
              with the Federal Trade Commission's guidelines on endorsements and testimonials
              (16 CFR Part 255).
            </p>
          </div>

          <div>
            <h2 className="font-syne font-bold text-[20px] tracking-tight text-white mb-4">
              Our Editorial Standards
            </h2>
            <div className="space-y-4 text-white/60 text-[15px] leading-[1.85]">
              <p>
                Affiliate relationships <strong className="text-white">do not determine</strong> what
                we recommend. Our process for recommending any tool or service:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>We only recommend products we believe are genuinely useful for early retirees</li>
                <li>We do not accept payment to feature or favorably review any product</li>
                <li>We do not guarantee rankings or placement in exchange for compensation</li>
                <li>If we stop believing a product is worth recommending, we remove it — regardless of commission rates</li>
              </ul>
              <p>
                That said: we are not unbiased. A financial incentive exists on every affiliate link.
                Read our recommendations critically, do your own research, and make decisions based
                on your specific situation — not our endorsements.
              </p>
            </div>
          </div>

          <div>
            <h2 className="font-syne font-bold text-[20px] tracking-tight text-white mb-6">
              Current Affiliate Partners
            </h2>
            <div className="space-y-4">
              {partners.map((p) => (
                <div key={p.name} className="bg-ink border border-white/[0.07] rounded-xl p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="font-syne font-semibold text-[15px] text-white mb-1">{p.name}</div>
                      <div className="font-mono text-[9px] tracking-widest uppercase text-white/30">{p.type}</div>
                    </div>
                    <span className="font-mono text-[9px] tracking-wide bg-gold/10 text-gold border border-gold/25 px-2.5 py-1 rounded whitespace-nowrap">
                      Affiliate
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="font-mono text-[9px] tracking-widest uppercase text-white/25 block mb-1">Relationship</span>
                      <p className="text-[13px] text-white/50 leading-relaxed">{p.relationship}</p>
                    </div>
                    <div>
                      <span className="font-mono text-[9px] tracking-widest uppercase text-white/25 block mb-1">Why We Recommend It</span>
                      <p className="text-[13px] text-white/50 leading-relaxed">{p.why}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-syne font-bold text-[20px] tracking-tight text-white mb-4">
              How to Identify Affiliate Links
            </h2>
            <p className="text-white/60 text-[15px] leading-[1.85]">
              Affiliate links on this Site are marked with <code className="font-mono text-[12px] bg-white/[0.06] px-1.5 py-0.5 rounded border border-white/10">rel="sponsored"</code> in
              the HTML and carry UTM parameters identifying them as affiliate traffic.
              The "Tools We Actually Use" section of our homepage contains affiliate links.
              Individual blog posts may also contain affiliate links, which are noted within
              the post content.
            </p>
          </div>

          <div>
            <h2 className="font-syne font-bold text-[20px] tracking-tight text-white mb-4">
              No Sponsored Content
            </h2>
            <p className="text-white/60 text-[15px] leading-[1.85]">
              We do not publish sponsored posts, paid reviews, or advertiser-directed content.
              Companies cannot pay to be featured in our articles or guides. All editorial
              content — including this disclosures page — is written independently.
            </p>
          </div>

          <div>
            <h2 className="font-syne font-bold text-[20px] tracking-tight text-white mb-4">
              Questions
            </h2>
            <p className="text-white/60 text-[15px] leading-[1.85]">
              If you have questions about our affiliate relationships or editorial standards,
              contact us at{' '}
              <a href={`mailto:${EMAIL}`} className="text-gold underline">{EMAIL}</a>.
              We're happy to clarify any relationship or explain why we do or don't recommend
              a particular product.
            </p>
          </div>

          <div className="border-t border-white/[0.07] pt-8 flex flex-wrap gap-5">
            <Link href="/privacy" className="font-mono text-[11px] text-gold hover:opacity-75 transition-opacity">Privacy Policy →</Link>
            <Link href="/terms" className="font-mono text-[11px] text-gold hover:opacity-75 transition-opacity">Terms of Use →</Link>
          </div>

        </div>
      </div>
    </div>
  )
}

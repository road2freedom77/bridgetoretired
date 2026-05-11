import type { Metadata } from 'next'
import Link from 'next/link'
import ACASubsidyEstimator from '@/components/ACASubsidyEstimator'

export const metadata: Metadata = {
  title: 'ACA Health Insurance Cost Estimator 2026 | BridgeToRetired',
  description: 'Estimate your ACA Marketplace health insurance premium and subsidy eligibility for 2026. See how income affects your monthly cost and the 400% FPL subsidy cliff.',
  alternates: { canonical: 'https://bridgetoretired.com/tools/aca-subsidy-estimator' },
}

export default function ACASubsidyEstimatorPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-navy border-b border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-5 pt-12 pb-10">
          <Link href="/tools" className="font-mono text-[10px] tracking-widest uppercase text-white/30 hover:text-gold transition-colors flex items-center gap-2 mb-6">
            ← All Tools
          </Link>
          <div className="font-mono text-[9px] tracking-widest uppercase text-gold mb-3">Healthcare Planning</div>
          <h1 className="font-syne font-bold text-[clamp(26px,4vw,46px)] tracking-tight text-white leading-tight mb-3">
            ACA Health Insurance Cost Estimator
          </h1>
          <p className="text-white/50 text-[15px] leading-relaxed max-w-xl">
            Estimate your 2026 Marketplace health insurance premium and subsidy based on income, age, and household size. See how income management affects your monthly cost.
          </p>
        </div>
      </div>

      {/* Calculator */}
      <div className="max-w-4xl mx-auto px-5 py-12">
        <ACASubsidyEstimator />

        {/* SEO content */}
        <div className="mt-8 max-w-3xl">
          <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-4">
            Health Insurance Before Medicare: The Early Retiree's Biggest Cost
          </h2>
          <div className="space-y-4 text-white/55 text-[14px] leading-[1.8] mb-8">
            <p>
              For early retirees, healthcare is often the largest and most unpredictable line item in the budget. Medicare doesn't start until age 65, which means a 50-year-old retiree needs 15 years of private coverage — and a 55-year-old still needs 10 years. The Affordable Care Act Marketplace is the primary option for most early retirees who lose employer-sponsored coverage.
            </p>
            <p>
              ACA premiums vary significantly based on income, age, household size, and location. The federal government provides premium tax credits (subsidies) to households between 100% and 400% of the Federal Poverty Level (FPL). Above 400% FPL, subsidies drop to zero — this is known as the subsidy cliff, and it has major implications for early retirement income planning.
            </p>
            <p>
              Note: Enhanced subsidies that temporarily extended above 400% FPL under the American Rescue Plan Act (ARPA) expired in January 2026. The calculator above reflects current 2026 pre-ARPA rules.
            </p>
          </div>

          <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-4">
            The 400% FPL Subsidy Cliff Explained
          </h2>
          <div className="space-y-4 text-white/55 text-[14px] leading-[1.8] mb-8">
            <p>
              The subsidy cliff is one of the most important concepts in early retirement healthcare planning. At exactly 400% of the Federal Poverty Level, your ACA subsidy drops to zero. One dollar over the threshold costs you the entire subsidy — which can be thousands of dollars per year.
            </p>
            <p>
              For a single person in 2026, 400% FPL is roughly $62,600. For a couple, it's about $84,600. If your Modified Adjusted Gross Income (MAGI) exceeds these thresholds, you pay the full unsubsidized premium.
            </p>
            <p>
              This creates a powerful incentive to manage retirement income carefully. Early retirees have significant flexibility: drawing from Roth accounts doesn't count as MAGI, qualified dividends and long-term capital gains at low income levels may be taxed at 0%, and timing of Roth conversions can be managed to stay below the cliff.
            </p>
            <p>
              See the full <Link href="/blog/health-insurance-before-medicare" className="text-gold hover:text-gold/80 transition-colors">health insurance before Medicare guide</Link> for a complete breakdown of ACA strategies for early retirees.
            </p>
          </div>

          <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-4">
            How ACA Subsidies Affect Your Bridge Strategy
          </h2>
          <div className="space-y-4 text-white/55 text-[14px] leading-[1.8] mb-8">
            <p>
              Healthcare costs must be included in your taxable brokerage bridge calculation. A couple retiring at 55 without subsidies could easily pay $24,000-$36,000 per year in premiums alone — before out-of-pocket costs. Over 10 years until Medicare, that's $240,000-$360,000 in healthcare spending that needs to be funded.
            </p>
            <p>
              With income management to stay below 400% FPL, those same 10 years might cost $60,000-$120,000 in premiums — a difference of $180,000 or more. That's a meaningful amount of additional portfolio required if you don't plan around the subsidy cliff.
            </p>
            <p>
              Use the <Link href="/tools/bridge-strategy-calculator" className="text-gold hover:text-gold/80 transition-colors">Bridge Strategy Calculator</Link> to model your full withdrawal plan, and use this tool to estimate the healthcare cost that needs to be built into your annual spending figure.
            </p>
          </div>

          <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-4">
            Frequently Asked Questions
          </h2>
          <div className="space-y-5 mb-10">
            {[
              {
                q: 'What counts as MAGI for ACA subsidy purposes?',
                a: 'MAGI for ACA includes wages, self-employment income, Social Security benefits (85% if above thresholds), taxable interest, dividends, capital gains, IRA and 401(k) withdrawals, and Roth conversions. Roth contributions and qualified Roth distributions do NOT count as MAGI.'
              },
              {
                q: 'What is the Federal Poverty Level (FPL)?',
                a: 'The FPL is an income threshold set annually by the federal government. ACA subsidies are calculated as a percentage of FPL. In 2026, 100% FPL is roughly $15,650 for a single person and $21,150 for a household of two. Subsidies phase out at 400% FPL.'
              },
              {
                q: 'Does Roth IRA withdrawal affect ACA subsidies?',
                a: 'Qualified Roth IRA distributions (from accounts at least 5 years old, owner at least 59½) are not included in MAGI and do not affect subsidy eligibility. This makes Roth accounts an important tool for managing income in early retirement to stay below subsidy thresholds.'
              },
              {
                q: 'What is the subsidy cliff and how do I avoid it?',
                a: 'The subsidy cliff is the point at 400% FPL where all subsidies disappear. Strategies to stay below: draw from Roth accounts instead of traditional IRA/401(k), realize long-term capital gains at the 0% rate in lower-income years, time Roth conversions carefully, and consider charitable giving to reduce MAGI.'
              },
              {
                q: 'How much are ACA premiums for someone age 55 in early retirement?',
                a: 'At age 55, the unsubsidized benchmark silver plan premium is roughly $800-$950/month for a single person and $1,600-$1,900/month for a couple, depending on location. With subsidies at 250-350% FPL, that can drop to $200-$400/month per person. The calculator above gives a personalized estimate.'
              },
              {
                q: 'What happens to ACA coverage when I turn 65?',
                a: 'At 65 you become eligible for Medicare Part A (hospital) and Part B (medical). Most people enroll at 65 and transition from ACA Marketplace coverage to Medicare. You cannot receive ACA subsidies if you are enrolled in or eligible for Medicare.'
              },
            ].map(({ q, a }) => (
              <div key={q} className="border-b border-white/[0.06] pb-5">
                <h3 className="font-syne font-semibold text-[15px] text-white mb-2">{q}</h3>
                <p className="text-white/50 text-[13px] leading-relaxed">{a}</p>
              </div>
            ))}
          </div>

          {/* Related tools */}
          <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-4">Related Tools & Guides</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { href: '/tools/bridge-strategy-calculator',               label: 'Bridge Strategy Calculator' },
              { href: '/tools/withdrawal-order-optimizer',               label: 'Withdrawal Order Optimizer' },
              { href: '/blog/health-insurance-before-medicare',          label: 'Health Insurance Before Medicare' },
              { href: '/blog/how-much-taxable-brokerage-to-retire-early', label: 'How Much Taxable Do I Need?' },
              { href: '/blog/can-i-retire-at-55-with-750k',             label: 'Can I Retire at 55 With $750K?' },
              { href: '/blog/zero-tax-early-retirement',                label: 'Zero Tax Early Retirement' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 bg-ink border border-white/[0.07] rounded-lg px-4 py-3 hover:border-gold/20 transition-colors group"
              >
                <span className="font-mono text-[11px] text-white/50 group-hover:text-gold/80 transition-colors">{label} →</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
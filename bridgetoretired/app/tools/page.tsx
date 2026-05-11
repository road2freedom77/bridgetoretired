import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Early Retirement Calculators & Tools | BridgeToRetired',
  description: 'Free calculators and planning tools for early retirement. Model your bridge strategy, calculate 72(t) SEPP payments, optimize withdrawal order, and more.',
  alternates: { canonical: 'https://bridgetoretired.com/tools' },
}

const tools = [
  {
    slug:        'bridge-strategy-calculator',
    title:       'Bridge Strategy Calculator',
    description: 'Model your year-by-year withdrawal plan from retirement to age 90. See exactly how taxable, 401(k), and Roth accounts work together across the bridge years.',
    tag:         'Most Popular',
    tagColor:    'gold',
    icon:        '🌉',
    free:        'Full year-by-year plan',
    pro:         'Bridge Risk Score + scenario save',
  },
  {
    slug:        '72t-sepp-calculator',
    title:       '72(t) SEPP Calculator',
    description: 'Calculate penalty-free early distributions from your IRA or 401(k) using all three IRS-approved methods: RMD, Fixed Amortization, and Fixed Annuitization.',
    tag:         'High Demand',
    tagColor:    'teal',
    icon:        '📊',
    free:        'Annual payment amount',
    pro:         'All 3 methods compared + 5-yr schedule',
  },
  {
    slug:        'hourly-to-annual-salary-calculator',
    title:       'Hourly to Annual Salary Calculator',
    description: 'Convert your hourly wage to an annual salary and see what it means for your early retirement timeline. Includes FIRE number estimate and years-to-retirement projection.',
    tag:         'New',
    tagColor:    'teal',
    icon:        '💰',
    free:        'Full salary breakdown + FIRE estimate',
    pro:         null,
  },
  {
    slug:        'roth-conversion-ladder-calculator',
    title:       'Roth Conversion Ladder',
    description: 'Plan your Roth conversion strategy to minimize taxes and build penalty-free access before 59½. See the optimal conversion amounts by year.',
    tag:         null,
    tagColor:    null,
    icon:        '🪜',
    free:        'Single-year conversion preview',
    pro:         'Full multi-year ladder + tax optimization',
  },
  {
    slug:        'fire-number-calculator',
    title:       'FIRE Number Calculator',
    description: 'Calculate exactly how much you need to retire early using the 4% rule, 3.5% rule, and Coast FIRE variants. Includes inflation adjustments.',
    tag:         null,
    tagColor:    null,
    icon:        '🔥',
    free:        'Your FIRE number',
    pro:         'Coast FIRE + trajectory chart',
  },
  {
    slug:        'aca-subsidy-estimator',
    title:       'ACA Subsidy Estimator',
    description: 'Estimate your Marketplace health insurance premium and subsidy eligibility based on income, household size, and state. Essential for early retirement healthcare planning.',
    tag:         null,
    tagColor:    null,
    icon:        '🏥',
    free:        'Premium + subsidy estimate',
    pro:         'MAGI optimization strategy',
  },
  {
    slug:        'withdrawal-order-optimizer',
    title:       'Withdrawal Order Optimizer',
    description: 'Find the tax-optimal order to draw from taxable, Roth, and traditional accounts in retirement. Minimize lifetime taxes across your entire retirement horizon.',
    tag:         null,
    tagColor:    null,
    icon:        '📋',
    free:        'Recommended draw order',
    pro:         'Year-by-year tax-optimized plan',
  },
  {
    slug:        'social-security-calculator',
    title:       'Social Security Timing Calculator',
    description: 'Compare claiming Social Security at 62, 67, or 70. See the break-even age, lifetime benefit totals, and how timing affects your portfolio withdrawal rate.',
    tag:         null,
    tagColor:    null,
    icon:        '🏛️',
    free:        '62 vs 67 vs 70 comparison',
    pro:         'Break-even analysis + spousal strategy',
  },
  {
    slug:        'sequence-of-returns-simulator',
    title:       'Sequence of Returns Simulator',
    description: 'See how bad early market returns can permanently damage your retirement — and test strategies to protect against sequence risk during the bridge years.',
    tag:         null,
    tagColor:    null,
    icon:        '📉',
    free:        'Single scenario simulation',
    pro:         'Monte Carlo stress test',
  },
]

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-navy border-b border-white/[0.06] py-16 px-5">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.24em] uppercase text-gold mb-4">
            <span className="block w-6 h-px bg-gold" />
            Free Tools
          </div>
          <h1 className="font-syne font-bold text-[clamp(32px,4vw,54px)] tracking-tight text-white mb-3">
            Early Retirement Calculators
          </h1>
          <p className="text-white/50 text-[15px] max-w-xl leading-relaxed">
            Free calculators and planning tools for people building a bridge to early retirement. No account required.
          </p>
        </div>
      </div>

      {/* Tools grid */}
      <div className="max-w-7xl mx-auto px-5 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tools.map(tool => (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className="group bg-ink border border-white/[0.07] rounded-xl overflow-hidden hover:border-gold/20 hover:-translate-y-1 transition-all duration-300 flex flex-col"
            >
              {/* Icon area */}
              <div className="h-28 bg-slate flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(232,184,75,0.07),transparent)]" />
                <span className="text-4xl relative z-10">{tool.icon}</span>
                {tool.tag && (
                  <div className={`absolute top-3 right-3 font-mono text-[8px] tracking-widest uppercase px-2 py-1 rounded border ${
                    tool.tagColor === 'gold'
                      ? 'text-gold bg-gold/10 border-gold/25'
                      : 'text-teal bg-teal/10 border-teal/25'
                  }`}>
                    {tool.tag}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5 pb-6 flex flex-col flex-1">
                <h2 className="font-syne font-semibold text-[15px] tracking-tight text-white mb-2 leading-snug group-hover:text-gold/90 transition-colors">
                  {tool.title}
                </h2>
                <p className="text-white/45 text-[12px] leading-[1.7] mb-4 flex-1">
                  {tool.description}
                </p>

                {/* Free/Pro split */}
                <div className="space-y-1.5 mt-auto">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[8px] tracking-widest uppercase text-sage/70 bg-sage/10 border border-sage/20 px-1.5 py-0.5 rounded">Free</span>
                    <span className="font-mono text-[10px] text-white/35">{tool.free}</span>
                  </div>
                  {tool.pro && (
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[8px] tracking-widest uppercase text-gold/70 bg-gold/10 border border-gold/20 px-1.5 py-0.5 rounded">Pro</span>
                      <span className="font-mono text-[10px] text-white/35">{tool.pro}</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 bg-ink border border-white/[0.07] rounded-xl p-8 text-center">
          <div className="font-mono text-[9px] tracking-widest uppercase text-gold mb-3">Pro Access</div>
          <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-3">
            Unlock the full planning suite
          </h2>
          <p className="text-white/45 text-[14px] leading-relaxed max-w-lg mx-auto mb-6">
            Get your Bridge Risk Score, save scenarios, compare strategies side-by-side, and access the complete year-by-year plan across every tool.
          </p>
          <Link
            href="/pricing"
            className="inline-block bg-gold text-black font-syne font-semibold text-[13px] tracking-wide px-8 py-3 rounded hover:opacity-85 transition-opacity"
          >
            See Pro Plans →
          </Link>
        </div>
      </div>
    </div>
  )
}
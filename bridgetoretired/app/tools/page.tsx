import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Early Retirement Calculators & Tools | BridgeToRetired',
  description: 'Free calculators and planning tools for early retirement. Model your bridge strategy, calculate 72(t) SEPP payments, optimize withdrawal order, and more.',
  alternates: { canonical: 'https://bridgetoretired.com/tools' },
}

const startHere = [
  {
    step:        1,
    slug:        'fire-number-calculator',
    title:       'Find Your FIRE Number',
    description: 'Start here. Calculate exactly how much you need — with bridge years, healthcare, and Social Security built in. Goes beyond the simple 25x rule.',
    icon:        '🔥',
    outcome:     'Your real target number',
  },
  {
    step:        2,
    slug:        'bridge-strategy-calculator',
    title:       'Model Your Bridge Plan',
    description: 'See how your taxable, 401(k), and Roth accounts work together year-by-year from retirement to age 90. Find out if your bridge is funded.',
    icon:        '🌉',
    outcome:     'Year-by-year withdrawal plan',
  },
  {
    step:        3,
    slug:        'withdrawal-order-optimizer',
    title:       'Optimize Withdrawal Order',
    description: 'Find the tax-optimal sequence for drawing from each account. See how the wrong order can cost hundreds of thousands over a lifetime.',
    icon:        '📋',
    outcome:     'Lifetime tax savings',
  },
]

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
    category:    'bridge',
  },
  {
    slug:        'fire-number-calculator',
    title:       'FIRE Number Calculator',
    description: 'Calculate exactly how much you need to retire early. Includes bridge years, healthcare costs, Social Security, and a sequence risk buffer beyond the simple 4% rule.',
    tag:         'Start Here',
    tagColor:    'gold',
    icon:        '🔥',
    free:        'Your real FIRE number',
    pro:         null,
    category:    'bridge',
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
    category:    'tax',
  },
  {
    slug:        'roth-conversion-ladder-calculator',
    title:       'Roth Conversion Ladder',
    description: 'Plan your Roth conversion strategy to minimize taxes and build penalty-free access before 59½. See the unlock schedule and tax cost by year.',
    tag:         null,
    tagColor:    null,
    icon:        '🪜',
    free:        'Conversion schedule + tax cost',
    pro:         'Full multi-year ladder + tax optimization',
    category:    'tax',
  },
  {
    slug:        '72t-sepp-calculator',
    title:       '72(t) SEPP Calculator',
    description: 'Calculate penalty-free early distributions from your IRA or 401(k) using all three IRS-approved methods. See the modification risk and full payment schedule.',
    tag:         'High Demand',
    tagColor:    'teal',
    icon:        '📊',
    free:        'Annual payment amount',
    pro:         'All 3 methods compared + 5-yr schedule',
    category:    'access',
  },
  {
    slug:        'aca-subsidy-estimator',
    title:       'ACA Subsidy Estimator',
    description: 'Estimate your 2026 Marketplace health insurance premium and subsidy eligibility. See exactly how income affects your monthly cost and the 400% FPL cliff.',
    tag:         null,
    tagColor:    null,
    icon:        '🏥',
    free:        'Premium + subsidy estimate',
    pro:         'MAGI optimization strategy',
    category:    'healthcare',
  },
  {
    slug:        'social-security-calculator',
    title:       'Social Security Timing Calculator',
    description: 'Compare claiming Social Security at 62, 67, or 70. See the break-even age, lifetime benefit totals, and how timing affects your portfolio longevity.',
    tag:         null,
    tagColor:    null,
    icon:        '🏛️',
    free:        '62 vs 67 vs 70 comparison',
    pro:         'Break-even analysis + spousal strategy',
    category:    'income',
  },
  {
    slug:        'sequence-of-returns-simulator',
    title:       'Sequence of Returns Simulator',
    description: 'See how a market crash in year one destroys portfolios that a crash in year twenty would survive. Model the timing risk that threatens early retirement most.',
    tag:         null,
    tagColor:    null,
    icon:        '📉',
    free:        'Single scenario simulation',
    pro:         'Monte Carlo stress test',
    category:    'risk',
  },
  {
    slug:        'hourly-to-annual-salary-calculator',
    title:       'Hourly to Annual Salary Calculator',
    description: 'Convert your hourly wage to an annual salary and see what it means for your early retirement timeline. Includes FIRE estimate and years-to-retirement projection.',
    tag:         'New',
    tagColor:    'teal',
    icon:        '💰',
    free:        'Full salary breakdown + FIRE estimate',
    pro:         null,
    category:    'planning',
  },
  {
  slug:        '72t-vs-roth-ladder',
  title:       '72(t) vs Roth Ladder Comparison',
  description: 'Compare 72(t) SEPP and the Roth conversion ladder side by side. Model income, tax cost, flexibility, and gap risk to find the right strategy for your situation.',
  tag:         null,
  tagColor:    null,
  icon:        '⚖️',
  free:        'Head-to-head summary',
  pro:         'Full year-by-year comparison + verdict',
  category:    'access',
},
{
  slug:        'coast-fire-calculator',
  title:       'CoastFIRE Calculator',
  description: 'Find how much you need saved today so compounding alone reaches your FIRE number. See exactly when you can stop contributing and coast to retirement.',
  tag:         'New',
  tagColor:    'teal',
  icon:        '🏄',
  free:        'CoastFIRE number + growth chart',
  pro:         null,
  category:    'planning',
},
{
  slug:        'bridge-health-check',
  title:       'Bridge Health Check',
  description: 'Is your early retirement bridge funded? Get an instant score — Stable, Moderate Risk, or Fragile — with your biggest weakness and how to fix it.',
  tag:         'New',
  tagColor:    'teal',
  icon:        '🏥',
  free:        'Bridge Health Score + biggest weakness',
  pro:         'All risk factors + prioritized fix plan',
  category:    'bridge',
},
{
  slug:        'early-retirement-age-calculator',
  title:       'Early Retirement Age Calculator',
  description: 'Find your earliest possible retirement age based on your current portfolio, contributions, and spending. See your FIRE number and bridge requirements instantly.',
  tag:         'New',
  tagColor:    'teal',
  icon:        '🎯',
  free:        'Retirement age + FIRE number',
  pro:         null,
  category:    'bridge',
},
]

const categories = [
  { id: 'bridge',    label: 'Bridge Planning',   color: 'gold' },
  { id: 'tax',      label: 'Tax Strategy',       color: 'teal' },
  { id: 'access',   label: 'Account Access',     color: 'purple' },
  { id: 'healthcare', label: 'Healthcare',        color: 'orange' },
  { id: 'income',   label: 'Income Planning',    color: 'sage' },
  { id: 'risk',     label: 'Risk Management',    color: 'red' },
  { id: 'planning', label: 'General Planning',   color: 'blue' },
]

const categoryColorMap: Record<string, string> = {
  gold:   'text-gold/70 bg-gold/10 border-gold/20',
  teal:   'text-teal/70 bg-teal/10 border-teal/20',
  purple: 'text-purple-400/70 bg-purple-400/10 border-purple-400/20',
  orange: 'text-orange-400/70 bg-orange-400/10 border-orange-400/20',
  sage:   'text-sage/70 bg-sage/10 border-sage/20',
  red:    'text-red-400/70 bg-red-400/10 border-red-400/20',
  blue:   'text-blue-400/70 bg-blue-400/10 border-blue-400/20',
}

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

      <div className="max-w-7xl mx-auto px-5 py-16">

        {/* Start Here */}
        <div className="mb-16">
          <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.24em] uppercase text-white/30 mb-2">
            <span className="block w-4 h-px bg-white/20" />
            Recommended Order
          </div>
          <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-2">
            Start Here
          </h2>
          <p className="text-white/40 text-[13px] mb-8">
            New to BridgeToRetired? Run these three tools in order for a complete picture of your early retirement plan.
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {startHere.map(({ step, slug, title, description, icon, outcome }) => (
              <Link
                key={slug}
                href={`/tools/${slug}`}
                className="group relative bg-ink border border-white/[0.07] rounded-xl p-6 hover:border-gold/30 hover:-translate-y-1 transition-all duration-300"
              >
                {/* Step number */}
                <div className="absolute -top-3 left-5 font-mono text-[9px] tracking-widest uppercase bg-gold text-black px-2 py-0.5 rounded font-bold">
                  Step {step}
                </div>
                <div className="text-3xl mb-4 mt-2">{icon}</div>
                <h3 className="font-syne font-bold text-[16px] text-white mb-2 group-hover:text-gold/90 transition-colors">
                  {title}
                </h3>
                <p className="text-white/40 text-[12px] leading-[1.7] mb-4">
                  {description}
                </p>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[8px] tracking-widest uppercase text-sage/70 bg-sage/10 border border-sage/20 px-1.5 py-0.5 rounded">Output</span>
                  <span className="font-mono text-[10px] text-white/35">{outcome}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-10">
          <div className="flex-1 h-px bg-white/[0.06]" />
          <span className="font-mono text-[9px] tracking-widest uppercase text-white/20">All Tools</span>
          <div className="flex-1 h-px bg-white/[0.06]" />
        </div>

        {/* Full tools grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tools.map(tool => {
            const cat = categories.find(c => c.id === tool.category)
            const catColor = cat ? categoryColorMap[cat.color] : categoryColorMap.gold
            return (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="group bg-ink border border-white/[0.07] rounded-xl overflow-hidden hover:border-gold/20 hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                {/* Icon area */}
                <div className="h-24 bg-slate flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(232,184,75,0.07),transparent)]" />
                  <span className="text-3xl relative z-10">{tool.icon}</span>
                  {tool.tag && (
                    <div className={`absolute top-3 right-3 font-mono text-[8px] tracking-widest uppercase px-2 py-1 rounded border ${
                      tool.tagColor === 'gold'
                        ? 'text-gold bg-gold/10 border-gold/25'
                        : 'text-teal bg-teal/10 border-teal/25'
                    }`}>
                      {tool.tag}
                    </div>
                  )}
                  {cat && (
                    <div className={`absolute bottom-3 left-3 font-mono text-[7px] tracking-widest uppercase px-1.5 py-0.5 rounded border ${catColor}`}>
                      {cat.label}
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
            )
          })}
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
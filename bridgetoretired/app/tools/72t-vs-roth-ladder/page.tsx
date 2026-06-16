import type { Metadata } from 'next'
import Link from 'next/link'
import VsComparisonTool from '@/components/calculators/VsComparisonTool'

export const metadata: Metadata = {
  title: '72(t) SEPP vs Roth Conversion Ladder | BridgeToRetired',
  description: 'Compare 72(t) SEPP and the Roth conversion ladder side by side. Model income, tax cost, flexibility, and gap risk for your early retirement situation.',
  alternates: { canonical: 'https://bridgetoretired.com/tools/72t-vs-roth-ladder' },
}

export default function VsPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="bg-navy border-b border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-5 pt-12 pb-10">
          <Link href="/tools" className="font-mono text-[10px] tracking-widest uppercase text-white/30 hover:text-gold transition-colors flex items-center gap-2 mb-6">
            ← All Tools
          </Link>
          <div className="font-mono text-[9px] tracking-widest uppercase text-gold mb-3">Strategy Comparison · Pro</div>
          <h1 className="font-syne font-bold text-[clamp(26px,4vw,46px)] tracking-tight text-white leading-tight mb-3">
            72(t) SEPP vs Roth Conversion Ladder
          </h1>
          <p className="text-white/50 text-[15px] leading-relaxed max-w-xl">
            Both strategies unlock IRA funds before 59½ — but they work very differently. Model your
            numbers side by side and see which approach wins on income, tax efficiency, and flexibility.
          </p>
          <div className="flex flex-wrap gap-3 mt-5">
            <Link href="/tools/72t-sepp-calculator"
              className="font-mono text-[10px] tracking-widest uppercase text-gold/60 border border-gold/20 px-3 py-1.5 rounded hover:text-gold transition-colors">
              72(t) Calculator →
            </Link>
            <Link href="/tools/roth-conversion-ladder-calculator"
              className="font-mono text-[10px] tracking-widest uppercase text-white/30 border border-white/[0.08] px-3 py-1.5 rounded hover:text-white/60 transition-colors">
              Roth Ladder Calculator →
            </Link>
          </div>
        </div>
      </div>

      <VsComparisonTool />

      <div className="max-w-4xl mx-auto px-5 pb-16">
        <div className="max-w-3xl">

          <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-4">
            72(t) vs Roth Ladder: The Core Difference
          </h2>
          <div className="space-y-4 text-white/55 text-[14px] leading-[1.8] mb-8">
            <p>
              Both the 72(t) SEPP and the Roth conversion ladder solve the same problem — getting money
              out of a traditional IRA or 401(k) before age 59½ without the 10% early withdrawal penalty.
              But they solve it in fundamentally different ways with very different tradeoffs.
            </p>
            <p>
              The 72(t) SEPP gives you income immediately. You calculate a fixed payment using one of three
              IRS methods and take that same amount every year until the lock-in period ends — the longer
              of five years or age 59½. The penalty exemption applies the moment you start. The cost is
              rigidity: change anything before the lock-in ends and the IRS retroactively applies the 10%
              penalty to every prior distribution plus interest.
            </p>
            <p>
              The Roth conversion ladder gives you flexibility but requires patience. You convert
              traditional IRA funds to Roth each year, paying ordinary income tax at conversion. Each
              conversion must season for five years before the principal can be withdrawn penalty-free.
              You need taxable savings to fund years one through five while the ladder seasons.
            </p>
          </div>

          <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-4">
            When 72(t) SEPP Is the Better Choice
          </h2>
          <div className="space-y-4 text-white/55 text-[14px] leading-[1.8] mb-8">
            <p>
              72(t) makes more sense when you have little or no taxable brokerage savings to fund a
              five-year gap, you need income to start immediately, your spending is stable and predictable
              enough to commit to a fixed payment for 5+ years, and you are comfortable with the
              modification risk.
            </p>
            <p>
              It also works well for people who are older — starting at 57 or 58 means the lock-in is only
              about two to three years past 59½, which limits the rigidity window significantly. Younger
              early retirees face a much longer lock-in commitment.
            </p>
          </div>

          <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-4">
            When the Roth Ladder Is the Better Choice
          </h2>
          <div className="space-y-4 text-white/55 text-[14px] leading-[1.8] mb-8">
            <p>
              The Roth ladder wins when you have enough taxable savings to fund the five-year gap,
              you want flexibility to adjust conversion amounts based on income, market conditions, or
              ACA subsidy optimization, and you are planning for long-term tax efficiency — money that
              reaches Roth grows and withdraws completely tax-free for the rest of your life.
            </p>
            <p>
              It is also better for people retiring very early — at 40 or 45 — where a 72(t) lock-in could
              last 15 to 20 years. At that time horizon, the flexibility of the Roth ladder is worth the
              gap funding complexity.
            </p>
          </div>

          <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-4">
            Using Both Strategies Together
          </h2>
          <div className="space-y-4 text-white/55 text-[14px] leading-[1.8] mb-8">
            <p>
              Many early retirees use both in parallel. A common structure: split the IRA into two accounts,
              start a 72(t) SEPP on the smaller portion to generate immediate income, and run a Roth
              conversion ladder on the larger portion. The SEPP covers near-term spending; the ladder
              builds a growing tax-free base for post-59½ withdrawals.
            </p>
            <p>
              This approach requires careful IRS coordination — the SEPP account must be kept separate and
              untouched beyond the fixed payments. But it solves the gap problem without requiring a large
              taxable brokerage balance.
            </p>
            <p>
              See the <Link href="/tools/72t-sepp-calculator" className="text-gold hover:text-gold/80 transition-colors">
              72(t) SEPP Calculator</Link> and the <Link href="/tools/roth-conversion-ladder-calculator"
              className="text-gold hover:text-gold/80 transition-colors">Roth Conversion Ladder Calculator</Link> for
              detailed modeling of each strategy individually.
            </p>
          </div>

          <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-4">
            Related Tools & Guides
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { href: '/tools/72t-sepp-calculator',                       label: '72(t) SEPP Calculator' },
              { href: '/tools/roth-conversion-ladder-calculator',          label: 'Roth Conversion Ladder Calculator' },
              { href: '/tools/bridge-strategy-calculator',                 label: 'Bridge Strategy Calculator' },
              { href: '/blog/roth-ladder-vs-72t',                         label: 'Roth Ladder vs 72(t) Guide' },
              { href: '/blog/rule-72t-sepp-guide',                        label: 'Rule 72(t) SEPP Guide' },
              { href: '/blog/roth-conversion-ladder-guide',               label: 'Roth Conversion Ladder Guide' },
            ].map(({ href, label }) => (
              <Link key={href} href={href}
                className="flex items-center gap-3 bg-ink border border-white/[0.07] rounded-lg px-4 py-3 hover:border-gold/20 transition-colors group">
                <span className="font-mono text-[11px] text-white/50 group-hover:text-gold/80 transition-colors">
                  {label} →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
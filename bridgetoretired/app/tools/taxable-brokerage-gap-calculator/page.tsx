import type { Metadata } from 'next'
import Link from 'next/link'
import TaxableBrokerageGapCalculator from '@/components/calculators/TaxableBrokerageGapCalculator'

export const metadata: Metadata = {
  title: 'Taxable Brokerage Gap Calculator — How Much Do I Need Before 59½? | BridgeToRetired',
  description: 'Calculate exactly how much you need in your taxable brokerage account to fund early retirement before 59½. See your bridge gap and how to close it.',
  alternates: { canonical: 'https://bridgetoretired.com/tools/taxable-brokerage-gap-calculator' },
}

export default function TaxableBrokerageGapPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="bg-navy border-b border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-5 pt-12 pb-10">
          <Link href="/tools" className="font-mono text-[10px] tracking-widest uppercase text-white/30 hover:text-gold transition-colors flex items-center gap-2 mb-6">
            ← All Tools
          </Link>
          <div className="font-mono text-[9px] tracking-widest uppercase text-gold mb-3">Bridge Planning</div>
          <h1 className="font-syne font-bold text-[clamp(26px,4vw,46px)] tracking-tight text-white leading-tight mb-3">
            How Much Taxable Do I Need?
          </h1>
          <p className="text-white/50 text-[15px] leading-relaxed max-w-xl">
            Calculate exactly how much you need in your taxable brokerage account to fund the gap between your retirement date and age 59½ — when your IRA and 401k become fully accessible.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 py-12">
        <TaxableBrokerageGapCalculator />

        <div className="max-w-3xl mt-8">
          <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-4">
            Why the Taxable Account Is the Key to Early Retirement
          </h2>
          <div className="space-y-4 text-white/55 text-[14px] leading-[1.8] mb-8">
            <p>
              Most retirement savers keep the majority of their wealth in tax-deferred accounts — 401(k)s and IRAs. These accounts come with a significant restriction: withdraw before age 59½ and you owe a 10% early withdrawal penalty on top of ordinary income tax.
            </p>
            <p>
              For early retirees, this creates the bridge problem. If you retire at 52, you have 7.5 years before your retirement accounts become fully accessible. You need another source of income to cover those years — and the taxable brokerage account is the cleanest solution. No contribution limits, no withdrawal restrictions, no penalty of any kind.
            </p>
            <p>
              This calculator tells you exactly how large that taxable account needs to be, accounting for your Roth contributions (also penalty-free), any part-time income during the bridge years, and a 15% buffer for market volatility and unexpected expenses.
            </p>
          </div>

          <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-4">
            What If My Taxable Account Falls Short?
          </h2>
          <div className="space-y-4 text-white/55 text-[14px] leading-[1.8] mb-8">
            <p>
              A taxable shortfall doesn't mean you can't retire early — it means you need a plan. The most common solutions are building more taxable savings before retirement, starting a Roth conversion ladder 5 years before your target retirement date, using a 72(t) SEPP arrangement for penalty-free IRA access, or a combination of all three.
            </p>
            <p>
              The Roth conversion ladder is particularly powerful: converting IRA funds to Roth today means those converted amounts become accessible penalty-free in 5 years, effectively extending your bridge without needing more taxable savings. See the <Link href="/tools/roth-conversion-ladder-calculator" className="text-gold hover:text-gold/80 transition-colors">Roth Conversion Ladder Calculator</Link> to model this.
            </p>
          </div>

          <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-4">Related Tools</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { href: '/tools/bridge-health-check',               label: 'Bridge Health Check' },
              { href: '/tools/roth-conversion-ladder-calculator',  label: 'Roth Conversion Ladder' },
              { href: '/tools/72t-sepp-calculator',               label: '72(t) SEPP Calculator' },
              { href: '/tools/withdrawal-order-optimizer',         label: 'Withdrawal Order Optimizer' },
              { href: '/tools/fire-number-calculator',            label: 'FIRE Number Calculator' },
              { href: '/tools/early-retirement-age-calculator',   label: 'Early Retirement Age Calculator' },
            ].map(({ href, label }) => (
              <Link key={href} href={href}
                className="flex items-center gap-3 bg-ink border border-white/[0.07] rounded-lg px-4 py-3 hover:border-gold/20 transition-colors group">
                <span className="font-mono text-[11px] text-white/50 group-hover:text-gold/80 transition-colors">{label} →</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
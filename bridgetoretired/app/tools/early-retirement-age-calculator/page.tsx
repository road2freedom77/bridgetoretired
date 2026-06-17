import type { Metadata } from 'next'
import Link from 'next/link'
import RetirementAgeCalculator from '@/components/calculators/RetirementAgeCalculator'

export const metadata: Metadata = {
  title: 'Early Retirement Age Calculator — When Can I Retire? | BridgeToRetired',
  description: 'Find your earliest possible retirement age based on your current portfolio, savings rate, and spending. See your FIRE number, years remaining, and bridge requirements.',
  alternates: { canonical: 'https://bridgetoretired.com/tools/early-retirement-age-calculator' },
}

export default function RetirementAgePage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="bg-navy border-b border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-5 pt-12 pb-10">
          <Link href="/tools" className="font-mono text-[10px] tracking-widest uppercase text-white/30 hover:text-gold transition-colors flex items-center gap-2 mb-6">
            ← All Tools
          </Link>
          <div className="font-mono text-[9px] tracking-widest uppercase text-gold mb-3">FIRE Planning</div>
          <h1 className="font-syne font-bold text-[clamp(26px,4vw,46px)] tracking-tight text-white leading-tight mb-3">
            When Can I Retire?
          </h1>
          <p className="text-white/50 text-[15px] leading-relaxed max-w-xl">
            Enter your current portfolio, savings rate, and target spending. Get your earliest retirement age, FIRE number, and bridge funding requirement — instantly.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 py-12">
        <RetirementAgeCalculator />

        <div className="max-w-3xl mt-8">
          <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-4">
            How Your Retirement Age Is Calculated
          </h2>
          <div className="space-y-4 text-white/55 text-[14px] leading-[1.8] mb-8">
            <p>
              Your retirement age is the point at which your portfolio grows large enough to fund your retirement spending indefinitely at a safe withdrawal rate. This calculator grows your portfolio year by year at your expected return, adding annual contributions, until it hits your FIRE number.
            </p>
            <p>
              The FIRE number itself adjusts based on how long your retirement will last — retiring at 45 with a 45-year horizon requires a more conservative 3.0% withdrawal rate than retiring at 60 with a 30-year horizon. The 4% rule was designed for 30-year retirements; early retirees need a lower rate to account for the longer time horizon.
            </p>
          </div>

          <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-4">
            What Happens After You Hit Your Number
          </h2>
          <div className="space-y-4 text-white/55 text-[14px] leading-[1.8] mb-8">
            <p>
              Knowing your retirement age is just step one. If you're retiring before 59½, you need a plan for accessing your money without penalties — most people have the majority of their savings in 401(k)s and IRAs with early withdrawal restrictions. The bridge years between your retirement date and 59½ require a separate funding strategy.
            </p>
            <p>
              Use the <Link href="/tools/bridge-health-check" className="text-gold hover:text-gold/80 transition-colors">Bridge Health Check</Link> to score your current setup, or the <Link href="/tools/bridge-strategy-calculator" className="text-gold hover:text-gold/80 transition-colors">Bridge Strategy Calculator</Link> to model your full year-by-year withdrawal plan.
            </p>
          </div>

          <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-4">Related Tools</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { href: '/tools/bridge-health-check',               label: 'Bridge Health Check' },
              { href: '/tools/fire-number-calculator',            label: 'FIRE Number Calculator' },
              { href: '/tools/bridge-strategy-calculator',        label: 'Bridge Strategy Calculator' },
              { href: '/tools/coast-fire-calculator',             label: 'CoastFIRE Calculator' },
              { href: '/tools/roth-conversion-ladder-calculator', label: 'Roth Conversion Ladder' },
              { href: '/tools/72t-sepp-calculator',               label: '72(t) SEPP Calculator' },
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
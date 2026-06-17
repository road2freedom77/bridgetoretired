import type { Metadata } from 'next'
import Link from 'next/link'
import BridgeHealthCheck from '@/components/calculators/BridgeHealthCheck'

export const metadata: Metadata = {
  title: 'Bridge Health Check — Is Your Early Retirement Bridge Funded? | BridgeToRetired',
  description: 'Check if your early retirement bridge is Stable, Moderate Risk, or Fragile. Enter your balances and get an instant Bridge Health Score with your biggest weakness and how to fix it.',
  alternates: { canonical: 'https://bridgetoretired.com/tools/bridge-health-check' },
}

export default function BridgeHealthCheckPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="bg-navy border-b border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-5 pt-12 pb-10">
          <Link href="/tools" className="font-mono text-[10px] tracking-widest uppercase text-white/30 hover:text-gold transition-colors flex items-center gap-2 mb-6">
            ← All Tools
          </Link>
          <div className="font-mono text-[9px] tracking-widest uppercase text-gold mb-3">Free Assessment · 60 Seconds</div>
          <h1 className="font-syne font-bold text-[clamp(26px,4vw,46px)] tracking-tight text-white leading-tight mb-3">
            Bridge Health Check
          </h1>
          <p className="text-white/50 text-[15px] leading-relaxed max-w-xl">
            Is your bridge to early retirement actually funded? Enter your balances and get an instant score — Stable, Moderate Risk, or Fragile — plus your biggest weakness and how to fix it.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 py-12">
        <BridgeHealthCheck />

        <div className="max-w-3xl mt-8">
          <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-4">
            What Is a Retirement Bridge?
          </h2>
          <div className="space-y-4 text-white/55 text-[14px] leading-[1.8] mb-8">
            <p>
              The bridge years are the gap between when you stop working and when you can access retirement accounts penalty-free at 59½. Most early retirees have the bulk of their savings in 401(k)s and IRAs — accounts that carry a 10% early withdrawal penalty before 59½. The bridge is the plan for funding your lifestyle during those years without triggering penalties.
            </p>
            <p>
              A well-funded bridge typically uses taxable brokerage accounts (no withdrawal restrictions), Roth IRA contributions (always accessible penalty-free), and in some cases a Roth conversion ladder or 72(t) SEPP arrangement for additional access.
            </p>
            <p>
              The Bridge Health Check scores your current setup across the key dimensions: how much of your bridge years are funded, whether your total portfolio is on track for your FIRE number, and whether you have the right account mix for flexible early access.
            </p>
          </div>

          <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-4">
            How the Score Is Calculated
          </h2>
          <div className="space-y-4 text-white/55 text-[14px] leading-[1.8] mb-8">
            <p>
              The Bridge Health Score (0–100) weighs four factors: bridge funding coverage (40 points), total portfolio vs FIRE number (35 points), account diversification across taxable/Roth/tax-deferred (15 points), and time remaining before retirement (10 points).
            </p>
            <p>
              Scores of 75+ are Stable — your bridge is well-funded and your overall plan is on track. 50–74 is Moderate Risk — meaningful gaps exist but they're fixable. 30–49 is Fragile — significant changes needed before retiring. Below 30 is Critical — retirement at the target age isn't yet viable.
            </p>
          </div>

          <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-4">
            Related Tools
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { href: '/tools/bridge-strategy-calculator',         label: 'Bridge Strategy Calculator' },
              { href: '/tools/fire-number-calculator',             label: 'FIRE Number Calculator' },
              { href: '/tools/roth-conversion-ladder-calculator',  label: 'Roth Conversion Ladder' },
              { href: '/tools/72t-sepp-calculator',                label: '72(t) SEPP Calculator' },
              { href: '/tools/coast-fire-calculator',              label: 'CoastFIRE Calculator' },
              { href: '/tools/72t-vs-roth-ladder',                 label: '72t vs Roth Ladder' },
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
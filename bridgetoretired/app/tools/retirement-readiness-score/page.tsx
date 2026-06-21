import type { Metadata } from 'next'
import Link from 'next/link'
import RetirementReadinessScore from '@/components/calculators/RetirementReadinessScore'

export const metadata: Metadata = {
  title: 'Retirement Readiness Score — Are You Ready to Retire? | BridgeToRetired',
  description: 'Get your personalized retirement readiness score across 5 dimensions: portfolio funding, bridge years, Social Security timing, healthcare, and account diversification.',
  alternates: { canonical: 'https://bridgetoretired.com/tools/retirement-readiness-score' },
}

export default function RetirementReadinessPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="bg-navy border-b border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-5 pt-12 pb-10">
          <Link href="/tools" className="font-mono text-[10px] tracking-widest uppercase text-white/30 hover:text-gold transition-colors flex items-center gap-2 mb-6">
            ← All Tools
          </Link>
          <div className="font-mono text-[9px] tracking-widest uppercase text-gold mb-3">Free Assessment · 5 Dimensions</div>
          <h1 className="font-syne font-bold text-[clamp(26px,4vw,46px)] tracking-tight text-white leading-tight mb-3">
            Retirement Readiness Score
          </h1>
          <p className="text-white/50 text-[15px] leading-relaxed max-w-xl">
            One score across five dimensions — portfolio funding, bridge years, Social Security timing, healthcare, and account mix. See exactly where your retirement plan is strong and where it needs work.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 py-12">
        <RetirementReadinessScore />

        <div className="max-w-3xl mt-8">
          <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-4">
            How the Score Is Calculated
          </h2>
          <div className="space-y-4 text-white/55 text-[14px] leading-[1.8] mb-8">
            <p>
              The Retirement Readiness Score (0–100) measures five dimensions weighted by their impact on retirement outcome. Portfolio vs FIRE Number carries the most weight (30 points) because it determines whether your savings can sustain your lifestyle. Bridge Funding (25 points) addresses the critical early retirement gap before 59½. Social Security timing, healthcare buffer, and account diversification each contribute 15 points.
            </p>
            <p>
              Scores of 85+ are Excellent — your plan is well-funded across all dimensions. 70–84 is Good — solid overall with minor gaps. 55–69 is Fair — meaningful improvements needed in one or two areas. Below 55 indicates significant gaps requiring action before retiring.
            </p>
          </div>

          <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-4">
            How This Differs from Bridge Health Check
          </h2>
          <div className="space-y-4 text-white/55 text-[14px] leading-[1.8] mb-8">
            <p>
              The <Link href="/tools/bridge-health-check" className="text-gold hover:text-gold/80 transition-colors">Bridge Health Check</Link> focuses specifically on the gap years — whether your taxable and Roth accounts can fund the period between retirement and age 59½. The Retirement Readiness Score is broader: it includes the bridge but also scores your Social Security timing strategy, healthcare buffer, total portfolio vs your long-term FIRE number, and account diversification.
            </p>
            <p>
              Use Bridge Health Check for a quick bridge-focused diagnosis. Use Retirement Readiness Score for the complete picture of whether your overall retirement plan is on track.
            </p>
          </div>

          <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-4">Related Tools</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { href: '/tools/bridge-health-check',               label: 'Bridge Health Check' },
              { href: '/tools/fire-number-calculator',            label: 'FIRE Number Calculator' },
              { href: '/tools/taxable-brokerage-gap-calculator',  label: 'Taxable Brokerage Gap Calculator' },
              { href: '/tools/social-security-calculator',        label: 'Social Security Timing Calculator' },
              { href: '/tools/early-retirement-age-calculator',   label: 'Early Retirement Age Calculator' },
              { href: '/tools/bridge-strategy-calculator',        label: 'Bridge Strategy Calculator' },
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
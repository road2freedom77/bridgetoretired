import BridgeRiskScore from '@/components/BridgeRiskScore'
import { ProNav } from '@/components/ProNav'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Bridge Risk Score™ — Is Your Early Retirement Bridge Safe? | BridgeToRetired',
  description: 'Get your Bridge Risk Score in 60 seconds. See if your early retirement bridge is Stable, Moderate Risk, or Fragile — based on withdrawal rate, taxable coverage, cash buffer, allocation, and Social Security timing.',
  alternates: { canonical: 'https://bridgetoretired.com/bridge-risk-score' },
}

export default function BridgeRiskScorePage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="bg-navy border-b border-white/[0.06]">
        <div className="max-w-3xl mx-auto px-5 pt-14 pb-10">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/" className="font-mono text-[10px] tracking-widest uppercase text-white/30 hover:text-gold transition-colors">
              ← BridgeToRetired
            </Link>
            <span className="text-white/15">·</span>
            <Link href="/pro-welcome" className="font-mono text-[10px] tracking-widest uppercase text-gold/50 hover:text-gold transition-colors">
              Pro Dashboard →
            </Link>
          </div>
          <div className="font-mono text-[9px] tracking-widest uppercase text-gold mb-3">Pro Feature</div>
          <h1 className="font-syne font-bold text-[clamp(26px,4vw,44px)] tracking-tight text-white leading-tight mb-4">
            Bridge Risk Score™
          </h1>
          <p className="text-white/50 text-[15px] leading-relaxed max-w-xl">
            Your retirement's structural health in a single number. Adjust the sliders to model your exact situation — withdrawal rate, bridge funding, cash buffer, allocation, and Social Security timing.
          </p>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-5 py-10">
        <BridgeRiskScore />
        <div className="mt-12 space-y-6 text-white/50 text-[14px] leading-relaxed font-serif">
          <h2 className="font-syne font-bold text-xl text-white">How the Bridge Risk Score Works</h2>
          <p>
            The Bridge Risk Score analyzes five structural factors that determine whether an early retirement bridge will hold — not just in a normal market, but when things go wrong in year one or two of retirement.
          </p>
          <p>
            <strong className="text-white">Withdrawal Rate (25 pts)</strong> — The single most important factor. A rate above 4% for a 40+ year retirement carries compounding risk. Below 3.5% is structurally sound.
          </p>
          <p>
            <strong className="text-white">Bridge Funding / Taxable Coverage (25 pts)</strong> — Does your taxable brokerage cover the full bridge to 59½? Underfunded bridges force early 401(k) access — the 10% penalty trap.
          </p>
          <p>
            <strong className="text-white">Cash Buffer (20 pts)</strong> — 1–3 years of expenses in cash or short-term bonds lets you avoid selling equities in a down market. This is sequence-of-returns insurance.
          </p>
          <p>
            <strong className="text-white">Portfolio Allocation (15 pts)</strong> — 50–70% equities is the early retirement sweet spot. Too aggressive amplifies sequence risk; too conservative risks running out of real spending power.
          </p>
          <p>
            <strong className="text-white">Social Security Timing (15 pts)</strong> — When SS kicks in relative to your bridge length determines how long your portfolio must carry the full load alone.
          </p>
        </div>
      </div>
      <ProNav />
    </div>
  )
}

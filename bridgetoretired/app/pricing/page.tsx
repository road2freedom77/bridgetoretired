'use client'

import Link from 'next/link'
import { useState } from 'react'
import { notFound } from 'next/navigation'
import { FLAGS } from '@/lib/feature-flags'

const FREE_FEATURES = [
  'All 10 interactive retirement calculators',
  'Bridge strategy visualizer',
  'Roth conversion ladder builder',
  'ACA subsidy estimator',
  'Social Security break-even calculator',
  'SEPP / 72(t) calculator',
  'Early Retirement Bridge Planner v2 (Excel)',
  'Unlimited blog access',
]

const PRO_FEATURES = [
  { icon: '🛡️', title: 'Bridge Risk Score™', description: "Your retirement's structural health in a single number. Instant clarity on whether your bridge is Stable, At Risk, or Fragile — based on withdrawal rate, buffer, allocation, and years to Social Security.", badge: 'Signature Feature' },
  { icon: '📊', title: 'Advanced Bridge Calculator', description: 'Every variable unlocked. Custom retire age 40–65, adjustable inflation, dynamic spending toggle, all three SS claiming ages modeled simultaneously, full withdrawal order customization.', badge: null },
  { icon: '📉', title: 'Sequence-of-Returns Stress Tester', description: 'Simulate a 2000, 2008, or 2022-style crash in year one of retirement. See exact portfolio survival odds and "years until depletion" across 5 historical crash scenarios.', badge: null },
  { icon: '💾', title: 'Scenario Save + Compare', description: 'Save up to 5 named retirement scenarios. "Retire at 50 aggressive" vs "Retire at 53 conservative." Compare side-by-side. Never lose your numbers.', badge: null },
  { icon: '📄', title: 'PDF Report Export', description: 'One-click export of your complete retirement plan. Branded, shareable, CPA-ready. Bring this to your fee-only advisor and skip the $300 first meeting.', badge: null },
  { icon: '📋', title: 'Premium Excel Planner', description: 'The full planner with auto-calculated bridge years, withdrawal tracking, basic tax estimate tab, and annual rebalance tracker. Updated with every major tax law change.', badge: 'Always Current' },
]

const SCORES = [
  { range: '80–100', label: 'Stable', color: '#4ADE80', desc: 'Your bridge is well-funded. Sequence risk is manageable.' },
  { range: '50–79', label: 'Moderate', color: '#E8B84B', desc: 'Some structural risk. Worth stress-testing before you pull the trigger.' },
  { range: '0–49', label: 'Fragile', color: '#F87171', desc: 'High depletion risk in a bad market sequence. Needs work.' },
]

export default function PricingPage() {
  if (!FLAGS.PRO_ENABLED) notFound()

  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly')
  const monthlyPrice = 9
  const annualPrice = 97
  const annualMonthly = (annualPrice / 12).toFixed(2)

  return (
    <div className="min-h-screen bg-black">
      <div className="border-b border-white/[0.06] bg-navy">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/" className="font-mono text-[11px] tracking-widest uppercase text-white/40 hover:text-gold transition-colors">
            ← BridgeToRetired
          </Link>
          <div className="font-mono text-[9px] tracking-widest uppercase text-gold">Pro Membership</div>
        </div>
      </div>

      <div className="bg-navy border-b border-white/[0.06] relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-100" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gold/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-5 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 rounded-full px-4 py-1.5 mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            <span className="font-mono text-[9px] tracking-widest uppercase text-gold">Now Available</span>
          </div>
          <h1 className="font-syne font-bold text-[clamp(32px,5vw,56px)] tracking-tight text-white leading-tight mb-5">
            Build a bridge that<br /><span className="text-gold">actually holds.</span>
          </h1>
          <p className="text-white/50 text-[16px] leading-relaxed max-w-xl mx-auto mb-8">
            The free tools show you the math. Pro tells you if your plan survives the real world — crashes, healthcare costs, and 40 years of inflation.
          </p>
          <div className="inline-flex items-center bg-ink border border-white/[0.08] rounded-full p-1 mb-2">
            <button onClick={() => setBilling('monthly')} className={`px-5 py-2 rounded-full font-mono text-[10px] tracking-wider uppercase transition-all ${billing === 'monthly' ? 'bg-gold text-black font-bold' : 'text-white/40 hover:text-white/60'}`}>Monthly</button>
            <button onClick={() => setBilling('annual')} className={`px-5 py-2 rounded-full font-mono text-[10px] tracking-wider uppercase transition-all ${billing === 'annual' ? 'bg-gold text-black font-bold' : 'text-white/40 hover:text-white/60'}`}>
              Annual <span className="ml-2 text-sage text-[8px]">SAVE 10%</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
          <div className="bg-ink border border-white/[0.07] rounded-2xl p-7">
            <div className="font-mono text-[9px] tracking-widest uppercase text-white/30 mb-3">Free Forever</div>
            <div className="text-4xl font-syne font-bold text-white mb-1">$0</div>
            <div className="text-white/30 text-[12px] font-mono mb-6">no card required</div>
            <Link href="/#download" className="block text-center border border-white/[0.12] text-white/60 font-mono text-[10px] tracking-widest uppercase py-3 rounded-lg hover:border-white/25 hover:text-white/80 transition-all mb-7">Download Free Planner</Link>
            <div className="space-y-3">
              {FREE_FEATURES.map(f => (
                <div key={f} className="flex items-start gap-3">
                  <div className="w-4 h-4 rounded-full border border-white/20 flex items-center justify-center flex-shrink-0 mt-0.5"><div className="w-1.5 h-1.5 rounded-full bg-white/30" /></div>
                  <span className="text-white/45 text-[12px] leading-snug">{f}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-ink border border-gold/25 rounded-2xl p-7 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-gold/5 blur-[80px] rounded-full pointer-events-none" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="font-mono text-[9px] tracking-widest uppercase text-gold">Pro</div>
                <div className="bg-gold/10 border border-gold/20 rounded-full px-3 py-1 font-mono text-[8px] tracking-widest uppercase text-gold">Most Popular</div>
              </div>
              <div className="flex items-end gap-2 mb-1">
                <div className="text-4xl font-syne font-bold text-white">${billing === 'monthly' ? monthlyPrice : annualMonthly}</div>
                <div className="text-white/30 text-[12px] font-mono mb-1.5">/month</div>
              </div>
              {billing === 'annual' && <div className="text-sage text-[11px] font-mono mb-1">${annualPrice} billed annually — save ${(monthlyPrice * 12) - annualPrice}/yr</div>}
              <div className="text-white/25 text-[11px] font-mono mb-6">cancel anytime</div>
              <a href="https://buy.stripe.com/bJe00j0DF85Hdz68fsfYY00" className="block text-center bg-gold text-black font-syne font-semibold text-[13px] tracking-wide py-3.5 rounded-lg hover:opacity-90 transition-opacity mb-7">
                Start Pro — ${billing === 'monthly' ? `${monthlyPrice}/mo` : `${annualPrice}/yr`} →
              </a>
              <div className="space-y-3">
                <div className="font-mono text-[8px] tracking-widest uppercase text-white/25 mb-4">Everything in Free, plus:</div>
                {PRO_FEATURES.map(f => (
                  <div key={f.title} className="flex items-start gap-3">
                    <div className="w-4 h-4 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center flex-shrink-0 mt-0.5"><div className="w-1.5 h-1.5 rounded-full bg-gold" /></div>
                    <div>
                      <span className="text-white text-[12px] font-medium">{f.title}</span>
                      {f.badge && <span className="ml-2 bg-gold/10 text-gold font-mono text-[7px] tracking-widest uppercase px-2 py-0.5 rounded-full border border-gold/20">{f.badge}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-ink border border-white/[0.07] rounded-2xl overflow-hidden mb-12">
          <div className="border-b border-white/[0.06] px-8 py-5 flex items-center justify-between">
            <div>
              <div className="font-mono text-[9px] tracking-widest uppercase text-gold mb-1">Signature Pro Feature</div>
              <h2 className="font-syne font-bold text-xl text-white">Bridge Risk Score™</h2>
            </div>
            <div className="text-4xl">🛡️</div>
          </div>
          <div className="p-8">
            <p className="text-white/50 text-[14px] leading-relaxed mb-8 max-w-2xl">
              The FIRE community obsesses over the 4% rule but ignores the structural question: <em className="text-white/70">is your specific bridge actually safe?</em> The Bridge Risk Score analyzes your exact situation and gives you a single number.
            </p>
            <div className="grid grid-cols-3 gap-4 mb-8">
              {SCORES.map(s => (
                <div key={s.label} style={{ borderColor: `${s.color}30`, borderTopColor: s.color }} className="bg-black/30 rounded-xl p-5 border border-t-2">
                  <div className="font-mono text-[9px] tracking-widest uppercase mb-2" style={{ color: s.color }}>{s.range}</div>
                  <div className="font-syne font-bold text-lg mb-2" style={{ color: s.color }}>{s.label}</div>
                  <div className="text-white/35 text-[11px] leading-relaxed">{s.desc}</div>
                </div>
              ))}
            </div>
            <div className="bg-black/40 border border-white/[0.06] rounded-xl p-6 flex items-center gap-8">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 rounded-full border-4 border-gold/30 flex items-center justify-center relative">
                  <div className="absolute inset-2 rounded-full bg-gold/5" />
                  <div className="relative text-center">
                    <div className="font-syne font-bold text-2xl text-gold">73</div>
                    <div className="font-mono text-[7px] tracking-widest text-gold/60 uppercase">/ 100</div>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-syne font-bold text-xl text-gold">Moderate Risk</span>
                  <div className="w-2 h-2 rounded-full bg-gold" />
                </div>
                <p className="text-white/40 text-[12px] leading-relaxed">Your 7.5-year bridge is funded, but withdrawal rate of 3.8% leaves thin margin in a down-market sequence.</p>
                <div className="mt-3 font-mono text-[9px] text-white/20 tracking-wider">Based on: Age 52 · $1.1M · $55k spend · SS at 67 · 60/40 allocation</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="font-syne font-bold text-2xl text-white mb-8 text-center">Everything in Pro</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PRO_FEATURES.map(f => (
              <div key={f.title} className="bg-ink border border-white/[0.07] rounded-xl p-5 flex gap-4">
                <div className="text-2xl flex-shrink-0">{f.icon}</div>
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-syne font-semibold text-white text-[14px]">{f.title}</span>
                    {f.badge && <span className="bg-gold/10 text-gold font-mono text-[7px] tracking-widest uppercase px-2 py-0.5 rounded-full border border-gold/20">{f.badge}</span>}
                  </div>
                  <p className="text-white/40 text-[12px] leading-relaxed">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-16">
          <h2 className="font-syne font-bold text-2xl text-white mb-8 text-center">Questions</h2>
          <div className="space-y-4 max-w-2xl mx-auto">
            {[
              { q: 'Is this financial advice?', a: 'No — BridgeToRetired Pro is a modeling tool, not a financial advisory service. We help you run the math clearly so you can make your own decisions or bring better questions to a fee-only advisor.' },
              { q: 'Can I cancel anytime?', a: 'Yes. Cancel in one click from your account settings. No questions, no retention flows, no emails begging you to stay.' },
              { q: 'What if I already downloaded the free Excel?', a: "The free Excel stays yours. Pro unlocks the premium Excel plus the web-based features the spreadsheet can't do." },
              { q: 'How is this different from ProjectionLab or Boldin?', a: "Those tools model retirement broadly. We're built specifically for early retirees navigating the bridge years — the 59½ problem, Roth ladders, ACA subsidies, and SEPP. Narrower and deeper." },
              { q: 'Will the Premium Excel stay updated?', a: 'Yes. Whenever tax law changes affect early retirees, we update the planner and push the new version to all Pro members automatically.' },
            ].map(({ q, a }) => (
              <div key={q} className="bg-ink border border-white/[0.07] rounded-xl p-5">
                <div className="font-syne font-semibold text-white text-[14px] mb-2">{q}</div>
                <div className="text-white/40 text-[13px] leading-relaxed">{a}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-ink border border-gold/20 rounded-2xl p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gold/3 pointer-events-none" />
          <div className="relative">
            <div className="font-mono text-[9px] tracking-widest uppercase text-gold mb-4">Get Started</div>
            <h2 className="font-syne font-bold text-[clamp(24px,4vw,38px)] text-white tracking-tight mb-4">Know your score before<br />you retire.</h2>
            <p className="text-white/40 text-[14px] mb-8 max-w-md mx-auto leading-relaxed">Less than a coffee a month. Cancel anytime. Your retirement plan deserves more than a spreadsheet and a prayer.</p>
            <a href="https://buy.stripe.com/bJe00j0DF85Hdz68fsfYY00" className="inline-block bg-gold text-black font-syne font-semibold text-[14px] tracking-wide px-10 py-4 rounded-xl hover:opacity-90 transition-opacity mb-4">
              Start Pro — ${billing === 'monthly' ? `${monthlyPrice}/mo` : `${annualPrice}/yr`} →
            </a>
            <div className="font-mono text-[9px] text-white/20 tracking-wider">30-day money back guarantee · Cancel anytime</div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/[0.06] py-8">
        <div className="max-w-4xl mx-auto px-5 flex items-center justify-between">
          <div className="font-mono text-[9px] text-white/20 tracking-wider">© 2026 BridgeToRetired · Not financial advice</div>
          <div className="flex gap-6">
            {['Privacy', 'Terms', 'Contact'].map(l => (
              <Link key={l} href={`/${l.toLowerCase()}`} className="font-mono text-[9px] text-white/25 hover:text-white/50 tracking-wider transition-colors">{l}</Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

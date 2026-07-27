'use client'

import Link from 'next/link'
import { useState } from 'react'
import { notFound } from 'next/navigation'
import { FLAGS } from '@/lib/feature-flags'
import { trackProCtaClick, trackBeginCheckout } from '@/lib/analytics'

const FREE_FEATURES = [
  'All 10 interactive retirement calculators',
  'Bridge strategy visualizer',
  'Roth conversion ladder builder',
  'ACA subsidy estimator',
  'Social Security break-even calculator',
  'SEPP / 72(t) calculator',
  'Early Retirement Bridge Planner v2.2 (Excel) — 7 sheets, SS modeled, risk flags',
  'Unlimited blog access',
]

const XLS_FEATURES = [
  '9-sheet Excel system (vs 7 in the free version)',
  'TAX ESTIMATE — federal tax per bridge year, MFJ/Single switchable',
  'ROTH LADDER — optimal conversions with ACA cliff cross-check',
  'MONTE CARLO — 200 randomized sequences, press F9 to re-run',
  'RISK FLAGS — 9 automated checks with color coding',
  'REBALANCE — annual target vs actual with drift alerts',
  'POST-59½ — full projection with SS income modeled',
  'Use indefinitely — no subscription required',
]

const PRO_FEATURES = [
  {
    icon: '🖥️',
    title: 'Online Retirement Planner',
    description: 'Save up to 5 named scenarios, run Monte Carlo simulation, and access your plan from anywhere. Enter your numbers and watch all results update instantly.',
    badge: 'New',
  },
  {
    icon: '🛡️',
    title: 'Bridge Risk Score™',
    description: "Your retirement's structural health in a single number. Instant clarity on whether your bridge is Stable, At Risk, or Fragile — based on withdrawal rate, buffer, allocation, and years to Social Security.",
    badge: 'Signature Feature',
  },
  {
    icon: '📊',
    title: 'Advanced Bridge Calculator',
    description: 'Every variable unlocked. Custom retire age 40–65, adjustable inflation, dynamic spending toggle, all three SS claiming ages modeled simultaneously, full withdrawal order customization.',
    badge: null,
  },
  {
    icon: '📉',
    title: 'Sequence-of-Returns Stress Tester',
    description: 'Simulate a 2000, 2008, or 2022-style crash in year one of retirement. See exact portfolio survival odds and "years until depletion" across 5 historical crash scenarios.',
    badge: null,
  },
  {
    icon: '💾',
    title: 'Scenario Save + Compare',
    description: 'Save up to 5 named retirement scenarios. "Retire at 50 aggressive" vs "Retire at 53 conservative." Compare side-by-side. Never lose your numbers.',
    badge: null,
  },
  {
    icon: '📄',
    title: 'PDF Report Export',
    description: 'One-click export of your complete retirement plan. Branded, shareable, CPA-ready. Bring this to your fee-only advisor and skip the $300 first meeting.',
    badge: null,
  },
  {
    icon: '📋',
    title: 'Pro Excel Planner v3 — 9 Sheets',
    description: 'The complete planning system: BRIDGE (taxable → Roth → 401k cascade), TAX ESTIMATE (MFJ/Single switchable brackets), ROTH LADDER (ACA cliff cross-check per year), POST-59½ (SS income modeled), MONTE CARLO (200-scenario simulator with success rate %), RISK FLAGS (9 automated checks with color coding), and REBALANCE tracker. Updated with every major tax law change.',
    badge: 'New v3',
  },
]

const SCORES = [
  { range: '80–100', label: 'Stable', color: '#4ADE80', desc: 'Your bridge is well-funded. Sequence risk is manageable.' },
  { range: '50–79', label: 'Moderate', color: '#E8B84B', desc: 'Some structural risk. Worth stress-testing before you pull the trigger.' },
  { range: '0–49', label: 'Fragile', color: '#F87171', desc: 'High depletion risk in a bad market sequence. Needs work.' },
]

const PRO_SHEETS = [
  { name: 'INPUTS', desc: 'Single entry point — ages, balances, filing status, state, SS benefit. Every sheet updates automatically.' },
  { name: 'BRIDGE', desc: 'Year-by-year funding plan from retirement to 59½. Taxable → Roth → 401k cascade. Rows auto-blank past bridge.' },
  { name: 'TAX ESTIMATE', desc: 'Federal tax per bridge year using 2026 brackets. Switches between MFJ and Single from INPUTS.' },
  { name: 'ROTH LADDER', desc: 'Optimal Roth conversions filling the 12% bracket. ACA cliff cross-check flags any year MAGI exceeds 400% FPL.' },
  { name: 'POST-59½', desc: 'Full projection to life expectancy. Social Security income reduces withdrawals from your claiming age.' },
  { name: 'MONTE CARLO', desc: '200 randomized return sequences. Success rate %, median, 10th/90th percentile. Press F9 to re-run.' },
  { name: 'RISK FLAGS', desc: '9 automated checks: withdrawal rate, bridge gap, penalty risk, ACA cliff, SS delay value, IRMAA, Monte Carlo success.' },
  { name: 'REBALANCE', desc: 'Annual target vs actual allocation by asset class. Drift alerts and buy/sell signals linked to your INPUTS balances.' },
]

const XLS_PAYMENT_LINK = 'https://buy.stripe.com/4gMaEXfyz0DfeDa53gfYY03'

export default function PricingPage() {
  if (!FLAGS.PRO_ENABLED) notFound()

  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly')
  const monthlyPrice  = 15
  const annualPrice   = 97
  const annualMonthly = (annualPrice / 12).toFixed(2)
  const MONTHLY_LINK  = 'https://buy.stripe.com/00w28rcmngCd52AgLYfYY01'
  const ANNUAL_LINK   = 'https://buy.stripe.com/aFa6oH9abeu5dz69jwfYY02'
  const paymentLink   = billing === 'monthly' ? MONTHLY_LINK : ANNUAL_LINK

  function handleCheckout(location: string) {
    trackProCtaClick(location)
    trackBeginCheckout(billing, billing === 'monthly' ? monthlyPrice : annualPrice)
  }

  function handleXlsCheckout() {
    trackProCtaClick('pricing-xls-card')
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="border-b border-white/[0.06] bg-navy">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/" className="font-mono text-[11px] tracking-widest uppercase text-white/40 hover:text-gold transition-colors">
            ← BridgeToRetired
          </Link>
          <div className="font-mono text-[9px] tracking-widest uppercase text-gold">Pricing</div>
        </div>
      </div>

      <div className="bg-navy border-b border-white/[0.06] relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-100" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gold/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-5 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 rounded-full px-4 py-1.5 mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            <span className="font-mono text-[9px] tracking-widest uppercase text-gold">Pro v3 Now Available</span>
          </div>
          <h1 className="font-syne font-bold text-[clamp(32px,5vw,56px)] tracking-tight text-white leading-tight mb-5">
            Stress-Test Your Early Retirement<br /><span className="text-gold">Before You Quit.</span>
          </h1>
          <p className="text-white/50 text-[16px] leading-relaxed max-w-xl mx-auto mb-8">
            Free tools show the math. Pro tells you whether your plan survives market crashes, inflation, and decades of withdrawals.
          </p>
          <div className="inline-flex items-center bg-ink border border-white/[0.08] rounded-full p-1 mb-2">
            <button onClick={() => setBilling('monthly')} className={`px-5 py-2 rounded-full font-mono text-[10px] tracking-wider uppercase transition-all ${billing === 'monthly' ? 'bg-gold text-black font-bold' : 'text-white/40 hover:text-white/60'}`}>Monthly</button>
            <button onClick={() => setBilling('annual')} className={`px-5 py-2 rounded-full font-mono text-[10px] tracking-wider uppercase transition-all ${billing === 'annual' ? 'bg-gold text-black font-bold' : 'text-white/40 hover:text-white/60'}`}>
              Annual <span className="ml-2 text-sage text-[8px]">SAVE 10%</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 py-16">

        {/* ── Three-plan grid ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">

          {/* Free card */}
          <div className="bg-ink border border-white/[0.07] rounded-2xl p-7">
            <div className="font-mono text-[9px] tracking-widest uppercase text-white/30 mb-3">Free Forever</div>
            <div className="text-4xl font-syne font-bold text-white mb-1">$0</div>
            <div className="text-white/30 text-[12px] font-mono mb-6">no card required</div>
            <Link href="/#download" className="block text-center border border-white/[0.12] text-white/60 font-mono text-[10px] tracking-widest uppercase py-3 rounded-lg hover:border-white/25 hover:text-white/80 transition-all mb-7">
              Download Free Planner
            </Link>
            <div className="space-y-3">
              {FREE_FEATURES.map(f => (
                <div key={f} className="flex items-start gap-3">
                  <div className="w-4 h-4 rounded-full border border-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
                  </div>
                  <span className="text-white/45 text-[12px] leading-snug">{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pro XLS card */}
          <div className="bg-ink border border-teal-500/25 rounded-2xl p-7 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-teal-500/5 blur-[60px] rounded-full pointer-events-none" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="font-mono text-[9px] tracking-widest uppercase text-teal-400">Pro Excel</div>
                <div className="bg-teal-500/10 border border-teal-500/20 rounded-full px-3 py-1 font-mono text-[8px] tracking-widest uppercase text-teal-400">One-Time</div>
              </div>
              <div className="flex items-end gap-2 mb-1">
                <div className="text-4xl font-syne font-bold text-white">$39</div>
              </div>
              <div className="text-white/30 text-[12px] font-mono mb-1">one-time purchase</div>
              <div className="text-white/20 text-[11px] font-mono mb-6">no subscription · use indefinitely</div>
              <a
                href={XLS_PAYMENT_LINK}
                onClick={handleXlsCheckout}
                className="block text-center bg-teal-500 text-black font-syne font-semibold text-[13px] tracking-wide py-3.5 rounded-lg hover:opacity-90 transition-opacity mb-7"
              >
                Get Pro Excel Planner →
              </a>
              <div className="space-y-3">
                <div className="font-mono text-[8px] tracking-widest uppercase text-white/25 mb-4">Everything in Free, plus:</div>
                {XLS_FEATURES.map(f => (
                  <div key={f} className="flex items-start gap-3">
                    <div className="w-4 h-4 rounded-full bg-teal-500/15 border border-teal-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                    </div>
                    <span className="text-white/45 text-[12px] leading-snug">{f}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-5 border-t border-white/[0.06]">
                <div className="font-mono text-[9px] text-white/20 leading-relaxed">
                  Includes current version only. Future version upgrades sold separately. No automatic updates.
                </div>
              </div>
            </div>
          </div>

          {/* Online Pro subscription card */}
          <div className="bg-ink border border-gold/25 rounded-2xl p-7 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-gold/5 blur-[80px] rounded-full pointer-events-none" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="font-mono text-[9px] tracking-widest uppercase text-gold">Online Pro</div>
                <div className="bg-gold/10 border border-gold/20 rounded-full px-3 py-1 font-mono text-[8px] tracking-widest uppercase text-gold">Most Popular</div>
              </div>
              <div className="flex items-end gap-2 mb-1">
                <div className="text-4xl font-syne font-bold text-white">${billing === 'monthly' ? monthlyPrice : annualMonthly}</div>
                <div className="text-white/30 text-[12px] font-mono mb-1.5">/month</div>
              </div>
              {billing === 'annual' && (
                <div className="text-sage text-[11px] font-mono mb-1">${annualPrice} billed annually</div>
              )}
              <div className="text-white/25 text-[11px] font-mono mb-6">cancel anytime</div>
              <a
                href={paymentLink}
                onClick={() => handleCheckout('pricing-hero')}
                className="block text-center bg-gold text-black font-syne font-semibold text-[13px] tracking-wide py-3.5 rounded-lg hover:opacity-90 transition-opacity mb-7"
              >
                Start Online Pro →
              </a>
              <div className="space-y-3">
                <div className="font-mono text-[8px] tracking-widest uppercase text-white/25 mb-4">Everything in Pro Excel, plus:</div>
                {PRO_FEATURES.map(f => (
                  <div key={f.title} className="flex items-start gap-3">
                    <div className="w-4 h-4 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                    </div>
                    <div>
                      <span className="text-white text-[12px] font-medium">{f.title}</span>
                      {f.badge && (
                        <span className="ml-2 bg-gold/10 text-gold font-mono text-[7px] tracking-widest uppercase px-2 py-0.5 rounded-full border border-gold/20">{f.badge}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Online Planner callout */}
        <div className="bg-ink border border-gold/20 rounded-2xl overflow-hidden mb-8">
          <div className="border-b border-white/[0.06] px-8 py-5 flex items-center justify-between">
            <div>
              <div className="font-mono text-[9px] tracking-widest uppercase text-gold mb-1">New in Pro v3</div>
              <h2 className="font-syne font-bold text-xl text-white">Online Retirement Planner</h2>
            </div>
            <div className="text-4xl">🖥️</div>
          </div>
          <div className="p-8">
            <p className="text-white/50 text-[14px] leading-relaxed mb-6 max-w-2xl">
              The online planner is the reason Online Pro is a subscription, not a one-time download. Save up to 5 named scenarios, run Monte Carlo simulation, and access your plan from any device. Your numbers live in the cloud — come back anytime.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[
                { icon: '💾', title: 'Save 5 scenarios', desc: 'Name and save up to 5 retirement scenarios. Switch between them instantly.' },
                { icon: '🎲', title: 'Monte Carlo', desc: '200 randomized return sequences. Success rate updates as you change inputs.' },
                { icon: '📱', title: 'Access anywhere', desc: 'Your plan lives in the cloud. Open it from any device, any time.' },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="bg-black/30 border border-white/[0.06] rounded-xl p-4">
                  <div className="text-xl mb-2">{icon}</div>
                  <div className="font-syne font-semibold text-white text-[13px] mb-1">{title}</div>
                  <div className="text-white/40 text-[12px] leading-relaxed">{desc}</div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <a
                href={paymentLink}
                onClick={() => handleCheckout('pricing-planner-callout')}
                className="inline-block bg-gold text-black font-syne font-semibold text-[13px] tracking-wide px-6 py-3 rounded hover:opacity-85 transition-opacity"
              >
                Start Online Pro →
              </a>
              <Link href="/pro/planner" className="inline-block border border-gold/30 text-gold font-mono text-[10px] tracking-widest uppercase px-6 py-3 rounded hover:border-gold/60 transition-colors">
                Preview Planner →
              </Link>
            </div>
          </div>
        </div>

        {/* Pro Excel v3 callout */}
        <div className="bg-ink border border-gold/20 rounded-2xl overflow-hidden mb-12">
          <div className="border-b border-white/[0.06] px-8 py-5 flex items-center justify-between">
            <div>
              <div className="font-mono text-[9px] tracking-widest uppercase text-gold mb-1">One-Time Purchase</div>
              <h2 className="font-syne font-bold text-xl text-white">Pro Excel Planner — 9 Sheets</h2>
            </div>
            <div className="text-4xl">📋</div>
          </div>
          <div className="p-8">
            <p className="text-white/50 text-[14px] leading-relaxed mb-8 max-w-2xl">
              The offline companion to the online planner. Change one number in INPUTS and all 9 sheets update instantly — BRIDGE years, tax estimates, Roth ladder, Monte Carlo simulation, and risk flags.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
              {PRO_SHEETS.map(s => (
                <div key={s.name} className="bg-black/30 border border-white/[0.06] rounded-xl p-4">
                  <div className="font-mono text-[9px] tracking-widest uppercase text-gold mb-1">{s.name}</div>
                  <div className="text-white/45 text-[12px] leading-relaxed">{s.desc}</div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <a
                href={XLS_PAYMENT_LINK}
                onClick={handleXlsCheckout}
                className="inline-block bg-teal-500 text-black font-syne font-semibold text-[13px] tracking-wide px-6 py-3 rounded hover:opacity-85 transition-opacity"
              >
                Get Pro Excel — $39 one-time →
              </a>
              <div className="font-mono text-[10px] text-white/25">No subscription · Use indefinitely</div>
            </div>
          </div>
        </div>

        {/* Bridge Risk Score callout */}
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

        {/* All Pro Online features grid */}
        <div className="mb-12">
          <h2 className="font-syne font-bold text-2xl text-white mb-8 text-center">Everything in Online Pro</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PRO_FEATURES.map(f => (
              <div key={f.title} className="bg-ink border border-white/[0.07] rounded-xl p-5 flex gap-4">
                <div className="text-2xl flex-shrink-0">{f.icon}</div>
                <div>
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="font-syne font-semibold text-white text-[14px]">{f.title}</span>
                    {f.badge && (
                      <span className="bg-gold/10 text-gold font-mono text-[7px] tracking-widest uppercase px-2 py-0.5 rounded-full border border-gold/20">{f.badge}</span>
                    )}
                  </div>
                  <p className="text-white/40 text-[12px] leading-relaxed">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <h2 className="font-syne font-bold text-2xl text-white mb-8 text-center">Questions</h2>
          <div className="space-y-4 max-w-2xl mx-auto">
            {[
              { q: 'What is the difference between Pro Excel and Online Pro?', a: 'Pro Excel ($39 one-time) is a downloadable Excel file you use on your own computer — no internet required, use it forever. Online Pro ($15/month) is the cloud-based planner with saved scenarios, Monte Carlo simulation, and access from any device. Both include the 9-sheet Excel system.' },
              { q: 'Does Pro Excel get future updates automatically?', a: 'No. The $39 purchase includes the current version (v3) only. Future major versions will be available as separate purchases. We will notify you by email when a new version ships.' },
              { q: 'Is this financial advice?', a: 'No — BridgeToRetired Pro is a modeling tool, not a financial advisory service. We help you run the math clearly so you can make your own decisions or bring better questions to a fee-only advisor.' },
              { q: 'Can I cancel Online Pro anytime?', a: 'Yes. Cancel in one click from your account settings. No questions, no retention flows, no emails begging you to stay.' },
              { q: "What's new in Pro v3?", a: 'Pro v3 adds the online planner with scenario saving, a full Monte Carlo simulator, a 9-sheet Excel planning system with switchable MFJ/Single tax brackets, ACA cliff cross-check in the Roth Ladder, SS income modeled in POST-59½, and color-coded RISK FLAGS. Existing Pro members get v3 at no extra cost.' },
              { q: 'How is this different from ProjectionLab or Boldin?', a: "Those tools model retirement broadly. We're built specifically for early retirees navigating the bridge years — the 59½ problem, Roth ladders, ACA subsidies, and SEPP. Narrower and deeper." },
            ].map(({ q, a }) => (
              <div key={q} className="bg-ink border border-white/[0.07] rounded-xl p-5">
                <div className="font-syne font-semibold text-white text-[14px] mb-2">{q}</div>
                <div className="text-white/40 text-[13px] leading-relaxed">{a}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="bg-ink border border-gold/20 rounded-2xl p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gold/3 pointer-events-none" />
          <div className="relative">
            <div className="font-mono text-[9px] tracking-widest uppercase text-gold mb-4">Get Started</div>
            <h2 className="font-syne font-bold text-[clamp(24px,4vw,38px)] text-white tracking-tight mb-4">
              Know your score before<br />you retire.
            </h2>
            <p className="text-white/40 text-[14px] mb-8 max-w-md mx-auto leading-relaxed">
              Pick the option that fits. One-time Excel or online subscription — either way you get the full 9-sheet planning system.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-4">
              <a
                href={XLS_PAYMENT_LINK}
                onClick={handleXlsCheckout}
                className="inline-block bg-teal-500 text-black font-syne font-semibold text-[14px] tracking-wide px-8 py-4 rounded-xl hover:opacity-90 transition-opacity"
              >
                Pro Excel — $39 one-time →
              </a>
              <a
                href={paymentLink}
                onClick={() => handleCheckout('pricing-final-cta')}
                className="inline-block bg-gold text-black font-syne font-semibold text-[14px] tracking-wide px-8 py-4 rounded-xl hover:opacity-90 transition-opacity"
              >
                Online Pro — ${billing === 'monthly' ? `${monthlyPrice}/mo` : `${annualPrice}/yr`} →
              </a>
            </div>
            <div className="font-mono text-[9px] text-white/20 tracking-wider">Online Pro: cancel anytime · Pro Excel: one-time, no refunds on digital downloads</div>
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
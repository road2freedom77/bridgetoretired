'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { notFound } from 'next/navigation'
import { FLAGS } from '@/lib/feature-flags'
import { trackProCtaClick } from '@/lib/analytics'

const FREE_FEATURES = [
  'All 10 interactive retirement calculators',
  'Bridge strategy visualizer',
  'Roth conversion ladder builder',
  'ACA subsidy estimator',
  'Social Security break-even calculator',
  'SEPP / 72(t) calculator',
  'Early Retirement Bridge Planner v2.2 (Excel) — 7 sheets',
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

const ONLINE_PRO_FEATURES = [
  { icon: '🖥️', title: 'Online Retirement Planner', badge: 'New' },
  { icon: '💾', title: 'Save and compare up to 5 scenarios', badge: null },
  { icon: '🛡️', title: 'Bridge Risk Score™', badge: 'Signature Feature' },
  { icon: '📉', title: 'Sequence-of-Returns Stress Tester', badge: null },
  { icon: '🎲', title: 'Online Monte Carlo simulation', badge: null },
  { icon: '📄', title: 'PDF retirement plan export', badge: null },
  { icon: '📱', title: 'Access your plan from any device', badge: null },
]

const SCORES = [
  { range: '80–100', label: 'Stable', color: '#4ADE80', desc: 'Your bridge is well-funded. Sequence risk is manageable.' },
  { range: '50–79', label: 'Moderate', color: '#E8B84B', desc: 'Some structural risk. Worth stress-testing before you pull the trigger.' },
  { range: '0–49', label: 'Fragile', color: '#F87171', desc: 'High depletion risk in a bad market sequence. Needs work.' },
]

const PRO_SHEETS = [
  { name: 'INPUTS', desc: 'Single entry point — ages, balances, filing status, state, SS benefit. Every sheet updates automatically.' },
  { name: 'BRIDGE', desc: 'Year-by-year funding plan from retirement to 59½. Taxable → Roth → 401k cascade.' },
  { name: 'TAX ESTIMATE', desc: 'Federal tax per bridge year using 2026 brackets. Switches between MFJ and Single from INPUTS.' },
  { name: 'ROTH LADDER', desc: 'Optimal Roth conversions filling the 12% bracket. ACA cliff cross-check per year.' },
  { name: 'POST-59½', desc: 'Full projection to life expectancy. Social Security income reduces withdrawals from your claiming age.' },
  { name: 'MONTE CARLO', desc: '200 randomized return sequences. Success rate %, median, 10th/90th percentile. Press F9 to re-run.' },
  { name: 'RISK FLAGS', desc: '9 automated checks: withdrawal rate, bridge gap, penalty risk, ACA cliff, SS delay value, IRMAA, Monte Carlo success.' },
  { name: 'REBALANCE', desc: 'Annual target vs actual allocation by asset class. Drift alerts and buy/sell signals.' },
]

const XLS_PAYMENT_LINK    = 'https://buy.stripe.com/4gMaEXfyz0DfeDa53gfYY03'
const ONLINE_PRO_LINK     = 'https://buy.stripe.com/28E00jaefeu5amU1R4fYY04'

export default function PricingPage() {
  if (!FLAGS.PRO_ENABLED) notFound()

  // Forward utm_campaign to Stripe as client_reference_id so every purchase
  // row records its acquisition source (read back in the verify route).
  const [xlsLink,    setXlsLink]    = useState(XLS_PAYMENT_LINK)
  const [onlineLink, setOnlineLink] = useState(ONLINE_PRO_LINK)

  useEffect(() => {
    const params   = new URLSearchParams(window.location.search)
    const campaign = params.get('utm_campaign')
    if (campaign) {
      // client_reference_id: alphanumeric, dash, underscore only, max 200 chars
      const ref = campaign.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 200)
      if (ref) {
        setXlsLink(`${XLS_PAYMENT_LINK}?client_reference_id=${ref}`)
        setOnlineLink(`${ONLINE_PRO_LINK}?client_reference_id=${ref}`)
      }
    }
  }, [])

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

      {/* Hero */}
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
          <p className="text-white/50 text-[16px] leading-relaxed max-w-xl mx-auto">
            Buy the complete Excel planner once, or keep your scenarios saved and stress-tested online.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 py-16">

        {/* ── Three-plan grid ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

          {/* Free */}
          <div className="bg-ink border border-white/[0.07] rounded-2xl p-7 flex flex-col">
            <div className="font-mono text-[9px] tracking-widest uppercase text-white/30 mb-3">Free Forever</div>
            <div className="text-4xl font-syne font-bold text-white mb-1">$0</div>
            <div className="text-white/30 text-[12px] font-mono mb-2">no card required</div>
            <div className="text-white/25 text-[11px] font-mono mb-6">Best for exploring the tools.</div>
            <Link href="/#download" className="block text-center border border-white/[0.12] text-white/60 font-mono text-[10px] tracking-widest uppercase py-3 rounded-lg hover:border-white/25 hover:text-white/80 transition-all mb-7">
              Download Free Planner
            </Link>
            <div className="space-y-3 flex-1">
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

          {/* Pro Excel — one-time */}
          <div className="bg-ink border border-[#2DD4BF]/25 rounded-2xl p-7 relative overflow-hidden flex flex-col">
            <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-[#2DD4BF]/5 blur-[60px] rounded-full pointer-events-none" />
            <div className="relative flex flex-col flex-1">
              <div className="flex items-center justify-between mb-3">
                <div className="font-mono text-[9px] tracking-widest uppercase text-[#2DD4BF]">Pro Excel</div>
                <div className="bg-[#2DD4BF]/10 border border-[#2DD4BF]/20 rounded-full px-3 py-1 font-mono text-[8px] tracking-widest uppercase text-[#2DD4BF]">One-Time</div>
              </div>
              <div className="text-4xl font-syne font-bold text-white mb-1">$39</div>
              <div className="text-white/30 text-[12px] font-mono mb-2">one-time purchase</div>
              <div className="text-white/25 text-[11px] font-mono mb-6">Best for offline planning without recurring billing.</div>
              <a
                href={xlsLink}
                onClick={() => trackProCtaClick('pricing-xls-card')}
                className="block text-center font-syne font-semibold text-[13px] tracking-wide py-3.5 rounded-lg hover:opacity-90 transition-opacity mb-7"
                style={{ background: '#2DD4BF', color: '#0D1420' }}
              >
                Get Pro Excel Planner →
              </a>
              <div className="space-y-3 flex-1">
                <div className="font-mono text-[8px] tracking-widest uppercase text-white/25 mb-4">Everything in Free, plus:</div>
                {XLS_FEATURES.map(f => (
                  <div key={f} className="flex items-start gap-3">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'rgba(45,212,191,0.15)', border: '1px solid rgba(45,212,191,0.3)' }}>
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#2DD4BF' }} />
                    </div>
                    <span className="text-white/45 text-[12px] leading-snug">{f}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-5 border-t border-white/[0.06]">
                <div className="font-mono text-[9px] text-white/20 leading-relaxed">
                  Includes current version only. Future upgrades sold separately. No automatic updates.
                </div>
              </div>
            </div>
          </div>

          {/* Online Pro — subscription */}
          <div className="bg-ink border border-gold/25 rounded-2xl p-7 relative overflow-hidden flex flex-col">
            <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-gold/5 blur-[80px] rounded-full pointer-events-none" />
            <div className="relative flex flex-col flex-1">
              <div className="flex items-center justify-between mb-3">
                <div className="font-mono text-[9px] tracking-widest uppercase text-gold">Online Pro</div>
                <div className="bg-gold/10 border border-gold/20 rounded-full px-3 py-1 font-mono text-[8px] tracking-widest uppercase text-gold">Best for ongoing planning</div>
              </div>
              <div className="flex items-end gap-2 mb-1">
                <div className="text-4xl font-syne font-bold text-white">$15</div>
                <div className="text-white/30 text-[12px] font-mono mb-1.5">/month</div>
              </div>
              <div className="text-white/25 text-[11px] font-mono mb-2">cancel anytime</div>
              <div className="text-white/25 text-[11px] font-mono mb-6">Best for plans you expect to revisit, update, and stress-test over time.</div>
              <a
                href={onlineLink}
                onClick={() => trackProCtaClick('pricing-online-pro-card')}
                className="block text-center bg-gold text-black font-syne font-semibold text-[13px] tracking-wide py-3.5 rounded-lg hover:opacity-90 transition-opacity mb-7"
              >
                Start Online Pro →
              </a>
              <div className="space-y-3 flex-1">
                <div className="font-mono text-[8px] tracking-widest uppercase text-white/25 mb-4">Built for ongoing retirement planning:</div>
                {ONLINE_PRO_FEATURES.map(f => (
                  <div key={f.title} className="flex items-start gap-3">
                    <div className="w-4 h-4 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white text-[12px] font-medium">{f.title}</span>
                      {f.badge && (
                        <span className="bg-gold/10 text-gold font-mono text-[7px] tracking-widest uppercase px-2 py-0.5 rounded-full border border-gold/20">{f.badge}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-5 border-t border-white/[0.06]">
                <div className="font-mono text-[9px] text-white/20 leading-relaxed">
                  Prefer Excel? <a href={xlsLink} onClick={() => trackProCtaClick('pricing-online-pro-xls-link')} className="text-[#2DD4BF]/60 hover:text-[#2DD4BF] transition-colors">Purchase Pro Excel v3 separately for $39 →</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comparison table */}
        <div className="bg-ink border border-white/[0.07] rounded-2xl overflow-hidden mb-12">
          <div className="border-b border-white/[0.06] px-8 py-5">
            <h2 className="font-syne font-bold text-xl text-white">Which option is right for me?</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="px-6 py-4 text-left font-mono text-[9px] tracking-widest uppercase text-white/30">Feature</th>
                  <th className="px-4 py-4 text-center font-mono text-[9px] tracking-widest uppercase text-white/30">Free</th>
                  <th className="px-4 py-4 text-center font-mono text-[9px] tracking-widest uppercase text-[#2DD4BF]">Pro Excel $39</th>
                  <th className="px-4 py-4 text-center font-mono text-[9px] tracking-widest uppercase text-gold">Online Pro $15/mo</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Interactive calculators', '✓', '✓', '✓'],
                  ['Free Excel planner v2.2', '✓', '✓', '✓'],
                  ['Pro Excel v3 — 9 sheets', '—', '✓', '—'],
                  ['Use purchased XLS indefinitely', '—', '✓', '—'],
                  ['Online retirement planner', '—', '—', '✓'],
                  ['Save up to 5 scenarios', '—', '—', '✓'],
                  ['Scenario comparison', '—', '—', '✓'],
                  ['Bridge Risk Score™', '—', '—', '✓'],
                  ['Stress testing', '—', '—', '✓'],
                  ['PDF report export', '—', '—', '✓'],
                  ['Access from any device', '—', '—', '✓'],
                ].map(([feature, free, xls, pro]) => (
                  <tr key={feature} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                    <td className="px-6 py-3 text-[13px] text-white/60">{feature}</td>
                    <td className="px-4 py-3 text-center text-[13px] text-white/30">{free}</td>
                    <td className="px-4 py-3 text-center text-[13px]" style={{ color: xls === '✓' ? '#2DD4BF' : 'rgba(255,255,255,0.2)' }}>{xls}</td>
                    <td className="px-4 py-3 text-center text-[13px]" style={{ color: pro === '✓' ? '#E8B84B' : 'rgba(255,255,255,0.2)' }}>{pro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Online Planner callout */}
        <div className="bg-ink border border-gold/20 rounded-2xl overflow-hidden mb-8">
          <div className="border-b border-white/[0.06] px-8 py-5 flex items-center justify-between">
            <div>
              <div className="font-mono text-[9px] tracking-widest uppercase text-gold mb-1">Online Pro</div>
              <h2 className="font-syne font-bold text-xl text-white">Online Retirement Planner</h2>
            </div>
            <div className="text-4xl">🖥️</div>
          </div>
          <div className="p-8">
            <p className="text-white/50 text-[14px] leading-relaxed mb-6 max-w-2xl">
              Save up to 5 named scenarios, run Monte Carlo simulation, and access your plan from any device. Your numbers live in the cloud — come back anytime as your situation changes.
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
                href={onlineLink}
                onClick={() => trackProCtaClick('pricing-planner-callout')}
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

        {/* Pro Excel callout */}
        <div className="bg-ink border border-white/[0.07] rounded-2xl overflow-hidden mb-12">
          <div className="border-b border-white/[0.06] px-8 py-5 flex items-center justify-between">
            <div>
              <div className="font-mono text-[9px] tracking-widest uppercase text-[#2DD4BF] mb-1">One-Time Purchase</div>
              <h2 className="font-syne font-bold text-xl text-white">Pro Excel Planner — 9 Sheets</h2>
            </div>
            <div className="text-4xl">📋</div>
          </div>
          <div className="p-8">
            <p className="text-white/50 text-[14px] leading-relaxed mb-8 max-w-2xl">
              The complete offline planning system. Change one number in INPUTS and all 9 sheets update instantly. No internet required, no subscription, use it forever.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
              {PRO_SHEETS.map(s => (
                <div key={s.name} className="bg-black/30 border border-white/[0.06] rounded-xl p-4">
                  <div className="font-mono text-[9px] tracking-widest uppercase text-[#2DD4BF] mb-1">{s.name}</div>
                  <div className="text-white/45 text-[12px] leading-relaxed">{s.desc}</div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <a
                href={xlsLink}
                onClick={() => trackProCtaClick('pricing-xls-callout')}
                className="inline-block font-syne font-semibold text-[13px] tracking-wide px-6 py-3 rounded hover:opacity-85 transition-opacity"
                style={{ background: '#2DD4BF', color: '#0D1420' }}
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
              <div className="font-mono text-[9px] tracking-widest uppercase text-gold mb-1">Signature Online Pro Feature</div>
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

        {/* FAQ */}
        <div className="mb-16">
          <h2 className="font-syne font-bold text-2xl text-white mb-8 text-center">Questions</h2>
          <div className="space-y-4 max-w-2xl mx-auto">
            {[
              { q: 'What is the difference between Pro Excel and Online Pro?', a: 'Pro Excel ($39 one-time) is a downloadable Excel file you use on your own computer — no internet required, no recurring billing, use it forever. Online Pro ($15/month) is the cloud-based planner with saved scenarios, Monte Carlo, Bridge Risk Score, stress testing, and access from any device. The monthly subscription does not include the Pro Excel download.' },
              { q: 'Does Pro Excel get future updates automatically?', a: 'No. The $39 purchase includes the current version (v3) only. Future major versions will be available as separate purchases. We will notify you by email when a new version ships.' },
              { q: 'Can I cancel Online Pro anytime?', a: 'Yes. Cancel from your account settings without calling or contacting support. Access continues through the end of your paid billing period.' },
              { q: 'What is the refund policy for Pro Excel?', a: 'Pro Excel is a digital download and is not refundable once purchased. If you have a problem with the file or your download, contact support and we will make it right.' },
              { q: 'Is this financial advice?', a: 'No — BridgeToRetired Pro is a modeling tool, not a financial advisory service. We help you run the math clearly so you can make your own decisions or bring better questions to a fee-only advisor.' },
              { q: 'What is included in Pro Excel v3?', a: 'Pro Excel v3 is the nine-sheet downloadable workbook. It adds federal tax estimates, Roth conversion planning with an ACA cross-check, post-59½ projections, Monte Carlo simulation, risk flags, and rebalancing tools.' },
              { q: 'What is included in Online Pro?', a: 'Online Pro adds the cloud-based planner, saved scenario comparison, Bridge Risk Score, online Monte Carlo simulation, sequence-risk testing, PDF reports, and access from any device. It does not include the Pro Excel download.' },
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
            <div className="font-mono text-[9px] tracking-widest uppercase text-gold mb-4">Choose How You Want to Plan</div>
            <h2 className="font-syne font-bold text-[clamp(24px,4vw,38px)] text-white tracking-tight mb-4">
              Know your score before<br />you retire.
            </h2>
            <p className="text-white/40 text-[14px] mb-8 max-w-md mx-auto leading-relaxed">
              Own the complete Excel workbook once, or keep your scenarios saved and stress-tested online.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-4">
              <a
                href={xlsLink}
                onClick={() => trackProCtaClick('pricing-final-xls')}
                className="inline-block font-syne font-semibold text-[14px] tracking-wide px-8 py-4 rounded-xl hover:opacity-90 transition-opacity"
                style={{ background: '#2DD4BF', color: '#0D1420' }}
              >
                Buy Pro Excel — $39 one-time →
              </a>
              <a
                href={onlineLink}
                onClick={() => trackProCtaClick('pricing-final-online-pro')}
                className="inline-block bg-gold text-black font-syne font-semibold text-[14px] tracking-wide px-8 py-4 rounded-xl hover:opacity-90 transition-opacity"
              >
                Start Online Pro — $15/mo →
              </a>
            </div>
            <div className="font-mono text-[9px] text-white/20 tracking-wider">
              Online Pro: cancel anytime · Pro Excel: secure one-time purchase with instant access
            </div>
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
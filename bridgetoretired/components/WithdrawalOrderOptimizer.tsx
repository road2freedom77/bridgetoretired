'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { trackCalculatorUsed, trackToolComplete, trackProCtaClick } from '@/lib/analytics'

const COLORS = {
  gold: '#E8B84B', teal: '#2DD4BF', purple: '#A78BFA',
  red: '#F87171', sage: '#4ADE80', orange: '#FB923C',
  blue: '#60A5FA', white: '#FFFFFF', dark: '#0D1420', ink: '#141C28',
}

function formatDollars(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${Math.round(n / 1_000)}k`
  return `$${Math.round(n).toLocaleString()}`
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#0D1420', border: '1px solid rgba(232,184,75,0.2)', borderRadius: 8, padding: '10px 14px', fontFamily: 'monospace', fontSize: 11 }}>
      <div style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>Age {label}</div>
      {payload.map((p: any) => p.value > 0 && (
        <div key={p.name} style={{ color: p.color, marginBottom: 3 }}>{p.name}: {formatDollars(p.value)}</div>
      ))}
    </div>
  )
}

const PRO_FEATURES = [
  { icon: '🛡️', label: 'Bridge Risk Score™', sub: 'Grade your plan in 60 seconds' },
  { icon: '📉', label: 'Sequence-of-Returns Stress Tester', sub: '2000, 2008, worst-case crashes' },
  { icon: '🖥️', label: 'Online Retirement Planner', sub: 'Save up to 5 scenarios' },
  { icon: '📄', label: 'PDF Report Export', sub: 'CPA-ready, shareable' },
]

function runOptimalStrategy(retireAge: number, taxable: number, k401k: number, roth: number, annualSpend: number, returnRate: number) {
  const rate = returnRate / 100
  const rows = []
  let t = taxable, k = k401k, r = roth, totalTax = 0

  for (let age = retireAge; age <= 90; age++) {
    const isBridge = age < 59.5
    const ssIncome = age >= 67 ? 24_000 : 0
    const need = Math.max(0, annualSpend - ssIncome)
    let taxThisYear = 0, grossNeed = need

    if (isBridge) {
      const fromTaxable = Math.min(t, grossNeed); t -= fromTaxable; taxThisYear += fromTaxable * 0.04; grossNeed -= fromTaxable
      const fromRoth = Math.min(r, grossNeed); r -= fromRoth; grossNeed -= fromRoth
      if (grossNeed > 0) { const from401k = Math.min(k, grossNeed); k -= from401k; taxThisYear += from401k * 0.12; grossNeed -= from401k }
    } else {
      const from401k = Math.min(k, grossNeed); k -= from401k; taxThisYear += from401k * 0.15; grossNeed -= from401k
      const fromTaxable = Math.min(t, grossNeed); t -= fromTaxable; taxThisYear += fromTaxable * 0.04; grossNeed -= fromTaxable
      const fromRoth = Math.min(r, grossNeed); r -= fromRoth; grossNeed -= fromRoth
    }

    totalTax += taxThisYear
    t = Math.max(0, t * (1 + rate)); k = Math.max(0, k * (1 + rate)); r = Math.max(0, r * (1 + rate))
    rows.push({ age, Taxable: Math.round(t), '401k': Math.round(k), Roth: Math.round(r), tax: Math.round(taxThisYear) })
  }

  const last = rows[rows.length - 1]
  return { rows, totalTax: Math.round(totalTax), totalPenalty: 0, final: (last?.Taxable ?? 0) + (last?.['401k'] ?? 0) + (last?.Roth ?? 0) }
}

function runWrongStrategy(retireAge: number, taxable: number, k401k: number, roth: number, annualSpend: number, returnRate: number) {
  const rate = returnRate / 100
  const rows = []
  let t = taxable, k = k401k, r = roth, totalTax = 0, totalPenalty = 0

  for (let age = retireAge; age <= 90; age++) {
    const isBridge = age < 59.5
    const ssIncome = age >= 67 ? 24_000 : 0
    const need = Math.max(0, annualSpend - ssIncome)
    let taxThisYear = 0, penaltyThisYear = 0, grossNeed = need

    if (isBridge) {
      const grossFrom401k = Math.min(k, grossNeed / 0.68); k -= grossFrom401k
      taxThisYear += grossFrom401k * 0.22; penaltyThisYear += grossFrom401k * 0.10; grossNeed -= grossFrom401k * 0.68
      if (grossNeed > 0) { const fromTaxable = Math.min(t, grossNeed); t -= fromTaxable; taxThisYear += fromTaxable * 0.08; grossNeed -= fromTaxable }
      if (grossNeed > 0) { const fromRoth = Math.min(r, grossNeed); r -= fromRoth; grossNeed -= fromRoth }
    } else {
      const fromTaxable = Math.min(t, grossNeed); t -= fromTaxable; taxThisYear += fromTaxable * 0.08; grossNeed -= fromTaxable
      const from401k = Math.min(k, grossNeed); k -= from401k; taxThisYear += from401k * 0.15; grossNeed -= from401k
      const fromRoth = Math.min(r, grossNeed); r -= fromRoth; grossNeed -= fromRoth
    }

    totalTax += taxThisYear; totalPenalty += penaltyThisYear
    t = Math.max(0, t * (1 + rate)); k = Math.max(0, k * (1 + rate)); r = Math.max(0, r * (1 + rate))
    rows.push({ age, Taxable: Math.round(t), '401k': Math.round(k), Roth: Math.round(r), tax: Math.round(taxThisYear) })
  }

  const last = rows[rows.length - 1]
  return { rows, totalTax: Math.round(totalTax), totalPenalty: Math.round(totalPenalty), final: (last?.Taxable ?? 0) + (last?.['401k'] ?? 0) + (last?.Roth ?? 0) }
}

export default function WithdrawalOrderOptimizer() {
  const { user } = useUser()
  const isPro = (user?.publicMetadata as any)?.isPro === true

  const [retireAge, setRetireAge] = useState(52)
  const [taxable, setTaxable] = useState(500_000)
  const [k401k, setK401k] = useState(800_000)
  const [roth, setRoth] = useState(150_000)
  const [annualSpend, setAnnualSpend] = useState(65_000)
  const [returnRate, setReturnRate] = useState(6)
  const [activeTab, setActiveTab] = useState<'optimal' | 'wrong'>('optimal')

  const track = useCallback(() => { trackCalculatorUsed('withdrawal-optimizer'); trackToolComplete('withdrawal-optimizer') }, [])
  function tracked(setter: (v: number) => void) {
    return (v: number) => { track(); setter(v) }
  }

  const optimal = useMemo(() => runOptimalStrategy(retireAge, taxable, k401k, roth, annualSpend, returnRate), [retireAge, taxable, k401k, roth, annualSpend, returnRate])
  const wrong = useMemo(() => runWrongStrategy(retireAge, taxable, k401k, roth, annualSpend, returnRate), [retireAge, taxable, k401k, roth, annualSpend, returnRate])

  const wealthDifference = optimal.final - wrong.final
  const taxDifference = wrong.totalTax - optimal.totalTax
  const activeData = activeTab === 'optimal' ? optimal.rows : wrong.rows

  const bridgePhaseSteps = [
    { order: 1, account: 'Taxable Brokerage', color: COLORS.teal, reason: '0% capital gains tax if income managed carefully. Return of basis not taxed at all.' },
    { order: 2, account: 'Roth Contributions', color: COLORS.purple, reason: 'Your own contributions always accessible penalty-free. No tax on withdrawal.' },
    { order: 3, account: 'Roth Conversions (5yr+)', color: COLORS.blue, reason: 'Conversions seasoned 5+ years become accessible. Tax already paid at conversion.' },
    { order: 4, account: '401k / IRA via 72(t)', color: COLORS.orange, reason: 'Only if needed. Requires SEPP commitment. Avoid if taxable covers the bridge.' },
  ]

  const postBridgeSteps = [
    { order: 1, account: '401k / Traditional IRA', color: COLORS.gold, reason: 'Draw down to reduce future RMDs at 73+. Fill low tax brackets each year.' },
    { order: 2, account: 'Taxable Brokerage', color: COLORS.teal, reason: 'Now let this recover and compound. Draw as needed to supplement 401k.' },
    { order: 3, account: 'Roth IRA', color: COLORS.purple, reason: 'Draw last. No RMDs, tax-free growth, passes to heirs tax-free. Your longevity insurance.' },
  ]

  return (
    <div style={{ background: '#0D1420', borderRadius: 16, border: '1px solid rgba(232,184,75,0.15)', overflow: 'hidden', fontFamily: "'IBM Plex Mono', monospace", margin: '2rem 0' }}>
      <div style={{ background: '#141C28', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '20px 24px' }}>
        <div style={{ fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: COLORS.gold, marginBottom: 6 }}>Interactive Optimizer</div>
        <h3 style={{ color: COLORS.white, fontSize: 18, fontFamily: 'Georgia, serif', fontWeight: 700, margin: 0, marginBottom: 4 }}>Withdrawal Order Optimizer</h3>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, margin: 0 }}>See how optimal vs wrong withdrawal order affects your lifetime wealth — and the exact sequence to follow in each phase.</p>
      </div>

      <div style={{ padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Retirement Age', value: retireAge, set: tracked(setRetireAge), min: 40, max: 58, step: 1, fmt: (v: number) => `Age ${v}` },
            { label: 'Annual Spending', value: annualSpend, set: tracked(setAnnualSpend), min: 30000, max: 120000, step: 5000, fmt: (v: number) => formatDollars(v) },
            { label: 'Taxable Account', value: taxable, set: tracked(setTaxable), min: 50000, max: 2000000, step: 50000, fmt: (v: number) => formatDollars(v) },
            { label: '401k / IRA', value: k401k, set: tracked(setK401k), min: 100000, max: 3000000, step: 50000, fmt: (v: number) => formatDollars(v) },
            { label: 'Roth IRA', value: roth, set: tracked(setRoth), min: 0, max: 500000, step: 25000, fmt: (v: number) => formatDollars(v) },
            { label: 'Annual Return', value: returnRate, set: tracked(setReturnRate), min: 3, max: 10, step: 0.5, fmt: (v: number) => `${v}%` },
          ].map(({ label, value, set, min, max, step, fmt }) => (
            <div key={label} style={{ background: '#141C28', borderRadius: 10, padding: '12px 14px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>{label}</span>
                <span style={{ fontSize: 12, color: COLORS.gold, fontWeight: 600 }}>{fmt(value)}</span>
              </div>
              <input type="range" min={min} max={max} step={step} value={value} onChange={e => set(Number(e.target.value))} style={{ width: '100%', accentColor: COLORS.gold, cursor: 'pointer' }} />
            </div>
          ))}
        </div>

        <div style={{ background: '#141C28', borderRadius: 12, padding: '24px', marginBottom: 20, textAlign: 'center' as const, border: '1px solid rgba(232,184,75,0.2)' }}>
          <div style={{ fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 8 }}>Potential Lifetime Difference</div>
          <div style={{ fontSize: 52, fontWeight: 700, color: COLORS.gold, fontFamily: 'Georgia, serif', lineHeight: 1, marginBottom: 8 }}>
            {wealthDifference >= 0 ? '+' : ''}{formatDollars(wealthDifference)}
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 20 }}>caused by withdrawal order alone</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, maxWidth: 480, margin: '0 auto' }}>
            <div style={{ background: 'rgba(74,222,128,0.06)', borderRadius: 8, padding: '10px 14px', border: `1px solid ${COLORS.sage}20` }}>
              <div style={{ fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>Optimal Order</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.sage, fontFamily: 'Georgia, serif' }}>{formatDollars(optimal.final)}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)' }}>at age 90</div>
            </div>
            <div style={{ background: 'rgba(248,113,113,0.06)', borderRadius: 8, padding: '10px 14px', border: `1px solid ${COLORS.red}20` }}>
              <div style={{ fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>Wrong Order</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.red, fontFamily: 'Georgia, serif' }}>{formatDollars(wrong.final)}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)' }}>401k first during bridge</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {(['optimal', 'wrong'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '6px 16px', borderRadius: 6, border: 'none', cursor: 'pointer',
              fontFamily: 'monospace', fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase',
              background: activeTab === tab ? (tab === 'optimal' ? COLORS.sage : COLORS.red) : 'rgba(255,255,255,0.06)',
              color: activeTab === tab ? COLORS.dark : 'rgba(255,255,255,0.4)',
            }}>
              {tab === 'optimal' ? '✓ Optimal Order' : '✗ Wrong Order'}
            </button>
          ))}
        </div>

        <div style={{ background: '#141C28', borderRadius: 12, padding: '20px 16px 12px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 16, fontFamily: 'Georgia, serif' }}>
            {activeTab === 'optimal' ? 'Optimal Withdrawal Order — Account Balances Over Time' : 'Wrong Order — Drawing 401k During Bridge Years (10% penalty + 22% tax)'}
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={activeData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <defs>
                {[['tealGrad', COLORS.teal], ['goldGrad', COLORS.gold], ['purpleGrad', COLORS.purple]].map(([id, color]) => (
                  <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={color} stopOpacity={0.02} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="age" tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 9, fontFamily: 'monospace' }} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 9, fontFamily: 'monospace' }} tickFormatter={formatDollars} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)', paddingTop: 12 }} />
              <Area type="monotone" dataKey="Taxable" stroke={COLORS.teal} fill="url(#tealGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="401k" stroke={COLORS.gold} fill="url(#goldGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="Roth" stroke={COLORS.purple} fill="url(#purpleGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div style={{ background: '#141C28', borderRadius: 12, padding: '16px', border: '1px solid rgba(232,184,75,0.15)' }}>
            <div style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: COLORS.gold, marginBottom: 12 }}>Phase 1: Bridge Years (Retire → Age 59½)</div>
            {bridgePhaseSteps.map(step => (
              <div key={step.order} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0, background: step.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: COLORS.dark }}>{step.order}</div>
                <div>
                  <div style={{ fontSize: 10, color: step.color, fontWeight: 600, marginBottom: 2 }}>{step.account}</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', lineHeight: 1.5 }}>{step.reason}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: '#141C28', borderRadius: 12, padding: '16px', border: '1px solid rgba(45,212,191,0.15)' }}>
            <div style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: COLORS.teal, marginBottom: 12 }}>Phase 2: Post-59½ (401k Unlocked)</div>
            {postBridgeSteps.map(step => (
              <div key={step.order} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0, background: step.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: COLORS.dark }}>{step.order}</div>
                <div>
                  <div style={{ fontSize: 10, color: step.color, fontWeight: 600, marginBottom: 2 }}>{step.account}</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', lineHeight: 1.5 }}>{step.reason}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: 'rgba(232,184,75,0.06)', border: '1px solid rgba(232,184,75,0.15)', borderLeft: `3px solid ${COLORS.gold}`, borderRadius: 8, padding: '14px 16px', marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: COLORS.gold, fontWeight: 600, marginBottom: 6, letterSpacing: 1 }}>💡 WHY ORDER MATTERS THIS MUCH</div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.7 }}>
            Drawing from your 401k during bridge years triggers a 10% early withdrawal penalty plus ordinary income tax — up to 32% total cost.
            Drawing from taxable accounts at long-term capital gains rates in a low-income year can cost as little as 0–8%.
            That gap, compounded over {Math.round(59.5 - retireAge)} bridge years and {90 - retireAge} total years of portfolio growth,
            produces the <strong style={{ color: COLORS.gold }}>{formatDollars(Math.abs(wealthDifference))}</strong> difference shown above.
            Also saves <strong style={{ color: COLORS.gold }}>{formatDollars(Math.abs(taxDifference))}</strong> in total taxes and <strong style={{ color: COLORS.gold }}>{formatDollars(wrong.totalPenalty)}</strong> in penalties.
          </p>
        </div>

        <div style={{ background: 'rgba(45,212,191,0.06)', border: '1px solid rgba(45,212,191,0.15)', borderLeft: `3px solid ${COLORS.teal}`, borderRadius: 8, padding: '14px 16px', marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: COLORS.teal, fontWeight: 600, marginBottom: 6, letterSpacing: 1 }}>🌉 NEXT STEP</div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', margin: '0 0 10px', lineHeight: 1.7 }}>
            Now that you know the right order, check if your taxable account is large enough to fund the bridge — and score your overall plan.
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
            <a href="/tools/bridge-health-check" style={{ fontSize: 10, color: COLORS.teal, border: `1px solid ${COLORS.teal}40`, padding: '5px 12px', borderRadius: 5, textDecoration: 'none', fontWeight: 600 }}>Check Bridge Health →</a>
            <a href="/tools/taxable-brokerage-gap-calculator" style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.15)', padding: '5px 12px', borderRadius: 5, textDecoration: 'none', fontWeight: 600 }}>Taxable Gap Calculator →</a>
            <a href="/tools/roth-conversion-ladder-calculator" style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)', padding: '5px 12px', borderRadius: 5, textDecoration: 'none' }}>Roth Ladder →</a>
            <a href="/tools/72t-sepp-calculator" style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)', padding: '5px 12px', borderRadius: 5, textDecoration: 'none' }}>72(t) SEPP →</a>
          </div>
        </div>

        {!isPro && (
          <>
            <div style={{ background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)', borderLeft: `3px solid ${COLORS.red}`, borderRadius: 10, padding: '16px 20px', marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: COLORS.red, fontWeight: 600, marginBottom: 8, letterSpacing: 1 }}>📉 NOW TEST IF IT SURVIVES</div>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', margin: '0 0 12px', lineHeight: 1.7 }}>
                Your withdrawal order is optimized. But does your plan survive a bad market?
              </p>
              <div style={{ display: 'flex', gap: 16, marginBottom: 12, flexWrap: 'wrap' as const }}>
                {['✓ A 2008-style crash', '✓ A long bear market', '✓ Higher-than-expected inflation'].map(item => (
                  <div key={item} style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{item}</div>
                ))}
              </div>
              <Link
                href="/pricing"
                onClick={() => trackProCtaClick('withdrawal-optimizer-stress-hook')}
                style={{ background: COLORS.red, color: '#fff', fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 12, padding: '8px 20px', borderRadius: 7, textDecoration: 'none', display: 'inline-block' }}
              >
                Run Stress Test → (Pro)
              </Link>
            </div>

            <div style={{ background: 'linear-gradient(135deg, rgba(232,184,75,0.06) 0%, rgba(232,184,75,0.02) 100%)', border: '1px solid rgba(232,184,75,0.2)', borderLeft: '3px solid #E8B84B', borderRadius: 12, padding: '20px 24px' }}>
              <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: COLORS.gold, marginBottom: 10 }}>⚡ BridgeToRetired Pro — $15/mo</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 16 }}>
                {PRO_FEATURES.map(({ icon, label, sub }) => (
                  <div key={label} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 14, flexShrink: 0 }}>{icon}</span>
                    <div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{label}</div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{sub}</div>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/pricing"
                onClick={() => trackProCtaClick('withdrawal-optimizer-upsell')}
                style={{ background: COLORS.gold, color: '#0D1420', fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 12, padding: '10px 24px', borderRadius: 8, textDecoration: 'none', display: 'inline-block' }}
              >
                See Pro Plans →
              </Link>
            </div>
          </>
        )}
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.15)', letterSpacing: 1 }}>Simplified model · For educational purposes only</span>
        {!isPro && (
          <a href="/#download"
            onClick={() => trackProCtaClick('withdrawal-optimizer-footer-planner')}
            style={{ fontSize: 9, color: COLORS.gold, textDecoration: 'none', letterSpacing: 2, textTransform: 'uppercase' }}>
            Get Free Planner →
          </a>
        )}
      </div>
    </div>
  )
}
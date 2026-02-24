'use client'

import { useState, useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const COLORS = {
  gold: '#E8B84B',
  teal: '#2DD4BF',
  purple: '#A78BFA',
  red: '#F87171',
  sage: '#4ADE80',
  orange: '#FB923C',
  blue: '#60A5FA',
  white: '#FFFFFF',
  dark: '#0D1420',
  ink: '#141C28',
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
        <div key={p.name} style={{ color: p.color, marginBottom: 3 }}>
          {p.name}: {formatDollars(p.value)}
        </div>
      ))}
    </div>
  )
}

function runOptimalStrategy(retireAge: number, taxable: number, k401k: number, roth: number, annualSpend: number, returnRate: number) {
  const rate = returnRate / 100
  const rows = []
  let t = taxable, k = k401k, r = roth
  let totalTax = 0

  for (let age = retireAge; age <= 90; age++) {
    const isBridge = age < 59.5
    const hasSS = age >= 67
    const ssIncome = hasSS ? 24_000 : 0
    const need = Math.max(0, annualSpend - ssIncome)

    let taxThisYear = 0

    if (isBridge) {
      // Draw taxable first, then Roth contributions
      const fromTaxable = Math.min(t, need)
      t -= fromTaxable
      const fromRoth = Math.min(r, need - fromTaxable)
      r -= fromRoth
      // Assume 15% effective tax on capital gains portion (simplified)
      taxThisYear = Math.round(fromTaxable * 0.08)
    } else {
      // Draw 401k first, then taxable, Roth last
      const from401k = Math.min(k, need)
      k -= from401k
      const fromTaxable = Math.min(t, need - from401k)
      t -= fromTaxable
      const fromRoth = Math.min(r, need - from401k - fromTaxable)
      r -= fromRoth
      taxThisYear = Math.round(from401k * 0.15)
    }

    totalTax += taxThisYear
    t = Math.max(0, t * (1 + rate))
    k = Math.max(0, k * (1 + rate))
    r = Math.max(0, r * (1 + rate))

    rows.push({ age, Taxable: Math.round(t), '401k': Math.round(k), Roth: Math.round(r), tax: taxThisYear })
  }

  return { rows, totalTax, final: (rows[rows.length - 1]?.Taxable ?? 0) + (rows[rows.length - 1]?.['401k'] ?? 0) + (rows[rows.length - 1]?.Roth ?? 0) }
}

function runWrongStrategy(retireAge: number, taxable: number, k401k: number, roth: number, annualSpend: number, returnRate: number) {
  // Wrong: draw 401k first even during bridge (paying penalties), keep Roth
  const rate = returnRate / 100
  const rows = []
  let t = taxable, k = k401k, r = roth
  let totalTax = 0
  let totalPenalty = 0

  for (let age = retireAge; age <= 90; age++) {
    const isBridge = age < 59.5
    const hasSS = age >= 67
    const ssIncome = hasSS ? 24_000 : 0
    const need = Math.max(0, annualSpend - ssIncome)

    let taxThisYear = 0

    if (isBridge) {
      // Wrong: drain 401k with penalty, ignore taxable
      const from401k = Math.min(k, need)
      k -= from401k
      const fromTaxable = Math.min(t, need - from401k)
      t -= fromTaxable
      const penalty = from401k * 0.10
      totalPenalty += penalty
      taxThisYear = Math.round(from401k * 0.22 + penalty)
    } else {
      const fromTaxable = Math.min(t, need)
      t -= fromTaxable
      const from401k = Math.min(k, need - fromTaxable)
      k -= from401k
      taxThisYear = Math.round(from401k * 0.15)
    }

    totalTax += taxThisYear
    t = Math.max(0, t * (1 + rate))
    k = Math.max(0, k * (1 + rate))
    r = Math.max(0, r * (1 + rate))

    rows.push({ age, Taxable: Math.round(t), '401k': Math.round(k), Roth: Math.round(r), tax: taxThisYear })
  }

  return { rows, totalTax, totalPenalty, final: (rows[rows.length - 1]?.Taxable ?? 0) + (rows[rows.length - 1]?.['401k'] ?? 0) + (rows[rows.length - 1]?.Roth ?? 0) }
}

export default function WithdrawalOrderOptimizer() {
  const [retireAge, setRetireAge] = useState(52)
  const [taxable, setTaxable] = useState(500_000)
  const [k401k, setK401k] = useState(800_000)
  const [roth, setRoth] = useState(150_000)
  const [annualSpend, setAnnualSpend] = useState(65_000)
  const [returnRate, setReturnRate] = useState(6)
  const [activeTab, setActiveTab] = useState<'optimal' | 'wrong'>('optimal')

  const optimal = useMemo(() =>
    runOptimalStrategy(retireAge, taxable, k401k, roth, annualSpend, returnRate),
    [retireAge, taxable, k401k, roth, annualSpend, returnRate])

  const wrong = useMemo(() =>
    runWrongStrategy(retireAge, taxable, k401k, roth, annualSpend, returnRate),
    [retireAge, taxable, k401k, roth, annualSpend, returnRate])

  const wealthDifference = optimal.final - wrong.final
  const taxDifference = wrong.totalTax - optimal.totalTax
  const activeData = activeTab === 'optimal' ? optimal.rows : wrong.rows

  // Phase labels
  const bridgeEnd = 59.5
  const ssAge = 67

  // Decision flowchart steps
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
    <div style={{
      background: '#0D1420', borderRadius: 16,
      border: '1px solid rgba(232,184,75,0.15)', overflow: 'hidden',
      fontFamily: "'IBM Plex Mono', monospace", margin: '2rem 0',
    }}>
      {/* Header */}
      <div style={{ background: '#141C28', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '20px 24px' }}>
        <div style={{ fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: COLORS.gold, marginBottom: 6 }}>Interactive Optimizer</div>
        <h3 style={{ color: COLORS.white, fontSize: 18, fontFamily: 'Georgia, serif', fontWeight: 700, margin: 0, marginBottom: 4 }}>
          Withdrawal Order Optimizer
        </h3>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, margin: 0 }}>
          See how optimal vs wrong withdrawal order affects your lifetime wealth — and the exact sequence to follow in each phase.
        </p>
      </div>

      <div style={{ padding: '24px' }}>

        {/* Controls */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Retirement Age', value: retireAge, set: setRetireAge, min: 40, max: 58, step: 1, fmt: (v: number) => `Age ${v}` },
            { label: 'Annual Spending', value: annualSpend, set: setAnnualSpend, min: 30000, max: 120000, step: 5000, fmt: (v: number) => formatDollars(v) },
            { label: 'Taxable Account', value: taxable, set: setTaxable, min: 50000, max: 2000000, step: 50000, fmt: (v: number) => formatDollars(v) },
            { label: '401k / IRA', value: k401k, set: setK401k, min: 100000, max: 3000000, step: 50000, fmt: (v: number) => formatDollars(v) },
            { label: 'Roth IRA', value: roth, set: setRoth, min: 0, max: 500000, step: 25000, fmt: (v: number) => formatDollars(v) },
            { label: 'Annual Return', value: returnRate, set: setReturnRate, min: 3, max: 10, step: 0.5, fmt: (v: number) => `${v}%` },
          ].map(({ label, value, set, min, max, step, fmt }) => (
            <div key={label} style={{ background: '#141C28', borderRadius: 10, padding: '12px 14px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>{label}</span>
                <span style={{ fontSize: 12, color: COLORS.gold, fontWeight: 600 }}>{fmt(value)}</span>
              </div>
              <input type="range" min={min} max={max} step={step} value={value}
                onChange={e => set(Number(e.target.value))}
                style={{ width: '100%', accentColor: COLORS.gold, cursor: 'pointer' }} />
            </div>
          ))}
        </div>

        {/* Impact summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
          <div style={{ background: '#141C28', borderRadius: 10, padding: '12px 14px', border: `1px solid ${COLORS.sage}20`, borderTop: `3px solid ${COLORS.sage}` }}>
            <div style={{ fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>Wealth at 90 (Optimal)</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.sage, fontFamily: 'Georgia, serif' }}>{formatDollars(optimal.final)}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>correct order</div>
          </div>
          <div style={{ background: '#141C28', borderRadius: 10, padding: '12px 14px', border: `1px solid ${COLORS.red}20`, borderTop: `3px solid ${COLORS.red}` }}>
            <div style={{ fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>Wealth at 90 (Wrong Order)</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.red, fontFamily: 'Georgia, serif' }}>{formatDollars(wrong.final)}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>401k first during bridge</div>
          </div>
          <div style={{ background: '#141C28', borderRadius: 10, padding: '12px 14px', border: `1px solid ${COLORS.gold}20`, borderTop: `3px solid ${COLORS.gold}` }}>
            <div style={{ fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>Lifetime Difference</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.gold, fontFamily: 'Georgia, serif' }}>+{formatDollars(Math.abs(wealthDifference))}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>+{formatDollars(Math.abs(taxDifference))} less tax</div>
          </div>
        </div>

        {/* Chart tabs */}
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
            {activeTab === 'optimal' ? 'Optimal Withdrawal Order — Account Balances Over Time' : 'Wrong Order — Drawing 401k During Bridge Years'}
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

        {/* Phase decision guides */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          {/* Bridge phase */}
          <div style={{ background: '#141C28', borderRadius: 12, padding: '16px', border: '1px solid rgba(232,184,75,0.15)' }}>
            <div style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: COLORS.gold, marginBottom: 12 }}>
              Phase 1: Bridge Years (Retire → Age 59½)
            </div>
            {bridgePhaseSteps.map(step => (
              <div key={step.order} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                  background: step.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700, color: COLORS.dark,
                }}>
                  {step.order}
                </div>
                <div>
                  <div style={{ fontSize: 10, color: step.color, fontWeight: 600, marginBottom: 2 }}>{step.account}</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', lineHeight: 1.5 }}>{step.reason}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Post-bridge phase */}
          <div style={{ background: '#141C28', borderRadius: 12, padding: '16px', border: '1px solid rgba(45,212,191,0.15)' }}>
            <div style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: COLORS.teal, marginBottom: 12 }}>
              Phase 2: Post-59½ (401k Unlocked)
            </div>
            {postBridgeSteps.map(step => (
              <div key={step.order} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                  background: step.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700, color: COLORS.dark,
                }}>
                  {step.order}
                </div>
                <div>
                  <div style={{ fontSize: 10, color: step.color, fontWeight: 600, marginBottom: 2 }}>{step.account}</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', lineHeight: 1.5 }}>{step.reason}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insight */}
        <div style={{
          background: 'rgba(232,184,75,0.06)', border: '1px solid rgba(232,184,75,0.15)',
          borderLeft: `3px solid ${COLORS.gold}`, borderRadius: 8, padding: '14px 16px',
        }}>
          <div style={{ fontSize: 10, color: COLORS.gold, fontWeight: 600, marginBottom: 6, letterSpacing: 1 }}>💡 WHY ORDER MATTERS THIS MUCH</div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.7 }}>
            Drawing from your 401k during bridge years costs a 10% penalty plus ordinary income tax — potentially 30-35% total.
            Drawing from taxable at long-term capital gains rates in a low-income year can cost 0-8%.
            That gap, compounded over {Math.round(59.5 - retireAge)} bridge years and {90 - retireAge} years of portfolio growth,
            produces the <strong style={{ color: COLORS.gold }}>{formatDollars(Math.abs(wealthDifference))}</strong> difference shown above.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.15)', letterSpacing: 1 }}>Simplified model · For educational purposes only</span>
        <a href="/#download" style={{ fontSize: 9, color: COLORS.gold, textDecoration: 'none', letterSpacing: 2, textTransform: 'uppercase' }}>Get Free Planner →</a>
      </div>
    </div>
  )
}

'use client'

import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts'

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
      <div style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.fill || p.color, marginBottom: 3 }}>
          {p.name}: {formatDollars(p.value)}
        </div>
      ))}
    </div>
  )
}

const WITHDRAWAL_RATES: Record<number, number> = {
  30: 0.040,
  35: 0.037,
  40: 0.033,
  45: 0.031,
  50: 0.030,
}

export default function FIRENumberCalculator() {
  const [retireAge, setRetireAge] = useState(50)
  const [annualSpend, setAnnualSpend] = useState(60_000)
  const [ssAge, setSsAge] = useState(67)
  const [ssMonthly, setSsMonthly] = useState(2_000)
  const [healthcareBudget, setHealthcareBudget] = useState(12_000)
  const [currentSaved, setCurrentSaved] = useState(800_000)

  const lifeExpectancy = 90
  const retirementYears = lifeExpectancy - retireAge
  const bridgeYears = 59.5 - retireAge
  const withdrawalRate = WITHDRAWAL_RATES[Math.min(50, Math.max(30, Math.round(retirementYears / 5) * 5))] ?? 0.033
  const ssAnnual = ssMonthly * 12

  // Components of the FIRE number
  const bridgeNeeded = Math.round(annualSpend * bridgeYears * 1.15) // 15% buffer
  const healthcareNeeded = Math.round(healthcareBudget * (65 - retireAge))
  const ssPostAge = ssAge
  const postSSSpend = Math.max(0, annualSpend - ssAnnual)

  // 401k needed at retirement: must fund postSSSpend from ssAge to 90, discounted back
  // Simplified: use withdrawal rate on post-SS spending need
  const k401kNeeded = postSSSpend > 0
    ? Math.round(postSSSpend / withdrawalRate)
    : 0

  // Sequence buffer
  const sequenceBuffer = Math.round(annualSpend * 1.5)

  const totalFireNumber = bridgeNeeded + healthcareNeeded + k401kNeeded + sequenceBuffer
  const gap = Math.max(0, totalFireNumber - currentSaved)
  const simpleFireNumber = Math.round(annualSpend / withdrawalRate)
  const differenceFromSimple = totalFireNumber - simpleFireNumber

  const breakdown = [
    { name: 'Bridge Account\n(Taxable/Roth)', value: bridgeNeeded, color: COLORS.teal, description: `${bridgeYears.toFixed(1)} years × $${(annualSpend / 1000).toFixed(0)}k + buffer` },
    { name: '401k at Retire', value: k401kNeeded, color: COLORS.gold, description: `Funds $${(postSSSpend / 1000).toFixed(0)}k/yr after SS at ${withdrawalRate * 100}%` },
    { name: 'Healthcare\nBuffer', value: healthcareNeeded, color: COLORS.purple, description: `${65 - retireAge} yrs × $${(healthcareBudget / 1000).toFixed(0)}k/yr` },
    { name: 'Sequence Risk\nBuffer', value: sequenceBuffer, color: COLORS.orange, description: '1.5 years spending cushion' },
  ]

  const pieData = breakdown.map(b => ({ name: b.name.replace('\n', ' '), value: b.value, fill: b.color }))

  // Comparison bar: simple 25x vs real number
  const comparisonData = [
    { name: 'Simple 25x Rule', value: Math.round(annualSpend * 25), fill: COLORS.red },
    { name: `${Math.round(1 / withdrawalRate)}x Rule (${retirementYears}yr)`, value: simpleFireNumber, fill: COLORS.orange },
    { name: 'Real Number\n(Bridge + Healthcare)', value: totalFireNumber, fill: COLORS.sage },
  ]

  const progressPct = Math.min(100, Math.round((currentSaved / totalFireNumber) * 100))

  return (
    <div style={{
      background: '#0D1420', borderRadius: 16,
      border: '1px solid rgba(232,184,75,0.15)', overflow: 'hidden',
      fontFamily: "'IBM Plex Mono', monospace", margin: '2rem 0',
    }}>
      {/* Header */}
      <div style={{ background: '#141C28', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '20px 24px' }}>
        <div style={{ fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: COLORS.gold, marginBottom: 6 }}>Interactive Calculator</div>
        <h3 style={{ color: COLORS.white, fontSize: 18, fontFamily: 'Georgia, serif', fontWeight: 700, margin: 0, marginBottom: 4 }}>
          How Much Do I Need to Retire at 50?
        </h3>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, margin: 0 }}>
          Beyond the 4% rule — calculates your real FIRE number with bridge years, healthcare, and Social Security built in.
        </p>
      </div>

      <div style={{ padding: '24px' }}>
        {/* Controls */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Target Retire Age', value: retireAge, set: setRetireAge, min: 40, max: 58, step: 1, fmt: (v: number) => `Age ${v}` },
            { label: 'Annual Spending', value: annualSpend, set: setAnnualSpend, min: 30000, max: 150000, step: 5000, fmt: (v: number) => formatDollars(v) },
            { label: 'SS Claiming Age', value: ssAge, set: setSsAge, min: 62, max: 70, step: 1, fmt: (v: number) => `Age ${v}` },
            { label: 'Monthly SS Benefit (at FRA)', value: ssMonthly, set: setSsMonthly, min: 0, max: 4000, step: 100, fmt: (v: number) => `$${v.toLocaleString()}/mo` },
            { label: 'Annual Healthcare Budget', value: healthcareBudget, set: setHealthcareBudget, min: 5000, max: 30000, step: 1000, fmt: (v: number) => formatDollars(v) },
            { label: 'Currently Saved', value: currentSaved, set: setCurrentSaved, min: 0, max: 5000000, step: 50000, fmt: (v: number) => formatDollars(v) },
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

        {/* Big FIRE number display */}
        <div style={{
          background: 'rgba(232,184,75,0.06)', border: '1px solid rgba(232,184,75,0.2)',
          borderRadius: 12, padding: '20px 24px', marginBottom: 20, textAlign: 'center',
        }}>
          <div style={{ fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 8 }}>
            Your Real FIRE Number (Age {retireAge}, {retirementYears}-yr retirement)
          </div>
          <div style={{ fontSize: 42, fontWeight: 700, color: COLORS.gold, fontFamily: 'Georgia, serif', lineHeight: 1 }}>
            {formatDollars(totalFireNumber)}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 8 }}>
            vs. simple 25x rule: {formatDollars(Math.round(annualSpend * 25))} — difference: <span style={{ color: differenceFromSimple > 0 ? COLORS.red : COLORS.sage }}>{differenceFromSimple > 0 ? '+' : ''}{formatDollars(differenceFromSimple)}</span>
          </div>
          {/* Progress bar */}
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>Current: {formatDollars(currentSaved)}</span>
              <span style={{ fontSize: 9, color: progressPct >= 100 ? COLORS.sage : COLORS.gold }}>{progressPct}% there</span>
            </div>
            <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${progressPct}%`,
                background: progressPct >= 100 ? COLORS.sage : COLORS.gold,
                borderRadius: 4, transition: 'width 0.3s ease',
              }} />
            </div>
            {gap > 0 && (
              <div style={{ fontSize: 10, color: COLORS.red, marginTop: 6 }}>
                Gap: {formatDollars(gap)} remaining
              </div>
            )}
            {gap === 0 && (
              <div style={{ fontSize: 10, color: COLORS.sage, marginTop: 6 }}>
                ✓ You've hit your FIRE number!
              </div>
            )}
          </div>
        </div>

        {/* KPI row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
          {breakdown.map(b => (
            <div key={b.name} style={{ background: '#141C28', borderRadius: 10, padding: '10px 12px', border: `1px solid ${b.color}20`, borderTop: `3px solid ${b.color}` }}>
              <div style={{ fontSize: 7, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 4, lineHeight: 1.3 }}>{b.name}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: b.color, fontFamily: 'Georgia, serif' }}>{formatDollars(b.value)}</div>
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', marginTop: 2, lineHeight: 1.4 }}>{b.description}</div>
            </div>
          ))}
        </div>

        {/* Comparison chart */}
        <div style={{ background: '#141C28', borderRadius: 12, padding: '20px 16px 12px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4, fontFamily: 'Georgia, serif' }}>Simple Rules vs Your Real Number</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginBottom: 16 }}>The 25x rule underestimates for early retirement — see the real gap</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={comparisonData} layout="vertical" margin={{ top: 5, right: 40, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
              <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 9, fontFamily: 'monospace' }} tickFormatter={formatDollars} />
              <YAxis type="category" dataKey="name" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 9, fontFamily: 'monospace' }} width={120} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {comparisonData.map((entry, i) => <Cell key={i} fill={entry.fill} opacity={0.85} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Withdrawal rate note */}
        <div style={{
          background: 'rgba(232,184,75,0.06)', border: '1px solid rgba(232,184,75,0.15)',
          borderLeft: `3px solid ${COLORS.gold}`, borderRadius: 8, padding: '14px 16px',
        }}>
          <div style={{ fontSize: 10, color: COLORS.gold, fontWeight: 600, marginBottom: 6, letterSpacing: 1 }}>
            💡 WHY {(withdrawalRate * 100).toFixed(1)}% NOT 4%
          </div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.7 }}>
            The 4% rule was designed for 30-year retirements. Retiring at age {retireAge} means a {retirementYears}-year
            retirement horizon. Research supports a {(withdrawalRate * 100).toFixed(1)}% withdrawal rate for {retirementYears} years,
            which requires {formatDollars(Math.round(annualSpend / withdrawalRate))} vs the 4% rule's {formatDollars(Math.round(annualSpend / 0.04))} —
            a difference of {formatDollars(Math.round(annualSpend / withdrawalRate) - Math.round(annualSpend / 0.04))}.
            This calculator also adds healthcare and a sequence risk buffer the simple rule ignores entirely.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.05)', padding: '12px 24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.15)', letterSpacing: 1 }}>For educational purposes only · Not financial advice</span>
        <a href="/#download" style={{ fontSize: 9, color: COLORS.gold, textDecoration: 'none', letterSpacing: 2, textTransform: 'uppercase' }}>Get Free Planner →</a>
      </div>
    </div>
  )
}

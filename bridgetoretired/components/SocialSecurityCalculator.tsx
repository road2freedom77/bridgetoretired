'use client'

import { useState, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'

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
    <div style={{
      background: '#0D1420', border: '1px solid rgba(232,184,75,0.2)',
      borderRadius: 8, padding: '10px 14px', fontFamily: 'monospace', fontSize: 11
    }}>
      <div style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>Age {label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.color, marginBottom: 3 }}>
          {p.name}: {formatDollars(p.value)}
        </div>
      ))}
    </div>
  )
}

export default function SocialSecurityCalculator() {
  const [fullBenefit, setFullBenefit] = useState(2_400) // monthly at FRA
  const [currentAge, setCurrentAge] = useState(52)
  const [portfolioSize, setPortfolioSize] = useState(1_200_000)
  const [annualSpend, setAnnualSpend] = useState(70_000)
  const [portfolioReturn, setPortfolioReturn] = useState(6)

  const FRA = 67

  // Benefit multipliers
  const benefit62 = Math.round(fullBenefit * 0.70)
  const benefit67 = fullBenefit
  const benefit70 = Math.round(fullBenefit * 1.24)

  // Break-even calculations (cumulative lifetime benefits)
  const breakEven6267 = useMemo(() => {
    // Age 62 gets payments 5 years earlier but smaller
    // Find age where cumulative 67 benefit exceeds cumulative 62 benefit
    let cum62 = 0, cum67 = 0
    for (let age = 62; age <= 95; age++) {
      cum62 += age >= 62 ? benefit62 * 12 : 0
      cum67 += age >= 67 ? benefit67 * 12 : 0
      if (cum67 > cum62 && cum62 > 0) return age
    }
    return 79
  }, [benefit62, benefit67])

  const breakEven6770 = useMemo(() => {
    let cum67 = 0, cum70 = 0
    for (let age = 67; age <= 95; age++) {
      cum67 += age >= 67 ? benefit67 * 12 : 0
      cum70 += age >= 70 ? benefit70 * 12 : 0
      if (cum70 > cum67 && cum67 > 0) return age
    }
    return 83
  }, [benefit67, benefit70])

  const breakEven6270 = useMemo(() => {
    let cum62 = 0, cum70 = 0
    for (let age = 62; age <= 95; age++) {
      cum62 += age >= 62 ? benefit62 * 12 : 0
      cum70 += age >= 70 ? benefit70 * 12 : 0
      if (cum70 > cum62 && cum62 > 0) return age
    }
    return 81
  }, [benefit62, benefit70])

  // Cumulative lifetime benefit chart
  const cumulativeData = useMemo(() => {
    let cum62 = 0, cum67 = 0, cum70 = 0
    const rows = []
    for (let age = 60; age <= 90; age++) {
      cum62 += age >= 62 ? benefit62 * 12 : 0
      cum67 += age >= 67 ? benefit67 * 12 : 0
      cum70 += age >= 70 ? benefit70 * 12 : 0
      rows.push({
        age,
        'Claim at 62': Math.round(cum62),
        'Claim at 67': Math.round(cum67),
        'Claim at 70': Math.round(cum70),
      })
    }
    return rows
  }, [benefit62, benefit67, benefit70])

  // Portfolio survival: how does claiming age affect portfolio longevity?
  const portfolioData = useMemo(() => {
    const rate = portfolioReturn / 100
    const rows = []

    const runPortfolio = (claimAge: number, monthlyBenefit: number) => {
      let bal = portfolioSize
      const balances: Record<number, number> = {}
      for (let age = currentAge; age <= 95; age++) {
        const ssIncome = age >= claimAge ? monthlyBenefit * 12 : 0
        const withdrawal = Math.max(0, annualSpend - ssIncome)
        bal = Math.max(0, bal - withdrawal)
        bal *= (1 + rate)
        balances[age] = Math.round(bal)
      }
      return balances
    }

    const port62 = runPortfolio(62, benefit62)
    const port67 = runPortfolio(67, benefit67)
    const port70 = runPortfolio(70, benefit70)

    for (let age = currentAge; age <= 90; age++) {
      rows.push({
        age,
        'Claim 62': port62[age] ?? 0,
        'Claim 67': port67[age] ?? 0,
        'Claim 70': port70[age] ?? 0,
      })
    }
    return rows
  }, [currentAge, portfolioSize, annualSpend, portfolioReturn, benefit62, benefit67, benefit70])

  const portDepletedAge62 = portfolioData.find(d => d['Claim 62'] === 0)?.age
  const portDepletedAge67 = portfolioData.find(d => d['Claim 67'] === 0)?.age
  const portDepletedAge70 = portfolioData.find(d => d['Claim 70'] === 0)?.age

  const port90_62 = portfolioData[portfolioData.length - 1]?.['Claim 62'] ?? 0
  const port90_67 = portfolioData[portfolioData.length - 1]?.['Claim 67'] ?? 0
  const port90_70 = portfolioData[portfolioData.length - 1]?.['Claim 70'] ?? 0

  return (
    <div style={{
      background: '#0D1420',
      borderRadius: 16,
      border: '1px solid rgba(232,184,75,0.15)',
      overflow: 'hidden',
      fontFamily: "'IBM Plex Mono', monospace",
      margin: '2rem 0',
    }}>
      {/* Header */}
      <div style={{ background: '#141C28', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '20px 24px' }}>
        <div style={{ fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: COLORS.gold, marginBottom: 6 }}>
          Interactive Calculator
        </div>
        <h3 style={{ color: COLORS.white, fontSize: 18, fontFamily: 'Georgia, serif', fontWeight: 700, margin: 0, marginBottom: 4 }}>
          Social Security Break-Even Calculator
        </h3>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, margin: 0 }}>
          See when claiming at 67 or 70 pays more than claiming at 62 — and how each choice affects your portfolio.
        </p>
      </div>

      <div style={{ padding: '24px' }}>

        {/* Controls */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Monthly Benefit at 67 (FRA)', value: fullBenefit, set: setFullBenefit, min: 500, max: 4000, step: 50, fmt: (v: number) => `$${v.toLocaleString()}/mo` },
            { label: 'Current Age', value: currentAge, set: setCurrentAge, min: 40, max: 62, step: 1, fmt: (v: number) => `Age ${v}` },
            { label: 'Portfolio Size', value: portfolioSize, set: setPortfolioSize, min: 300000, max: 5000000, step: 100000, fmt: (v: number) => formatDollars(v) },
            { label: 'Annual Spending', value: annualSpend, set: setAnnualSpend, min: 30000, max: 150000, step: 5000, fmt: (v: number) => formatDollars(v) },
            { label: 'Portfolio Return', value: portfolioReturn, set: setPortfolioReturn, min: 3, max: 9, step: 0.5, fmt: (v: number) => `${v}%/yr` },
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
          {/* Benefit summary card */}
          <div style={{ background: '#141C28', borderRadius: 10, padding: '12px 14px', border: '1px solid rgba(232,184,75,0.15)' }}>
            <div style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 10 }}>Your Benefit By Claiming Age</div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {[
                { age: 'Age 62', benefit: benefit62, color: COLORS.red },
                { age: 'Age 67', benefit: benefit67, color: COLORS.gold },
                { age: 'Age 70', benefit: benefit70, color: COLORS.sage },
              ].map(({ age, benefit, color }) => (
                <div key={age} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>{age}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color, fontFamily: 'Georgia, serif' }}>${benefit.toLocaleString()}</div>
                  <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)' }}>/month</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Break-even KPI cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
          <div style={{ background: '#141C28', borderRadius: 10, padding: '12px 14px', border: `1px solid ${COLORS.teal}30`, borderTop: `3px solid ${COLORS.teal}` }}>
            <div style={{ fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>62 vs 67 Break-Even</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.teal, fontFamily: 'Georgia, serif' }}>Age {breakEven6267}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>67 wins after this age</div>
          </div>
          <div style={{ background: '#141C28', borderRadius: 10, padding: '12px 14px', border: `1px solid ${COLORS.gold}30`, borderTop: `3px solid ${COLORS.gold}` }}>
            <div style={{ fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>67 vs 70 Break-Even</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.gold, fontFamily: 'Georgia, serif' }}>Age {breakEven6770}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>70 wins after this age</div>
          </div>
          <div style={{ background: '#141C28', borderRadius: 10, padding: '12px 14px', border: `1px solid ${COLORS.sage}30`, borderTop: `3px solid ${COLORS.sage}` }}>
            <div style={{ fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>62 vs 70 Break-Even</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.sage, fontFamily: 'Georgia, serif' }}>Age {breakEven6270}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>70 wins after this age</div>
          </div>
        </div>

        {/* Cumulative lifetime benefits chart */}
        <div style={{ background: '#141C28', borderRadius: 12, padding: '20px 16px 12px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4, fontFamily: 'Georgia, serif' }}>
            Cumulative Lifetime Social Security Benefits
          </div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginBottom: 16 }}>
            Lines cross at break-even ages — after that, the higher line wins
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={cumulativeData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="age" tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 9, fontFamily: 'monospace' }} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 9, fontFamily: 'monospace' }} tickFormatter={formatDollars} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)', paddingTop: 12 }} />
              <ReferenceLine x={breakEven6267} stroke={COLORS.teal} strokeDasharray="3 3" strokeOpacity={0.4} />
              <ReferenceLine x={breakEven6270} stroke={COLORS.sage} strokeDasharray="3 3" strokeOpacity={0.4} />
              <Line type="monotone" dataKey="Claim at 62" stroke={COLORS.red} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Claim at 67" stroke={COLORS.gold} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Claim at 70" stroke={COLORS.sage} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Portfolio impact chart */}
        <div style={{ background: '#141C28', borderRadius: 12, padding: '20px 16px 12px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4, fontFamily: 'Georgia, serif' }}>
            Portfolio Balance by Claiming Age
          </div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginBottom: 16 }}>
            How SS claiming age affects your portfolio longevity over time
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={portfolioData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="age" tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 9, fontFamily: 'monospace' }} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 9, fontFamily: 'monospace' }} tickFormatter={formatDollars} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)', paddingTop: 12 }} />
              <ReferenceLine y={0} stroke={COLORS.red} strokeOpacity={0.4} />
              <Line type="monotone" dataKey="Claim 62" stroke={COLORS.red} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Claim 67" stroke={COLORS.gold} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Claim 70" stroke={COLORS.sage} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
          {/* Portfolio at 90 summary */}
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            {[
              { label: 'Portfolio at 90 (Claim 62)', value: port90_62, color: COLORS.red },
              { label: 'Portfolio at 90 (Claim 67)', value: port90_67, color: COLORS.gold },
              { label: 'Portfolio at 90 (Claim 70)', value: port90_70, color: COLORS.sage },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ flex: 1, background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: value > 0 ? color : COLORS.red, fontFamily: 'Georgia, serif' }}>
                  {value > 0 ? formatDollars(value) : 'Depleted'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insight callout */}
        <div style={{
          background: 'rgba(232,184,75,0.06)', border: '1px solid rgba(232,184,75,0.15)',
          borderLeft: `3px solid ${COLORS.gold}`, borderRadius: 8, padding: '14px 16px',
        }}>
          <div style={{ fontSize: 10, color: COLORS.gold, fontWeight: 600, marginBottom: 6, letterSpacing: 1 }}>
            💡 THE DELAY ADVANTAGE
          </div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.7 }}>
            Waiting from 62 to 70 increases your monthly benefit from{' '}
            <strong style={{ color: COLORS.red }}>${benefit62.toLocaleString()}</strong> to{' '}
            <strong style={{ color: COLORS.sage }}>${benefit70.toLocaleString()}</strong> —
            a permanent <strong style={{ color: COLORS.sage }}>+${(benefit70 - benefit62).toLocaleString()}/month</strong> ({' '}
            <strong style={{ color: COLORS.sage }}>${((benefit70 - benefit62) * 12).toLocaleString()}/year</strong>) for life,
            fully inflation-adjusted. That's the equivalent of having an extra{' '}
            <strong style={{ color: COLORS.gold }}>
              {formatDollars((benefit70 - benefit62) * 12 / 0.04)}
            </strong>{' '}
            in your portfolio at a 4% withdrawal rate.
          </p>
        </div>

      </div>

      {/* Footer */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.05)',
        padding: '12px 24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.15)', letterSpacing: 1 }}>
          Verify your actual benefit at ssa.gov · For educational purposes only
        </span>
        <a href="/#download" style={{ fontSize: 9, color: COLORS.gold, textDecoration: 'none', letterSpacing: 2, textTransform: 'uppercase' }}>
          Get Free Planner →
        </a>
      </div>
    </div>
  )
}

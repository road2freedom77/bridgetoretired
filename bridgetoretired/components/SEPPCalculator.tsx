'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line, ReferenceLine } from 'recharts'

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

function getLifeExpectancy(age: number): number {
  const table: Record<number, number> = {
    40: 43.6, 42: 41.7, 44: 39.8, 46: 37.9, 48: 36.0,
    50: 34.2, 52: 32.3, 54: 30.5, 56: 28.7, 58: 27.0,
    60: 25.2, 62: 23.5, 64: 21.8,
  }
  const lower = Math.floor(age / 2) * 2
  const upper = lower + 2
  if (table[lower] && table[upper]) {
    const t = (age - lower) / 2
    return table[lower] + t * (table[upper] - table[lower])
  }
  return table[lower] ?? table[50]
}

function calcSEPP(balance: number, age: number, interestRate: number, method: 'amortization' | 'annuitization' | 'rmd') {
  const le = getLifeExpectancy(age)
  const r = interestRate / 100
  if (method === 'rmd') return Math.round(balance / le)
  if (method === 'amortization') {
    if (r === 0) return Math.round(balance / le)
    return Math.round(balance * r / (1 - Math.pow(1 + r, -le)))
  }
  if (method === 'annuitization') {
    const factor = (1 - Math.pow(1 + r, -le)) / r
    return Math.round(balance / factor)
  }
  return 0
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#0D1420', border: '1px solid rgba(232,184,75,0.2)', borderRadius: 8, padding: '10px 14px', fontFamily: 'monospace', fontSize: 11 }}>
      <div style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>Age {label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.color || COLORS.gold, marginBottom: 3 }}>
          {p.name}: {typeof p.value === 'number' ? formatDollars(p.value) : p.value}
        </div>
      ))}
    </div>
  )
}

export default function SEPPCalculator() {
  const { user } = useUser()
  const isPro = (user?.publicMetadata as any)?.isPro === true

  const [accountBalance, setAccountBalance] = useState(600_000)
  const [startAge, setStartAge] = useState(52)
  const [interestRate, setInterestRate] = useState(4.5)
  const [portfolioReturn, setPortfolioReturn] = useState(6)
  const [annualSpend, setAnnualSpend] = useState(55_000)

  const freeAge = Math.max(59.5, startAge + 5)
  const sepp59 = freeAge === 59.5
  const durationYears = freeAge - startAge

  const amortization = calcSEPP(accountBalance, startAge, interestRate, 'amortization')
  const annuitization = calcSEPP(accountBalance, startAge, interestRate, 'annuitization')
  const rmd = calcSEPP(accountBalance, startAge, interestRate, 'rmd')

  const methods = [
    { name: 'Fixed Amortization', value: amortization, color: COLORS.gold, recommended: true, description: 'Fixed payments, most popular. Best for predictable income planning.' },
    { name: 'Fixed Annuitization', value: annuitization, color: COLORS.teal, recommended: false, description: 'Similar to amortization, slightly different formula.' },
    { name: 'RMD Method', value: rmd, color: COLORS.purple, recommended: false, description: 'Lowest, variable payments. Recalculates each year. Most flexible post-start.' },
  ]

  const retroactivePenalty = useMemo(() => Math.round(amortization * 3 * 0.10), [amortization])

  const portfolioData = useMemo(() => {
    const rate = portfolioReturn / 100
    const rows = []
    let bal = accountBalance
    for (let age = startAge; age <= 70; age++) {
      const inSEPP = age < freeAge
      const payment = inSEPP ? amortization : 0
      bal = Math.max(0, bal - payment)
      bal *= (1 + rate)
      rows.push({ age, 'Account Balance': Math.round(bal), 'Annual SEPP Payment': inSEPP ? amortization : 0 })
    }
    return rows
  }, [accountBalance, startAge, amortization, freeAge, portfolioReturn])

  const taxComparison = useMemo(() => {
    const years = Math.ceil(durationYears)
    const sepp_tax = Math.round(amortization * years * 0.18)
    const penalty_tax = Math.round(amortization * years * 0.28)
    return { sepp_tax, penalty_tax, savings: penalty_tax - sepp_tax, years }
  }, [amortization, durationYears])

  return (
    <div style={{ background: '#0D1420', borderRadius: 16, border: '1px solid rgba(232,184,75,0.15)', overflow: 'hidden', fontFamily: "'IBM Plex Mono', monospace", margin: '2rem 0' }}>
      <div style={{ background: '#141C28', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '20px 24px' }}>
        <div style={{ fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: COLORS.gold, marginBottom: 6 }}>Rule 72(t) Calculator</div>
        <h3 style={{ color: COLORS.white, fontSize: 18, fontFamily: 'Georgia, serif', fontWeight: 700, margin: 0, marginBottom: 4 }}>SEPP Payment Calculator</h3>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, margin: 0 }}>Calculate penalty-free 72(t) distributions across all three IRS methods — and see the total tax savings vs paying the 10% penalty.</p>
      </div>

      <div style={{ padding: '24px' }}>
        {/* Controls */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'IRA / 401k Balance', value: accountBalance, set: setAccountBalance, min: 100000, max: 3000000, step: 25000, fmt: (v: number) => formatDollars(v) },
            { label: 'Age at SEPP Start', value: startAge, set: setStartAge, min: 40, max: 58, step: 1, fmt: (v: number) => `Age ${v}` },
            { label: 'IRS Interest Rate', value: interestRate, set: setInterestRate, min: 1, max: 7, step: 0.25, fmt: (v: number) => `${v}%` },
            { label: 'Portfolio Return', value: portfolioReturn, set: setPortfolioReturn, min: 3, max: 10, step: 0.5, fmt: (v: number) => `${v}%` },
            { label: 'Annual Spending Need', value: annualSpend, set: setAnnualSpend, min: 20000, max: 150000, step: 5000, fmt: (v: number) => formatDollars(v) },
          ].map(({ label, value, set, min, max, step, fmt }) => (
            <div key={label} style={{ background: '#141C28', borderRadius: 10, padding: '12px 14px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>{label}</span>
                <span style={{ fontSize: 12, color: COLORS.gold, fontWeight: 600 }}>{fmt(value)}</span>
              </div>
              <input type="range" min={min} max={max} step={step} value={value} onChange={e => set(Number(e.target.value))} style={{ width: '100%', accentColor: COLORS.gold, cursor: 'pointer' }} />
            </div>
          ))}
          <div style={{ background: '#141C28', borderRadius: 10, padding: '12px 14px', border: `1px solid ${COLORS.teal}20` }}>
            <div style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 10 }}>SEPP Schedule</div>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 6 }}>
              {[
                { label: 'Start age', value: `Age ${startAge}` },
                { label: 'Free at', value: `Age ${freeAge.toFixed(1)} (${sepp59 ? '59½ reached' : '5-yr rule'})` },
                { label: 'Duration', value: `${durationYears.toFixed(1)} years` },
                { label: 'Modification penalty', value: formatDollars(retroactivePenalty) + ' if broken at 3yr' },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>{label}</span>
                  <span style={{ fontSize: 9, color: COLORS.teal, fontWeight: 600 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Three method comparison */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Annual Payment by Method</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {methods.map(({ name, value, color, recommended, description }) => (
              <div key={name} style={{ background: '#141C28', borderRadius: 10, padding: '14px', border: `1px solid ${color}20`, borderTop: `3px solid ${recommended ? color : 'transparent'}` }}>
                {recommended && <div style={{ fontSize: 7, letterSpacing: 2, textTransform: 'uppercase', color, marginBottom: 6 }}>★ Most Used</div>}
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginBottom: 6, lineHeight: 1.3 }}>{name}</div>
                <div style={{ fontSize: 24, fontWeight: 700, color, fontFamily: 'Georgia, serif', marginBottom: 4 }}>{formatDollars(value)}</div>
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', lineHeight: 1.5 }}>{description}</div>
                {annualSpend > 0 && (
                  <div style={{ marginTop: 8, fontSize: 9, color: value >= annualSpend ? COLORS.sage : COLORS.orange }}>
                    {value >= annualSpend ? `✓ Covers spending (+${formatDollars(value - annualSpend)}/yr)` : `⚠ Gap: ${formatDollars(annualSpend - value)}/yr`}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* KPI cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Penalty Avoided', value: formatDollars(Math.round(amortization * taxComparison.years * 0.10)), sub: `over ${taxComparison.years} years`, color: COLORS.sage },
            { label: 'Tax Still Owed', value: formatDollars(taxComparison.sepp_tax), sub: '~18% ordinary income', color: COLORS.orange },
            { label: 'Modification Risk', value: formatDollars(retroactivePenalty), sub: 'if broken at 3 years', color: COLORS.red },
          ].map(({ label, value, sub, color }) => (
            <div key={label} style={{ background: '#141C28', borderRadius: 10, padding: '12px 14px', border: `1px solid ${color}20`, borderTop: `3px solid ${color}` }}>
              <div style={{ fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color, fontFamily: 'Georgia, serif' }}>{value}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* Portfolio chart */}
        <div style={{ background: '#141C28', borderRadius: 12, padding: '20px 16px 12px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4, fontFamily: 'Georgia, serif' }}>Account Balance During and After SEPP</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginBottom: 16 }}>Balance depletes during SEPP, then grows freely after age {freeAge.toFixed(1)}</div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={portfolioData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="age" tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 9, fontFamily: 'monospace' }} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 9, fontFamily: 'monospace' }} tickFormatter={formatDollars} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine x={freeAge} stroke={COLORS.sage} strokeDasharray="4 4" strokeOpacity={0.6} label={{ value: 'Free at ' + freeAge.toFixed(1), fill: COLORS.sage, fontSize: 9 }} />
              <Line type="monotone" dataKey="Account Balance" stroke={COLORS.gold} strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Method bar chart */}
        <div style={{ background: '#141C28', borderRadius: 12, padding: '20px 16px 12px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4, fontFamily: 'Georgia, serif' }}>Annual Payment Comparison</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginBottom: 16 }}>vs your annual spending of {formatDollars(annualSpend)}</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={[
              { name: 'Amortization', value: amortization },
              { name: 'Annuitization', value: annuitization },
              { name: 'RMD Method', value: rmd },
              { name: 'Your Spending', value: annualSpend },
            ]} layout="vertical" margin={{ top: 0, right: 40, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
              <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 9, fontFamily: 'monospace' }} tickFormatter={formatDollars} />
              <YAxis type="category" dataKey="name" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 9, fontFamily: 'monospace' }} width={100} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {[COLORS.gold, COLORS.teal, COLORS.purple, 'rgba(255,255,255,0.15)'].map((color, i) => (
                  <Cell key={i} fill={color} opacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Warning */}
        <div style={{ background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)', borderLeft: `3px solid ${COLORS.red}`, borderRadius: 8, padding: '12px 14px', marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: COLORS.red, fontWeight: 600, marginBottom: 6, letterSpacing: 1 }}>⚠ CRITICAL: THE MODIFICATION TRAP</div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: 1.7 }}>
            If you modify or stop payments before your schedule ends (age {freeAge.toFixed(1)}), the IRS retroactively applies the 10% penalty to <strong style={{ color: COLORS.red }}>every prior withdrawal</strong> plus interest. Breaking SEPP after 3 years could cost <strong style={{ color: COLORS.red }}>{formatDollars(retroactivePenalty)}</strong> in retroactive penalties.
          </p>
        </div>

        {/* Insight */}
        <div style={{ background: 'rgba(232,184,75,0.06)', border: '1px solid rgba(232,184,75,0.15)', borderLeft: `3px solid ${COLORS.gold}`, borderRadius: 8, padding: '14px 16px', marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: COLORS.gold, fontWeight: 600, marginBottom: 6, letterSpacing: 1 }}>💡 WHEN 72(t) MAKES SENSE</div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.7 }}>
            72(t) is a <em>backup bridge tool</em>, not a first choice. Use it only if your taxable account and Roth contributions can't cover the bridge to 59½. The amortization method generates <strong style={{ color: COLORS.gold }}>{formatDollars(amortization)}/year</strong> from your <strong style={{ color: COLORS.gold }}>{formatDollars(accountBalance)}</strong> account — saving <strong style={{ color: COLORS.sage }}>{formatDollars(Math.round(amortization * taxComparison.years * 0.10))}</strong> in penalties over {taxComparison.years} years.
          </p>
        </div>

        {/* Pro upsell — hidden for Pro users */}
        {!isPro && (
          <div style={{ background: 'linear-gradient(135deg, rgba(232,184,75,0.06) 0%, rgba(232,184,75,0.02) 100%)', border: '1px solid rgba(232,184,75,0.2)', borderLeft: '3px solid #E8B84B', borderRadius: 12, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
            <div>
              <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: COLORS.gold, marginBottom: 6 }}>⚡ Take it further with Pro</div>
              <div style={{ fontSize: 14, fontFamily: 'Georgia, serif', fontWeight: 700, color: '#fff', marginBottom: 6 }}>Export your complete retirement plan as a PDF.</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, maxWidth: 420 }}>
                Generate a branded, CPA-ready report with your SEPP schedule, bridge strategy, and 30-year projection — shareable in one click.
              </div>
            </div>
            <Link href="/pricing" style={{ background: COLORS.gold, color: '#0D1420', fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 12, padding: '10px 20px', borderRadius: 8, textDecoration: 'none', whiteSpace: 'nowrap' as const, flexShrink: 0 }}>
              Get Pro →
            </Link>
          </div>
        )}
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.15)', letterSpacing: 1 }}>Work with a CPA before starting 72(t) · For educational purposes only</span>
        {!isPro && <a href="/#download" style={{ fontSize: 9, color: COLORS.gold, textDecoration: 'none', letterSpacing: 2, textTransform: 'uppercase' }}>Get Free Planner →</a>}
      </div>
    </div>
  )
}

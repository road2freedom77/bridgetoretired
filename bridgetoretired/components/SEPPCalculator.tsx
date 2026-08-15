'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line, ReferenceLine } from 'recharts'
import { trackCalculatorUsed, trackProCtaClick } from '@/lib/analytics'

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

// IRS Single Life Expectancy Table — Pub 590-B, Table I (effective 2022+)
// Used for RMD and Fixed Amortization methods
function getLifeExpectancy(age: number): number {
  const table: Record<number, number> = {
    40: 45.7, 41: 44.7, 42: 43.7, 43: 42.8, 44: 41.8,
    45: 40.8, 46: 39.8, 47: 38.9, 48: 37.9, 49: 37.0,
    50: 36.2, 51: 35.3, 52: 34.3, 53: 33.4, 54: 32.5,
    55: 31.6, 56: 30.6, 57: 29.8, 58: 28.9,
    59: 28.0, 60: 27.1, 61: 26.2, 62: 25.4, 63: 24.5, 64: 23.7,
  }
  return table[age] ?? table[50]
}

// IRS mortality table for annuity-factor calculation
// 26 CFR §1.401(a)(9)-9(e), Table 4 (effective 2022+, per Notice 2022-6)
// qx = probability of death within one year at attained age
const MORTALITY_QX: Record<number, number> = {
  40: 0.000576, 41: 0.000628, 42: 0.000683, 43: 0.000745, 44: 0.000813,
  45: 0.000893, 46: 0.000985, 47: 0.001087, 48: 0.001199, 49: 0.001320,
  50: 0.001452, 51: 0.001594, 52: 0.001754, 53: 0.001935, 54: 0.002139,
  55: 0.002368, 56: 0.002621, 57: 0.002894, 58: 0.003180, 59: 0.003489,
  60: 0.003833, 61: 0.004222, 62: 0.004666, 63: 0.005168, 64: 0.005733,
  65: 0.006369, 66: 0.007085, 67: 0.007880, 68: 0.008762, 69: 0.009741,
  70: 0.010845, 71: 0.012101, 72: 0.013528, 73: 0.015151, 74: 0.016991,
  75: 0.019087, 76: 0.021468, 77: 0.024125, 78: 0.027057, 79: 0.030353,
  80: 0.034087, 81: 0.038328, 82: 0.043148, 83: 0.048631, 84: 0.054880,
  85: 0.062014, 86: 0.070178, 87: 0.079564, 88: 0.090311, 89: 0.102528,
  90: 0.116328, 91: 0.131800, 92: 0.148991, 93: 0.167923, 94: 0.188592,
  95: 0.210954, 96: 0.234926, 97: 0.260382, 98: 0.287146, 99: 0.315009,
  100: 0.343718, 101: 0.372996, 102: 0.402539, 103: 0.432040, 104: 0.461183,
  105: 0.489657, 106: 0.517154, 107: 0.543378, 108: 0.568047, 109: 0.590895,
  110: 0.611679, 111: 0.630175, 112: 0.646189, 113: 0.659545, 114: 0.670093,
  115: 0.677703, 116: 0.682272, 117: 0.683716, 118: 0.681976, 119: 0.677010,
  120: 1.000000,
}

// Compute mortality-weighted annuity factor per IRS Notice 2022-6
// annuityFactor = Σ (kPx / (1+r)^k) where kPx = cumulative survival probability
function calcAnnuityFactor(age: number, rate: number): number {
  const r = rate / 100
  let survival = 1.0
  let factor = 0.0
  for (let k = 1; k <= 120 - age; k++) {
    const currentAge = age + k - 1
    const qx = MORTALITY_QX[currentAge] ?? 1.0
    survival *= (1 - qx)
    if (survival < 1e-12) break
    factor += survival / Math.pow(1 + r, k)
  }
  return factor
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
    const factor = calcAnnuityFactor(age, interestRate)
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

// Optional props for blog embeds — override defaults when provided
// Props arrive as strings from the [[tool:...]] token parser
interface SEPPCalculatorProps {
  balance?:  string
  age?:      string
  rate?:     string
  spending?: string
}

export default function SEPPCalculator({ balance, age, rate, spending }: SEPPCalculatorProps) {
  const { user } = useUser()
  const isPro = (user?.publicMetadata as any)?.isPro === true

  const [accountBalance, setAccountBalance] = useState(balance  ? Number(balance)  : 600_000)
  const [startAge, setStartAge]             = useState(age      ? Number(age)      : 52)
  const [interestRate, setInterestRate]     = useState(rate     ? Number(rate)      : 4.5)
  const [portfolioReturn, setPortfolioReturn] = useState(6)
  const [annualSpend, setAnnualSpend]       = useState(spending ? Number(spending)  : 55_000)

  const track = useCallback(() => trackCalculatorUsed('sepp-calculator'), [])
  function tracked(setter: (v: number) => void) {
    return (v: number) => { track(); setter(v) }
  }

  const freeAge = Math.max(59.5, startAge + 5)
  const sepp59 = freeAge === 59.5
  const durationYears = freeAge - startAge

  const amortization = calcSEPP(accountBalance, startAge, interestRate, 'amortization')
  const annuitization = calcSEPP(accountBalance, startAge, interestRate, 'annuitization')
  const rmd = calcSEPP(accountBalance, startAge, interestRate, 'rmd')

  const methods = [
    { name: 'Fixed Amortization', value: amortization, color: COLORS.gold, recommended: true, description: 'Fixed payments, most popular. Best for predictable income planning.' },
    { name: 'Fixed Annuitization', value: annuitization, color: COLORS.teal, recommended: false, description: 'Often similar to amortization. Slightly different annuity-factor formula.' },
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
            { label: 'IRA / 401k Balance', value: accountBalance, set: tracked(setAccountBalance), min: 100000, max: 3000000, step: 25000, fmt: (v: number) => formatDollars(v) },
            { label: 'Age at SEPP Start', value: startAge, set: tracked(setStartAge), min: 40, max: 58, step: 1, fmt: (v: number) => `Age ${v}` },
            { label: 'IRS Interest Rate', value: interestRate, set: tracked(setInterestRate), min: 1, max: 7, step: 0.25, fmt: (v: number) => `${v}%` },
            { label: 'Portfolio Return', value: portfolioReturn, set: tracked(setPortfolioReturn), min: 3, max: 10, step: 0.5, fmt: (v: number) => `${v}%` },
            { label: 'Annual Spending Need', value: annualSpend, set: tracked(setAnnualSpend), min: 20000, max: 150000, step: 5000, fmt: (v: number) => formatDollars(v) },
          ].map(({ label, value, set, min, max, step, fmt }) => (
            <div key={label} style={{ background: '#141C28', borderRadius: 10, padding: '12px 14px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>{label}</span>
                <span style={{ fontSize: 12, color: COLORS.gold, fontWeight: 600 }}>{fmt(value)}</span>
              </div>
              <input type="range" min={min} max={max} step={step} value={value} onChange={e => set(Number(e.target.value))} style={{ width: '100%', accentColor: COLORS.gold, cursor: 'pointer' }} />
            </div>
          ))}

          {/* SEPP Schedule summary card */}
          <div style={{ background: '#141C28', borderRadius: 10, padding: '12px 14px', border: `1px solid ${COLORS.teal}20` }}>
            <div style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 10 }}>SEPP Schedule</div>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 6 }}>
              {[
                { label: 'Start age', value: `Age ${startAge}` },
                { label: 'Free at', value: `Age ${freeAge.toFixed(1)} (${sepp59 ? '59½ reached' : '5-yr rule'})` },
                { label: 'Duration', value: `${durationYears.toFixed(1)} years` },
                { label: 'Modification penalty', value: `~${formatDollars(retroactivePenalty)} before interest` },
                { label: '', value: 'if broken at year 3' },
              ].map(({ label, value }, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
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
            {
              label: 'Penalty Avoided',
              value: formatDollars(Math.round(amortization * taxComparison.years * 0.10)),
              sub: `over ${taxComparison.years} years`,
              color: COLORS.sage,
            },
            {
              label: 'Estimated Income Tax',
              value: formatDollars(taxComparison.sepp_tax),
              sub: 'Assumes 18% ordinary-income tax rate',
              color: COLORS.orange,
            },
            {
              label: 'Modification Risk',
              value: `~${formatDollars(retroactivePenalty)}`,
              sub: 'before interest · if broken at year 3',
              color: COLORS.red,
            },
          ].map(({ label, value, sub, color }) => (
            <div key={label} style={{ background: '#141C28', borderRadius: 10, padding: '12px 14px', border: `1px solid ${color}20`, borderTop: `3px solid ${color}` }}>
              <div style={{ fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color, fontFamily: 'Georgia, serif' }}>{value}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* Portfolio balance chart */}
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

        {/* Modification warning */}
        <div style={{ background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)', borderLeft: `3px solid ${COLORS.red}`, borderRadius: 8, padding: '12px 14px', marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: COLORS.red, fontWeight: 600, marginBottom: 6, letterSpacing: 1 }}>⚠ CRITICAL: THE MODIFICATION TRAP</div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: 1.7 }}>
            If you modify or stop payments before your schedule ends (age {freeAge.toFixed(1)}), the IRS retroactively applies the 10% penalty to <strong style={{ color: COLORS.red }}>every prior withdrawal</strong> plus interest. Breaking SEPP after 3 years could cost <strong style={{ color: COLORS.red }}>~{formatDollars(retroactivePenalty)} before interest</strong> in retroactive penalties — the actual total will be higher once the IRS adds interest on each prior year.
          </p>
        </div>

        {/* When 72(t) makes sense */}
        <div style={{ background: 'rgba(232,184,75,0.06)', border: '1px solid rgba(232,184,75,0.15)', borderLeft: `3px solid ${COLORS.gold}`, borderRadius: 8, padding: '14px 16px', marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: COLORS.gold, fontWeight: 600, marginBottom: 6, letterSpacing: 1 }}>💡 WHEN 72(t) MAKES SENSE</div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.7 }}>
            72(t) is a <em>backup bridge tool</em>, not a first choice. Use it only if your taxable account and Roth contributions can't cover the bridge to 59½. The amortization method generates <strong style={{ color: COLORS.gold }}>{formatDollars(amortization)}/year</strong> from your <strong style={{ color: COLORS.gold }}>{formatDollars(accountBalance)}</strong> account — saving <strong style={{ color: COLORS.sage }}>{formatDollars(Math.round(amortization * taxComparison.years * 0.10))}</strong> in penalties over {taxComparison.years} years. But that tax savings comes with {durationYears.toFixed(1)} years of inflexibility. Model the full bridge before committing.
          </p>
        </div>

        {/* Pro upsell */}
        {!isPro && (
          <div style={{ background: 'linear-gradient(135deg, rgba(232,184,75,0.06) 0%, rgba(232,184,75,0.02) 100%)', border: '1px solid rgba(232,184,75,0.2)', borderLeft: '3px solid #E8B84B', borderRadius: 12, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
            <div>
              <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: COLORS.gold, marginBottom: 6 }}>⚡ Take it further with Pro</div>
              <div style={{ fontSize: 14, fontFamily: 'Georgia, serif', fontWeight: 700, color: '#fff', marginBottom: 6 }}>Export your complete retirement plan as a PDF.</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, maxWidth: 420 }}>
                Generate a branded, CPA-ready report with your SEPP schedule, bridge strategy, and 30-year projection — shareable in one click.
              </div>
            </div>
            <Link
              href="/pricing"
              onClick={() => trackProCtaClick('sepp-calculator-upsell')}
              style={{ background: COLORS.gold, color: '#0D1420', fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 12, padding: '10px 20px', borderRadius: 8, textDecoration: 'none', whiteSpace: 'nowrap' as const, flexShrink: 0 }}
            >
              Get Pro →
            </Link>
          </div>
        )}
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.15)', letterSpacing: 1 }}>Work with a CPA before starting 72(t) · For educational purposes only</span>
        {!isPro && (
          <a href="/#download"
            onClick={() => trackProCtaClick('sepp-calculator-footer-planner')}
            style={{ fontSize: 9, color: COLORS.gold, textDecoration: 'none', letterSpacing: 2, textTransform: 'uppercase' }}>
            Get Free Planner →
          </a>
        )}
      </div>
    </div>
  )
}
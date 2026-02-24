'use client'

import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Cell } from 'recharts'

const COLORS = {
  gold: '#E8B84B',
  teal: '#2DD4BF',
  purple: '#A78BFA',
  red: '#F87171',
  sage: '#4ADE80',
  orange: '#FB923C',
  white: '#FFFFFF',
  dark: '#0D1420',
  ink: '#141C28',
}

function formatDollars(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${Math.round(n / 1_000)}k`
  return `$${Math.round(n).toLocaleString()}`
}

const TAX_BRACKETS_MFJ_2026 = [
  { rate: 0.10, upTo: 23_850 },
  { rate: 0.12, upTo: 96_950 },
  { rate: 0.22, upTo: 206_700 },
  { rate: 0.24, upTo: 394_600 },
]

const STANDARD_DEDUCTION_MFJ = 30_000

function calcFederalTax(income: number): number {
  const taxable = Math.max(0, income - STANDARD_DEDUCTION_MFJ)
  let tax = 0
  let prev = 0
  for (const bracket of TAX_BRACKETS_MFJ_2026) {
    if (taxable <= prev) break
    const inBracket = Math.min(taxable, bracket.upTo) - prev
    tax += inBracket * bracket.rate
    prev = bracket.upTo
  }
  return Math.round(tax)
}

function effectiveRate(income: number): number {
  const tax = calcFederalTax(income)
  return income > 0 ? (tax / income) * 100 : 0
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#0D1420', border: '1px solid rgba(232,184,75,0.2)',
      borderRadius: 8, padding: '10px 14px', fontFamily: 'monospace', fontSize: 11
    }}>
      <div style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>Year {label} (Age {Number(label) + 2024 - 2024})</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.color || p.fill, marginBottom: 3 }}>
          {p.name}: {typeof p.value === 'number' && p.value > 100 ? formatDollars(p.value) : `${p.value}`}
        </div>
      ))}
    </div>
  )
}

export default function RothLadderBuilder() {
  const [retireAge, setRetireAge] = useState(52)
  const [traditional401k, setTraditional401k] = useState(700_000)
  const [annualConversion, setAnnualConversion] = useState(45_000)
  const [annualSpend, setAnnualSpend] = useState(55_000)
  const [taxableIncome, setTaxableIncome] = useState(5_000)
  const [ladderYears, setLadderYears] = useState(10)

  const currentYear = new Date().getFullYear()

  const ladderData = useMemo(() => {
    const rows = []
    let k401Balance = traditional401k

    for (let yr = 0; yr < ladderYears; yr++) {
      const age = retireAge + yr
      const year = currentYear + yr
      const unlockYear = year + 5
      const unlockAge = age + 5
      const totalIncome = annualConversion + taxableIncome
      const tax = calcFederalTax(totalIncome)
      const effRate = effectiveRate(totalIncome)
      const isUnlocked = yr >= 5
      k401Balance = Math.max(0, k401Balance - annualConversion)

      rows.push({
        yr: yr + 1,
        year,
        age,
        'Conversion': annualConversion,
        'Tax Cost': tax,
        unlockYear,
        unlockAge,
        isUnlocked,
        effRate: effRate.toFixed(1),
        k401Remaining: Math.round(k401Balance),
      })
    }
    return rows
  }, [retireAge, traditional401k, annualConversion, annualSpend, taxableIncome, ladderYears, currentYear])

  const totalConverted = annualConversion * ladderYears
  const totalTax = ladderData.reduce((s, r) => s + r['Tax Cost'], 0)
  const totalIncome = annualConversion + taxableIncome
  const effRate = effectiveRate(totalIncome)
  const workingRateSaved = Math.max(0, 0.24 - effRate / 100)
  const taxSavings = Math.round(totalConverted * workingRateSaved)
  const bridgeGap = annualSpend * 5 // need 5 years of spending before ladder matures

  // Bracket analysis
  const brackets = [
    { label: '0%', max: STANDARD_DEDUCTION_MFJ, color: COLORS.sage },
    { label: '10%', max: STANDARD_DEDUCTION_MFJ + 23_850, color: COLORS.teal },
    { label: '12%', max: STANDARD_DEDUCTION_MFJ + 96_950, color: COLORS.gold },
    { label: '22%', max: STANDARD_DEDUCTION_MFJ + 206_700, color: COLORS.orange },
  ]
  const currentBracket = brackets.find(b => totalIncome <= b.max) ?? brackets[brackets.length - 1]

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
      <div style={{
        background: '#141C28',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '20px 24px',
      }}>
        <div style={{ fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: COLORS.gold, marginBottom: 6 }}>
          Interactive Builder
        </div>
        <h3 style={{ color: COLORS.white, fontSize: 18, fontFamily: 'Georgia, serif', fontWeight: 700, margin: 0, marginBottom: 4 }}>
          Roth Conversion Ladder
        </h3>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, margin: 0 }}>
          Model your annual conversions, tax cost, and when each rung unlocks penalty-free.
        </p>
      </div>

      <div style={{ padding: '24px' }}>

        {/* Controls */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Retirement Age', value: retireAge, set: setRetireAge, min: 40, max: 57, step: 1, fmt: (v: number) => `Age ${v}` },
            { label: 'Annual Conversion', value: annualConversion, set: setAnnualConversion, min: 10000, max: 150000, step: 5000, fmt: (v: number) => formatDollars(v) },
            { label: '401k / IRA Balance', value: traditional401k, set: setTraditional401k, min: 100000, max: 3000000, step: 50000, fmt: (v: number) => formatDollars(v) },
            { label: 'Other Annual Income', value: taxableIncome, set: setTaxableIncome, min: 0, max: 60000, step: 1000, fmt: (v: number) => formatDollars(v) },
            { label: 'Annual Spending', value: annualSpend, set: setAnnualSpend, min: 20000, max: 120000, step: 5000, fmt: (v: number) => formatDollars(v) },
            { label: 'Ladder Years', value: ladderYears, set: setLadderYears, min: 5, max: 20, step: 1, fmt: (v: number) => `${v} yrs` },
          ].map(({ label, value, set, min, max, step, fmt }) => (
            <div key={label} style={{ background: '#141C28', borderRadius: 10, padding: '12px 14px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>{label}</span>
                <span style={{ fontSize: 12, color: COLORS.gold, fontWeight: 600 }}>{fmt(value)}</span>
              </div>
              <input
                type="range" min={min} max={max} step={step} value={value}
                onChange={e => set(Number(e.target.value))}
                style={{ width: '100%', accentColor: COLORS.gold, cursor: 'pointer' }}
              />
            </div>
          ))}
        </div>

        {/* Tax bracket indicator */}
        <div style={{
          background: '#141C28', borderRadius: 10, padding: '14px 16px',
          border: `1px solid ${currentBracket.color}40`,
          borderLeft: `3px solid ${currentBracket.color}`,
          marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>
              Your Conversion Tax Bracket (MFJ 2026)
            </div>
            <div style={{ fontSize: 13, color: currentBracket.color, fontWeight: 600 }}>
              {formatDollars(totalIncome)} total income → <strong>{currentBracket.label} bracket</strong> · {effRate.toFixed(1)}% effective rate
            </div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: currentBracket.color, fontFamily: 'Georgia, serif' }}>
            {formatDollars(calcFederalTax(totalIncome))}/yr
          </div>
        </div>

        {/* KPI cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
          <div style={{ background: '#141C28', borderRadius: 10, padding: '12px 14px', border: '1px solid rgba(232,184,75,0.15)', borderTop: `3px solid ${COLORS.gold}` }}>
            <div style={{ fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>Total Converted</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.gold, fontFamily: 'Georgia, serif' }}>{formatDollars(totalConverted)}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>over {ladderYears} years</div>
          </div>
          <div style={{ background: '#141C28', borderRadius: 10, padding: '12px 14px', border: '1px solid rgba(248,113,113,0.15)', borderTop: `3px solid ${COLORS.red}` }}>
            <div style={{ fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>Total Tax Paid</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.red, fontFamily: 'Georgia, serif' }}>{formatDollars(totalTax)}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>{effRate.toFixed(1)}% effective rate</div>
          </div>
          <div style={{ background: '#141C28', borderRadius: 10, padding: '12px 14px', border: '1px solid rgba(74,222,128,0.15)', borderTop: `3px solid ${COLORS.sage}` }}>
            <div style={{ fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>Est. Tax Savings vs Working</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.sage, fontFamily: 'Georgia, serif' }}>{formatDollars(taxSavings)}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>vs 24%+ bracket</div>
          </div>
        </div>

        {/* Ladder chart */}
        <div style={{ background: '#141C28', borderRadius: 12, padding: '20px 16px 12px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4, fontFamily: 'Georgia, serif' }}>
            Conversion Amount vs Tax Cost Per Year
          </div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginBottom: 16 }}>
            Gold bars unlock penalty-free 5 years after conversion
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={ladderData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="yr"
                tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 9, fontFamily: 'monospace' }}
                label={{ value: 'Year of Retirement', position: 'insideBottom', offset: -2, fill: 'rgba(255,255,255,0.2)', fontSize: 9 }}
              />
              <YAxis
                tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 9, fontFamily: 'monospace' }}
                tickFormatter={formatDollars}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)', paddingTop: 12 }} />
              <ReferenceLine y={annualSpend} stroke={COLORS.teal} strokeDasharray="4 4"
                label={{ value: 'Annual Spend', position: 'right', fill: COLORS.teal, fontSize: 9 }} />
              <Bar dataKey="Conversion" radius={[4, 4, 0, 0]}>
                {ladderData.map((entry, index) => (
                  <Cell key={index} fill={index >= 5 ? COLORS.sage : COLORS.gold} opacity={0.85} />
                ))}
              </Bar>
              <Bar dataKey="Tax Cost" fill={COLORS.red} radius={[4, 4, 0, 0]} opacity={0.7} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Ladder timeline table */}
        <div style={{ background: '#141C28', borderRadius: 12, padding: '16px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 16, overflowX: 'auto' }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 12, fontFamily: 'Georgia, serif' }}>
            Ladder Unlock Schedule
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
            <thead>
              <tr>
                {['Yr', 'Age', 'Convert', 'Tax', 'Unlocks At', 'Status'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '4px 8px', color: 'rgba(255,255,255,0.25)', fontWeight: 400, letterSpacing: 1, fontSize: 8, textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ladderData.slice(0, 8).map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '6px 8px', color: 'rgba(255,255,255,0.4)' }}>{row.yr}</td>
                  <td style={{ padding: '6px 8px', color: 'rgba(255,255,255,0.6)' }}>{row.age}</td>
                  <td style={{ padding: '6px 8px', color: COLORS.gold }}>{formatDollars(row['Conversion'])}</td>
                  <td style={{ padding: '6px 8px', color: COLORS.red }}>{formatDollars(row['Tax Cost'])}</td>
                  <td style={{ padding: '6px 8px', color: 'rgba(255,255,255,0.4)' }}>Age {row.unlockAge} ({row.unlockYear})</td>
                  <td style={{ padding: '6px 8px' }}>
                    <span style={{
                      fontSize: 8, letterSpacing: 1,
                      color: row.isUnlocked ? COLORS.sage : COLORS.gold,
                      background: row.isUnlocked ? 'rgba(74,222,128,0.1)' : 'rgba(232,184,75,0.1)',
                      padding: '2px 6px', borderRadius: 4,
                    }}>
                      {row.isUnlocked ? '✓ UNLOCKED' : '⏳ SEASONING'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bridge gap warning */}
        {annualSpend * 5 > 200000 && (
          <div style={{
            background: 'rgba(232,184,75,0.06)', border: '1px solid rgba(232,184,75,0.15)',
            borderLeft: `3px solid ${COLORS.gold}`, borderRadius: 8, padding: '12px 14px', marginBottom: 16,
          }}>
            <div style={{ fontSize: 10, color: COLORS.gold, fontWeight: 600, marginBottom: 4 }}>⏳ 5-YEAR BRIDGE NEEDED</div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.6 }}>
              You need {formatDollars(bridgeGap)} in taxable/Roth contributions to cover spending while the first rung of your ladder seasons.
              The ladder doesn't pay out until Year 6 — make sure your bridge accounts can fund Years 1-5.
            </p>
          </div>
        )}

        {/* Key insight */}
        <div style={{
          background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.15)',
          borderLeft: `3px solid ${COLORS.purple}`, borderRadius: 8, padding: '14px 16px',
        }}>
          <div style={{ fontSize: 10, color: COLORS.purple, fontWeight: 600, marginBottom: 6, letterSpacing: 1 }}>
            💡 THE LADDER ADVANTAGE
          </div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.7 }}>
            Converting {formatDollars(annualConversion)}/year at a {effRate.toFixed(1)}% effective rate
            vs the 24%+ you likely paid while working saves an estimated{' '}
            <strong style={{ color: COLORS.purple }}>{formatDollars(taxSavings)}</strong> over {ladderYears} years.
            Once in Roth, that money grows and withdraws <strong style={{ color: COLORS.purple }}>completely tax-free</strong> for the rest of your life.
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
          Based on 2026 MFJ tax brackets · For educational purposes only
        </span>
        <a href="/#download" style={{ fontSize: 9, color: COLORS.gold, textDecoration: 'none', letterSpacing: 2, textTransform: 'uppercase' }}>
          Get Free Planner →
        </a>
      </div>
    </div>
  )
}

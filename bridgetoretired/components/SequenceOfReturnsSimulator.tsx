'use client'

import { useState, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'

const COLORS = {
  gold: '#E8B84B',
  teal: '#2DD4BF',
  red: '#F87171',
  sage: '#4ADE80',
  white: '#FFFFFF',
  dark: '#0D1420',
  ink: '#141C28',
  slate: '#1E2A3A',
  gray: 'rgba(255,255,255,0.3)',
}

function formatDollars(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${Math.round(n / 1_000)}k`
  return `$${Math.round(n).toLocaleString()}`
}

function simulatePortfolio(
  startBalance: number,
  annualWithdrawal: number,
  returns: number[],
  inflation: number
) {
  const rows = []
  let balance = startBalance
  let withdrawal = annualWithdrawal

  for (let i = 0; i < returns.length; i++) {
    if (balance <= 0) {
      rows.push({ year: i + 1, balance: 0, withdrawal, depleted: true })
      continue
    }
    balance = (balance - withdrawal) * (1 + returns[i] / 100)
    balance = Math.max(0, balance)
    rows.push({ year: i + 1, balance: Math.round(balance), withdrawal: Math.round(withdrawal), depleted: balance === 0 })
    withdrawal *= (1 + inflation / 100)
  }
  return rows
}

function getDepletionYear(rows: ReturnType<typeof simulatePortfolio>) {
  const d = rows.find(r => r.depleted || r.balance === 0)
  return d ? d.year : null
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#0D1420', border: '1px solid rgba(232,184,75,0.2)',
      borderRadius: 8, padding: '10px 14px', fontFamily: 'monospace', fontSize: 11
    }}>
      <div style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>Year {label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.color, marginBottom: 3 }}>
          {p.name}: {formatDollars(p.value)}
        </div>
      ))}
    </div>
  )
}

export default function SequenceOfReturnsSimulator() {
  const [startBalance, setStartBalance] = useState(1_000_000)
  const [withdrawal, setWithdrawal] = useState(40_000)
  const [inflation, setInflation] = useState(2.5)
  const [crashMagnitude, setCrashMagnitude] = useState(30)
  const [years, setYears] = useState(30)

  // Build return sequences
  const goodReturns = useMemo(() => {
    const baseReturn = 7
    const arr = Array(years).fill(baseReturn)
    // Bad years at END (years 20-22)
    const crashStart = Math.floor(years * 0.65)
    for (let i = crashStart; i < Math.min(crashStart + 3, years); i++) {
      arr[i] = -crashMagnitude
    }
    return arr
  }, [years, crashMagnitude])

  const badReturns = useMemo(() => {
    const arr = [...goodReturns]
    // Swap: bad years at BEGINNING (years 1-3)
    const crashStart = Math.floor(years * 0.65)
    const earlyEnd = Math.min(3, years)
    for (let i = 0; i < earlyEnd; i++) arr[i] = goodReturns[crashStart + i] ?? -crashMagnitude
    for (let i = 0; i < Math.min(3, years); i++) arr[crashStart + i] = goodReturns[i]
    return arr
  }, [goodReturns, years, crashMagnitude])

  const luckyData = useMemo(() => simulatePortfolio(startBalance, withdrawal, goodReturns, inflation), [startBalance, withdrawal, goodReturns, inflation])
  const unluckyData = useMemo(() => simulatePortfolio(startBalance, withdrawal, badReturns, inflation), [startBalance, withdrawal, badReturns, inflation])

  const chartData = useMemo(() => luckyData.map((row, i) => ({
    year: row.year,
    'Lucky (crash later)': row.balance,
    'Unlucky (crash early)': unluckyData[i]?.balance ?? 0,
  })), [luckyData, unluckyData])

  const luckyDepletion = getDepletionYear(luckyData)
  const unluckyDepletion = getDepletionYear(unluckyData)

  const luckyFinal = luckyData[luckyData.length - 1]?.balance ?? 0
  const unluckyFinal = unluckyData[unluckyData.length - 1]?.balance ?? 0
  const difference = luckyFinal - unluckyFinal

  const withdrawalRate = ((withdrawal / startBalance) * 100).toFixed(1)

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
          Interactive Simulator
        </div>
        <h3 style={{ color: COLORS.white, fontSize: 18, fontFamily: 'Georgia, serif', fontWeight: 700, margin: 0, marginBottom: 4 }}>
          Sequence of Returns Risk
        </h3>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, margin: 0 }}>
          Same average returns. Same portfolio. Completely different outcomes — just because of timing.
        </p>
      </div>

      <div style={{ padding: '24px' }}>

        {/* Controls */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 16, marginBottom: 24,
        }}>
          {[
            { label: 'Starting Portfolio', value: startBalance, set: setStartBalance, min: 250000, max: 3000000, step: 50000, fmt: (v: number) => formatDollars(v) },
            { label: 'Annual Withdrawal', value: withdrawal, set: setWithdrawal, min: 10000, max: 150000, step: 5000, fmt: (v: number) => formatDollars(v) },
            { label: 'Market Crash Size', value: crashMagnitude, set: setCrashMagnitude, min: 10, max: 50, step: 5, fmt: (v: number) => `-${v}%` },
            { label: 'Years to Simulate', value: years, set: setYears, min: 15, max: 50, step: 5, fmt: (v: number) => `${v} yrs` },
          ].map(({ label, value, set, min, max, step, fmt }) => (
            <div key={label} style={{ background: '#141C28', borderRadius: 10, padding: '14px 16px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>{label}</span>
                <span style={{ fontSize: 13, color: COLORS.gold, fontWeight: 600 }}>{fmt(value)}</span>
              </div>
              <input
                type="range" min={min} max={max} step={step} value={value}
                onChange={e => set(Number(e.target.value))}
                style={{ width: '100%', accentColor: COLORS.gold, cursor: 'pointer' }}
              />
            </div>
          ))}
        </div>

        {/* Withdrawal rate badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          marginBottom: 20, padding: '10px 14px',
          background: Number(withdrawalRate) <= 4
            ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)',
          border: `1px solid ${Number(withdrawalRate) <= 4 ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)'}`,
          borderRadius: 8,
        }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Withdrawal Rate:</span>
          <span style={{
            fontSize: 13, fontWeight: 700,
            color: Number(withdrawalRate) <= 4 ? COLORS.sage : COLORS.red
          }}>{withdrawalRate}%</span>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginLeft: 4 }}>
            {Number(withdrawalRate) <= 4 ? '✓ Within 4% guideline' : '⚠ Exceeds 4% — higher risk'}
          </span>
        </div>

        {/* KPI cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
          <div style={{ background: '#141C28', border: '1px solid rgba(45,212,191,0.2)', borderRadius: 10, padding: '14px 16px', borderTop: `3px solid ${COLORS.teal}` }}>
            <div style={{ fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 6 }}>Lucky — Final Balance</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.teal, fontFamily: 'Georgia, serif' }}>
              {luckyDepletion ? `Depleted yr ${luckyDepletion}` : formatDollars(luckyFinal)}
            </div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginTop: 4 }}>crash in later years</div>
          </div>
          <div style={{ background: '#141C28', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 10, padding: '14px 16px', borderTop: `3px solid ${COLORS.red}` }}>
            <div style={{ fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 6 }}>Unlucky — Final Balance</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: unluckyDepletion ? COLORS.red : COLORS.white, fontFamily: 'Georgia, serif' }}>
              {unluckyDepletion ? `Depleted yr ${unluckyDepletion}` : formatDollars(unluckyFinal)}
            </div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginTop: 4 }}>crash in first 3 years</div>
          </div>
          <div style={{ background: '#141C28', border: '1px solid rgba(232,184,75,0.2)', borderRadius: 10, padding: '14px 16px', borderTop: `3px solid ${COLORS.gold}` }}>
            <div style={{ fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 6 }}>Timing Difference</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.gold, fontFamily: 'Georgia, serif' }}>
              {formatDollars(Math.abs(difference))}
            </div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginTop: 4 }}>same returns, different order</div>
          </div>
        </div>

        {/* Chart */}
        <div style={{ background: '#141C28', borderRadius: 12, padding: '20px 16px 12px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 16, fontFamily: 'Georgia, serif' }}>
            Portfolio Balance Over Time
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="year"
                tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 9, fontFamily: 'monospace' }}
                label={{ value: 'Years into Retirement', position: 'insideBottom', offset: -2, fill: 'rgba(255,255,255,0.2)', fontSize: 9 }}
              />
              <YAxis
                tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 9, fontFamily: 'monospace' }}
                tickFormatter={formatDollars}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 10, fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)', paddingTop: 12 }}
              />
              <ReferenceLine y={0} stroke="rgba(248,113,113,0.3)" strokeDasharray="4 4" />
              <Line
                type="monotone" dataKey="Lucky (crash later)"
                stroke={COLORS.teal} strokeWidth={2.5}
                dot={false} activeDot={{ r: 4, fill: COLORS.teal }}
              />
              <Line
                type="monotone" dataKey="Unlucky (crash early)"
                stroke={COLORS.red} strokeWidth={2.5}
                dot={false} activeDot={{ r: 4, fill: COLORS.red }}
                strokeDasharray="6 3"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Key insight */}
        <div style={{
          background: 'rgba(232,184,75,0.06)',
          border: '1px solid rgba(232,184,75,0.15)',
          borderLeft: '3px solid #E8B84B',
          borderRadius: 8, padding: '14px 16px',
        }}>
          <div style={{ fontSize: 10, color: COLORS.gold, fontWeight: 600, marginBottom: 6, letterSpacing: 1 }}>
            💡 KEY INSIGHT
          </div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.7 }}>
            Both portfolios experience the <em>exact same returns</em> — just in different order.
            The {crashMagnitude}% crash hits in year {Math.floor(years * 0.65) + 1} for the lucky investor,
            and year 1 for the unlucky one. Same average. {formatDollars(Math.abs(difference))} difference.
            This is why the bridge strategy — keeping 2-3 years of cash in taxable before tapping investments — is critical.
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
          For educational purposes only · Not financial advice
        </span>
        <a href="/#download" style={{ fontSize: 9, color: COLORS.gold, textDecoration: 'none', letterSpacing: 2, textTransform: 'uppercase' }}>
          Get Free Planner →
        </a>
      </div>
    </div>
  )
}

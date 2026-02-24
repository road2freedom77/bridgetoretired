'use client'

import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'

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

// 2026 MFJ brackets (standard deduction $30,000)
const STANDARD_DEDUCTION = 30_000
const BRACKETS_MFJ = [
  { rate: 0, upTo: STANDARD_DEDUCTION, label: '0% (Standard Deduction)', color: COLORS.sage },
  { rate: 0.10, upTo: STANDARD_DEDUCTION + 23_850, label: '10%', color: COLORS.teal },
  { rate: 0.12, upTo: STANDARD_DEDUCTION + 96_950, label: '12%', color: COLORS.blue },
  { rate: 0.22, upTo: STANDARD_DEDUCTION + 206_700, label: '22%', color: COLORS.orange },
  { rate: 0.24, upTo: STANDARD_DEDUCTION + 394_600, label: '24%', color: COLORS.red },
]

const LTCG_THRESHOLD_MFJ = 94_050 // 0% LTCG threshold

function calcTax(ordinaryIncome: number, capitalGains: number): {
  ordinaryTax: number
  capitalGainsTax: number
  totalTax: number
  effectiveRate: number
  totalIncome: number
} {
  const totalIncome = ordinaryIncome + capitalGains
  const taxableOrdinary = Math.max(0, ordinaryIncome - STANDARD_DEDUCTION)

  // Ordinary income tax
  let ordTax = 0
  let prev = 0
  for (const b of BRACKETS_MFJ.slice(1)) {
    if (taxableOrdinary <= prev) break
    const inBracket = Math.min(taxableOrdinary, b.upTo - STANDARD_DEDUCTION) - prev
    ordTax += inBracket * b.rate
    prev = b.upTo - STANDARD_DEDUCTION
  }

  // Capital gains tax (0% if total income under LTCG threshold)
  const ltcgRate = totalIncome <= LTCG_THRESHOLD_MFJ ? 0 : 0.15
  const cgTax = capitalGains * ltcgRate

  const totalTax = Math.round(ordTax + cgTax)
  return {
    ordinaryTax: Math.round(ordTax),
    capitalGainsTax: Math.round(cgTax),
    totalTax,
    effectiveRate: totalIncome > 0 ? (totalTax / totalIncome) * 100 : 0,
    totalIncome,
  }
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#0D1420', border: '1px solid rgba(232,184,75,0.2)', borderRadius: 8, padding: '10px 14px', fontFamily: 'monospace', fontSize: 11 }}>
      <div style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.fill || p.color || COLORS.gold, marginBottom: 3 }}>
          {p.name}: {formatDollars(p.value)}
        </div>
      ))}
    </div>
  )
}

export default function TaxBracketVisualizer() {
  const [rothConversion, setRothConversion] = useState(30_000)
  const [capitalGains, setCapitalGains] = useState(45_000)
  const [otherIncome, setOtherIncome] = useState(0)
  const [filingStatus] = useState<'mfj'>('mfj')

  const ordinaryIncome = rothConversion + otherIncome
  const result = useMemo(() => calcTax(ordinaryIncome, capitalGains), [ordinaryIncome, capitalGains])

  const totalSpendable = capitalGains + rothConversion + otherIncome
  const overLTCGThreshold = result.totalIncome > LTCG_THRESHOLD_MFJ
  const overCGThreshold = result.totalIncome > LTCG_THRESHOLD_MFJ

  // Build bracket fill visualization
  const bracketData = useMemo(() => {
    const bars = []
    const ordinary = Math.max(0, ordinaryIncome - STANDARD_DEDUCTION)

    // Standard deduction
    bars.push({
      name: 'Std Deduction',
      amount: Math.min(ordinaryIncome, STANDARD_DEDUCTION),
      rate: '0% — Free',
      color: COLORS.sage,
      type: 'ordinary',
    })

    // Ordinary income brackets
    let filled = 0
    for (const b of BRACKETS_MFJ.slice(1)) {
      const bracketSize = (b.upTo - STANDARD_DEDUCTION) - (BRACKETS_MFJ[BRACKETS_MFJ.indexOf(b) - 1]?.upTo - STANDARD_DEDUCTION || 0)
      const usedInBracket = Math.max(0, Math.min(ordinary - filled, bracketSize))
      if (usedInBracket > 0 || b.rate <= 0.12) {
        bars.push({
          name: `${b.label} Bracket`,
          amount: usedInBracket,
          rate: b.label,
          color: b.color,
          type: 'ordinary',
        })
      }
      filled += bracketSize
      if (filled >= ordinary + 20_000) break
    }

    // Capital gains bar
    bars.push({
      name: 'Capital Gains',
      amount: capitalGains,
      rate: overCGThreshold ? '15% Rate' : '0% Rate',
      color: overCGThreshold ? COLORS.orange : COLORS.teal,
      type: 'cg',
    })

    return bars
  }, [ordinaryIncome, capitalGains, overCGThreshold])

  // Year simulation: show tax at different income levels
  const scenarioData = useMemo(() => {
    return [20, 30, 40, 50, 60, 70, 80, 94, 110, 130].map(k => {
      const cg = k * 1000 * 0.6 // 60% capital gains
      const ord = k * 1000 * 0.4 // 40% ordinary (Roth conversions)
      const r = calcTax(ord, cg)
      return {
        name: `$${k}k`,
        'Tax Paid': r.totalTax,
        'After-Tax': Math.round(k * 1000 - r.totalTax),
        isCurrentIncome: Math.abs(k * 1000 - result.totalIncome) < 10_000,
        effectiveRate: r.effectiveRate.toFixed(1),
      }
    })
  }, [result.totalIncome])

  return (
    <div style={{
      background: '#0D1420', borderRadius: 16,
      border: '1px solid rgba(232,184,75,0.15)', overflow: 'hidden',
      fontFamily: "'IBM Plex Mono', monospace", margin: '2rem 0',
    }}>
      {/* Header */}
      <div style={{ background: '#141C28', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '20px 24px' }}>
        <div style={{ fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: COLORS.gold, marginBottom: 6 }}>2026 Tax Visualizer</div>
        <h3 style={{ color: COLORS.white, fontSize: 18, fontFamily: 'Georgia, serif', fontWeight: 700, margin: 0, marginBottom: 4 }}>
          Zero Tax Early Retirement Planner
        </h3>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, margin: 0 }}>
          Engineer your income to pay zero federal tax — Roth conversions, capital gains, and the standard deduction stacked together.
        </p>
      </div>

      <div style={{ padding: '24px' }}>
        {/* Controls */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Roth Conversion Amount', value: rothConversion, set: setRothConversion, min: 0, max: 100_000, step: 1000, fmt: (v: number) => formatDollars(v), sublabel: 'Ordinary income' },
            { label: 'Capital Gains / Dividends', value: capitalGains, set: setCapitalGains, min: 0, max: 150_000, step: 1000, fmt: (v: number) => formatDollars(v), sublabel: 'From taxable account' },
            { label: 'Other Ordinary Income', value: otherIncome, set: setOtherIncome, min: 0, max: 50_000, step: 1000, fmt: (v: number) => formatDollars(v), sublabel: 'SS, part-time, etc.' },
          ].map(({ label, value, set, min, max, step, fmt, sublabel }) => (
            <div key={label} style={{ background: '#141C28', borderRadius: 10, padding: '12px 14px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>{label}</span>
                <span style={{ fontSize: 12, color: COLORS.gold, fontWeight: 600 }}>{fmt(value)}</span>
              </div>
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', marginBottom: 8 }}>{sublabel}</div>
              <input type="range" min={min} max={max} step={step} value={value}
                onChange={e => set(Number(e.target.value))}
                style={{ width: '100%', accentColor: COLORS.gold, cursor: 'pointer' }} />
            </div>
          ))}

          {/* Tax result card */}
          <div style={{
            background: result.totalTax === 0 ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.06)',
            borderRadius: 10, padding: '16px',
            border: `1px solid ${result.totalTax === 0 ? COLORS.sage : COLORS.red}30`,
            borderLeft: `3px solid ${result.totalTax === 0 ? COLORS.sage : COLORS.red}`,
            display: 'flex', flexDirection: 'column' as const, justifyContent: 'center',
          }}>
            <div style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 8 }}>
              Federal Tax Bill
            </div>
            <div style={{ fontSize: 36, fontWeight: 700, fontFamily: 'Georgia, serif', color: result.totalTax === 0 ? COLORS.sage : COLORS.red, lineHeight: 1 }}>
              {result.totalTax === 0 ? '$0' : formatDollars(result.totalTax)}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 8 }}>
              {result.effectiveRate.toFixed(1)}% effective rate on {formatDollars(result.totalIncome)} income
            </div>
            {result.totalTax === 0 && (
              <div style={{ fontSize: 10, color: COLORS.sage, marginTop: 6 }}>✓ Zero tax achieved</div>
            )}
          </div>
        </div>

        {/* KPI row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Total Income', value: result.totalIncome, color: COLORS.white },
            { label: 'Ordinary Tax', value: result.ordinaryTax, color: result.ordinaryTax === 0 ? COLORS.sage : COLORS.orange },
            { label: 'Capital Gains Tax', value: result.capitalGainsTax, color: result.capitalGainsTax === 0 ? COLORS.sage : COLORS.red },
            { label: 'Total Federal Tax', value: result.totalTax, color: result.totalTax === 0 ? COLORS.sage : COLORS.red },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: '#141C28', borderRadius: 10, padding: '10px 12px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 7, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color, fontFamily: 'Georgia, serif' }}>
                {value === 0 ? '$0' : formatDollars(value)}
              </div>
            </div>
          ))}
        </div>

        {/* Bracket visualization */}
        <div style={{ background: '#141C28', borderRadius: 12, padding: '16px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4, fontFamily: 'Georgia, serif' }}>How Your Income Fills the Tax Brackets</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginBottom: 16 }}>Ordinary income fills from bottom up · Capital gains taxed at 0% if total income under $94,050</div>
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 6 }}>
            {/* Standard deduction */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 80, fontSize: 9, color: 'rgba(255,255,255,0.3)', textAlign: 'right' as const, flexShrink: 0 }}>0% Deduction</div>
              <div style={{ flex: 1, height: 28, background: 'rgba(255,255,255,0.04)', borderRadius: 4, overflow: 'hidden', position: 'relative' as const }}>
                <div style={{
                  width: `${Math.min(100, (Math.min(ordinaryIncome, STANDARD_DEDUCTION) / STANDARD_DEDUCTION) * 100)}%`,
                  height: '100%', background: COLORS.sage, opacity: 0.7, borderRadius: 4,
                  display: 'flex', alignItems: 'center', paddingLeft: 8,
                }}>
                  <span style={{ fontSize: 9, color: COLORS.dark, fontWeight: 600 }}>
                    {formatDollars(Math.min(ordinaryIncome, STANDARD_DEDUCTION))}
                  </span>
                </div>
              </div>
              <div style={{ width: 60, fontSize: 9, color: COLORS.sage, textAlign: 'right' as const }}>Cap: $30k</div>
            </div>
            {/* 10% bracket */}
            {[
              { label: '10% Bracket', max: 23_850, color: COLORS.teal },
              { label: '12% Bracket', max: 96_950, color: COLORS.blue },
            ].map(({ label, max, color }) => {
              const bracketStart = label === '10% Bracket' ? 0 : 23_850
              const taxableOrd = Math.max(0, ordinaryIncome - STANDARD_DEDUCTION)
              const inBracket = Math.max(0, Math.min(taxableOrd, max) - bracketStart)
              const pct = Math.min(100, (inBracket / (max - bracketStart)) * 100)
              return (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 80, fontSize: 9, color: 'rgba(255,255,255,0.3)', textAlign: 'right' as const, flexShrink: 0 }}>{label}</div>
                  <div style={{ flex: 1, height: 28, background: 'rgba(255,255,255,0.04)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{
                      width: `${pct}%`, height: '100%', background: color, opacity: 0.7, borderRadius: 4,
                      display: 'flex', alignItems: 'center', paddingLeft: 8, minWidth: inBracket > 0 ? 40 : 0,
                    }}>
                      {inBracket > 0 && <span style={{ fontSize: 9, color: COLORS.dark, fontWeight: 600 }}>{formatDollars(inBracket)}</span>}
                    </div>
                  </div>
                  <div style={{ width: 60, fontSize: 9, color: 'rgba(255,255,255,0.3)', textAlign: 'right' as const }}>Cap: ${Math.round(max / 1000)}k</div>
                </div>
              )
            })}
            {/* Capital gains */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
              <div style={{ width: 80, fontSize: 9, color: 'rgba(255,255,255,0.3)', textAlign: 'right' as const, flexShrink: 0 }}>Cap Gains</div>
              <div style={{ flex: 1, height: 28, background: 'rgba(255,255,255,0.04)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  width: `${Math.min(100, (capitalGains / 100_000) * 100)}%`,
                  height: '100%',
                  background: overCGThreshold ? COLORS.orange : COLORS.teal,
                  opacity: 0.7, borderRadius: 4,
                  display: 'flex', alignItems: 'center', paddingLeft: 8,
                }}>
                  <span style={{ fontSize: 9, color: COLORS.dark, fontWeight: 600 }}>
                    {formatDollars(capitalGains)} @ {overCGThreshold ? '15%' : '0%'}
                  </span>
                </div>
              </div>
              <div style={{ width: 60, fontSize: 9, color: overCGThreshold ? COLORS.orange : COLORS.sage, textAlign: 'right' as const }}>
                {overCGThreshold ? '15% rate' : '0% rate'}
              </div>
            </div>
          </div>
        </div>

        {/* LTCG threshold warning */}
        {overLTCGThreshold && (
          <div style={{
            background: 'rgba(251,146,60,0.06)', border: '1px solid rgba(251,146,60,0.2)',
            borderLeft: `3px solid ${COLORS.orange}`, borderRadius: 8, padding: '12px 14px', marginBottom: 16,
          }}>
            <div style={{ fontSize: 10, color: COLORS.orange, fontWeight: 600, marginBottom: 4 }}>⚠ OVER 0% LTCG THRESHOLD</div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.6 }}>
              Total income of {formatDollars(result.totalIncome)} exceeds the $94,050 threshold for 0% capital gains.
              Reduce income by {formatDollars(result.totalIncome - LTCG_THRESHOLD_MFJ)} to pay $0 on your capital gains.
              Consider reducing Roth conversions or deferring some capital gains to next year.
            </p>
          </div>
        )}

        {/* Zero tax recipe */}
        <div style={{
          background: 'rgba(232,184,75,0.06)', border: '1px solid rgba(232,184,75,0.15)',
          borderLeft: `3px solid ${COLORS.gold}`, borderRadius: 8, padding: '14px 16px',
        }}>
          <div style={{ fontSize: 10, color: COLORS.gold, fontWeight: 600, marginBottom: 8, letterSpacing: 1 }}>
            💡 THE ZERO TAX RECIPE (MFJ 2026)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { item: 'Standard deduction', amount: '$30,000', note: 'Covers Roth conversions', color: COLORS.sage },
              { item: '0% LTCG threshold', amount: '$94,050', note: 'Total income ceiling', color: COLORS.teal },
              { item: 'Max Roth conversion', amount: '$30,000', note: 'Tax-free ordinary income', color: COLORS.purple },
              { item: 'Max 0% cap gains', amount: '$64,050', note: 'After $30k conversion', color: COLORS.blue },
            ].map(({ item, amount, note, color }) => (
              <div key={item} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 6, padding: '8px 10px' }}>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginBottom: 2 }}>{item}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color, fontFamily: 'Georgia, serif' }}>{amount}</div>
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', marginTop: 2 }}>{note}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.15)', letterSpacing: 1 }}>2026 MFJ brackets · State taxes not included · For educational purposes only</span>
        <a href="/#download" style={{ fontSize: 9, color: COLORS.gold, textDecoration: 'none', letterSpacing: 2, textTransform: 'uppercase' }}>Get Free Planner →</a>
      </div>
    </div>
  )
}

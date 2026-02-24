'use client'

import { useState, useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'

const COLORS = {
  gold: '#E8B84B',
  teal: '#2DD4BF',
  blue: '#60A5FA',
  purple: '#A78BFA',
  red: '#F87171',
  sage: '#4ADE80',
  white: '#FFFFFF',
  dark: '#0D1420',
  ink: '#141C28',
  slate: '#1E2A3A',
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
      {payload.map((p: any) => p.value > 0 && (
        <div key={p.name} style={{ color: p.color, marginBottom: 3 }}>
          {p.name}: {formatDollars(p.value)}
        </div>
      ))}
    </div>
  )
}

export default function BridgeStrategyVisualizer() {
  const [retireAge, setRetireAge] = useState(52)
  const [taxable, setTaxable] = useState(400_000)
  const [retirement401k, setRetirement401k] = useState(800_000)
  const [rothBalance, setRothBalance] = useState(150_000)
  const [annualSpend, setAnnualSpend] = useState(60_000)
  const [returnRate, setReturnRate] = useState(6)

  const bridgeEnd = 59.5
  const ssAge = 67
  const endAge = 90

  const data = useMemo(() => {
    const rows = []
    let taxableBalance = taxable
    let k401Balance = retirement401k
    let rothBal = rothBalance
    const rate = returnRate / 100

    for (let age = retireAge; age <= endAge; age++) {
      const isBridgeYear = age < bridgeEnd
      const isPostBridge = age >= bridgeEnd && age < ssAge
      const hasSS = age >= ssAge
      const ssIncome = hasSS ? 24_000 : 0
      const netSpend = Math.max(0, annualSpend - ssIncome)

      if (isBridgeYear) {
        // Draw from taxable first
        taxableBalance = Math.max(0, taxableBalance - netSpend)
        taxableBalance *= (1 + rate)
        k401Balance *= (1 + rate) // grows untouched
        rothBal *= (1 + rate)
      } else if (isPostBridge) {
        // Draw from 401k after 59.5
        k401Balance = Math.max(0, k401Balance - netSpend)
        k401Balance *= (1 + rate)
        taxableBalance *= (1 + rate) // now grows
        rothBal *= (1 + rate)
      } else {
        // SS + 401k
        k401Balance = Math.max(0, k401Balance - netSpend)
        k401Balance *= (1 + rate)
        taxableBalance *= (1 + rate)
        rothBal *= (1 + rate)
      }

      rows.push({
        age,
        'Taxable': Math.round(Math.max(0, taxableBalance)),
        '401k / IRA': Math.round(Math.max(0, k401Balance)),
        'Roth': Math.round(Math.max(0, rothBal)),
        phase: isBridgeYear ? 'bridge' : isPostBridge ? 'post' : 'ss',
      })
    }
    return rows
  }, [retireAge, taxable, retirement401k, rothBalance, annualSpend, returnRate])

  const bridgeYears = Math.round(bridgeEnd - retireAge * 10) / 10
  const k401AtBridge = data.find(d => d.age === Math.ceil(bridgeEnd))?.[' 401k / IRA'] ?? 0
  const totalAtEnd = (data[data.length - 1]?.['Taxable'] ?? 0) +
    (data[data.length - 1]?.['401k / IRA'] ?? 0) +
    (data[data.length - 1]?.['Roth'] ?? 0)

  const taxableRunsOut = data.find(d => d['Taxable'] === 0 && d.age < bridgeEnd)

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
          Interactive Visualizer
        </div>
        <h3 style={{ color: COLORS.white, fontSize: 18, fontFamily: 'Georgia, serif', fontWeight: 700, margin: 0, marginBottom: 4 }}>
          Bridge Strategy Timeline
        </h3>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, margin: 0 }}>
          See how your three buckets work together from retirement to 90. Watch the 401k grow untouched during bridge years.
        </p>
      </div>

      <div style={{ padding: '24px' }}>

        {/* Controls */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Retirement Age', value: retireAge, set: setRetireAge, min: 40, max: 58, step: 1, fmt: (v: number) => `Age ${v}` },
            { label: 'Annual Spending', value: annualSpend, set: setAnnualSpend, min: 30000, max: 150000, step: 5000, fmt: (v: number) => formatDollars(v) },
            { label: 'Taxable Account', value: taxable, set: setTaxable, min: 100000, max: 2000000, step: 50000, fmt: (v: number) => formatDollars(v) },
            { label: '401k / IRA Balance', value: retirement401k, set: setRetirement401k, min: 200000, max: 3000000, step: 50000, fmt: (v: number) => formatDollars(v) },
            { label: 'Roth Balance', value: rothBalance, set: setRothBalance, min: 0, max: 500000, step: 25000, fmt: (v: number) => formatDollars(v) },
            { label: 'Annual Return', value: returnRate, set: setReturnRate, min: 3, max: 10, step: 0.5, fmt: (v: number) => `${v}%` },
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

        {/* Phase legend */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {[
            { label: `Bridge Years (${retireAge}–59½)`, color: 'rgba(232,184,75,0.15)', border: 'rgba(232,184,75,0.4)', text: 'Draw taxable. 401k grows.' },
            { label: `Post-59½ (59½–67)`, color: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.3)', text: 'Draw 401k. Taxable recovers.' },
            { label: `Social Security (67+)`, color: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.2)', text: 'SS floor + 401k supplement.' },
          ].map(({ label, color, border, text }) => (
            <div key={label} style={{
              background: color, border: `1px solid ${border}`,
              borderRadius: 6, padding: '6px 10px', flex: 1, minWidth: 160,
            }}>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', fontWeight: 600, marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>{text}</div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div style={{ background: '#141C28', borderRadius: 12, padding: '20px 16px 12px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 16 }}>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="taxableGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.teal} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={COLORS.teal} stopOpacity={0.02}/>
                </linearGradient>
                <linearGradient id="k401Grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.gold} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={COLORS.gold} stopOpacity={0.02}/>
                </linearGradient>
                <linearGradient id="rothGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.purple} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={COLORS.purple} stopOpacity={0.02}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="age"
                tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 9, fontFamily: 'monospace' }}
                label={{ value: 'Age', position: 'insideBottom', offset: -2, fill: 'rgba(255,255,255,0.2)', fontSize: 9 }}
              />
              <YAxis
                tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 9, fontFamily: 'monospace' }}
                tickFormatter={formatDollars}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)', paddingTop: 12 }} />
              <ReferenceLine x={59} stroke={COLORS.gold} strokeDasharray="4 4" strokeOpacity={0.5}
                label={{ value: '59½', position: 'top', fill: COLORS.gold, fontSize: 9 }} />
              <ReferenceLine x={ssAge} stroke={COLORS.sage} strokeDasharray="4 4" strokeOpacity={0.5}
                label={{ value: 'SS', position: 'top', fill: COLORS.sage, fontSize: 9 }} />
              <Area type="monotone" dataKey="Taxable" stroke={COLORS.teal} fill="url(#taxableGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="401k / IRA" stroke={COLORS.gold} fill="url(#k401Grad)" strokeWidth={2} />
              <Area type="monotone" dataKey="Roth" stroke={COLORS.purple} fill="url(#rothGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* KPI row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
          <div style={{ background: '#141C28', borderRadius: 10, padding: '12px 14px', border: '1px solid rgba(232,184,75,0.15)', borderTop: `3px solid ${COLORS.gold}` }}>
            <div style={{ fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>Bridge Length</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.gold, fontFamily: 'Georgia, serif' }}>{bridgeYears.toFixed(1)} yrs</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>Age {retireAge} → 59½</div>
          </div>
          <div style={{ background: '#141C28', borderRadius: 10, padding: '12px 14px', border: '1px solid rgba(45,212,191,0.15)', borderTop: `3px solid ${COLORS.teal}` }}>
            <div style={{ fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>Taxable Needed</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.teal, fontFamily: 'Georgia, serif' }}>
              {formatDollars(annualSpend * bridgeYears)}
            </div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>
              {taxable >= annualSpend * bridgeYears ? '✓ Funded' : '⚠ Shortfall'}
            </div>
          </div>
          <div style={{ background: '#141C28', borderRadius: 10, padding: '12px 14px', border: '1px solid rgba(74,222,128,0.15)', borderTop: `3px solid ${COLORS.sage}` }}>
            <div style={{ fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>Total at Age 90</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: totalAtEnd > 0 ? COLORS.sage : COLORS.red, fontFamily: 'Georgia, serif' }}>
              {totalAtEnd > 0 ? formatDollars(totalAtEnd) : 'Depleted'}
            </div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>all three accounts</div>
          </div>
        </div>

        {/* Warning if taxable insufficient */}
        {taxable < annualSpend * bridgeYears && (
          <div style={{
            background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)',
            borderLeft: `3px solid ${COLORS.red}`, borderRadius: 8, padding: '12px 14px', marginBottom: 16,
          }}>
            <div style={{ fontSize: 10, color: COLORS.red, fontWeight: 600, marginBottom: 4 }}>⚠ BRIDGE FUNDING GAP</div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.6 }}>
              Your taxable account ({formatDollars(taxable)}) may not fully fund the {bridgeYears.toFixed(1)}-year bridge at {formatDollars(annualSpend)}/yr spending.
              Consider Roth contributions, Rule 72(t), or reducing spending to close the gap.
            </p>
          </div>
        )}

        {/* Key insight */}
        <div style={{
          background: 'rgba(232,184,75,0.06)', border: '1px solid rgba(232,184,75,0.15)',
          borderLeft: '3px solid #E8B84B', borderRadius: 8, padding: '14px 16px',
        }}>
          <div style={{ fontSize: 10, color: COLORS.gold, fontWeight: 600, marginBottom: 6, letterSpacing: 1 }}>
            💡 THE BRIDGE ADVANTAGE
          </div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.7 }}>
            Your 401(k) grows untouched for {bridgeYears.toFixed(1)} years during the bridge.
            At {returnRate}% return, {formatDollars(retirement401k)} becomes approximately{' '}
            <strong style={{ color: COLORS.gold }}>
              {formatDollars(retirement401k * Math.pow(1 + returnRate / 100, bridgeYears))}
            </strong>{' '}
            by age 59½ — without touching a dollar of it.
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

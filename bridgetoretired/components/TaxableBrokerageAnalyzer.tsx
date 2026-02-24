'use client'

import { useState, useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, Cell } from 'recharts'

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

export default function TaxableBrokerageAnalyzer() {
  const [retireAge, setRetireAge] = useState(52)
  const [taxable, setTaxable] = useState(450_000)
  const [k401k, setK401k] = useState(700_000)
  const [roth, setRoth] = useState(120_000)
  const [annualSpend, setAnnualSpend] = useState(55_000)
  const [returnRate, setReturnRate] = useState(6)
  const [annualSavings, setAnnualSavings] = useState(0)

  const bridgeEnd = 59.5
  const rate = returnRate / 100

  // How much more should go to taxable vs 401k?
  const bridgeYears = bridgeEnd - retireAge
  const bridgeNeeded = annualSpend * bridgeYears * 1.15
  const taxableGap = Math.max(0, bridgeNeeded - taxable)

  // Simulate bridge strategy
  const bridgeData = useMemo(() => {
    let t = taxable, k = k401k, r = roth
    const rows = []
    for (let age = retireAge; age <= 90; age++) {
      const isBridge = age < bridgeEnd
      const hasSS = age >= 67
      const ssIncome = hasSS ? 22_000 : 0
      const need = Math.max(0, annualSpend - ssIncome)

      if (isBridge) {
        t = Math.max(0, t - need)
        k *= (1 + rate)
        r *= (1 + rate)
      } else {
        k = Math.max(0, k - need)
        t *= (1 + rate)
        r *= (1 + rate)
      }

      rows.push({
        age,
        'Taxable': Math.round(Math.max(0, t)),
        '401k': Math.round(Math.max(0, k)),
        'Roth': Math.round(Math.max(0, r)),
      })
    }
    return rows
  }, [retireAge, taxable, k401k, roth, annualSpend, rate])

  // Years until taxable runs out
  const taxableRunsOut = bridgeData.find(d => d['Taxable'] === 0)?.age
  const bridgeFullyCovered = !taxableRunsOut || taxableRunsOut >= Math.ceil(bridgeEnd)

  // Tax comparison: taxable first vs 401k first during bridge
  const taxSaved = useMemo(() => {
    // Wrong: tap 401k during bridge
    const wrongTax = annualSpend * bridgeYears * 0.30 // ~30% effective (penalty + tax)
    // Right: tap taxable at ~5% effective
    const rightTax = annualSpend * bridgeYears * 0.05
    return Math.round(wrongTax - rightTax)
  }, [annualSpend, bridgeYears])

  // Asset location recommendations
  const assetLocationData = [
    { account: 'Taxable', best: 'Index funds, ETFs, Muni bonds', avoid: 'REITs, high-yield bonds', color: COLORS.teal, reason: 'Minimize taxable events, hold tax-efficient assets' },
    { account: '401k / IRA', best: 'REITs, bonds, actively managed', avoid: 'Municipal bonds', color: COLORS.gold, reason: 'Tax-deferred growth, ordinary income treatment anyway' },
    { account: 'Roth IRA', best: 'Highest growth assets', avoid: 'Bonds, stable value', color: COLORS.purple, reason: 'Tax-free growth forever — maximize growth potential' },
  ]

  // How much to build in taxable before retiring
  const yearsToRetire = 5 // assume 5 years away
  const currentTaxableTarget = bridgeNeeded
  const annualTaxableContrib = Math.max(0, (currentTaxableTarget - taxable) / yearsToRetire)

  const total = taxable + k401k + roth
  const taxablePct = Math.round((taxable / total) * 100)
  const k401kPct = Math.round((k401k / total) * 100)
  const rothPct = Math.round((roth / total) * 100)

  return (
    <div style={{
      background: '#0D1420', borderRadius: 16,
      border: '1px solid rgba(232,184,75,0.15)', overflow: 'hidden',
      fontFamily: "'IBM Plex Mono', monospace", margin: '2rem 0',
    }}>
      <div style={{ background: '#141C28', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '20px 24px' }}>
        <div style={{ fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: COLORS.gold, marginBottom: 6 }}>Interactive Analyzer</div>
        <h3 style={{ color: COLORS.white, fontSize: 18, fontFamily: 'Georgia, serif', fontWeight: 700, margin: 0, marginBottom: 4 }}>
          Taxable Brokerage Bridge Analyzer
        </h3>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, margin: 0 }}>
          See if your taxable account can fund your bridge — and how the three buckets work together from retirement to 90.
        </p>
      </div>

      <div style={{ padding: '24px' }}>
        {/* Controls */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Retirement Age', value: retireAge, set: setRetireAge, min: 40, max: 58, step: 1, fmt: (v: number) => `Age ${v}` },
            { label: 'Annual Spending', value: annualSpend, set: setAnnualSpend, min: 30000, max: 120000, step: 5000, fmt: (v: number) => formatDollars(v) },
            { label: 'Taxable Account', value: taxable, set: setTaxable, min: 0, max: 2000000, step: 25000, fmt: (v: number) => formatDollars(v) },
            { label: '401k / IRA', value: k401k, set: setK401k, min: 0, max: 3000000, step: 50000, fmt: (v: number) => formatDollars(v) },
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

        {/* Portfolio allocation */}
        <div style={{ background: '#141C28', borderRadius: 10, padding: '14px 16px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 16 }}>
          <div style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 12 }}>Portfolio Allocation</div>
          <div style={{ display: 'flex', height: 24, borderRadius: 6, overflow: 'hidden', marginBottom: 10 }}>
            <div style={{ width: `${taxablePct}%`, background: COLORS.teal, opacity: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 9, color: COLORS.dark, fontWeight: 700 }}>{taxablePct}%</span>
            </div>
            <div style={{ width: `${k401kPct}%`, background: COLORS.gold, opacity: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 9, color: COLORS.dark, fontWeight: 700 }}>{k401kPct}%</span>
            </div>
            <div style={{ width: `${rothPct}%`, background: COLORS.purple, opacity: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 9, color: COLORS.dark, fontWeight: 700 }}>{rothPct}%</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            {[
              { label: 'Taxable', color: COLORS.teal, value: taxable },
              { label: '401k / IRA', color: COLORS.gold, value: k401k },
              { label: 'Roth', color: COLORS.purple, value: roth },
            ].map(({ label, color, value }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>{label}: {formatDollars(value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bridge status */}
        <div style={{
          background: bridgeFullyCovered ? 'rgba(74,222,128,0.06)' : 'rgba(248,113,113,0.06)',
          border: `1px solid ${bridgeFullyCovered ? COLORS.sage : COLORS.red}30`,
          borderLeft: `3px solid ${bridgeFullyCovered ? COLORS.sage : COLORS.red}`,
          borderRadius: 8, padding: '12px 14px', marginBottom: 16,
        }}>
          <div style={{ fontSize: 10, color: bridgeFullyCovered ? COLORS.sage : COLORS.red, fontWeight: 600, marginBottom: 4 }}>
            {bridgeFullyCovered ? '✓ BRIDGE FUNDED' : '⚠ BRIDGE FUNDING GAP'}
          </div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.6 }}>
            {bridgeFullyCovered
              ? `Your taxable account (${formatDollars(taxable)}) can fund the ${bridgeYears.toFixed(1)}-year bridge at ${formatDollars(annualSpend)}/yr spending. Bridge needs ~${formatDollars(bridgeNeeded)}.`
              : `Bridge needs ~${formatDollars(bridgeNeeded)} but taxable is only ${formatDollars(taxable)}. Gap: ${formatDollars(taxableGap)}. Consider Roth contributions, 72(t), or building more taxable before retiring.`
            }
          </p>
        </div>

        {/* KPI cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
          <div style={{ background: '#141C28', borderRadius: 10, padding: '12px 14px', border: `1px solid ${COLORS.teal}20`, borderTop: `3px solid ${COLORS.teal}` }}>
            <div style={{ fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>Bridge Length</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.teal, fontFamily: 'Georgia, serif' }}>{bridgeYears.toFixed(1)} yrs</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>Age {retireAge} → 59½</div>
          </div>
          <div style={{ background: '#141C28', borderRadius: 10, padding: '12px 14px', border: `1px solid ${COLORS.sage}20`, borderTop: `3px solid ${COLORS.sage}` }}>
            <div style={{ fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>Tax Saved vs 401k First</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.sage, fontFamily: 'Georgia, serif' }}>{formatDollars(taxSaved)}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>over bridge years</div>
          </div>
          <div style={{ background: '#141C28', borderRadius: 10, padding: '12px 14px', border: `1px solid ${COLORS.gold}20`, borderTop: `3px solid ${COLORS.gold}` }}>
            <div style={{ fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>401k at 59½</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.gold, fontFamily: 'Georgia, serif' }}>
              {formatDollars(Math.round(k401k * Math.pow(1 + rate, bridgeYears)))}
            </div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>untouched at {returnRate}%</div>
          </div>
        </div>

        {/* Bridge chart */}
        <div style={{ background: '#141C28', borderRadius: 12, padding: '20px 16px 12px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 16, fontFamily: 'Georgia, serif' }}>Three Buckets: Retirement to Age 90</div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={bridgeData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <defs>
                {[['tG', COLORS.teal], ['kG', COLORS.gold], ['rG', COLORS.purple]].map(([id, color]) => (
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
              <Area type="monotone" dataKey="Taxable" stroke={COLORS.teal} fill="url(#tG)" strokeWidth={2} />
              <Area type="monotone" dataKey="401k" stroke={COLORS.gold} fill="url(#kG)" strokeWidth={2} />
              <Area type="monotone" dataKey="Roth" stroke={COLORS.purple} fill="url(#rG)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Asset location guide */}
        <div style={{ background: '#141C28', borderRadius: 12, padding: '16px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 12, fontFamily: 'Georgia, serif' }}>Asset Location: What Goes Where</div>
          {assetLocationData.map(({ account, best, avoid, color, reason }) => (
            <div key={account} style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'flex-start' }}>
              <div style={{
                minWidth: 70, padding: '4px 8px', borderRadius: 4,
                background: `${color}20`, border: `1px solid ${color}40`,
                fontSize: 9, color, fontWeight: 600, textAlign: 'center' as const,
              }}>{account}</div>
              <div>
                <div style={{ fontSize: 9, color: COLORS.sage, marginBottom: 2 }}>✓ Best: {best}</div>
                <div style={{ fontSize: 9, color: COLORS.red, marginBottom: 2 }}>✗ Avoid: {avoid}</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)' }}>{reason}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Insight */}
        <div style={{
          background: 'rgba(232,184,75,0.06)', border: '1px solid rgba(232,184,75,0.15)',
          borderLeft: `3px solid ${COLORS.gold}`, borderRadius: 8, padding: '14px 16px',
        }}>
          <div style={{ fontSize: 10, color: COLORS.gold, fontWeight: 600, marginBottom: 6, letterSpacing: 1 }}>💡 THE TAXABLE ACCOUNT IS YOUR MOST VALUABLE EARLY ASSET</div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.7 }}>
            Despite being the "smallest" account for most FIRE savers, your taxable brokerage is irreplaceable during bridge years.
            No other account gives you penalty-free access, 0% capital gains rates, and tax-free return of basis simultaneously.
            Build it deliberately during accumulation — don't over-concentrate in 401k to the point where your bridge is underfunded.
          </p>
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.15)', letterSpacing: 1 }}>Simplified model · For educational purposes only</span>
        <a href="/#download" style={{ fontSize: 9, color: COLORS.gold, textDecoration: 'none', letterSpacing: 2, textTransform: 'uppercase' }}>Get Free Planner →</a>
      </div>
    </div>
  )
}

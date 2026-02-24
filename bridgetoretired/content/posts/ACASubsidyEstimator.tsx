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
  white: '#FFFFFF',
  dark: '#0D1420',
  ink: '#141C28',
}

function formatDollars(n: number) {
  if (n >= 1_000) return `$${Math.round(n / 1_000)}k`
  return `$${Math.round(n).toLocaleString()}`
}

// 2026 Federal Poverty Level (estimate - reverts to pre-ARPA rules)
const FPL_2026: Record<number, number> = {
  1: 15_650,
  2: 21_150,
  3: 26_650,
  4: 32_150,
}

// 2026 benchmark Silver plan monthly premiums by age (unsubsidized estimates)
function getBenchmarkPremium(age: number, householdSize: number): number {
  // Approximate unsubsidized Silver plan premiums 2026
  const base = householdSize === 1 ? 500 : 950
  const ageFactor = age < 40 ? 1.0 : age < 50 ? 1.3 : age < 55 ? 1.6 : age < 60 ? 1.9 : age < 65 ? 2.2 : 2.4
  return Math.round(base * ageFactor)
}

// ACA subsidy calculation (reverted pre-ARPA 2026 rules)
function calcSubsidy(magi: number, householdSize: number, age: number): {
  fpl: number
  fplPercent: number
  benchmarkPremium: number
  maxContribution: number
  monthlySubsidy: number
  annualSubsidy: number
  yourMonthlyCost: number
  yourAnnualCost: number
  eligible: boolean
  overCliff: boolean
} {
  const fpl = FPL_2026[Math.min(householdSize, 4)] ?? 32_150
  const fplPercent = (magi / fpl) * 100
  const benchmarkPremium = getBenchmarkPremium(age, householdSize)
  const annualBenchmark = benchmarkPremium * 12

  // Pre-ARPA: subsidies available 100%-400% FPL
  // Contribution percentages from ACA sliding scale
  const getContributionPercent = (pct: number): number => {
    if (pct < 100) return 0 // Medicaid territory
    if (pct <= 133) return 0.0
    if (pct <= 150) return 0.0
    if (pct <= 200) return 0.06
    if (pct <= 250) return 0.08
    if (pct <= 300) return 0.10
    if (pct <= 400) return 0.085
    return 1.0 // no subsidy above 400%
  }

  const overCliff = fplPercent > 400
  const eligible = fplPercent >= 100 && fplPercent <= 400
  const contributionPct = getContributionPercent(fplPercent)
  const maxContribution = Math.round(magi * contributionPct / 12) // monthly
  const monthlySubsidy = eligible ? Math.max(0, benchmarkPremium - maxContribution) : 0
  const annualSubsidy = monthlySubsidy * 12
  const yourMonthlyCost = eligible ? Math.max(0, benchmarkPremium - monthlySubsidy) : benchmarkPremium
  const yourAnnualCost = yourMonthlyCost * 12

  return {
    fpl,
    fplPercent,
    benchmarkPremium,
    maxContribution,
    monthlySubsidy,
    annualSubsidy,
    yourMonthlyCost,
    yourAnnualCost,
    eligible,
    overCliff,
  }
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#0D1420', border: '1px solid rgba(232,184,75,0.2)', borderRadius: 8, padding: '10px 14px', fontFamily: 'monospace', fontSize: 11 }}>
      <div style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.fill || p.color, marginBottom: 3 }}>
          {p.name}: {formatDollars(p.value)}/mo
        </div>
      ))}
    </div>
  )
}

export default function ACASubsidyEstimator() {
  const [magi, setMagi] = useState(55_000)
  const [age, setAge] = useState(52)
  const [householdSize, setHouseholdSize] = useState(2)

  const result = useMemo(() => calcSubsidy(magi, householdSize, age), [magi, age, householdSize])

  // Chart: show cost at different income levels
  const chartData = useMemo(() => {
    const fpl = FPL_2026[Math.min(householdSize, 4)] ?? 32_150
    const points = [100, 133, 150, 200, 250, 300, 350, 400, 450].map(pct => {
      const income = Math.round(fpl * pct / 100)
      const r = calcSubsidy(income, householdSize, age)
      return {
        name: `${pct}% FPL\n$${Math.round(income / 1000)}k`,
        'Your Cost': r.yourMonthlyCost,
        'Subsidy': r.monthlySubsidy,
        isCurrentIncome: Math.abs(income - magi) < fpl * 0.26,
      }
    })
    return points
  }, [householdSize, age, magi])

  const fplPercent = result.fplPercent

  const statusColor = result.overCliff ? COLORS.red : result.eligible ? COLORS.sage : COLORS.orange
  const statusLabel = result.overCliff
    ? '⚠ Over 400% FPL — No Subsidy'
    : fplPercent < 100
    ? '⚠ Under 100% FPL — Medicaid Zone'
    : `✓ Eligible — ${Math.round(fplPercent)}% of FPL`

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
          2026 Estimator
        </div>
        <h3 style={{ color: COLORS.white, fontSize: 18, fontFamily: 'Georgia, serif', fontWeight: 700, margin: 0, marginBottom: 4 }}>
          ACA Health Insurance Cost Estimator
        </h3>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, margin: 0 }}>
          See your estimated monthly premium after subsidies — based on 2026 pre-ARPA rules. Subsidies end at 400% FPL.
        </p>
      </div>

      <div style={{ padding: '24px' }}>

        {/* 2026 warning banner */}
        <div style={{
          background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.25)',
          borderLeft: `3px solid ${COLORS.orange}`, borderRadius: 8, padding: '12px 14px', marginBottom: 20,
        }}>
          <div style={{ fontSize: 10, color: COLORS.orange, fontWeight: 600, marginBottom: 4 }}>⚠ 2026 ACA UPDATE</div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: 1.6 }}>
            Enhanced ACA subsidies (ARPA) expired January 2026. Average premiums for subsidized enrollees increased ~114%.
            Congress may extend subsidies — monitor healthcare.gov during open enrollment. This estimator uses current 2026 rules.
          </p>
        </div>

        {/* Controls */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Annual MAGI', value: magi, set: setMagi, min: 15000, max: 200000, step: 1000, fmt: (v: number) => `$${v.toLocaleString()}` },
            { label: 'Your Age', value: age, set: setAge, min: 40, max: 64, step: 1, fmt: (v: number) => `Age ${v}` },
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
          {/* Household size buttons */}
          <div style={{ background: '#141C28', borderRadius: 10, padding: '12px 14px', border: '1px solid rgba(255,255,255,0.06)', gridColumn: 'span 2' }}>
            <div style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 10 }}>Household Size</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[1, 2, 3, 4].map(n => (
                <button key={n} onClick={() => setHouseholdSize(n)} style={{
                  flex: 1, padding: '8px', borderRadius: 6, border: 'none', cursor: 'pointer', fontFamily: 'monospace', fontSize: 12, fontWeight: 600,
                  background: householdSize === n ? COLORS.gold : 'rgba(255,255,255,0.06)',
                  color: householdSize === n ? COLORS.dark : 'rgba(255,255,255,0.4)',
                  transition: 'all 0.15s',
                }}>
                  {n === 4 ? '4+' : n} {n === 1 ? 'person' : 'people'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Status indicator */}
        <div style={{
          background: '#141C28', borderRadius: 10, padding: '14px 16px',
          border: `1px solid ${statusColor}40`,
          borderLeft: `3px solid ${statusColor}`,
          marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>Subsidy Status</div>
            <div style={{ fontSize: 13, color: statusColor, fontWeight: 600 }}>{statusLabel}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
              FPL for {householdSize}-person household: ${result.fpl.toLocaleString()}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginBottom: 2 }}>Unsubsidized benchmark</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>{formatDollars(result.benchmarkPremium)}/mo</div>
          </div>
        </div>

        {/* KPI cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
          <div style={{ background: '#141C28', borderRadius: 10, padding: '12px 14px', border: '1px solid rgba(74,222,128,0.15)', borderTop: `3px solid ${COLORS.sage}` }}>
            <div style={{ fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>Your Monthly Cost</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.sage, fontFamily: 'Georgia, serif' }}>{formatDollars(result.yourMonthlyCost)}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>Silver benchmark plan</div>
          </div>
          <div style={{ background: '#141C28', borderRadius: 10, padding: '12px 14px', border: '1px solid rgba(45,212,191,0.15)', borderTop: `3px solid ${COLORS.teal}` }}>
            <div style={{ fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>Monthly Subsidy</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.teal, fontFamily: 'Georgia, serif' }}>{formatDollars(result.monthlySubsidy)}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>{formatDollars(result.annualSubsidy)}/year saved</div>
          </div>
          <div style={{ background: '#141C28', borderRadius: 10, padding: '12px 14px', border: '1px solid rgba(248,113,113,0.15)', borderTop: `3px solid ${COLORS.red}` }}>
            <div style={{ fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>Annual Cost</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.red, fontFamily: 'Georgia, serif' }}>{formatDollars(result.yourAnnualCost)}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>premiums only, not OOP</div>
          </div>
        </div>

        {/* Chart: cost across income levels */}
        <div style={{ background: '#141C28', borderRadius: 12, padding: '20px 16px 12px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4, fontFamily: 'Georgia, serif' }}>Monthly Premium Cost vs Income Level</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginBottom: 16 }}>Green = your cost after subsidy · Teal = subsidy amount · Drop at 400% FPL = subsidy cliff</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 8, fontFamily: 'monospace' }} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 9, fontFamily: 'monospace' }} tickFormatter={v => `$${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine x={`400% FPL\n$${Math.round(result.fpl * 4 / 1000)}k`} stroke={COLORS.red} strokeDasharray="4 4" />
              <Bar dataKey="Your Cost" stackId="a" radius={[0, 0, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.isCurrentIncome ? COLORS.gold : COLORS.sage} opacity={0.85} />
                ))}
              </Bar>
              <Bar dataKey="Subsidy" stackId="a" fill={COLORS.teal} opacity={0.5} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Income management tip */}
        <div style={{
          background: 'rgba(232,184,75,0.06)', border: '1px solid rgba(232,184,75,0.15)',
          borderLeft: `3px solid ${COLORS.gold}`, borderRadius: 8, padding: '14px 16px',
        }}>
          <div style={{ fontSize: 10, color: COLORS.gold, fontWeight: 600, marginBottom: 6, letterSpacing: 1 }}>
            💡 INCOME MANAGEMENT MATTERS
          </div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.7 }}>
            {result.overCliff
              ? `Your income is above 400% FPL — you receive no subsidy. Reducing MAGI by $${Math.round((magi - result.fpl * 4) / 1000)}k would bring you under the cliff and save ${formatDollars(result.benchmarkPremium * 0.4)}/month or more. Strategies: draw from Roth (not counted as MAGI), reduce Roth conversions, or increase pre-tax deductions.`
              : `At $${magi.toLocaleString()} MAGI, you save ${formatDollars(result.annualSubsidy)}/year in subsidies. Each additional dollar of MAGI above the 400% FPL cliff ($${(result.fpl * 4).toLocaleString()}) eliminates all subsidies — a potential $${formatDollars(result.annualSubsidy)} cliff. Plan Roth conversions carefully to stay under.`
            }
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
          Estimates only · Verify at healthcare.gov · 2026 pre-ARPA rules
        </span>
        <a href="/#download" style={{ fontSize: 9, color: COLORS.gold, textDecoration: 'none', letterSpacing: 2, textTransform: 'uppercase' }}>
          Get Free Planner →
        </a>
      </div>
    </div>
  )
}

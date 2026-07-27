'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#0D1420', border: '1px solid rgba(232,184,75,0.2)', borderRadius: 8, padding: '10px 14px', fontFamily: 'monospace', fontSize: 11 }}>
      <div style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.fill || p.color, marginBottom: 3 }}>{p.name}: {formatDollars(p.value)}</div>
      ))}
    </div>
  )
}

const WITHDRAWAL_RATES: Record<number, number> = {
  30: 0.040, 35: 0.037, 40: 0.033, 45: 0.031, 50: 0.030,
}

const PRO_FEATURES = [
  { icon: '🛡️', label: 'Bridge Risk Score™', sub: 'Grade your plan in 60 seconds' },
  { icon: '📉', label: 'Sequence-of-Returns Stress Tester', sub: '2000, 2008, worst-case crashes' },
  { icon: '🖥️', label: 'Online Retirement Planner', sub: 'Save up to 5 scenarios' },
  { icon: '📄', label: 'PDF Report Export', sub: 'CPA-ready, shareable' },
]

export default function FIRENumberCalculator() {
  const { user } = useUser()
  const isPro = (user?.publicMetadata as any)?.isPro === true

  const [retireAge, setRetireAge] = useState(50)
  const [annualSpend, setAnnualSpend] = useState(60_000)
  const [ssAge, setSsAge] = useState(67)
  const [ssMonthly, setSsMonthly] = useState(2_000)
  const [spouseSSMonthly, setSpouseSSMonthly] = useState(0)
  const [hasSpouse, setHasSpouse] = useState(false)
  const [healthcareBudget, setHealthcareBudget] = useState(12_000)
  const [currentSaved, setCurrentSaved] = useState(800_000)

  // Track first interaction
  const track = useCallback(() => trackCalculatorUsed('fire-number'), [])

  const lifeExpectancy = 90
  const retirementYears = lifeExpectancy - retireAge
  const bridgeYears = 59.5 - retireAge
  const withdrawalRate = WITHDRAWAL_RATES[Math.min(50, Math.max(30, Math.round(retirementYears / 5) * 5))] ?? 0.033
  const withdrawalRatePct = (withdrawalRate * 100).toFixed(1)
  const ssAnnual = (ssMonthly + (hasSpouse ? spouseSSMonthly : 0)) * 12

  const bridgeNeeded = Math.round(annualSpend * bridgeYears * 1.15)
  const healthcareNeeded = Math.round(healthcareBudget * (65 - retireAge))
  const postSSSpend = Math.max(0, annualSpend - ssAnnual)
  const k401kNeeded = postSSSpend > 0 ? Math.round(postSSSpend / withdrawalRate) : 0
  const sequenceBuffer = Math.round(annualSpend * 1.5)
  const totalFireNumber = bridgeNeeded + healthcareNeeded + k401kNeeded + sequenceBuffer
  const gap = Math.max(0, totalFireNumber - currentSaved)
  const simpleFireNumber = Math.round(annualSpend / withdrawalRate)
  const differenceFromSimple = totalFireNumber - simpleFireNumber
  const progressPct = Math.min(100, Math.round((currentSaved / totalFireNumber) * 100))

  const breakdown = [
    { name: 'Bridge Account\n(Taxable/Roth)', value: bridgeNeeded, color: COLORS.teal, description: `${bridgeYears.toFixed(1)} years × $${(annualSpend / 1000).toFixed(0)}k + buffer` },
    { name: '401k at Retire', value: k401kNeeded, color: COLORS.gold, description: `Funds $${(postSSSpend / 1000).toFixed(0)}k/yr after SS at ${withdrawalRatePct}%` },
    { name: 'Healthcare\nBuffer', value: healthcareNeeded, color: COLORS.purple, description: `${65 - retireAge} yrs × $${(healthcareBudget / 1000).toFixed(0)}k/yr` },
    { name: 'Sequence Risk\nBuffer', value: sequenceBuffer, color: COLORS.orange, description: '1.5 years spending cushion' },
  ]

  const comparisonData = [
    { name: 'Simple 25x Rule', value: Math.round(annualSpend * 25), fill: COLORS.red },
    { name: `${Math.round(1 / withdrawalRate)}x Rule (${retirementYears}yr)`, value: simpleFireNumber, fill: COLORS.orange },
    { name: 'Real Number\n(Bridge + Healthcare)', value: totalFireNumber, fill: COLORS.sage },
  ]

  // Tracked slider setter — fires calculator_used once per session on first interaction
  function tracked(setter: (v: number) => void) {
    return (v: number) => { track(); setter(v) }
  }

  return (
    <div style={{ background: '#0D1420', borderRadius: 16, border: '1px solid rgba(232,184,75,0.15)', overflow: 'hidden', fontFamily: "'IBM Plex Mono', monospace", margin: '2rem 0' }}>
      <div style={{ background: '#141C28', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '20px 24px' }}>
        <div style={{ fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: COLORS.gold, marginBottom: 6 }}>Interactive Calculator</div>
        <h3 style={{ color: COLORS.white, fontSize: 18, fontFamily: 'Georgia, serif', fontWeight: 700, margin: 0, marginBottom: 4 }}>How Much Do I Need to Retire at 50?</h3>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, margin: 0 }}>Beyond the 4% rule — calculates your real FIRE number with bridge years, healthcare, and Social Security built in.</p>
      </div>

      <div style={{ padding: '24px' }}>
        {/* Controls */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 16 }}>
          {[
            { label: 'Target Retire Age', value: retireAge, set: tracked(setRetireAge), min: 40, max: 58, step: 1, fmt: (v: number) => `Age ${v}` },
            { label: 'Annual Spending', value: annualSpend, set: tracked(setAnnualSpend), min: 30000, max: 150000, step: 5000, fmt: (v: number) => formatDollars(v) },
            { label: 'SS Claiming Age', value: ssAge, set: tracked(setSsAge), min: 62, max: 70, step: 1, fmt: (v: number) => `Age ${v}` },
            { label: 'Your Monthly SS Benefit', value: ssMonthly, set: tracked(setSsMonthly), min: 0, max: 4000, step: 100, fmt: (v: number) => `$${v.toLocaleString()}/mo` },
            { label: 'Annual Healthcare Budget', value: healthcareBudget, set: tracked(setHealthcareBudget), min: 5000, max: 30000, step: 1000, fmt: (v: number) => formatDollars(v) },
            { label: 'Currently Saved', value: currentSaved, set: tracked(setCurrentSaved), min: 0, max: 5000000, step: 50000, fmt: (v: number) => formatDollars(v) },
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

        {/* Spouse toggle + field */}
        <div style={{ background: '#141C28', borderRadius: 10, padding: '14px 16px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: hasSpouse ? 14 : 0 }}>
            <div>
              <div style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 2 }}>Planning as a Couple?</div>
              {hasSpouse && spouseSSMonthly > 0 && (
                <div style={{ fontSize: 9, color: COLORS.sage }}>
                  Combined SS: ${(ssMonthly + spouseSSMonthly).toLocaleString()}/mo = {formatDollars((ssMonthly + spouseSSMonthly) * 12)}/yr
                </div>
              )}
            </div>
            <button
              onClick={() => { track(); setHasSpouse(!hasSpouse) }}
              style={{
                padding: '5px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
                fontFamily: 'monospace', fontSize: 10, fontWeight: 600,
                background: hasSpouse ? COLORS.teal : 'rgba(255,255,255,0.08)',
                color: hasSpouse ? COLORS.dark : 'rgba(255,255,255,0.4)',
                transition: 'all 0.15s',
              }}
            >
              {hasSpouse ? '✓ Spouse added' : '+ Add Spouse'}
            </button>
          </div>

          {hasSpouse && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>Spouse Monthly SS Benefit</span>
                <span style={{ fontSize: 12, color: COLORS.teal, fontWeight: 600 }}>${spouseSSMonthly.toLocaleString()}/mo</span>
              </div>
              <input type="range" min={0} max={4000} step={100} value={spouseSSMonthly}
                onChange={e => { track(); setSpouseSSMonthly(Number(e.target.value)) }}
                style={{ width: '100%', accentColor: COLORS.teal, cursor: 'pointer' }} />
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', marginTop: 4 }}>
                Both SS benefits assumed to start at same claiming age · Set to $0 if spouse has no SS
              </div>
            </div>
          )}
        </div>

        {/* Big FIRE number */}
        <div style={{ background: 'rgba(232,184,75,0.06)', border: '1px solid rgba(232,184,75,0.2)', borderRadius: 12, padding: '20px 24px', marginBottom: 20, textAlign: 'center' as const }}>
          <div style={{ fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 8 }}>
            Your Real FIRE Number (Age {retireAge}, {retirementYears}-yr retirement{hasSpouse ? ' · Couple' : ''})
          </div>
          <div style={{ fontSize: 42, fontWeight: 700, color: COLORS.gold, fontFamily: 'Georgia, serif', lineHeight: 1 }}>{formatDollars(totalFireNumber)}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 8 }}>
            vs. simple 25x rule: {formatDollars(Math.round(annualSpend * 25))} — difference: <span style={{ color: differenceFromSimple > 0 ? COLORS.red : COLORS.sage }}>{differenceFromSimple > 0 ? '+' : ''}{formatDollars(differenceFromSimple)}</span>
          </div>
          {hasSpouse && spouseSSMonthly > 0 && (
            <div style={{ fontSize: 10, color: COLORS.teal, marginTop: 6 }}>
              Spouse SS reduces portfolio need by {formatDollars(Math.round(spouseSSMonthly * 12 / withdrawalRate))}
            </div>
          )}
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>Current: {formatDollars(currentSaved)}</span>
              <span style={{ fontSize: 9, color: progressPct >= 100 ? COLORS.sage : COLORS.gold }}>{progressPct}% there</span>
            </div>
            <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progressPct}%`, background: progressPct >= 100 ? COLORS.sage : COLORS.gold, borderRadius: 4, transition: 'width 0.3s ease' }} />
            </div>
            {gap > 0 && <div style={{ fontSize: 10, color: COLORS.red, marginTop: 6 }}>Gap: {formatDollars(gap)} remaining</div>}
            {gap === 0 && <div style={{ fontSize: 10, color: COLORS.sage, marginTop: 6 }}>✓ You've hit your FIRE number!</div>}
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

        {/* Insight */}
        <div style={{ background: 'rgba(232,184,75,0.06)', border: '1px solid rgba(232,184,75,0.15)', borderLeft: `3px solid ${COLORS.gold}`, borderRadius: 8, padding: '14px 16px', marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: COLORS.gold, fontWeight: 600, marginBottom: 6, letterSpacing: 1 }}>💡 WHY {withdrawalRatePct}% NOT 4%</div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.7 }}>
            The 4% rule was designed for 30-year retirements. Retiring at age {retireAge} means a {retirementYears}-year retirement horizon. Research supports a {withdrawalRatePct}% withdrawal rate for {retirementYears} years, which requires {formatDollars(Math.round(annualSpend / withdrawalRate))} vs the 4% rule's {formatDollars(Math.round(annualSpend / 0.04))} — a difference of {formatDollars(Math.round(annualSpend / withdrawalRate) - Math.round(annualSpend / 0.04))}. This calculator also adds healthcare and a sequence risk buffer the simple rule ignores entirely.
          </p>
        </div>

        {/* Next step */}
        <div style={{ background: 'rgba(45,212,191,0.06)', border: '1px solid rgba(45,212,191,0.15)', borderLeft: `3px solid ${COLORS.teal}`, borderRadius: 8, padding: '14px 16px', marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: COLORS.teal, fontWeight: 600, marginBottom: 6, letterSpacing: 1 }}>🌉 NEXT STEP</div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', margin: '0 0 10px', lineHeight: 1.7 }}>
            Now that you know your FIRE number, check if your bridge to retirement is actually funded — and find your biggest weakness.
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
            <a href="/tools/bridge-health-check" style={{ fontSize: 10, color: COLORS.teal, border: `1px solid ${COLORS.teal}40`, padding: '5px 12px', borderRadius: 5, textDecoration: 'none', fontWeight: 600 }}>Check Bridge Health →</a>
            <a href="/tools/early-retirement-age-calculator" style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)', padding: '5px 12px', borderRadius: 5, textDecoration: 'none' }}>When Can I Retire? →</a>
          </div>
        </div>

        {/* Pro upsell */}
        {!isPro && (
          <div style={{ background: 'linear-gradient(135deg, rgba(232,184,75,0.06) 0%, rgba(232,184,75,0.02) 100%)', border: '1px solid rgba(232,184,75,0.2)', borderLeft: '3px solid #E8B84B', borderRadius: 12, padding: '20px 24px' }}>
            <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: COLORS.gold, marginBottom: 10 }}>⚡ BridgeToRetired Pro — $15/mo</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 16 }}>
              {PRO_FEATURES.map(({ icon, label, sub }) => (
                <div key={label} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 14, flexShrink: 0 }}>{icon}</span>
                  <div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{label}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{sub}</div>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/pricing"
              onClick={() => trackProCtaClick('fire-calculator-upsell')}
              style={{ background: COLORS.gold, color: '#0D1420', fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 12, padding: '10px 24px', borderRadius: 8, textDecoration: 'none', display: 'inline-block' }}
            >
              See Pro Plans →
            </Link>
          </div>
        )}
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.15)', letterSpacing: 1 }}>For educational purposes only · Not financial advice</span>
        {!isPro && (
          <a href="/#download"
            onClick={() => trackProCtaClick('fire-calculator-footer-planner')}
            style={{ fontSize: 9, color: COLORS.gold, textDecoration: 'none', letterSpacing: 2, textTransform: 'uppercase' }}>
            Get Free Planner →
          </a>
        )}
      </div>
    </div>
  )
}
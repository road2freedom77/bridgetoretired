'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'

const COLORS = {
  gold: '#E8B84B', teal: '#2DD4BF', sage: '#4ADE80',
  red: '#F87171', orange: '#FB923C', purple: '#A78BFA',
  white: '#FFFFFF', dark: '#0D1420', ink: '#141C28',
}

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${Math.round(n / 1_000)}k`
  return `$${Math.round(n).toLocaleString()}`
}

// ── Scoring engine ─────────────────────────────────────────────────────────────

interface ReadinessInputs {
  currentAge: number
  retireAge: number
  annualSpend: number
  totalPortfolio: number
  taxableBalance: number
  rothBalance: number
  k401kBalance: number
  ssMonthly: number
  ssClaimAge: number
  healthcareAnnual: number
}

interface DimensionScore {
  name: string
  score: number      // 0-100 for this dimension
  weight: number     // weight in final score
  weighted: number   // score × weight
  status: 'good' | 'warn' | 'poor'
  label: string
  detail: string
  fix: string
}

interface ReadinessResult {
  total: number      // 0-100
  grade: string
  gradeColor: string
  dimensions: DimensionScore[]
  incomeGap: number        // annual $ shortfall at retirement
  projectedIncome: number  // SS + portfolio withdrawals
  ssDelayBonus: number     // extra lifetime $ by waiting to 70
  portfolioPct: number     // portfolio as % of FIRE number
}

const WITHDRAWAL_RATES: Record<number, number> = {
  25: 0.040, 30: 0.037, 35: 0.035, 40: 0.033, 45: 0.031, 50: 0.030,
}

function getRate(retirementYears: number): number {
  const key = Math.round(retirementYears / 5) * 5
  return WITHDRAWAL_RATES[Math.min(50, Math.max(25, key))] ?? 0.033
}

function calcReadiness(inp: ReadinessInputs): ReadinessResult {
  const {
    currentAge, retireAge, annualSpend, totalPortfolio,
    taxableBalance, rothBalance, k401kBalance,
    ssMonthly, ssClaimAge, healthcareAnnual,
  } = inp

  const retirementYears = 90 - retireAge
  const bridgeYears = Math.max(0, 59.5 - retireAge)
  const withdrawalRate = getRate(retirementYears)
  const fireNumber = Math.round(annualSpend / withdrawalRate)

  // SS adjustments: 62 = 70% of FRA, 67 = 100%, 70 = 124%
  const ssAdjFactor = ssClaimAge <= 62 ? 0.70 : ssClaimAge <= 64 ? 0.80 : ssClaimAge <= 66 ? 0.93 : ssClaimAge === 67 ? 1.0 : ssClaimAge === 68 ? 1.08 : ssClaimAge === 69 ? 1.16 : 1.24
  const ssAnnual = ssMonthly * 12 * ssAdjFactor
  const ssAt70Annual = ssMonthly * 12 * 1.24
  const ssDelayBonus = Math.round((ssAt70Annual - ssAnnual) * (90 - 70)) // lifetime delta

  const portfolioIncome = totalPortfolio * withdrawalRate
  const projectedIncome = portfolioIncome + ssAnnual
  const incomeGap = Math.max(0, annualSpend - projectedIncome)

  const portfolioPct = Math.min(150, Math.round((totalPortfolio / fireNumber) * 100))

  // ── Dimension 1: Portfolio vs FIRE Number (30pts) ──
  const d1Score = Math.min(100, portfolioPct)
  const d1: DimensionScore = {
    name: 'Portfolio vs FIRE Number',
    score: d1Score,
    weight: 0.30,
    weighted: d1Score * 0.30,
    status: d1Score >= 80 ? 'good' : d1Score >= 60 ? 'warn' : 'poor',
    label: `${portfolioPct}% funded`,
    detail: `${fmt(totalPortfolio)} of ${fmt(fireNumber)} needed at ${(withdrawalRate * 100).toFixed(1)}% withdrawal rate`,
    fix: d1Score < 80 ? `Need ${fmt(Math.max(0, fireNumber - totalPortfolio))} more in total portfolio` : 'Portfolio on track',
  }

  // ── Dimension 2: Bridge Funding (25pts) ──
  const bridgeRequired = bridgeYears > 0 ? Math.round(annualSpend * bridgeYears * 1.15) : 0
  const bridgeAvailable = taxableBalance + rothBalance * 0.7
  const bridgePct = bridgeRequired > 0 ? Math.min(100, Math.round((bridgeAvailable / bridgeRequired) * 100)) : 100
  const d2: DimensionScore = {
    name: 'Bridge Funding',
    score: bridgePct,
    weight: 0.25,
    weighted: bridgePct * 0.25,
    status: bridgePct >= 90 ? 'good' : bridgePct >= 60 ? 'warn' : 'poor',
    label: bridgeYears > 0 ? `${bridgePct}% of ${bridgeYears.toFixed(1)}-yr gap funded` : 'No bridge needed (retiring at 59½+)',
    detail: bridgeYears > 0 ? `Need ${fmt(bridgeRequired)} in taxable/Roth to cover bridge years` : 'Retiring at or after 59½ — full account access',
    fix: bridgePct < 90 ? `Add ${fmt(Math.max(0, bridgeRequired - bridgeAvailable))} to taxable brokerage or Roth contributions` : 'Bridge well-funded',
  }

  // ── Dimension 3: SS Timing (15pts) ──
  const ssTimingScore = ssClaimAge >= 70 ? 100 : ssClaimAge >= 68 ? 80 : ssClaimAge >= 67 ? 65 : ssClaimAge >= 65 ? 45 : 25
  const d3: DimensionScore = {
    name: 'Social Security Timing',
    score: ssTimingScore,
    weight: 0.15,
    weighted: ssTimingScore * 0.15,
    status: ssClaimAge >= 68 ? 'good' : ssClaimAge >= 66 ? 'warn' : 'poor',
    label: `Claiming at ${ssClaimAge} · ${fmt(ssAnnual)}/yr`,
    detail: ssClaimAge < 70 ? `Waiting until 70 adds ~${fmt(ssDelayBonus)} in lifetime SS income` : 'Optimal SS timing — maximizing lifetime benefit',
    fix: ssClaimAge < 68 ? `Consider delaying SS to 70 for ${fmt(ssDelayBonus)} more in lifetime income` : 'SS timing looks strong',
  }

  // ── Dimension 4: Healthcare Buffer (15pts) ──
  const yearsToMedicare = Math.max(0, 65 - retireAge)
  const healthcareTotal = healthcareAnnual * yearsToMedicare
  // Score based on whether healthcare is included in spending budget
  const healthcarePct = annualSpend > 0 ? Math.min(100, Math.round((healthcareAnnual / annualSpend) * 100 * 5)) : 0 // 20% of spend on healthcare = 100 pts
  const d4Score = Math.min(100, healthcarePct)
  const d4: DimensionScore = {
    name: 'Healthcare Buffer',
    score: d4Score,
    weight: 0.15,
    weighted: d4Score * 0.15,
    status: d4Score >= 70 ? 'good' : d4Score >= 40 ? 'warn' : 'poor',
    label: `${fmt(healthcareAnnual)}/yr · ${yearsToMedicare} yrs to Medicare`,
    detail: yearsToMedicare > 0 ? `Total pre-Medicare healthcare exposure: ${fmt(healthcareTotal)}` : 'Already Medicare-eligible at retirement',
    fix: d4Score < 70 ? `Budget at least ${fmt(Math.round(annualSpend * 0.15))}–${fmt(Math.round(annualSpend * 0.20))}/yr for healthcare before Medicare` : 'Healthcare budget looks adequate',
  }

  // ── Dimension 5: Account Diversification (15pts) ──
  const hasTaxable = taxableBalance > annualSpend
  const hasRoth = rothBalance > annualSpend
  const hasTaxDeferred = k401kBalance > 0
  const divScore = (hasTaxable ? 34 : 0) + (hasRoth ? 33 : 0) + (hasTaxDeferred ? 33 : 0)
  const d5: DimensionScore = {
    name: 'Account Diversification',
    score: divScore,
    weight: 0.15,
    weighted: divScore * 0.15,
    status: divScore >= 67 ? 'good' : divScore >= 34 ? 'warn' : 'poor',
    label: [hasTaxable && 'Taxable ✓', hasRoth && 'Roth ✓', hasTaxDeferred && '401k ✓'].filter(Boolean).join(' · ') || 'No accounts entered',
    detail: 'Optimal bridge strategy requires taxable + Roth + tax-deferred accounts',
    fix: !hasTaxable ? 'Build taxable brokerage for penalty-free bridge access' : !hasRoth ? 'Add Roth contributions or conversions for tax-free flexibility' : 'Good account mix',
  }

  const dimensions = [d1, d2, d3, d4, d5]
  const total = Math.min(100, Math.round(dimensions.reduce((s, d) => s + d.weighted, 0)))

  const grade = total >= 85 ? 'Excellent' : total >= 70 ? 'Good' : total >= 55 ? 'Fair' : total >= 40 ? 'Needs Work' : 'At Risk'
  const gradeColor = total >= 85 ? COLORS.sage : total >= 70 ? COLORS.teal : total >= 55 ? COLORS.gold : total >= 40 ? COLORS.orange : COLORS.red

  return { total, grade, gradeColor, dimensions, incomeGap, projectedIncome, ssDelayBonus, portfolioPct }
}

// ── Score ring ────────────────────────────────────────────────────────────────

function ScoreRing({ score, color }: { score: number; color: string }) {
  const r = 54
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  return (
    <div style={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
      <svg width={140} height={140} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={70} cy={70} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={10} />
        <circle cx={70} cy={70} r={r} fill="none" stroke={color} strokeWidth={10}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.6s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 34, fontWeight: 700, color, fontFamily: 'Georgia, serif', lineHeight: 1 }}>{score}</div>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', letterSpacing: 2, textTransform: 'uppercase', marginTop: 4 }}>/ 100</div>
      </div>
    </div>
  )
}

// ── Slider ────────────────────────────────────────────────────────────────────

function Slider({ label, value, set, min, max, step, display, note, color = COLORS.gold }: {
  label: string; value: number; set: (v: number) => void
  min: number; max: number; step: number; display: string; note?: string; color?: string
}) {
  return (
    <div style={{ background: COLORS.ink, borderRadius: 10, padding: '12px 14px', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>{label}</span>
        <span style={{ fontSize: 12, color, fontWeight: 600 }}>{display}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => set(Number(e.target.value))}
        style={{ width: '100%', accentColor: color, cursor: 'pointer' }} />
      {note && <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', marginTop: 4 }}>{note}</div>}
    </div>
  )
}

const PRO_FEATURES = [
  { icon: '🛡️', label: 'Bridge Risk Score™', sub: 'Grade your plan in 60 seconds' },
  { icon: '📉', label: 'Sequence-of-Returns Stress Tester', sub: '2000, 2008, worst-case crashes' },
  { icon: '🖥️', label: 'Online Retirement Planner', sub: 'Save up to 5 scenarios' },
  { icon: '📄', label: 'PDF Report Export', sub: 'CPA-ready, shareable' },
]

// ── Main component ────────────────────────────────────────────────────────────

export default function RetirementReadinessScore() {
  const { user } = useUser()
  const isPro = (user?.publicMetadata as any)?.isPro === true

  const [currentAge, setCurrentAge] = useState(45)
  const [retireAge, setRetireAge] = useState(55)
  const [annualSpend, setAnnualSpend] = useState(65_000)
  const [totalPortfolio, setTotalPortfolio] = useState(650_000)
  const [taxableBalance, setTaxableBalance] = useState(150_000)
  const [rothBalance, setRothBalance] = useState(80_000)
  const [k401kBalance, setK401kBalance] = useState(420_000)
  const [ssMonthly, setSsMonthly] = useState(2_000)
  const [ssClaimAge, setSsClaimAge] = useState(67)
  const [healthcareAnnual, setHealthcareAnnual] = useState(14_400)

  const result = useMemo(() => calcReadiness({
    currentAge, retireAge, annualSpend, totalPortfolio,
    taxableBalance, rothBalance, k401kBalance,
    ssMonthly, ssClaimAge, healthcareAnnual,
  }), [currentAge, retireAge, annualSpend, totalPortfolio, taxableBalance, rothBalance, k401kBalance, ssMonthly, ssClaimAge, healthcareAnnual])

  const statusIcon = (s: 'good' | 'warn' | 'poor') => s === 'good' ? '✓' : s === 'warn' ? '⚠' : '✗'
  const statusColor = (s: 'good' | 'warn' | 'poor') => s === 'good' ? COLORS.sage : s === 'warn' ? COLORS.gold : COLORS.red

  return (
    <div style={{ background: '#0D1420', borderRadius: 16, border: '1px solid rgba(232,184,75,0.15)', overflow: 'hidden', fontFamily: "'IBM Plex Mono', monospace", margin: '2rem 0' }}>

      {/* Header */}
      <div style={{ background: '#141C28', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '20px 24px' }}>
        <div style={{ fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: COLORS.gold, marginBottom: 6 }}>Free Assessment</div>
        <h3 style={{ color: COLORS.white, fontSize: 18, fontFamily: 'Georgia, serif', fontWeight: 700, margin: 0, marginBottom: 4 }}>Retirement Readiness Score</h3>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, margin: 0 }}>Five dimensions. One score. See exactly where your retirement plan is strong — and where it needs work.</p>
      </div>

      <div style={{ padding: '24px' }}>

        {/* Inputs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
          <Slider label="Current Age" value={currentAge} set={setCurrentAge} min={30} max={57} step={1} display={`Age ${currentAge}`} />
          <Slider label="Target Retire Age" value={retireAge} set={v => setRetireAge(Math.max(currentAge + 1, v))} min={40} max={70} step={1} display={`Age ${retireAge}`} />
          <Slider label="Annual Spending" value={annualSpend} set={setAnnualSpend} min={30_000} max={150_000} step={5_000} display={fmt(annualSpend)} />
          <Slider label="Total Portfolio" value={totalPortfolio} set={setTotalPortfolio} min={0} max={5_000_000} step={25_000} display={fmt(totalPortfolio)} note="All accounts combined" />
          <Slider label="Taxable / Brokerage" value={taxableBalance} set={setTaxableBalance} min={0} max={2_000_000} step={10_000} display={fmt(taxableBalance)} />
          <Slider label="Roth IRA Balance" value={rothBalance} set={setRothBalance} min={0} max={1_000_000} step={10_000} display={fmt(rothBalance)} color={COLORS.purple} />
          <Slider label="401k / IRA Balance" value={k401kBalance} set={setK401kBalance} min={0} max={3_000_000} step={25_000} display={fmt(k401kBalance)} />
          <Slider label="Monthly SS Benefit (at FRA)" value={ssMonthly} set={setSsMonthly} min={0} max={4_000} step={100} display={`$${ssMonthly.toLocaleString()}/mo`} />
          <Slider label="SS Claiming Age" value={ssClaimAge} set={setSsClaimAge} min={62} max={70} step={1} display={`Age ${ssClaimAge}`} color={ssClaimAge >= 68 ? COLORS.sage : ssClaimAge >= 66 ? COLORS.gold : COLORS.orange} />
          <Slider label="Annual Healthcare Budget" value={healthcareAnnual} set={setHealthcareAnnual} min={0} max={30_000} step={1_000} display={fmt(healthcareAnnual)} note="Before Medicare at 65" color={COLORS.teal} />
        </div>

        {/* Score hero */}
        <div style={{ background: '#141C28', borderRadius: 12, padding: '24px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' as const }}>
          <ScoreRing score={result.total} color={result.gradeColor} />
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 6 }}>Retirement Readiness Score</div>
            <div style={{ fontSize: 30, fontWeight: 700, color: result.gradeColor, fontFamily: 'Georgia, serif', marginBottom: 8 }}>{result.grade}</div>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 4 }}>
              {result.dimensions.map(d => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: statusColor(d.status), fontSize: 11, fontWeight: 700, width: 14, flexShrink: 0 }}>{statusIcon(d.status)}</span>
                  <span style={{ fontSize: 10, color: statusColor(d.status) === COLORS.sage ? 'rgba(255,255,255,0.6)' : statusColor(d.status), fontWeight: d.status !== 'good' ? 600 : 400 }}>{d.name}</span>
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginLeft: 'auto' }}>{d.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Income summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
          <div style={{ background: '#141C28', borderRadius: 10, padding: '12px 14px', border: `1px solid ${COLORS.teal}20`, borderTop: `3px solid ${COLORS.teal}` }}>
            <div style={{ fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>Projected Annual Income</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.teal, fontFamily: 'Georgia, serif' }}>{fmt(result.projectedIncome)}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>Portfolio + SS at age {ssClaimAge}</div>
          </div>
          <div style={{ background: '#141C28', borderRadius: 10, padding: '12px 14px', border: `1px solid ${result.incomeGap > 0 ? COLORS.red : COLORS.sage}20`, borderTop: `3px solid ${result.incomeGap > 0 ? COLORS.red : COLORS.sage}` }}>
            <div style={{ fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>Annual Income Gap</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: result.incomeGap > 0 ? COLORS.red : COLORS.sage, fontFamily: 'Georgia, serif' }}>
              {result.incomeGap > 0 ? `-${fmt(result.incomeGap)}` : '✓ Funded'}
            </div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>vs {fmt(annualSpend)}/yr target</div>
          </div>
          <div style={{ background: '#141C28', borderRadius: 10, padding: '12px 14px', border: `1px solid ${COLORS.gold}20`, borderTop: `3px solid ${COLORS.gold}` }}>
            <div style={{ fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>SS Delay Opportunity</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.gold, fontFamily: 'Georgia, serif' }}>
              {ssClaimAge < 70 ? `+${fmt(result.ssDelayBonus)}` : '✓ Maxed'}
            </div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>{ssClaimAge < 70 ? 'lifetime gain by waiting to 70' : 'claiming at optimal age'}</div>
          </div>
        </div>

        {/* Dimension detail — Pro gate */}
        {isPro ? (
          <div style={{ background: '#141C28', borderRadius: 12, padding: '20px', marginBottom: 16, border: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 14 }}>Score Breakdown & Fix Plan</div>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 12 }}>
              {result.dimensions.map(d => (
                <div key={d.name} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: statusColor(d.status), fontSize: 13, fontWeight: 700 }}>{statusIcon(d.status)}</span>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>{d.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ height: 6, width: 80, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${d.score}%`, background: statusColor(d.status), borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 10, color: statusColor(d.status), fontWeight: 600, width: 32 }}>{d.score}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 4, paddingLeft: 22 }}>{d.detail}</div>
                  {d.status !== 'good' && (
                    <div style={{ fontSize: 10, color: COLORS.gold, paddingLeft: 22, fontStyle: 'italic' }}>→ {d.fix}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ background: '#141C28', borderRadius: 12, padding: '20px', marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
            {/* Blurred preview */}
            <div style={{ filter: 'blur(4px)', userSelect: 'none', pointerEvents: 'none', opacity: 0.4 }}>
              <div style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 14 }}>Score Breakdown & Fix Plan</div>
              {result.dimensions.map(d => (
                <div key={d.name} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{d.name}</span>
                    <span style={{ fontSize: 10, color: statusColor(d.status) }}>{d.score}/100</span>
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{d.fix}</div>
                </div>
              ))}
            </div>
            {/* Overlay */}
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(13,20,32,0.75)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 12 }}>
              <div style={{ textAlign: 'center', padding: '0 24px' }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>🔒</div>
                <div style={{ fontSize: 14, fontFamily: 'Georgia, serif', fontWeight: 700, color: COLORS.white, marginBottom: 6 }}>
                  See why your score is {result.total} — and fix it
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginBottom: 16, lineHeight: 1.6, maxWidth: 300 }}>
                  Pro unlocks the full breakdown — each dimension scored, explained, and with a specific fix amount.
                </div>
                <a href="/pricing" style={{ background: COLORS.gold, color: '#0D1420', fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 12, padding: '10px 24px', borderRadius: 8, textDecoration: 'none', display: 'inline-block' }}>
                  Unlock Full Breakdown — $9/mo
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Next step */}
        <div style={{ background: 'rgba(45,212,191,0.06)', border: '1px solid rgba(45,212,191,0.15)', borderLeft: `3px solid ${COLORS.teal}`, borderRadius: 8, padding: '14px 16px', marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: COLORS.teal, fontWeight: 600, marginBottom: 6, letterSpacing: 1 }}>🌉 NEXT STEP</div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', margin: '0 0 10px', lineHeight: 1.7 }}>
            Dig deeper into any weakness with a focused tool.
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
            <a href="/tools/bridge-health-check" style={{ fontSize: 10, color: COLORS.teal, border: `1px solid ${COLORS.teal}40`, padding: '5px 12px', borderRadius: 5, textDecoration: 'none', fontWeight: 600 }}>Bridge Health Check →</a>
            <a href="/tools/taxable-brokerage-gap-calculator" style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)', padding: '5px 12px', borderRadius: 5, textDecoration: 'none' }}>Taxable Gap →</a>
            <a href="/tools/social-security-calculator" style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)', padding: '5px 12px', borderRadius: 5, textDecoration: 'none' }}>SS Timing →</a>
            <a href="/tools/fire-number-calculator" style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)', padding: '5px 12px', borderRadius: 5, textDecoration: 'none' }}>FIRE Number →</a>
          </div>
        </div>

        {/* Pro upsell */}
        {!isPro && (
          <div style={{ background: 'linear-gradient(135deg, rgba(232,184,75,0.06) 0%, rgba(232,184,75,0.02) 100%)', border: '1px solid rgba(232,184,75,0.2)', borderLeft: '3px solid #E8B84B', borderRadius: 12, padding: '20px 24px' }}>
            <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: COLORS.gold, marginBottom: 10 }}>⚡ BridgeToRetired Pro — $9/mo</div>
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
            <a href="/pricing" style={{ background: COLORS.gold, color: '#0D1420', fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 12, padding: '10px 24px', borderRadius: 8, textDecoration: 'none', display: 'inline-block' }}>
              See Pro Plans →
            </a>
          </div>
        )}
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.15)', letterSpacing: 1 }}>For educational purposes only · Not financial advice</span>
        {!isPro && <a href="/#download" style={{ fontSize: 9, color: COLORS.gold, textDecoration: 'none', letterSpacing: 2, textTransform: 'uppercase' }}>Get Free Planner →</a>}
      </div>
    </div>
  )
}
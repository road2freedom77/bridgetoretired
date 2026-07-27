'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { trackCalculatorUsed, trackProCtaClick } from '@/lib/analytics'

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

interface BridgeInputs {
  currentAge: number
  retireAge: number
  taxableBalance: number
  k401kBalance: number
  rothBalance: number
  annualSpend: number
}

interface WeaknessItem {
  label: string
  detail: string
  fix: string
  severity: 'high' | 'medium' | 'low'
}

interface BridgeResult {
  bridgeYears: number
  bridgeRequired: number
  bridgeFunded: number
  taxableGap: number
  totalPortfolio: number
  fireNumber: number
  portfolioFunded: number
  withdrawalRate: number
  score: number
  grade: 'Stable' | 'Moderate Risk' | 'Fragile' | 'Critical'
  gradeColor: string
  biggestWeakness: WeaknessItem
  weaknesses: WeaknessItem[]
  recommendations: string[]
}

function calcBridgeHealth(inp: BridgeInputs): BridgeResult {
  const { currentAge, retireAge, taxableBalance, k401kBalance, rothBalance, annualSpend } = inp
  const bridgeYears = Math.max(0, 59.5 - retireAge)
  const retirementYears = 90 - retireAge

  const withdrawalRate = retirementYears >= 45 ? 0.030
    : retirementYears >= 40 ? 0.031
    : retirementYears >= 35 ? 0.033
    : retirementYears >= 30 ? 0.035
    : 0.037

  const fireNumber = Math.round(annualSpend / withdrawalRate)
  const totalPortfolio = taxableBalance + k401kBalance + rothBalance
  const bridgeRequired = Math.round(annualSpend * bridgeYears * 1.15)
  const bridgeAvailable = taxableBalance + rothBalance * 0.7
  const bridgeFunded = bridgeRequired > 0 ? Math.min(100, Math.round((bridgeAvailable / bridgeRequired) * 100)) : 100
  const taxableGap = Math.max(0, bridgeRequired - bridgeAvailable)
  const portfolioFunded = Math.min(100, Math.round((totalPortfolio / fireNumber) * 100))

  let score = 0
  score += Math.min(40, Math.round(bridgeFunded * 0.40))
  score += Math.min(35, Math.round(portfolioFunded * 0.35))
  const hasTaxable = taxableBalance > annualSpend
  const hasRoth = rothBalance > annualSpend
  const hasTaxDeferred = k401kBalance > 0
  score += (hasTaxable ? 5 : 0) + (hasRoth ? 5 : 0) + (hasTaxDeferred ? 5 : 0)
  const yearsToRetire = retireAge - currentAge
  score += yearsToRetire >= 10 ? 10 : yearsToRetire >= 5 ? 6 : 3
  score = Math.min(100, Math.max(0, score))

  const grade: BridgeResult['grade'] = score >= 75 ? 'Stable'
    : score >= 50 ? 'Moderate Risk'
    : score >= 30 ? 'Fragile'
    : 'Critical'

  const gradeColor = grade === 'Stable' ? COLORS.sage
    : grade === 'Moderate Risk' ? COLORS.gold
    : grade === 'Fragile' ? COLORS.orange
    : COLORS.red

  const weaknesses: WeaknessItem[] = []

  if (bridgeFunded < 100) {
    weaknesses.push({
      label: 'Bridge account too small',
      detail: `You need ${fmt(bridgeRequired)} in taxable/Roth to cover ${bridgeYears.toFixed(1)} bridge years. You have ${fmt(bridgeAvailable)} — a ${fmt(taxableGap)} shortfall.`,
      fix: `Add ${fmt(taxableGap)} to taxable brokerage or Roth contributions before retiring.`,
      severity: bridgeFunded < 50 ? 'high' : bridgeFunded < 75 ? 'medium' : 'low',
    })
  }

  if (portfolioFunded < 80) {
    weaknesses.push({
      label: 'Total portfolio below FIRE number',
      detail: `Your ${fmt(totalPortfolio)} portfolio is ${portfolioFunded}% of your ${fmt(fireNumber)} FIRE number. At ${(withdrawalRate * 100).toFixed(1)}% withdrawal rate for a ${retirementYears}-year retirement.`,
      fix: `Need ${fmt(Math.max(0, fireNumber - totalPortfolio))} more in total portfolio.`,
      severity: portfolioFunded < 50 ? 'high' : portfolioFunded < 70 ? 'medium' : 'low',
    })
  }

  if (!hasTaxable) {
    weaknesses.push({
      label: 'No meaningful taxable account',
      detail: 'Most assets are in tax-deferred accounts. Without a taxable bridge, you may need 72(t) SEPP or a Roth ladder — both require advance planning.',
      fix: 'Start building taxable brokerage now. Even $50k/year makes a significant difference over 5 years.',
      severity: bridgeYears > 3 ? 'high' : 'medium',
    })
  }

  if (!hasRoth) {
    weaknesses.push({
      label: 'No Roth balance',
      detail: 'Roth contributions (not earnings) can be withdrawn any time penalty-free, making them a key bridge funding tool.',
      fix: 'Consider Roth conversions or direct Roth IRA contributions if income-eligible.',
      severity: 'medium',
    })
  }

  if (taxableBalance > 0 && rothBalance === 0 && k401kBalance === 0) {
    weaknesses.push({
      label: 'No tax-deferred retirement savings',
      detail: 'Heavy reliance on taxable accounts creates unnecessary tax drag on growth.',
      fix: 'Max 401(k) contributions while building taxable account alongside it.',
      severity: 'low',
    })
  }

  const severityOrder = { high: 0, medium: 1, low: 2 }
  weaknesses.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])

  const biggestWeakness = weaknesses[0] ?? {
    label: 'No major weaknesses found',
    detail: 'Your bridge looks well-funded across the key dimensions.',
    fix: 'Continue building toward your FIRE number.',
    severity: 'low' as const,
  }

  const recommendations: string[] = []
  if (taxableGap > 0) recommendations.push(`Add ${fmt(Math.min(taxableGap, annualSpend * 2))} to taxable brokerage to close bridge gap`)
  if (portfolioFunded < 80) recommendations.push(`Grow total portfolio by ${fmt(Math.max(0, fireNumber - totalPortfolio))} before retiring`)
  if (!hasRoth) recommendations.push('Start Roth conversions to build penalty-free bridge funding')
  if (bridgeYears > 5 && taxableBalance < annualSpend * 2) recommendations.push('Consider 72(t) SEPP or Roth ladder for bridge income — plan 5 years ahead')
  if (recommendations.length === 0) recommendations.push('Stay the course — your bridge is well-funded')

  return {
    bridgeYears, bridgeRequired, bridgeFunded, taxableGap,
    totalPortfolio, fireNumber, portfolioFunded, withdrawalRate,
    score, grade, gradeColor, biggestWeakness, weaknesses, recommendations,
  }
}

function SliderField({ label, value, set, min, max, step, display, onTrack }: {
  label: string; value: number; set: (v: number) => void
  min: number; max: number; step: number; display: string; onTrack: () => void
}) {
  return (
    <div style={{ background: COLORS.ink, borderRadius: 10, padding: '12px 14px', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>{label}</span>
        <span style={{ fontSize: 12, color: COLORS.gold, fontWeight: 600 }}>{display}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => { onTrack(); set(Number(e.target.value)) }}
        style={{ width: '100%', accentColor: COLORS.gold, cursor: 'pointer' }} />
    </div>
  )
}

function ScoreRing({ score, grade, color }: { score: number; grade: string; color: string }) {
  const r = 54
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  return (
    <div style={{ position: 'relative', width: 140, height: 140, margin: '0 auto' }}>
      <svg width={140} height={140} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={70} cy={70} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={10} />
        <circle cx={70} cy={70} r={r} fill="none" stroke={color} strokeWidth={10}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.5s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 32, fontWeight: 700, color, fontFamily: 'Georgia, serif', lineHeight: 1 }}>{score}</div>
        <div style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{grade}</div>
      </div>
    </div>
  )
}

export default function BridgeHealthCheck() {
  const { user } = useUser()
  const isPro = (user?.publicMetadata as any)?.isPro === true

  const [currentAge, setCurrentAge] = useState(45)
  const [retireAge, setRetireAge] = useState(55)
  const [taxableBalance, setTaxableBalance] = useState(150_000)
  const [k401kBalance, setK401kBalance] = useState(600_000)
  const [rothBalance, setRothBalance] = useState(80_000)
  const [annualSpend, setAnnualSpend] = useState(65_000)

  const track = useCallback(() => trackCalculatorUsed('bridge-health-check'), [])

  const result = useMemo(() => calcBridgeHealth({
    currentAge, retireAge, taxableBalance, k401kBalance, rothBalance, annualSpend,
  }), [currentAge, retireAge, taxableBalance, k401kBalance, rothBalance, annualSpend])

  return (
    <div style={{ background: '#0D1420', borderRadius: 16, border: '1px solid rgba(232,184,75,0.15)', overflow: 'hidden', fontFamily: "'IBM Plex Mono', monospace", margin: '2rem 0' }}>

      <div style={{ background: '#141C28', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '20px 24px' }}>
        <div style={{ fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: COLORS.gold, marginBottom: 6 }}>Free Assessment</div>
        <h3 style={{ color: COLORS.white, fontSize: 18, fontFamily: 'Georgia, serif', fontWeight: 700, margin: 0, marginBottom: 4 }}>Bridge Health Check</h3>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, margin: 0 }}>See if your bridge to early retirement is Stable, Moderate Risk, or Fragile — in 60 seconds.</p>
      </div>

      <div style={{ padding: '24px' }}>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 24 }}>
          <SliderField label="Current Age" value={currentAge} set={setCurrentAge} min={30} max={57} step={1} display={`Age ${currentAge}`} onTrack={track} />
          <SliderField label="Target Retire Age" value={retireAge} set={v => { track(); setRetireAge(Math.max(currentAge + 1, v)) }} min={35} max={65} step={1} display={`Age ${retireAge}`} onTrack={track} />
          <SliderField label="Taxable / Brokerage" value={taxableBalance} set={setTaxableBalance} min={0} max={2_000_000} step={10_000} display={fmt(taxableBalance)} onTrack={track} />
          <SliderField label="401k / IRA Balance" value={k401kBalance} set={setK401kBalance} min={0} max={3_000_000} step={25_000} display={fmt(k401kBalance)} onTrack={track} />
          <SliderField label="Roth IRA Balance" value={rothBalance} set={setRothBalance} min={0} max={1_000_000} step={10_000} display={fmt(rothBalance)} onTrack={track} />
          <SliderField label="Annual Spending" value={annualSpend} set={setAnnualSpend} min={30_000} max={150_000} step={5_000} display={fmt(annualSpend)} onTrack={track} />
        </div>

        <div style={{ background: '#141C28', borderRadius: 12, padding: '24px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' as const }}>
          <ScoreRing score={result.score} grade={result.grade} color={result.gradeColor} />
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 6 }}>Bridge Health Score</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: result.gradeColor, fontFamily: 'Georgia, serif', marginBottom: 4 }}>{result.grade}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
              Bridge length: <span style={{ color: 'rgba(255,255,255,0.7)' }}>{result.bridgeYears.toFixed(1)} years</span> ·{' '}
              Bridge funded: <span style={{ color: result.gradeColor }}>{result.bridgeFunded}%</span>
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
              Portfolio: <span style={{ color: 'rgba(255,255,255,0.7)' }}>{fmt(result.totalPortfolio)}</span> of{' '}
              <span style={{ color: 'rgba(255,255,255,0.7)' }}>{fmt(result.fireNumber)}</span> FIRE target ({result.portfolioFunded}%)
            </div>
          </div>
        </div>

        <div style={{ background: `rgba(${result.biggestWeakness.severity === 'high' ? '248,113,113' : result.biggestWeakness.severity === 'medium' ? '251,146,60' : '74,222,128'},0.06)`, border: `1px solid rgba(${result.biggestWeakness.severity === 'high' ? '248,113,113' : result.biggestWeakness.severity === 'medium' ? '251,146,60' : '74,222,128'},0.2)`, borderLeft: `3px solid ${result.biggestWeakness.severity === 'high' ? COLORS.red : result.biggestWeakness.severity === 'medium' ? COLORS.orange : COLORS.sage}`, borderRadius: 8, padding: '14px 16px', marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: result.biggestWeakness.severity === 'high' ? COLORS.red : result.biggestWeakness.severity === 'medium' ? COLORS.orange : COLORS.sage, fontWeight: 600, marginBottom: 6, letterSpacing: 1 }}>
            {result.biggestWeakness.severity === 'high' ? '🔴' : result.biggestWeakness.severity === 'medium' ? '🟡' : '🟢'} BIGGEST WEAKNESS: {result.biggestWeakness.label.toUpperCase()}
          </div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', margin: '0 0 8px', lineHeight: 1.7 }}>{result.biggestWeakness.detail}</p>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontStyle: 'italic' }}>Fix: {result.biggestWeakness.fix}</div>
        </div>

        <div style={{ background: '#141C28', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>Bridge Funding</span>
            <span style={{ fontSize: 11, color: result.bridgeFunded >= 100 ? COLORS.sage : result.bridgeFunded >= 75 ? COLORS.gold : COLORS.orange, fontWeight: 600 }}>{result.bridgeFunded}% funded</span>
          </div>
          <div style={{ height: 10, background: 'rgba(255,255,255,0.06)', borderRadius: 5, overflow: 'hidden', marginBottom: 6 }}>
            <div style={{ height: '100%', width: `${result.bridgeFunded}%`, background: result.bridgeFunded >= 100 ? COLORS.sage : result.bridgeFunded >= 75 ? COLORS.gold : COLORS.orange, borderRadius: 5, transition: 'width 0.3s ease' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'rgba(255,255,255,0.25)' }}>
            <span>Available: {fmt(taxableBalance + rothBalance * 0.7)}</span>
            <span>Required: {fmt(result.bridgeRequired)}</span>
          </div>
        </div>

        {isPro ? (
          <>
            {result.weaknesses.length > 1 && (
              <div style={{ background: '#141C28', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
                <div style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 12 }}>All Risk Factors</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {result.weaknesses.map((w, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>
                        {w.severity === 'high' ? '🔴' : w.severity === 'medium' ? '🟡' : '🟢'}
                      </span>
                      <div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 600, marginBottom: 2 }}>{w.label}</div>
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{w.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div style={{ background: 'rgba(232,184,75,0.06)', border: '1px solid rgba(232,184,75,0.15)', borderLeft: `3px solid ${COLORS.gold}`, borderRadius: 8, padding: '14px 16px', marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: COLORS.gold, fontWeight: 600, marginBottom: 8, letterSpacing: 1 }}>📋 RECOMMENDED ACTIONS</div>
              <ol style={{ margin: 0, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {result.recommendations.map((r, i) => (
                  <li key={i} style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>{r}</li>
                ))}
              </ol>
            </div>
            <div style={{ background: '#141C28', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
              <div style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 10 }}>Model Your Plan</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
                {[
                  { label: 'Bridge Strategy', href: '/tools/bridge-strategy-calculator' },
                  { label: 'Roth Ladder', href: '/tools/roth-conversion-ladder-calculator' },
                  { label: '72(t) SEPP', href: '/tools/72t-sepp-calculator' },
                  { label: '72t vs Roth', href: '/tools/72t-vs-roth-ladder' },
                ].map(({ label, href }) => (
                  <a key={label} href={href} style={{ fontSize: 10, color: COLORS.teal, border: `1px solid ${COLORS.teal}40`, padding: '5px 12px', borderRadius: 5, textDecoration: 'none' }}>{label} →</a>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div style={{ background: '#141C28', borderRadius: 12, padding: '20px', marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
            <div style={{ filter: 'blur(4px)', userSelect: 'none', pointerEvents: 'none', marginBottom: 16, opacity: 0.5 }}>
              <div style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 10 }}>All Risk Factors</div>
              {['Bridge account too small — $190k shortfall', 'No Roth balance for penalty-free access', 'Portfolio 67% of FIRE target'].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                  <span>🔴</span>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{item}</div>
                </div>
              ))}
              <div style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', margin: '12px 0 8px' }}>Recommended Actions</div>
              {['Add $190k to taxable brokerage', 'Start Roth conversions now', 'Model bridge with Roth ladder'].map((r, i) => (
                <div key={i} style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>• {r}</div>
              ))}
            </div>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(13,20,32,0.7)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 12 }}>
              <div style={{ textAlign: 'center', padding: '0 24px' }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>🔒</div>
                <div style={{ fontSize: 14, fontFamily: 'Georgia, serif', fontWeight: 700, color: COLORS.white, marginBottom: 6 }}>
                  See why your score is {result.score} — and how to fix it
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginBottom: 16, lineHeight: 1.6, maxWidth: 320 }}>
                  Pro unlocks all risk factors ranked by severity, specific fix amounts, and a prioritized action plan for your bridge.
                </div>
                <a
                  href="/pricing"
                  onClick={() => trackProCtaClick('bridge-health-gate')}
                  style={{ background: COLORS.gold, color: '#0D1420', fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 12, padding: '10px 24px', borderRadius: 8, textDecoration: 'none', display: 'inline-block' }}
                >
                  Unlock Bridge Risk Score — $15/mo
                </a>
              </div>
            </div>
          </div>
        )}

        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', textAlign: 'center', margin: 0 }}>
          Estimates only · For educational purposes · Not financial advice
        </p>
      </div>
    </div>
  )
}
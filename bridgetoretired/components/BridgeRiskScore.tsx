'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'

const COLORS = {
  gold: '#E8B84B',
  sage: '#4ADE80',
  red: '#F87171',
  orange: '#FB923C',
}

function formatDollars(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${Math.round(n / 1_000)}k`
  return `$${Math.round(n)}`
}

type Scoreband = { label: string; color: string; bg: string; border: string; emoji: string }

function getBand(score: number): Scoreband {
  if (score >= 80) return { label: 'Stable', color: COLORS.sage, bg: 'rgba(74,222,128,0.06)', border: 'rgba(74,222,128,0.2)', emoji: '🟢' }
  if (score >= 50) return { label: 'Moderate Risk', color: COLORS.gold, bg: 'rgba(232,184,75,0.06)', border: 'rgba(232,184,75,0.2)', emoji: '🟡' }
  return { label: 'Fragile', color: COLORS.red, bg: 'rgba(248,113,113,0.06)', border: 'rgba(248,113,113,0.2)', emoji: '🔴' }
}

interface ScoreFactor {
  label: string
  points: number
  max: number
  explanation: string
  tip?: string
}

export default function BridgeRiskScore() {
  const { user } = useUser()
  const isPro = (user?.publicMetadata as any)?.isPro === true

  const [retireAge, setRetireAge] = useState(52)
  const [portfolio, setPortfolio] = useState(1_100_000)
  const [annualSpend, setAnnualSpend] = useState(55_000)
  const [cashBuffer, setCashBuffer] = useState(1)
  const [stockAlloc, setStockAlloc] = useState(65)
  const [ssAge, setSsAge] = useState(67)
  const [taxable, setTaxable] = useState(350_000)

  const score = useMemo(() => {
    const bridgeYears = Math.max(0, 59.5 - retireAge)
    const withdrawalRate = (annualSpend / portfolio) * 100
    const bridgeNeeded = annualSpend * bridgeYears
    const taxableCoverage = taxable / bridgeNeeded
    const ssGap = ssAge - retireAge

    let wdPts = 0
    if (withdrawalRate <= 3.0) wdPts = 25
    else if (withdrawalRate <= 3.5) wdPts = 22
    else if (withdrawalRate <= 4.0) wdPts = 17
    else if (withdrawalRate <= 4.5) wdPts = 11
    else if (withdrawalRate <= 5.0) wdPts = 5
    else wdPts = 0

    let bridgePts = 0
    if (taxableCoverage >= 1.2) bridgePts = 25
    else if (taxableCoverage >= 1.0) bridgePts = 20
    else if (taxableCoverage >= 0.75) bridgePts = 13
    else if (taxableCoverage >= 0.5) bridgePts = 7
    else bridgePts = 2

    let cashPts = 0
    if (cashBuffer >= 3) cashPts = 20
    else if (cashBuffer >= 2) cashPts = 15
    else if (cashBuffer >= 1) cashPts = 9
    else cashPts = 3

    let allocPts = 0
    if (stockAlloc >= 50 && stockAlloc <= 70) allocPts = 15
    else if (stockAlloc >= 40 && stockAlloc <= 80) allocPts = 10
    else if (stockAlloc >= 30 && stockAlloc <= 90) allocPts = 5
    else allocPts = 2

    let ssPts = 0
    if (ssGap <= bridgeYears + 2) ssPts = 15
    else if (ssGap <= bridgeYears + 5) ssPts = 10
    else ssPts = 5

    const total = Math.min(100, Math.round(wdPts + bridgePts + cashPts + allocPts + ssPts))

    const factors: ScoreFactor[] = [
      {
        label: 'Withdrawal Rate',
        points: wdPts,
        max: 25,
        explanation: `${withdrawalRate.toFixed(1)}% withdrawal rate`,
        tip: withdrawalRate > 4 ? 'Consider reducing spending or increasing portfolio before retiring.' : undefined,
      },
      {
        label: 'Bridge Funding',
        points: bridgePts,
        max: 25,
        explanation: `Taxable covers ${Math.round(taxableCoverage * 100)}% of bridge`,
        tip: taxableCoverage < 1.0 ? `Gap of ~${formatDollars(bridgeNeeded - taxable)}. Consider 72(t) or building more taxable.` : undefined,
      },
      {
        label: 'Cash Buffer',
        points: cashPts,
        max: 20,
        explanation: `${cashBuffer} year${cashBuffer !== 1 ? 's' : ''} of expenses in cash`,
        tip: cashBuffer < 2 ? 'Aim for 2–3 years of expenses in cash/short bonds to weather early sequence risk.' : undefined,
      },
      {
        label: 'Portfolio Allocation',
        points: allocPts,
        max: 15,
        explanation: `${stockAlloc}% stocks / ${100 - stockAlloc}% bonds`,
        tip: stockAlloc > 80 ? 'Consider reducing equity exposure — high stock % amplifies sequence risk in early retirement.' : stockAlloc < 40 ? 'Very conservative allocation may not keep pace with 40+ year retirement.' : undefined,
      },
      {
        label: 'Social Security Timing',
        points: ssPts,
        max: 15,
        explanation: `Claiming at ${ssAge} (${ssGap} years from now)`,
        tip: ssAge < 67 && portfolio < 1_500_000 ? 'Delaying SS to 67–70 significantly reduces portfolio stress in later years.' : undefined,
      },
    ]

    return { total, withdrawalRate, bridgeYears, taxableCoverage, factors }
  }, [retireAge, portfolio, annualSpend, cashBuffer, stockAlloc, ssAge, taxable])

  const band = getBand(score.total)
  const improvements = score.factors.filter(f => f.tip)

  const pct = score.total / 100
  const radius = 54
  const cx = 70, cy = 70
  const startAngle = -210
  const endAngle = 30
  const totalArc = endAngle - startAngle
  const sweepAngle = startAngle + totalArc * pct
  const toRad = (d: number) => (d * Math.PI) / 180
  const arcX = (a: number) => cx + radius * Math.cos(toRad(a))
  const arcY = (a: number) => cy + radius * Math.sin(toRad(a))
  const arcPath = `M ${arcX(startAngle)} ${arcY(startAngle)} A ${radius} ${radius} 0 ${totalArc * pct > 180 ? 1 : 0} 1 ${arcX(sweepAngle)} ${arcY(sweepAngle)}`
  const bgPath = `M ${arcX(startAngle)} ${arcY(startAngle)} A ${radius} ${radius} 0 1 1 ${arcX(endAngle)} ${arcY(endAngle)}`

  return (
    <div style={{
      background: '#0D1420', borderRadius: 16,
      border: '1px solid rgba(232,184,75,0.15)', overflow: 'hidden',
      fontFamily: "'IBM Plex Mono', monospace", margin: '2rem 0',
    }}>
      {/* Header */}
      <div style={{ background: '#141C28', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: COLORS.gold, marginBottom: 4 }}>
              🛡️ Signature Pro Feature
            </div>
            <h3 style={{ color: '#fff', fontSize: 18, fontFamily: 'Georgia, serif', fontWeight: 700, margin: 0, marginBottom: 3 }}>
              Bridge Risk Score™
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, margin: 0 }}>
              Is your early retirement bridge structurally sound? Find out in 60 seconds.
            </p>
          </div>
          {isPro && (
            <div style={{
              background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)',
              borderRadius: 8, padding: '6px 12px', textAlign: 'center' as const,
            }}>
              <div style={{ fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: COLORS.sage, marginBottom: 2 }}>Pro</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Full Access</div>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* LEFT: Inputs */}
          <div>
            <div style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 14 }}>Your Situation</div>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 12 }}>
              {[
                { label: 'Retire Age', value: retireAge, set: setRetireAge, min: 40, max: 58, step: 1, fmt: (v: number) => `Age ${v}` },
                { label: 'Portfolio Size', value: portfolio, set: setPortfolio, min: 200000, max: 5000000, step: 50000, fmt: formatDollars },
                { label: 'Annual Spending', value: annualSpend, set: setAnnualSpend, min: 25000, max: 150000, step: 5000, fmt: formatDollars },
                { label: 'Taxable Account', value: taxable, set: setTaxable, min: 0, max: 2000000, step: 25000, fmt: formatDollars },
                { label: 'Cash Buffer (yrs)', value: cashBuffer, set: setCashBuffer, min: 0, max: 5, step: 0.5, fmt: (v: number) => `${v} yr${v !== 1 ? 's' : ''}` },
                { label: 'Stock Allocation', value: stockAlloc, set: setStockAlloc, min: 20, max: 100, step: 5, fmt: (v: number) => `${v}%` },
                { label: 'SS Claiming Age', value: ssAge, set: setSsAge, min: 62, max: 70, step: 1, fmt: (v: number) => `Age ${v}` },
              ].map(({ label, value, set, min, max, step, fmt }) => (
                <div key={label} style={{ background: '#141C28', borderRadius: 8, padding: '10px 12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>{label}</span>
                    <span style={{ fontSize: 11, color: COLORS.gold, fontWeight: 600 }}>{fmt(value)}</span>
                  </div>
                  <input type="range" min={min} max={max} step={step} value={value}
                    onChange={e => set(Number(e.target.value))}
                    style={{ width: '100%', accentColor: COLORS.gold, cursor: 'pointer' }} />
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Score */}
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 16 }}>
            <div style={{
              background: '#141C28', borderRadius: 12, padding: '20px',
              border: `1px solid ${band.border}`, textAlign: 'center' as const,
            }}>
              <svg width="140" height="95" viewBox="0 0 140 95" style={{ display: 'block', margin: '0 auto' }}>
                <path d={bgPath} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" strokeLinecap="round" />
                <path d={arcPath} fill="none" stroke={band.color} strokeWidth="10" strokeLinecap="round"
                  style={{ filter: `drop-shadow(0 0 8px ${band.color}50)` }} />
                <text x={cx} y={cy + 8} textAnchor="middle" fill={band.color}
                  fontSize="28" fontWeight="800" fontFamily="Georgia, serif">{score.total}</text>
                <text x={cx} y={cy + 22} textAnchor="middle" fill="rgba(255,255,255,0.2)"
                  fontSize="8" fontFamily="monospace" letterSpacing="2">/ 100</text>
              </svg>
              <div style={{ fontSize: 18, fontWeight: 700, color: band.color, fontFamily: 'Georgia, serif', marginBottom: 4 }}>
                {band.emoji} {band.label}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
                {score.bridgeYears.toFixed(1)}-yr bridge · {score.withdrawalRate.toFixed(1)}% withdrawal rate
              </div>
            </div>

            <div style={{ background: '#141C28', borderRadius: 12, padding: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 12 }}>Score Breakdown</div>
              {score.factors.map(f => (
                <div key={f.label} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>{f.label}</span>
                    <span style={{ fontSize: 10, color: f.points >= f.max * 0.7 ? COLORS.sage : f.points >= f.max * 0.4 ? COLORS.gold : COLORS.red, fontWeight: 600 }}>
                      {f.points}/{f.max}
                    </span>
                  </div>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 2,
                      width: `${(f.points / f.max) * 100}%`,
                      background: f.points >= f.max * 0.7 ? COLORS.sage : f.points >= f.max * 0.4 ? COLORS.gold : COLORS.red,
                      transition: 'width 0.4s ease',
                    }} />
                  </div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', marginTop: 2 }}>{f.explanation}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Improvement tips */}
        {improvements.length > 0 && (
          <div style={{ marginTop: 16, background: '#141C28', borderRadius: 12, padding: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 10 }}>
              💡 How to Improve Your Score
            </div>
            {improvements.map(f => (
              <div key={f.label} style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'flex-start' }}>
                <div style={{ fontSize: 9, color: COLORS.red, fontWeight: 600, minWidth: 80, flexShrink: 0 }}>{f.label}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{f.tip}</div>
              </div>
            ))}
          </div>
        )}

        {/* Pro upsell — only show for non-Pro users */}
        {!isPro && (
          <div style={{
            marginTop: 16,
            background: 'rgba(232,184,75,0.04)', border: '1px solid rgba(232,184,75,0.15)',
            borderLeft: '3px solid #E8B84B', borderRadius: 8, padding: '14px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
          }}>
            <div>
              <div style={{ fontSize: 10, color: COLORS.gold, fontWeight: 600, marginBottom: 4 }}>
                🔒 Pro unlocks the full Bridge Risk Score™
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
                Save scenarios, stress-test against 2008-style crashes, export your full plan as PDF, and get personalized action steps — $9/mo.
              </div>
            </div>
            <Link
              href="/pricing"
              style={{
                background: COLORS.gold, color: '#0D1420', fontFamily: 'Georgia, serif',
                fontWeight: 700, fontSize: 12, padding: '10px 18px', borderRadius: 8,
                textDecoration: 'none', whiteSpace: 'nowrap' as const, flexShrink: 0,
              }}
            >
              Go Pro →
            </Link>
          </div>
        )}
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '10px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.15)', letterSpacing: 1 }}>Not financial advice · Simplified model</span>
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.15)', letterSpacing: 1 }}>BridgeToRetired™</span>
      </div>
    </div>
  )
}

'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { trackCalculatorUsed, trackToolComplete, trackProCtaClick } from '@/lib/analytics'

const COLORS = {
  gold: '#E8B84B', teal: '#2DD4BF', sage: '#4ADE80',
  red: '#F87171', orange: '#FB923C', white: '#FFFFFF',
  dark: '#0D1420', ink: '#141C28',
}

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${Math.round(n / 1_000)}k`
  return `$${Math.round(n).toLocaleString()}`
}

const WITHDRAWAL_RATES: Record<number, number> = {
  25: 0.040, 30: 0.037, 35: 0.035, 40: 0.033, 45: 0.031, 50: 0.030,
}

function getRate(retirementYears: number): number {
  const key = Math.round(retirementYears / 5) * 5
  return WITHDRAWAL_RATES[Math.min(50, Math.max(25, key))] ?? 0.033
}

function calcRetirementAge(currentAge: number, portfolio: number, annualContrib: number, growthRate: number, annualSpend: number) {
  const r = growthRate / 100
  let bal = portfolio

  for (let y = 0; y <= 40; y++) {
    const retirementYears = 90 - (currentAge + y)
    const rate = getRate(retirementYears)
    const fireNumber = annualSpend / rate
    if (bal >= fireNumber) {
      return { retireAge: currentAge + y, portfolioAtRetire: Math.round(bal), fireNumber: Math.round(fireNumber), yearsRemaining: y, withdrawalRate: rate }
    }
    bal = bal * (1 + r) + annualContrib
  }

  const retirementYears = 90 - (currentAge + 40)
  const rate = getRate(retirementYears)
  return { retireAge: currentAge + 40, portfolioAtRetire: Math.round(bal), fireNumber: Math.round(annualSpend / rate), yearsRemaining: 40, withdrawalRate: rate }
}

function SliderField({ label, value, set, min, max, step, display, note, onTrack }: {
  label: string; value: number; set: (v: number) => void
  min: number; max: number; step: number; display: string; note?: string; onTrack: () => void
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
      {note && <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', marginTop: 4 }}>{note}</div>}
    </div>
  )
}

export default function RetirementAgeCalculator() {
  const { user } = useUser()
  const isPro = (user?.publicMetadata as any)?.isPro === true

  const [currentAge, setCurrentAge] = useState(38)
  const [portfolio, setPortfolio] = useState(350_000)
  const [annualContrib, setAnnualContrib] = useState(25_000)
  const [growthRate, setGrowthRate] = useState(7)
  const [annualSpend, setAnnualSpend] = useState(65_000)

  const track = useCallback(() => { trackCalculatorUsed('retirement-age'); trackToolComplete('retirement-age') }, [])

  const result = useMemo(() =>
    calcRetirementAge(currentAge, portfolio, annualContrib, growthRate, annualSpend),
    [currentAge, portfolio, annualContrib, growthRate, annualSpend]
  )

  const needsBridge = result.retireAge < 59.5
  const bridgeYears = needsBridge ? Math.max(0, 59.5 - result.retireAge) : 0
  const bridgeNeeded = Math.round(annualSpend * bridgeYears * 1.15)
  const pctToFire = Math.min(100, Math.round((portfolio / result.fireNumber) * 100))

  return (
    <div style={{ background: '#0D1420', borderRadius: 16, border: '1px solid rgba(232,184,75,0.15)', overflow: 'hidden', fontFamily: "'IBM Plex Mono', monospace", margin: '2rem 0' }}>

      <div style={{ background: '#141C28', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '20px 24px' }}>
        <div style={{ fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: COLORS.gold, marginBottom: 6 }}>Free Calculator</div>
        <h3 style={{ color: COLORS.white, fontSize: 18, fontFamily: 'Georgia, serif', fontWeight: 700, margin: 0, marginBottom: 4 }}>When Can I Retire?</h3>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, margin: 0 }}>Enter your numbers and see your earliest retirement age based on your current savings rate and portfolio.</p>
      </div>

      <div style={{ padding: '24px' }}>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 24 }}>
          <SliderField label="Current Age" value={currentAge} set={setCurrentAge} min={25} max={57} step={1} display={`Age ${currentAge}`} onTrack={track} />
          <SliderField label="Current Portfolio" value={portfolio} set={setPortfolio} min={0} max={3_000_000} step={10_000} display={fmt(portfolio)} note="Total across all accounts" onTrack={track} />
          <SliderField label="Annual Contributions" value={annualContrib} set={setAnnualContrib} min={0} max={100_000} step={1_000} display={fmt(annualContrib)} note="401k + IRA + taxable combined" onTrack={track} />
          <SliderField label="Annual Spending in Retirement" value={annualSpend} set={setAnnualSpend} min={30_000} max={150_000} step={5_000} display={fmt(annualSpend)} onTrack={track} />
          <SliderField label="Expected Growth Rate" value={growthRate} set={setGrowthRate} min={4} max={10} step={0.5} display={`${growthRate}%`} note="Real (inflation-adjusted)" onTrack={track} />
        </div>

        <div style={{ background: 'rgba(232,184,75,0.06)', border: '1px solid rgba(232,184,75,0.25)', borderRadius: 12, padding: '24px', marginBottom: 20, textAlign: 'center' as const }}>
          <div style={{ fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 8 }}>Estimated Retirement Age</div>
          <div style={{ fontSize: 56, fontWeight: 700, color: COLORS.gold, fontFamily: 'Georgia, serif', lineHeight: 1 }}>
            {result.retireAge === currentAge ? currentAge : result.retireAge >= currentAge + 40 ? '65+' : result.retireAge}
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>
            {result.yearsRemaining === 0 ? "You've already hit your FIRE number!" : `${result.yearsRemaining} year${result.yearsRemaining === 1 ? '' : 's'} from now`}
          </div>
          <div style={{ marginTop: 16, maxWidth: 360, margin: '16px auto 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>{fmt(portfolio)} saved</span>
              <span style={{ fontSize: 9, color: COLORS.gold }}>{pctToFire}% of FIRE number</span>
            </div>
            <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pctToFire}%`, background: COLORS.gold, borderRadius: 4, transition: 'width 0.3s ease' }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
          <div style={{ background: '#141C28', borderRadius: 10, padding: '12px 14px', border: `1px solid ${COLORS.teal}20`, borderTop: `3px solid ${COLORS.teal}` }}>
            <div style={{ fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>FIRE Number</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.teal, fontFamily: 'Georgia, serif' }}>{fmt(result.fireNumber)}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>{(result.withdrawalRate * 100).toFixed(1)}% withdrawal rate</div>
          </div>
          <div style={{ background: '#141C28', borderRadius: 10, padding: '12px 14px', border: `1px solid ${COLORS.sage}20`, borderTop: `3px solid ${COLORS.sage}` }}>
            <div style={{ fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>Portfolio at Retirement</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.sage, fontFamily: 'Georgia, serif' }}>{fmt(result.portfolioAtRetire)}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>at age {result.retireAge}</div>
          </div>
          <div style={{ background: '#141C28', borderRadius: 10, padding: '12px 14px', border: `1px solid ${needsBridge ? COLORS.orange : COLORS.sage}20`, borderTop: `3px solid ${needsBridge ? COLORS.orange : COLORS.sage}` }}>
            <div style={{ fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>Bridge Required</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: needsBridge ? COLORS.orange : COLORS.sage, fontFamily: 'Georgia, serif' }}>{needsBridge ? fmt(bridgeNeeded) : 'None'}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>{needsBridge ? `${bridgeYears.toFixed(1)} yrs until 59½` : 'Retiring at 59½ or later'}</div>
          </div>
        </div>

        {needsBridge && (
          <div style={{ background: 'rgba(251,146,60,0.06)', border: '1px solid rgba(251,146,60,0.2)', borderLeft: `3px solid ${COLORS.orange}`, borderRadius: 8, padding: '14px 16px', marginBottom: 16 }}>
            <div style={{ fontSize: 10, color: COLORS.orange, fontWeight: 600, marginBottom: 6, letterSpacing: 1 }}>🌉 BRIDGE YEARS REQUIRED</div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', margin: '0 0 10px', lineHeight: 1.7 }}>
              Retiring at {result.retireAge} means you can't touch your 401k or IRA without penalties until age 59½ — a {bridgeYears.toFixed(1)}-year gap. You'll need {fmt(bridgeNeeded)} in taxable accounts, Roth contributions, or a 72(t) SEPP plan to fund those years.
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
              <a href="/tools/bridge-health-check" style={{ fontSize: 10, color: COLORS.gold, border: `1px solid ${COLORS.gold}40`, padding: '5px 12px', borderRadius: 5, textDecoration: 'none', fontWeight: 600 }}>Check Bridge Health →</a>
              <a href="/tools/bridge-strategy-calculator" style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)', padding: '5px 12px', borderRadius: 5, textDecoration: 'none' }}>Model Bridge Plan →</a>
              <a href="/tools/72t-sepp-calculator" style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)', padding: '5px 12px', borderRadius: 5, textDecoration: 'none' }}>72(t) SEPP →</a>
            </div>
          </div>
        )}

        {!isPro && (
          <div style={{ background: 'linear-gradient(135deg, rgba(232,184,75,0.06) 0%, rgba(232,184,75,0.02) 100%)', border: '1px solid rgba(232,184,75,0.2)', borderLeft: '3px solid #E8B84B', borderRadius: 12, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
            <div>
              <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: COLORS.gold, marginBottom: 6 }}>⚡ Know if retiring at {result.retireAge} actually works</div>
              <div style={{ fontSize: 14, fontFamily: 'Georgia, serif', fontWeight: 700, color: '#fff', marginBottom: 6 }}>
                Get your Bridge Risk Score and year-by-year plan.
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, maxWidth: 400 }}>
                Pro models every year from {result.retireAge} to 90 — which account to draw from, when 401k access kicks in, and whether your bridge survives a market downturn.
              </div>
            </div>
            <a
              href="/pricing"
              onClick={() => trackProCtaClick('retirement-age-upsell')}
              style={{ background: COLORS.gold, color: '#0D1420', fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 12, padding: '10px 20px', borderRadius: 8, textDecoration: 'none', whiteSpace: 'nowrap' as const, flexShrink: 0 }}
            >
              Get Pro →
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
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

const PRO_FEATURES = [
  { icon: '🛡️', label: 'Bridge Risk Score™', sub: 'Grade your full plan in 60 seconds' },
  { icon: '📉', label: 'Sequence-of-Returns Stress Tester', sub: '2000, 2008, worst-case crashes' },
  { icon: '🖥️', label: 'Online Retirement Planner', sub: 'Save up to 5 scenarios' },
  { icon: '📄', label: 'PDF Report Export', sub: 'CPA-ready, shareable' },
]

interface Result {
  bridgeYears: number
  required: number
  shortfall: number
  funded: boolean
  fundedPct: number
  rothContribNeeded: number
  sepp72tAnnual: number
  yearsToClose: number
}

function calc(retireAge: number, annualSpend: number, taxableBalance: number, rothBalance: number, annualContrib: number, growthRate: number, otherBridgeIncome: number): Result {
  const bridgeYears = Math.max(0, 59.5 - retireAge)
  const netSpend = Math.max(0, annualSpend - otherBridgeIncome)
  const rothAccessible = rothBalance * 0.7
  const grossRequired = Math.round(netSpend * bridgeYears * 1.15)
  const required = Math.max(0, grossRequired - rothAccessible)
  const shortfall = Math.max(0, required - taxableBalance)
  const funded = shortfall === 0
  const fundedPct = required > 0 ? Math.min(100, Math.round((taxableBalance / required) * 100)) : 100

  let yearsToClose = 0
  if (!funded && annualContrib > 0) {
    let bal = taxableBalance
    const r = growthRate / 100
    while (bal < required && yearsToClose < 30) { bal = bal * (1 + r) + annualContrib; yearsToClose++ }
    if (bal < required) yearsToClose = -1
  }

  const sepp72tAnnual = shortfall > 0 ? Math.round(shortfall * 0.05 / (1 - Math.pow(1.05, -bridgeYears))) : 0
  return { bridgeYears, required, shortfall, funded, fundedPct, rothContribNeeded: shortfall, sepp72tAnnual, yearsToClose }
}

function SliderField({ label, value, set, min, max, step, display, note, color = COLORS.gold, onTrack }: {
  label: string; value: number; set: (v: number) => void
  min: number; max: number; step: number; display: string; note?: string; color?: string; onTrack: () => void
}) {
  return (
    <div style={{ background: COLORS.ink, borderRadius: 10, padding: '12px 14px', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>{label}</span>
        <span style={{ fontSize: 12, color, fontWeight: 600 }}>{display}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => { onTrack(); set(Number(e.target.value)) }}
        style={{ width: '100%', accentColor: color, cursor: 'pointer' }} />
      {note && <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', marginTop: 4 }}>{note}</div>}
    </div>
  )
}

export default function TaxableBrokerageGapCalculator() {
  const { user } = useUser()
  const isPro = (user?.publicMetadata as any)?.isPro === true

  const [retireAge, setRetireAge] = useState(52)
  const [annualSpend, setAnnualSpend] = useState(65_000)
  const [taxableBalance, setTaxableBalance] = useState(200_000)
  const [rothBalance, setRothBalance] = useState(80_000)
  const [annualContrib, setAnnualContrib] = useState(20_000)
  const [growthRate, setGrowthRate] = useState(7)
  const [otherBridgeIncome, setOtherBridgeIncome] = useState(0)

  const track = useCallback(() => trackCalculatorUsed('taxable-gap'), [])

  const result = useMemo(() =>
    calc(retireAge, annualSpend, taxableBalance, rothBalance, annualContrib, growthRate, otherBridgeIncome),
    [retireAge, annualSpend, taxableBalance, rothBalance, annualContrib, growthRate, otherBridgeIncome]
  )

  const statusColor = result.funded ? COLORS.sage : result.fundedPct >= 75 ? COLORS.gold : result.fundedPct >= 50 ? COLORS.orange : COLORS.red
  const statusLabel = result.funded ? '✓ Fully Funded' : result.fundedPct >= 75 ? '⚠ Nearly There' : result.fundedPct >= 50 ? '⚠ Partially Funded' : '🔴 Significant Gap'

  return (
    <div style={{ background: '#0D1420', borderRadius: 16, border: '1px solid rgba(232,184,75,0.15)', overflow: 'hidden', fontFamily: "'IBM Plex Mono', monospace", margin: '2rem 0' }}>

      <div style={{ background: '#141C28', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '20px 24px' }}>
        <div style={{ fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: COLORS.gold, marginBottom: 6 }}>Free Calculator</div>
        <h3 style={{ color: COLORS.white, fontSize: 18, fontFamily: 'Georgia, serif', fontWeight: 700, margin: 0, marginBottom: 4 }}>Taxable Brokerage Gap Calculator</h3>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, margin: 0 }}>How much do you need in your taxable account to fund the years between retirement and 59½ — penalty-free?</p>
      </div>

      <div style={{ padding: '24px' }}>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 24 }}>
          <SliderField label="Retirement Age" value={retireAge} set={setRetireAge} min={40} max={58} step={1} display={`Age ${retireAge}`} onTrack={track} />
          <SliderField label="Annual Spending" value={annualSpend} set={setAnnualSpend} min={30_000} max={150_000} step={5_000} display={fmt(annualSpend)} onTrack={track} />
          <SliderField label="Taxable / Brokerage Balance" value={taxableBalance} set={setTaxableBalance} min={0} max={2_000_000} step={10_000} display={fmt(taxableBalance)} note="No withdrawal restrictions" onTrack={track} />
          <SliderField label="Roth IRA Balance" value={rothBalance} set={setRothBalance} min={0} max={1_000_000} step={10_000} display={fmt(rothBalance)} note="Contributions (not earnings) accessible anytime" color={COLORS.purple} onTrack={track} />
          <SliderField label="Annual Contribution to Taxable" value={annualContrib} set={setAnnualContrib} min={0} max={100_000} step={1_000} display={fmt(annualContrib)} note="How much you're adding each year before retirement" onTrack={track} />
          <SliderField label="Expected Growth Rate" value={growthRate} set={setGrowthRate} min={4} max={10} step={0.5} display={`${growthRate}%`} onTrack={track} />
        </div>

        <div style={{ background: COLORS.ink, borderRadius: 10, padding: '12px 14px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <div>
              <span style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>Other Bridge Income / Year</span>
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', marginTop: 2 }}>Part-time work, rental, dividends during bridge years</div>
            </div>
            <span style={{ fontSize: 12, color: COLORS.teal, fontWeight: 600 }}>{fmt(otherBridgeIncome)}</span>
          </div>
          <input type="range" min={0} max={60_000} step={1_000} value={otherBridgeIncome}
            onChange={e => { track(); setOtherBridgeIncome(Number(e.target.value)) }}
            style={{ width: '100%', accentColor: COLORS.teal, cursor: 'pointer' }} />
        </div>

        <div style={{ background: result.funded ? 'rgba(74,222,128,0.06)' : 'rgba(248,113,113,0.06)', border: `1px solid ${statusColor}30`, borderRadius: 12, padding: '24px', marginBottom: 20, textAlign: 'center' as const }}>
          <div style={{ fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 6 }}>Bridge Gap Status</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: statusColor, fontFamily: 'Georgia, serif', marginBottom: 16 }}>{statusLabel}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16, maxWidth: 500, margin: '0 auto 16px' }}>
            <div>
              <div style={{ fontSize: 8, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 4 }}>Bridge Years</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.gold, fontFamily: 'Georgia, serif' }}>{result.bridgeYears.toFixed(1)}</div>
            </div>
            <div>
              <div style={{ fontSize: 8, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 4 }}>Required</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.white, fontFamily: 'Georgia, serif' }}>{fmt(result.required)}</div>
            </div>
            <div>
              <div style={{ fontSize: 8, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 4 }}>{result.funded ? 'Surplus' : 'Shortfall'}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: result.funded ? COLORS.sage : COLORS.red, fontFamily: 'Georgia, serif' }}>
                {result.funded ? `+${fmt(taxableBalance - result.required)}` : `-${fmt(result.shortfall)}`}
              </div>
            </div>
          </div>
          <div style={{ maxWidth: 400, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>Have: {fmt(taxableBalance + rothBalance * 0.7)}</span>
              <span style={{ fontSize: 9, color: statusColor }}>{result.fundedPct}% funded</span>
            </div>
            <div style={{ height: 10, background: 'rgba(255,255,255,0.06)', borderRadius: 5, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${result.fundedPct}%`, background: statusColor, borderRadius: 5, transition: 'width 0.3s ease' }} />
            </div>
          </div>
        </div>

        {!result.funded && (
          <div style={{ background: '#141C28', borderRadius: 12, padding: '16px 20px', marginBottom: 16, border: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 12 }}>Ways to Close the Gap</div>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 10 }}>
              {result.yearsToClose !== -1 && annualContrib > 0 && (
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ color: COLORS.teal, flexShrink: 0, fontSize: 14 }}>①</span>
                  <div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 600, marginBottom: 2 }}>Keep saving {fmt(annualContrib)}/yr to taxable</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>
                      {result.yearsToClose > 0
                        ? `At ${growthRate}% growth, you'll close the gap in ~${result.yearsToClose} year${result.yearsToClose === 1 ? '' : 's'} (age ${retireAge + result.yearsToClose > 59.5 ? '59+' : retireAge + result.yearsToClose})`
                        : 'Increase your annual contribution to close the gap before retirement'}
                    </div>
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ color: COLORS.purple, flexShrink: 0, fontSize: 14 }}>②</span>
                <div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 600, marginBottom: 2 }}>Build Roth contributions now</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>Roth contributions (not earnings) are always accessible penalty-free — they count toward your bridge even before 59½</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ color: COLORS.gold, flexShrink: 0, fontSize: 14 }}>③</span>
                <div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 600, marginBottom: 2 }}>Start a Roth conversion ladder 5 years early</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>Convert IRA funds to Roth starting 5 years before retirement — each conversion unlocks penalty-free 5 years later</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ color: COLORS.orange, flexShrink: 0, fontSize: 14 }}>④</span>
                <div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 600, marginBottom: 2 }}>72(t) SEPP as backup</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>If taxable falls short, a 72(t) SEPP can generate penalty-free IRA income. Locks you in for 5+ years — plan carefully</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{ background: 'rgba(45,212,191,0.06)', border: '1px solid rgba(45,212,191,0.15)', borderLeft: `3px solid ${COLORS.teal}`, borderRadius: 8, padding: '14px 16px', marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: COLORS.teal, fontWeight: 600, marginBottom: 6, letterSpacing: 1 }}>🌉 NEXT STEP</div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', margin: '0 0 10px', lineHeight: 1.7 }}>
            {result.funded ? 'Your taxable bridge looks funded. Now score your overall retirement plan.' : 'Close this gap before retiring. These tools can help.'}
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
            <a href="/tools/bridge-health-check" style={{ fontSize: 10, color: COLORS.teal, border: `1px solid ${COLORS.teal}40`, padding: '5px 12px', borderRadius: 5, textDecoration: 'none', fontWeight: 600 }}>Full Bridge Health Check →</a>
            {!result.funded && <a href="/tools/roth-conversion-ladder-calculator" style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)', padding: '5px 12px', borderRadius: 5, textDecoration: 'none' }}>Roth Ladder →</a>}
            {!result.funded && <a href="/tools/72t-sepp-calculator" style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)', padding: '5px 12px', borderRadius: 5, textDecoration: 'none' }}>72(t) SEPP →</a>}
            {result.funded && <a href="/tools/fire-number-calculator" style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)', padding: '5px 12px', borderRadius: 5, textDecoration: 'none' }}>FIRE Number →</a>}
          </div>
        </div>

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
            <Link
              href="/pricing"
              onClick={() => trackProCtaClick('taxable-gap-upsell')}
              style={{ background: COLORS.gold, color: '#0D1420', fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 12, padding: '10px 24px', borderRadius: 8, textDecoration: 'none', display: 'inline-block' }}
            >
              See Pro Plans →
            </Link>
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
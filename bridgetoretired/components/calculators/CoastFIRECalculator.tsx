'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

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

const WITHDRAWAL_RATES: Record<number, number> = {
  25: 0.040, 30: 0.037, 35: 0.035, 40: 0.033, 45: 0.031, 50: 0.030,
}

function getWithdrawalRate(retirementYears: number): number {
  const key = Math.round(retirementYears / 5) * 5
  return WITHDRAWAL_RATES[Math.min(50, Math.max(25, key))] ?? 0.033
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#0D1420', border: '1px solid rgba(232,184,75,0.2)', borderRadius: 8, padding: '10px 14px', fontFamily: 'monospace', fontSize: 11 }}>
      <div style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>Age {label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.stroke || p.fill, marginBottom: 3 }}>
          {p.name}: {fmt(p.value)}
        </div>
      ))}
    </div>
  )
}

export default function CoastFIRECalculator() {
  const { user } = useUser()
  const isPro = (user?.publicMetadata as any)?.isPro === true

  const [currentAge, setCurrentAge] = useState(35)
  const [retireAge, setRetireAge] = useState(55)
  const [currentSaved, setCurrentSaved] = useState(200_000)
  const [annualSpend, setAnnualSpend] = useState(60_000)
  const [growthRate, setGrowthRate] = useState(7)
  const [annualContribution, setAnnualContribution] = useState(20_000)

  const yearsToRetire = retireAge - currentAge
  const retirementYears = 90 - retireAge
  const withdrawalRate = getWithdrawalRate(retirementYears)
  const fireNumber = Math.round(annualSpend / withdrawalRate)
  const r = growthRate / 100

  // CoastFIRE number = FIRE number discounted back from retirement to today
  const coastNumber = Math.round(fireNumber / Math.pow(1 + r, yearsToRetire))

  const isCoasting = currentSaved >= coastNumber
  const coastGap = Math.max(0, coastNumber - currentSaved)

  // Years until you hit CoastFIRE number at current contribution rate
  let yearsToCoast = 0
  if (!isCoasting && annualContribution > 0) {
    let bal = currentSaved
    while (bal < coastNumber && yearsToCoast < yearsToRetire) {
      bal = bal * (1 + r) + annualContribution
      yearsToCoast++
    }
    if (bal < coastNumber) yearsToCoast = -1 // won't hit it before retirement
  }

  const coastAge = isCoasting ? currentAge : yearsToCoast > 0 ? currentAge + yearsToCoast : null

  // Growth projection chart
  const chartData = useMemo(() => {
    const rows = []
    let coastBal = currentSaved
    let fullBal = currentSaved

    for (let age = currentAge; age <= retireAge; age++) {
      const yr = age - currentAge

      // Coast path: no contributions after hitting coast number
      if (coastBal < coastNumber) {
        coastBal = coastBal * (1 + r) + annualContribution
      } else {
        coastBal = coastBal * (1 + r)
      }

      // Full save path: keep contributing all the way
      fullBal = fullBal * (1 + r) + annualContribution

      rows.push({
        age,
        'Coast Path': Math.round(coastBal),
        'Keep Saving': Math.round(fullBal),
        'FIRE Target': fireNumber,
      })
    }
    return rows
  }, [currentAge, retireAge, currentSaved, coastNumber, annualContribution, r, fireNumber])

  return (
    <div style={{ background: '#0D1420', borderRadius: 16, border: '1px solid rgba(232,184,75,0.15)', overflow: 'hidden', fontFamily: "'IBM Plex Mono', monospace", margin: '2rem 0' }}>
      {/* Header */}
      <div style={{ background: '#141C28', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '20px 24px' }}>
        <div style={{ fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: COLORS.gold, marginBottom: 6 }}>Interactive Calculator</div>
        <h3 style={{ color: COLORS.white, fontSize: 18, fontFamily: 'Georgia, serif', fontWeight: 700, margin: 0, marginBottom: 4 }}>CoastFIRE Calculator</h3>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, margin: 0 }}>Find the number you need today so compounding alone gets you to retirement — no more contributions required.</p>
      </div>

      <div style={{ padding: '24px' }}>
        {/* Controls */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Current Age', value: currentAge, set: setCurrentAge, min: 25, max: 55, step: 1, fmt: (v: number) => `Age ${v}` },
            { label: 'Target Retire Age', value: retireAge, set: setRetireAge, min: currentAge + 5, max: 70, step: 1, fmt: (v: number) => `Age ${v}` },
            { label: 'Current Savings', value: currentSaved, set: setCurrentSaved, min: 0, max: 2_000_000, step: 10_000, fmt: (v: number) => fmt(v) },
            { label: 'Annual Spend in Retirement', value: annualSpend, set: setAnnualSpend, min: 30_000, max: 150_000, step: 5_000, fmt: (v: number) => fmt(v) },
            { label: 'Expected Growth Rate', value: growthRate, set: setGrowthRate, min: 4, max: 10, step: 0.5, fmt: (v: number) => `${v}%` },
            { label: 'Annual Contribution', value: annualContribution, set: setAnnualContribution, min: 0, max: 60_000, step: 1_000, fmt: (v: number) => fmt(v) },
          ].map(({ label, value, set, min, max, step, fmt: f }) => (
            <div key={label} style={{ background: '#141C28', borderRadius: 10, padding: '12px 14px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>{label}</span>
                <span style={{ fontSize: 12, color: COLORS.gold, fontWeight: 600 }}>{f(value)}</span>
              </div>
              <input type="range" min={min} max={max} step={step} value={value}
                onChange={e => set(Number(e.target.value))}
                style={{ width: '100%', accentColor: COLORS.gold, cursor: 'pointer' }} />
            </div>
          ))}
        </div>

        {/* Coast number hero */}
        <div style={{ background: isCoasting ? 'rgba(74,222,128,0.06)' : 'rgba(232,184,75,0.06)', border: `1px solid ${isCoasting ? COLORS.sage : COLORS.gold}40`, borderRadius: 12, padding: '20px 24px', marginBottom: 20, textAlign: 'center' as const }}>
          <div style={{ fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 8 }}>
            Your CoastFIRE Number
          </div>
          <div style={{ fontSize: 42, fontWeight: 700, color: isCoasting ? COLORS.sage : COLORS.gold, fontFamily: 'Georgia, serif', lineHeight: 1 }}>
            {fmt(coastNumber)}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 8 }}>
            {isCoasting
              ? `✓ You're already coasting — ${fmt(currentSaved)} > ${fmt(coastNumber)}`
              : `You need ${fmt(coastGap)} more to hit CoastFIRE`}
          </div>

          {/* Progress bar */}
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>Saved: {fmt(currentSaved)}</span>
              <span style={{ fontSize: 9, color: isCoasting ? COLORS.sage : COLORS.gold }}>
                {Math.min(100, Math.round((currentSaved / coastNumber) * 100))}% of CoastFIRE
              </span>
            </div>
            <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(100, (currentSaved / coastNumber) * 100)}%`, background: isCoasting ? COLORS.sage : COLORS.gold, borderRadius: 4, transition: 'width 0.3s ease' }} />
            </div>
          </div>
        </div>

        {/* KPI cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 20 }}>
          <div style={{ background: '#141C28', borderRadius: 10, padding: '12px 14px', border: `1px solid ${COLORS.teal}20`, borderTop: `3px solid ${COLORS.teal}` }}>
            <div style={{ fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>Full FIRE Number</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.teal, fontFamily: 'Georgia, serif' }}>{fmt(fireNumber)}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>{fmt(annualSpend)}/yr ÷ {(withdrawalRate * 100).toFixed(1)}% rate</div>
          </div>
          <div style={{ background: '#141C28', borderRadius: 10, padding: '12px 14px', border: `1px solid ${COLORS.purple}20`, borderTop: `3px solid ${COLORS.purple}` }}>
            <div style={{ fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>CoastFIRE Age</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.purple, fontFamily: 'Georgia, serif' }}>
              {isCoasting ? `Age ${currentAge} ✓` : coastAge ? `Age ${coastAge}` : 'After retire age'}
            </div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>
              {isCoasting ? 'Already coasting!' : coastAge ? `${yearsToCoast} more year${yearsToCoast === 1 ? '' : 's'} of saving` : 'Increase contributions'}
            </div>
          </div>
          <div style={{ background: '#141C28', borderRadius: 10, padding: '12px 14px', border: `1px solid ${COLORS.orange}20`, borderTop: `3px solid ${COLORS.orange}` }}>
            <div style={{ fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>Years to Retirement</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.orange, fontFamily: 'Georgia, serif' }}>{yearsToRetire} years</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>Age {currentAge} → {retireAge}</div>
          </div>
          <div style={{ background: '#141C28', borderRadius: 10, padding: '12px 14px', border: `1px solid ${COLORS.gold}20`, borderTop: `3px solid ${COLORS.gold}` }}>
            <div style={{ fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>Growth Multiplier</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.gold, fontFamily: 'Georgia, serif' }}>{Math.pow(1 + r, yearsToRetire).toFixed(1)}×</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>{growthRate}% for {yearsToRetire} years</div>
          </div>
        </div>

        {/* Chart */}
        <div style={{ background: '#141C28', borderRadius: 12, padding: '20px 16px 12px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4, fontFamily: 'Georgia, serif' }}>Portfolio Growth: Coast Path vs Keep Saving</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginBottom: 16 }}>Gold = stop contributing at CoastFIRE · Teal = keep saving · Both reach FIRE target</div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="coastGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.gold} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={COLORS.gold} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="saveGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.teal} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={COLORS.teal} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="age" tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 9, fontFamily: 'monospace' }} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 9, fontFamily: 'monospace' }} tickFormatter={v => fmt(v)} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={fireNumber} stroke={COLORS.sage} strokeDasharray="4 4"
                label={{ value: 'FIRE Target', position: 'right', fill: COLORS.sage, fontSize: 9 }} />
              {coastAge && !isCoasting && (
                <ReferenceLine x={coastAge} stroke={COLORS.gold} strokeDasharray="4 4"
                  label={{ value: 'CoastFIRE', position: 'top', fill: COLORS.gold, fontSize: 9 }} />
              )}
              <Area type="monotone" dataKey="Coast Path" stroke={COLORS.gold} fill="url(#coastGrad)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="Keep Saving" stroke={COLORS.teal} fill="url(#saveGrad)" strokeWidth={2} dot={false} strokeDasharray="5 3" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Insight */}
        <div style={{ background: 'rgba(232,184,75,0.06)', border: '1px solid rgba(232,184,75,0.15)', borderLeft: `3px solid ${COLORS.gold}`, borderRadius: 8, padding: '14px 16px', marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: COLORS.gold, fontWeight: 600, marginBottom: 6, letterSpacing: 1 }}>💡 WHAT COASTFIRE MEANS FOR YOU</div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.7 }}>
            {isCoasting
              ? `With ${fmt(currentSaved)} saved at age ${currentAge}, compounding at ${growthRate}% will grow it to ${fmt(fireNumber)} by age ${retireAge} — no more contributions needed. You're free to work only enough to cover current expenses.`
              : coastAge
              ? `At your current ${fmt(annualContribution)}/year savings rate, you'll hit CoastFIRE at age ${coastAge}. After that, you can stop contributing entirely and let compounding do the rest — potentially switching to lower-stress work that covers only your living expenses.`
              : `Your current savings rate won't reach CoastFIRE before age ${retireAge}. Try increasing contributions or pushing back your retirement age slightly.`}
          </p>
        </div>

        {/* CTA to Bridge tools */}
        <div style={{ background: 'rgba(45,212,191,0.06)', border: '1px solid rgba(45,212,191,0.2)', borderLeft: `3px solid ${COLORS.teal}`, borderRadius: 8, padding: '14px 16px', marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: COLORS.teal, fontWeight: 600, marginBottom: 6, letterSpacing: 1 }}>🌉 PLAN THE BRIDGE YEARS</div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', margin: '0 0 10px', lineHeight: 1.7 }}>
            CoastFIRE tells you when you can stop saving — but you still need a plan for accessing your money before 59½. Model your full bridge strategy to see how taxable accounts, Roth conversions, and 72(t) SEPP work together.
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
            <a href="/tools/bridge-strategy-calculator" style={{ fontSize: 10, color: COLORS.teal, border: `1px solid ${COLORS.teal}40`, padding: '4px 10px', borderRadius: 4, textDecoration: 'none' }}>Bridge Strategy →</a>
            <a href="/tools/roth-conversion-ladder-calculator" style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: 4, textDecoration: 'none' }}>Roth Ladder →</a>
            <a href="/tools/72t-sepp-calculator" style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: 4, textDecoration: 'none' }}>72(t) SEPP →</a>
          </div>
        </div>

        {/* Pro upsell */}
        {!isPro && (
          <div style={{ background: 'linear-gradient(135deg, rgba(232,184,75,0.06) 0%, rgba(232,184,75,0.02) 100%)', border: '1px solid rgba(232,184,75,0.2)', borderLeft: '3px solid #E8B84B', borderRadius: 12, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
            <div>
              <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: COLORS.gold, marginBottom: 6 }}>⚡ Model the full plan with Pro</div>
              <div style={{ fontSize: 14, fontFamily: 'Georgia, serif', fontWeight: 700, color: '#fff', marginBottom: 6 }}>
                Build the complete bridge from CoastFIRE to retirement.
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, maxWidth: 420 }}>
                The Bridge Strategy Calculator (Pro) models your year-by-year withdrawal plan, Bridge Risk Score, and scenario saves — everything you need after you stop contributing.
              </div>
            </div>
            <a href="/pricing" style={{ background: COLORS.gold, color: '#0D1420', fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 12, padding: '10px 20px', borderRadius: 8, textDecoration: 'none', whiteSpace: 'nowrap' as const, flexShrink: 0 }}>
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
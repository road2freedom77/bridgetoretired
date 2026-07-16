'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts'
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

const WITHDRAWAL_RATES: Record<number, number> = {
  25: 0.040, 30: 0.037, 35: 0.035, 40: 0.033, 45: 0.031, 50: 0.030,
}

function getRate(retirementYears: number): number {
  const key = Math.round(retirementYears / 5) * 5
  return WITHDRAWAL_RATES[Math.min(50, Math.max(25, key))] ?? 0.033
}

interface CoastResult {
  fireNumber: number
  coastNumber: number
  isCoasting: boolean
  surplusOrDeficit: number
  yearsToCoast: number
  portfolioAtRetire: number
  withdrawalRate: number
  chartData: { age: number; 'With Contributions': number; 'Coast (No Contributions)': number; 'FIRE Target': number }[]
  coastAge: number | null
}

function calcCoast(
  currentAge: number, retireAge: number, annualSpend: number,
  currentPortfolio: number, annualContrib: number, growthRate: number
): CoastResult {
  const r = growthRate / 100
  const retirementYears = 90 - retireAge
  const withdrawalRate = getRate(retirementYears)
  const fireNumber = Math.round(annualSpend / withdrawalRate)
  const yearsToRetire = retireAge - currentAge
  const coastNumber = Math.round(fireNumber / Math.pow(1 + r, yearsToRetire))
  const isCoasting = currentPortfolio >= coastNumber
  const surplusOrDeficit = currentPortfolio - coastNumber
  const portfolioAtRetire = Math.round(currentPortfolio * Math.pow(1 + r, yearsToRetire))

  let yearsToCoast = 0
  if (!isCoasting) {
    let bal = currentPortfolio
    while (bal < coastNumber && yearsToCoast < 40) { bal = bal * (1 + r) + annualContrib; yearsToCoast++ }
    if (bal < coastNumber) yearsToCoast = -1
  }

  // Build chart data
  const chartData = []
  let withContrib = currentPortfolio
  let noContrib = currentPortfolio
  let coastAge: number | null = isCoasting ? currentAge : null

  for (let y = 0; y <= yearsToRetire; y++) {
    const age = currentAge + y
    const requiredCoastAtAge = Math.round(fireNumber / Math.pow(1 + r, retireAge - age))

    if (!isCoasting && coastAge === null && withContrib >= requiredCoastAtAge) {
      coastAge = age
    }

    chartData.push({
      age,
      'With Contributions': Math.round(withContrib),
      'Coast (No Contributions)': Math.round(noContrib),
      'FIRE Target': fireNumber,
    })

    withContrib = withContrib * (1 + r) + annualContrib
    noContrib = noContrib * (1 + r)
  }

  return { fireNumber, coastNumber, isCoasting, surplusOrDeficit, yearsToCoast, portfolioAtRetire, withdrawalRate, chartData, coastAge }
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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#0D1420', border: '1px solid rgba(232,184,75,0.2)', borderRadius: 8, padding: '10px 14px', fontFamily: 'monospace', fontSize: 11 }}>
      <div style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>Age {label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.color, marginBottom: 3 }}>{p.name}: {fmt(p.value)}</div>
      ))}
    </div>
  )
}

const PRO_FEATURES = [
  { icon: '🛡️', label: 'Bridge Risk Score™', sub: 'Grade your plan in 60 seconds' },
  { icon: '📉', label: 'Sequence-of-Returns Stress Tester', sub: '2000, 2008, worst-case crashes' },
  { icon: '🖥️', label: 'Online Retirement Planner', sub: 'Save up to 5 scenarios' },
  { icon: '📄', label: 'PDF Report Export', sub: 'CPA-ready, shareable' },
]

export default function CoastFIRECalculator() {
  const { user } = useUser()
  const isPro = (user?.publicMetadata as any)?.isPro === true

  const [currentAge, setCurrentAge] = useState(38)
  const [retireAge, setRetireAge] = useState(55)
  const [annualSpend, setAnnualSpend] = useState(60_000)
  const [currentPortfolio, setCurrentPortfolio] = useState(300_000)
  const [annualContrib, setAnnualContrib] = useState(25_000)
  const [growthRate, setGrowthRate] = useState(7)

  const track = useCallback(() => trackCalculatorUsed('coast-fire'), [])

  const result = useMemo(() =>
    calcCoast(currentAge, retireAge, annualSpend, currentPortfolio, annualContrib, growthRate),
    [currentAge, retireAge, annualSpend, currentPortfolio, annualContrib, growthRate]
  )

  const pctToCoast = Math.min(100, Math.round((currentPortfolio / result.coastNumber) * 100))

  return (
    <div style={{ background: '#0D1420', borderRadius: 16, border: '1px solid rgba(232,184,75,0.15)', overflow: 'hidden', fontFamily: "'IBM Plex Mono', monospace", margin: '2rem 0' }}>

      <div style={{ background: '#141C28', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '20px 24px' }}>
        <div style={{ fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: COLORS.gold, marginBottom: 6 }}>Free Calculator</div>
        <h3 style={{ color: COLORS.white, fontSize: 18, fontFamily: 'Georgia, serif', fontWeight: 700, margin: 0, marginBottom: 4 }}>CoastFIRE Calculator</h3>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, margin: 0 }}>Find out if you can stop saving today — and still retire on time.</p>
      </div>

      <div style={{ padding: '24px' }}>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 24 }}>
          <SliderField label="Current Age" value={currentAge} set={setCurrentAge} min={25} max={55} step={1} display={`Age ${currentAge}`} onTrack={track} />
          <SliderField label="Target Retire Age" value={retireAge} set={v => setRetireAge(Math.max(currentAge + 1, v))} min={40} max={70} step={1} display={`Age ${retireAge}`} onTrack={track} />
          <SliderField label="Current Portfolio" value={currentPortfolio} set={setCurrentPortfolio} min={0} max={3_000_000} step={10_000} display={fmt(currentPortfolio)} note="Total across all accounts" onTrack={track} />
          <SliderField label="Annual Contributions" value={annualContrib} set={setAnnualContrib} min={0} max={100_000} step={1_000} display={fmt(annualContrib)} note="Total savings per year" onTrack={track} />
          <SliderField label="Annual Spending in Retirement" value={annualSpend} set={setAnnualSpend} min={30_000} max={150_000} step={5_000} display={fmt(annualSpend)} onTrack={track} />
          <SliderField label="Expected Growth Rate" value={growthRate} set={setGrowthRate} min={4} max={10} step={0.5} display={`${growthRate}%`} note="Real (inflation-adjusted)" onTrack={track} />
        </div>

        {/* Big answer */}
        <div style={{ background: result.isCoasting ? 'rgba(74,222,128,0.06)' : 'rgba(232,184,75,0.06)', border: `1px solid ${result.isCoasting ? COLORS.sage : COLORS.gold}30`, borderRadius: 12, padding: '24px', marginBottom: 20, textAlign: 'center' as const }}>
          <div style={{ fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 8 }}>
            {result.isCoasting ? '🏄 You Are CoastFIRE!' : 'Your CoastFIRE Number'}
          </div>
          <div style={{ fontSize: 48, fontWeight: 700, color: result.isCoasting ? COLORS.sage : COLORS.gold, fontFamily: 'Georgia, serif', lineHeight: 1, marginBottom: 8 }}>
            {fmt(result.coastNumber)}
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 16 }}>
            {result.isCoasting
              ? `You have ${fmt(Math.abs(result.surplusOrDeficit))} more than you need — you can stop mandatory saving.`
              : result.yearsToCoast > 0
                ? `${fmt(Math.abs(result.surplusOrDeficit))} short. At current contributions, ~${result.yearsToCoast} more year${result.yearsToCoast === 1 ? '' : 's'} to CoastFIRE.`
                : `${fmt(Math.abs(result.surplusOrDeficit))} short. Keep contributing to close the gap.`}
          </div>
          {result.coastAge && !result.isCoasting && (
            <div style={{ fontSize: 11, color: COLORS.teal, marginBottom: 16 }}>
              📍 Projected CoastFIRE age: <strong>{result.coastAge}</strong>
            </div>
          )}
          <div style={{ maxWidth: 360, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>{fmt(currentPortfolio)} saved</span>
              <span style={{ fontSize: 9, color: result.isCoasting ? COLORS.sage : COLORS.gold }}>{pctToCoast}% to CoastFIRE</span>
            </div>
            <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pctToCoast}%`, background: result.isCoasting ? COLORS.sage : COLORS.gold, borderRadius: 4, transition: 'width 0.3s ease' }} />
            </div>
          </div>
        </div>

        {/* KPI cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
          <div style={{ background: '#141C28', borderRadius: 10, padding: '12px 14px', border: `1px solid ${COLORS.teal}20`, borderTop: `3px solid ${COLORS.teal}` }}>
            <div style={{ fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>FIRE Number</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.teal, fontFamily: 'Georgia, serif' }}>{fmt(result.fireNumber)}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>{(result.withdrawalRate * 100).toFixed(1)}% withdrawal rate</div>
          </div>
          <div style={{ background: '#141C28', borderRadius: 10, padding: '12px 14px', border: `1px solid ${COLORS.purple}20`, borderTop: `3px solid ${COLORS.purple}` }}>
            <div style={{ fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>Portfolio at Retirement</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.purple, fontFamily: 'Georgia, serif' }}>{fmt(result.portfolioAtRetire)}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>at age {retireAge} (no new contributions)</div>
          </div>
          <div style={{ background: '#141C28', borderRadius: 10, padding: '12px 14px', border: `1px solid ${result.isCoasting ? COLORS.sage : COLORS.orange}20`, borderTop: `3px solid ${result.isCoasting ? COLORS.sage : COLORS.orange}` }}>
            <div style={{ fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>Years to Retire</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: result.isCoasting ? COLORS.sage : COLORS.orange, fontFamily: 'Georgia, serif' }}>{retireAge - currentAge}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>age {currentAge} → {retireAge}</div>
          </div>
        </div>

        {/* Chart */}
        <div style={{ background: '#141C28', borderRadius: 12, padding: '20px 16px 12px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4, fontFamily: 'Georgia, serif' }}>Portfolio Growth — With vs Without Contributions</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginBottom: 16 }}>
            Gold line = keep contributing · Teal line = stop saving now · Red line = FIRE target
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={result.chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="age" tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 9, fontFamily: 'monospace' }} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 9, fontFamily: 'monospace' }} tickFormatter={fmt} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)', paddingTop: 12 }} />
              {result.coastAge && (
                <ReferenceLine x={result.coastAge} stroke={COLORS.teal} strokeDasharray="4 4"
                  label={{ value: `CoastFIRE Age ${result.coastAge}`, position: 'top', fill: COLORS.teal, fontSize: 9 }} />
              )}
              <Line type="monotone" dataKey="With Contributions" stroke={COLORS.gold} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Coast (No Contributions)" stroke={COLORS.teal} strokeWidth={2} dot={false} strokeDasharray="5 5" />
              <Line type="monotone" dataKey="FIRE Target" stroke={COLORS.red} strokeWidth={1} dot={false} strokeDasharray="3 3" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Insight */}
        <div style={{ background: 'rgba(45,212,191,0.06)', border: '1px solid rgba(45,212,191,0.15)', borderLeft: `3px solid ${COLORS.teal}`, borderRadius: 8, padding: '14px 16px', marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: COLORS.teal, fontWeight: 600, marginBottom: 6, letterSpacing: 1 }}>💡 WHAT COASTFIRE MEANS</div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.7 }}>
            CoastFIRE means your portfolio is large enough that — even without adding another dollar — it will grow to your full FIRE number by retirement.
            At {growthRate}% real growth, {fmt(result.coastNumber)} doubles roughly every {Math.round(72 / growthRate)} years.
            {result.isCoasting
              ? ` You've crossed the coast number — you can stop mandatory saving and let compounding do the rest.`
              : ` Once you hit ${fmt(result.coastNumber)}, you can redirect income to spending, bridge-building, or part-time work instead of aggressive saving.`}
          </p>
        </div>

        {/* Next step */}
        <div style={{ background: 'rgba(232,184,75,0.06)', border: '1px solid rgba(232,184,75,0.15)', borderLeft: `3px solid ${COLORS.gold}`, borderRadius: 8, padding: '14px 16px', marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: COLORS.gold, fontWeight: 600, marginBottom: 6, letterSpacing: 1 }}>🌉 NEXT STEP</div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', margin: '0 0 10px', lineHeight: 1.7 }}>
            {result.isCoasting
              ? "You've hit CoastFIRE — now check if your early retirement bridge is funded."
              : 'Once you hit CoastFIRE, check your retirement age and bridge plan.'}
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
            <a href="/tools/early-retirement-age-calculator" style={{ fontSize: 10, color: COLORS.gold, border: `1px solid ${COLORS.gold}40`, padding: '5px 12px', borderRadius: 5, textDecoration: 'none', fontWeight: 600 }}>When Can I Retire? →</a>
            <a href="/tools/bridge-health-check" style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)', padding: '5px 12px', borderRadius: 5, textDecoration: 'none' }}>Bridge Health Check →</a>
            <a href="/tools/fire-number-calculator" style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)', padding: '5px 12px', borderRadius: 5, textDecoration: 'none' }}>Full FIRE Number →</a>
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
            <a
              href="/pricing"
              onClick={() => trackProCtaClick('coast-fire-upsell')}
              style={{ background: COLORS.gold, color: '#0D1420', fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 12, padding: '10px 24px', borderRadius: 8, textDecoration: 'none', display: 'inline-block' }}
            >
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
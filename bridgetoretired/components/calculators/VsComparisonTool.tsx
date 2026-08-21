'use client'

import { useState, useMemo, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { trackCalculatorUsed, trackToolComplete, trackProCtaClick } from '@/lib/analytics'
import {
  calcSEPPComparison,
  calcMaxAllowedRate,
  SEPPInputs,
} from '@/lib/calc/sepp'

// ── Types ─────────────────────────────────────────────────────────────────────

type FilingStatus = 'mfj' | 'single'

interface SharedInputs {
  accountBalance: number
  currentAge: number
  bridgeEndAge: number
  annualSpend: number
  otherIncome: number
  growthRate: number
}

interface SEPPExtra {
  midTermAFR: number
  interestRate: number
}

interface LadderExtra {
  taxableBalance: number
  filingStatus: FilingStatus
}

// ── Tax engine (2026 brackets) ────────────────────────────────────────────────

const STD_DED: Record<FilingStatus, number> = { mfj: 30000, single: 15000 }

const BRACKETS: Record<FilingStatus, [number, number][]> = {
  mfj: [
    [0.10, 23850], [0.12, 96950], [0.22, 206700],
    [0.24, 394600], [0.32, 501050], [0.35, 751600], [0.37, Infinity],
  ],
  single: [
    [0.10, 11925], [0.12, 48475], [0.22, 103350],
    [0.24, 197300], [0.32, 250525], [0.35, 626350], [0.37, Infinity],
  ],
}

function federalTax(agi: number, fs: FilingStatus): number {
  const taxable = Math.max(0, agi - STD_DED[fs])
  let tax = 0, prev = 0
  for (const [rate, ceiling] of BRACKETS[fs]) {
    if (taxable <= prev) break
    tax += (Math.min(taxable, ceiling) - prev) * rate
    prev = ceiling
  }
  return tax
}

// ── Calculation engines ───────────────────────────────────────────────────────

interface ScenarioYear {
  year: number
  age: number
  income: number
  tax: number
  netIncome: number
  accountBalance: number
  taxableBalance: number
  note: string
}

interface ScenarioResult {
  years: ScenarioYear[]
  totalTax: number
  totalNetIncome: number
  avgEffectiveRate: number
  flexibilityScore: number  // 1-5
  accessAge: number         // when money first available
  lockInYears: number
  gapRisk: number           // 0 = none, > 0 = shortfall $
  accountFinal: number
}

function calcSEPPScenario(shared: SharedInputs, extra: SEPPExtra): ScenarioResult {
  const inp: SEPPInputs = {
    accountBalance: shared.accountBalance,
    currentAge: shared.currentAge,
    interestRate: extra.interestRate,
    lifeTable: 'single',
    midTermAFR: extra.midTermAFR,
  }
  const sepp = calcSEPPComparison(inp)
  const amort = sepp.amortization
  const lockInEnd = amort.lockInEndAge
  const years: ScenarioYear[] = []
  let balance = shared.accountBalance
  let totalTax = 0
  let totalNet = 0

  const yearsToModel = Math.max(lockInEnd - shared.currentAge + 2, 10)

  for (let y = 1; y <= yearsToModel; y++) {
    const age = shared.currentAge + y - 1
    const isActive = age < lockInEnd
    const payment = isActive ? amort.annualPayment : 0
    const agi = payment + shared.otherIncome
    const tax = federalTax(agi, 'single')
    const net = payment - tax
    balance = Math.max(0, (balance - payment) * (1 + shared.growthRate))

    totalTax += tax
    totalNet += net

    years.push({
      year: y, age,
      income: payment,
      tax, netIncome: net,
      accountBalance: balance,
      taxableBalance: 0,
      note: isActive ? 'SEPP active' : 'SEPP complete',
    })
  }

  const totalIncome = years.reduce((s, r) => s + r.income, 0)
  const avgEff = totalIncome > 0 ? totalTax / totalIncome : 0

  return {
    years, totalTax, totalNetIncome: totalNet,
    avgEffectiveRate: avgEff,
    flexibilityScore: 2, // low — locked in
    accessAge: shared.currentAge,
    lockInYears: lockInEnd - shared.currentAge,
    gapRisk: 0,
    accountFinal: balance,
  }
}

function calcLadderScenario(shared: SharedInputs, extra: LadderExtra): ScenarioResult {
  const { filingStatus } = extra
  const conversionTarget = shared.annualSpend * 1.15
  const convHistory: number[] = []
  const years: ScenarioYear[] = []
  let ira = shared.accountBalance
  let taxable = extra.taxableBalance
  let rothBasis = 0
  let totalTax = 0
  let totalNet = 0
  let gapRisk = 0

  const yearsToModel = Math.max(shared.bridgeEndAge - shared.currentAge + 3, 12)

  for (let y = 1; y <= yearsToModel; y++) {
    const age = shared.currentAge + y - 1
    const isBeyondBridge = age >= shared.bridgeEndAge
    const isGapYear = y <= 5

    // Unlock rung from 5 years ago
    const unlock = y > 5 ? (convHistory[y - 6] ?? 0) : 0
    rothBasis += unlock

    // Conversion
    const conv = isBeyondBridge ? 0 : Math.min(conversionTarget, ira)
    convHistory.push(conv)
    ira = Math.max(0, ira * (1 + shared.growthRate) - conv)

    // Tax on conversion
    const agi = shared.otherIncome + conv
    const tax = federalTax(agi, filingStatus)
    totalTax += tax

    // Gap funding
    let shortfall = 0
    let note = ''
    if (isGapYear) {
      const needed = shared.annualSpend + tax
      if (taxable >= needed) {
        taxable -= needed
        note = 'Gap funded from taxable'
      } else {
        shortfall = needed - taxable
        gapRisk += shortfall
        taxable = 0
        note = `⚠ Gap shortfall $${Math.round(shortfall).toLocaleString()}`
      }
    } else {
      taxable = Math.max(0, taxable * (1 + shared.growthRate) - tax)
      note = unlock > 0 ? `Rung unlocked: $${Math.round(unlock).toLocaleString()}` : 'Ladder running'
    }

    const net = isGapYear ? shared.annualSpend - shortfall : Math.min(rothBasis, shared.annualSpend)
    totalNet += net

    years.push({
      year: y, age,
      income: conv,
      tax, netIncome: net,
      accountBalance: ira,
      taxableBalance: taxable,
      note,
    })
  }

  const totalIncome = years.reduce((s, r) => s + r.income, 0)
  const avgEff = totalIncome > 0 ? totalTax / totalIncome : 0

  return {
    years, totalTax, totalNetIncome: totalNet,
    avgEffectiveRate: avgEff,
    flexibilityScore: 4, // high — no lock-in
    accessAge: shared.currentAge + 5,
    lockInYears: 0,
    gapRisk,
    accountFinal: ira,
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number) {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (Math.abs(n) >= 1_000) return `$${Math.round(n / 1_000)}k`
  return `$${Math.round(n).toLocaleString()}`
}

function fmtPct(n: number) { return `${(n * 100).toFixed(1)}%` }

function NumField({ label, value, onChange, onTrack, prefix, suffix, note }: {
  label: string; value: number; onChange: (v: number) => void; onTrack?: () => void
  prefix?: string; suffix?: string; note?: string
}) {
  const [raw, setRaw] = useState(String(value))
  return (
    <div className="mb-3">
      <label className="font-mono text-[9px] tracking-widest uppercase text-white/35 block mb-1">{label}</label>
      <div className="relative flex items-center">
        {prefix && <span className="absolute left-3 font-mono text-[11px] text-white/40 pointer-events-none">{prefix}</span>}
        <input
          type="text" inputMode="decimal" value={raw}
          onFocus={e => e.target.select()}
          onChange={e => {
            const val = e.target.value
            if (/^-?\d*\.?\d*$/.test(val) || val === '') {
              setRaw(val)
              const p = parseFloat(val)
              if (!isNaN(p)) { onTrack?.(); onChange(p) }
            }
          }}
          onBlur={e => {
            const p = parseFloat(e.target.value)
            const c = isNaN(p) ? 0 : p
            setRaw(String(c)); onChange(c)
          }}
          className={`w-full bg-ink border border-white/[0.08] rounded-lg py-2 font-mono text-[12px] text-blue-400 font-bold outline-none focus:border-gold/40 transition-colors ${prefix ? 'pl-7' : 'pl-3'} ${suffix ? 'pr-8' : 'pr-3'}`}
        />
        {suffix && <span className="absolute right-3 font-mono text-[11px] text-white/40 pointer-events-none">{suffix}</span>}
      </div>
      {note && <div className="font-mono text-[8px] text-white/20 mt-0.5">{note}</div>}
    </div>
  )
}

// ── Verdict logic ─────────────────────────────────────────────────────────────

function getVerdict(sepp: ScenarioResult, ladder: ScenarioResult, shared: SharedInputs, ladderExtra: LadderExtra) {
  const points: string[] = []
  let winner: 'sepp' | 'ladder' | 'split' = 'split'

  if (ladder.gapRisk > 0) {
    points.push(`Roth ladder has a ${fmt(ladder.gapRisk)} gap funding shortfall — you need more taxable savings.`)
    winner = 'sepp'
  }

  if (sepp.totalTax < ladder.totalTax) {
    points.push(`72(t) produces ${fmt(ladder.totalTax - sepp.totalTax)} less in total tax over the period.`)
  } else {
    points.push(`Roth ladder produces ${fmt(sepp.totalTax - ladder.totalTax)} less in total tax — money converts at lower rates.`)
    if (winner !== 'sepp') winner = 'ladder'
  }

  if (shared.currentAge < 50) {
    points.push('Starting before 50 means 72(t) locks you in for 9.5+ years — Roth ladder is more flexible.')
    if (winner !== 'sepp') winner = 'ladder'
  }

  if (ladderExtra.taxableBalance >= shared.annualSpend * 5) {
    points.push(`You have ${fmt(ladderExtra.taxableBalance)} in taxable — enough to fund the full 5-year ladder gap.`)
  } else if (ladder.gapRisk === 0) {
    points.push('Your taxable balance barely covers the 5-year gap — any market drop could cause a shortfall.')
  }

  points.push('Many early retirees use both: 72(t) for immediate income, Roth ladder running in parallel for post-59½ tax-free withdrawals.')

  return { winner, points }
}

// ── Main component ────────────────────────────────────────────────────────────

export default function VsComparisonTool() {
  const { user } = useUser()
  const isPro = user?.publicMetadata?.isPro === true

  const [shared, setShared] = useState<SharedInputs>({
    accountBalance: 800000,
    currentAge: 50,
    bridgeEndAge: 60,
    annualSpend: 55000,
    otherIncome: 0,
    growthRate: 0.06,
  })

  const [seppExtra, setSeppExtra] = useState<SEPPExtra>({
    midTermAFR: 0.045,
    interestRate: 0.05,
  })

  const [ladderExtra, setLadderExtra] = useState<LadderExtra>({
    taxableBalance: 150000,
    filingStatus: 'mfj',
  })

  const [activeTab, setActiveTab] = useState<'summary' | 'sepp' | 'ladder'>('summary')

  const track = useCallback(() => { trackCalculatorUsed('72t-vs-roth'); trackToolComplete('72t-vs-roth') }, [])

  const maxRate = calcMaxAllowedRate(seppExtra.midTermAFR)

  const seppResult = useMemo(() => calcSEPPScenario(shared, seppExtra), [shared, seppExtra])
  const ladderResult = useMemo(() => calcLadderScenario(shared, ladderExtra), [shared, ladderExtra])
  const verdict = useMemo(() => getVerdict(seppResult, ladderResult, shared, ladderExtra), [seppResult, ladderResult, shared, ladderExtra])

  function setS(k: keyof SharedInputs) { return (v: number) => setShared(p => ({ ...p, [k]: v })) }
  function setSE(k: keyof SEPPExtra) { return (v: number) => setSeppExtra(p => ({ ...p, [k]: v })) }
  function setLE(k: keyof LadderExtra) { return (v: any) => setLadderExtra(p => ({ ...p, [k]: v })) }

  const seppAnnual = seppResult.years[0]?.income ?? 0
  const ladderAnnual = shared.annualSpend

  return (
    <div className="max-w-5xl mx-auto px-5 py-10">

      {/* Pro gate */}
      {!isPro && (
        <div className="mb-8 bg-ink border border-gold/20 rounded-xl p-6 flex items-start gap-5">
          <div className="text-3xl shrink-0">🔒</div>
          <div className="flex-1">
            <div className="font-mono text-[9px] tracking-widest uppercase text-gold mb-2">Pro Feature</div>
            <h2 className="font-syne font-semibold text-[18px] text-white mb-2">
              Full comparison requires Pro
            </h2>
            <p className="text-white/45 text-[13px] leading-relaxed mb-4">
              The side-by-side comparison table, year-by-year breakdown, verdict engine, and tax
              efficiency analysis are Pro-only. Free users see the summary cards only.
            </p>
            <Link href="/pricing"
              onClick={() => trackProCtaClick('vs-comparison-gate')}
              className="inline-block bg-gold text-black font-syne font-semibold text-[12px] px-5 py-2.5 rounded hover:opacity-85 transition-opacity">
              Upgrade to Pro — $15/mo →
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">

        {/* ── Inputs ── */}
        <div className="space-y-4">
          <div className="bg-ink border border-white/[0.07] rounded-xl p-5">
            <div className="font-syne font-bold text-[13px] text-white mb-4">Your Situation</div>

            <NumField label="IRA / 401k Balance" value={shared.accountBalance}
              onChange={setS('accountBalance')} onTrack={track} prefix="$" note="Starting balance for both strategies" />
            <NumField label="Current Age" value={shared.currentAge}
              onChange={setS('currentAge')} onTrack={track} note="Must be under 59½" />
            <NumField label="Bridge-End Age" value={shared.bridgeEndAge}
              onChange={setS('bridgeEndAge')} onTrack={track} note="When SS, pension, or 59½ income begins" />
            <NumField label="Annual Spend Needed" value={shared.annualSpend}
              onChange={setS('annualSpend')} onTrack={track} prefix="$" />
            <NumField label="Other Annual Income" value={shared.otherIncome}
              onChange={setS('otherIncome')} onTrack={track} prefix="$" note="Rental, part-time, dividends" />
            <NumField label="Expected Growth Rate" value={shared.growthRate * 100}
              onChange={v => setS('growthRate')(v / 100)} onTrack={track} suffix="%" />
          </div>

          <div className="bg-ink border border-white/[0.07] rounded-xl p-5">
            <div className="font-mono text-[9px] tracking-widest uppercase text-gold mb-3">72(t) SEPP Settings</div>
            <NumField label="Federal Mid-Term AFR" value={seppExtra.midTermAFR * 100}
              onChange={v => setSE('midTermAFR')(v / 100)} onTrack={track} suffix="%" note="Check IRS.gov monthly" />
            <div className="bg-gold/5 border border-gold/15 rounded-lg px-3 py-1.5 mb-3">
              <div className="font-mono text-[8px] text-white/30">Max allowed rate</div>
              <div className="font-syne font-bold text-[14px] text-gold">{fmtPct(maxRate)}</div>
            </div>
            <NumField label="Rate to Use" value={seppExtra.interestRate * 100}
              onChange={v => setSE('interestRate')(Math.min(v / 100, maxRate))} onTrack={track}
              suffix="%" note={`Max: ${fmtPct(maxRate)}`} />
          </div>

          <div className="bg-ink border border-white/[0.07] rounded-xl p-5">
            <div className="font-mono text-[9px] tracking-widest uppercase text-teal mb-3">Roth Ladder Settings</div>
            <NumField label="Taxable / Cash Balance" value={ladderExtra.taxableBalance}
              onChange={v => setLE('taxableBalance')(v)} onTrack={track} prefix="$" note="Funds the 5-year gap" />
            <div className="mb-3">
              <label className="font-mono text-[9px] tracking-widest uppercase text-white/35 block mb-1">Filing Status</label>
              <select value={ladderExtra.filingStatus}
                onChange={e => { track(); setLE('filingStatus')(e.target.value as FilingStatus) }}
                className="w-full bg-ink border border-white/[0.08] rounded-lg py-2 px-3 font-mono text-[12px] text-blue-400 font-bold outline-none focus:border-gold/40">
                <option value="mfj">Married Filing Jointly</option>
                <option value="single">Single</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Results ── */}
        <div>

          {/* Head-to-head summary cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* SEPP card */}
            <div className="bg-ink border border-gold/20 rounded-xl p-5">
              <div className="font-mono text-[9px] tracking-widest uppercase text-gold mb-3">72(t) SEPP</div>
              <div className="space-y-2.5">
                {[
                  { label: 'Annual Income', value: fmt(seppAnnual) },
                  { label: 'Lock-in', value: `${seppResult.lockInYears.toFixed(1)} yrs` },
                  { label: 'Income Starts', value: `Age ${shared.currentAge}` },
                  { label: 'Total Tax', value: fmt(seppResult.totalTax) },
                  { label: 'Avg Eff. Rate', value: fmtPct(seppResult.avgEffectiveRate) },
                  { label: 'Flexibility', value: '⚡⚡ Low' },
                  { label: 'Gap Risk', value: 'None' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between font-mono text-[10px]">
                    <span className="text-white/30">{label}</span>
                    <span className="text-white/70">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ladder card */}
            <div className={`bg-ink rounded-xl p-5 border ${ladderResult.gapRisk > 0 ? 'border-red-500/30' : 'border-teal/20'}`}>
              <div className="font-mono text-[9px] tracking-widest uppercase text-teal mb-3">Roth Ladder</div>
              <div className="space-y-2.5">
                {[
                  { label: 'Annual Spend', value: fmt(ladderAnnual) },
                  { label: 'Lock-in', value: 'None' },
                  { label: 'Income Starts', value: `Age ${shared.currentAge + 5}` },
                  { label: 'Total Tax', value: fmt(ladderResult.totalTax) },
                  { label: 'Avg Eff. Rate', value: fmtPct(ladderResult.avgEffectiveRate) },
                  { label: 'Flexibility', value: '⚡⚡⚡⚡ High' },
                  {
                    label: 'Gap Risk',
                    value: ladderResult.gapRisk > 0 ? `⚠ ${fmt(ladderResult.gapRisk)}` : '✓ Funded',
                  },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between font-mono text-[10px]">
                    <span className="text-white/30">{label}</span>
                    <span className={`${label === 'Gap Risk' && ladderResult.gapRisk > 0 ? 'text-red-400' : 'text-white/70'}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Verdict — Pro only */}
          {isPro ? (
            <div className={`rounded-xl p-5 mb-6 border ${
              verdict.winner === 'sepp' ? 'bg-gold/5 border-gold/25' :
              verdict.winner === 'ladder' ? 'bg-teal/5 border-teal/25' :
              'bg-purple-950/20 border-purple-500/20'
            }`}>
              <div className="font-mono text-[9px] tracking-widest uppercase mb-2 text-white/40">Analysis</div>
              <div className="font-syne font-bold text-[16px] text-white mb-3">
                {verdict.winner === 'sepp' && '72(t) SEPP looks stronger for your situation'}
                {verdict.winner === 'ladder' && 'Roth Ladder looks stronger for your situation'}
                {verdict.winner === 'split' && 'Consider running both strategies in parallel'}
              </div>
              <ul className="space-y-2">
                {verdict.points.map((p, i) => (
                  <li key={i} className="font-mono text-[11px] text-white/50 flex gap-2">
                    <span className="text-gold/50 shrink-0">→</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="bg-ink border border-gold/10 rounded-xl p-5 mb-6 flex items-start gap-4">
              <div className="text-2xl shrink-0">🔒</div>
              <div>
                <div className="font-mono text-[9px] tracking-widest uppercase text-gold mb-1">Pro Feature</div>
                <div className="font-syne font-semibold text-white text-[14px] mb-1">Verdict & Analysis</div>
                <p className="text-white/40 text-[12px] leading-relaxed mb-3">
                  Get a data-driven recommendation based on your inputs — which strategy wins on tax, flexibility, and gap risk.
                </p>
                <Link href="/pricing"
                  onClick={() => trackProCtaClick('vs-comparison-upsell')}
                  className="inline-block bg-gold text-black font-syne font-semibold text-[11px] px-4 py-2 rounded hover:opacity-85 transition-opacity">
                  Upgrade to Pro →
                </Link>
              </div>
            </div>
          )}

          {/* Year-by-year table — Pro only */}
          {isPro && (
            <>
              {/* Tab switcher */}
              <div className="flex gap-2 mb-4">
                {(['summary', 'sepp', 'ladder'] as const).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`font-mono text-[9px] tracking-widest uppercase px-3 py-1.5 rounded transition-colors ${
                      activeTab === tab
                        ? 'bg-gold text-black'
                        : 'text-white/40 border border-white/[0.08] hover:text-white/70'
                    }`}>
                    {tab === 'summary' ? 'Side by Side' : tab === 'sepp' ? '72(t) Detail' : 'Ladder Detail'}
                  </button>
                ))}
              </div>

              {activeTab === 'summary' && (
                <div className="bg-ink border border-white/[0.07] rounded-xl overflow-hidden">
                  <div className="px-5 py-3 border-b border-white/[0.06]">
                    <span className="font-mono text-[9px] tracking-widest uppercase text-white/25">Year-by-Year Comparison</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-white/[0.06]">
                          {['Yr', 'Age', '72t Income', '72t Tax', 'Ladder Conv.', 'Ladder Tax', 'Ladder Note'].map(h => (
                            <th key={h} className="px-4 py-3 font-mono text-[9px] tracking-widest uppercase text-white/25 whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {seppResult.years.slice(0, 12).map((sr, i) => {
                          const lr = ladderResult.years[i]
                          return (
                            <tr key={i} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                              <td className="px-4 py-2.5 font-mono text-[11px] text-white/40">{sr.year}</td>
                              <td className="px-4 py-2.5 font-mono text-[11px] text-white/60">{sr.age}</td>
                              <td className="px-4 py-2.5 font-mono text-[11px] text-gold">{fmt(sr.income)}</td>
                              <td className="px-4 py-2.5 font-mono text-[11px] text-red-400/70">{fmt(sr.tax)}</td>
                              <td className="px-4 py-2.5 font-mono text-[11px] text-teal">{lr ? fmt(lr.income) : '—'}</td>
                              <td className="px-4 py-2.5 font-mono text-[11px] text-red-400/70">{lr ? fmt(lr.tax) : '—'}</td>
                              <td className="px-4 py-2.5 font-mono text-[10px] text-white/30">{lr?.note ?? ''}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'sepp' && (
                <div className="bg-ink border border-white/[0.07] rounded-xl overflow-hidden">
                  <div className="px-5 py-3 border-b border-white/[0.06]">
                    <span className="font-mono text-[9px] tracking-widest uppercase text-gold">72(t) SEPP — Year by Year</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-white/[0.06]">
                          {['Yr', 'Age', 'Payment', 'Tax', 'Net', 'IRA Balance', 'Status'].map(h => (
                            <th key={h} className="px-4 py-3 font-mono text-[9px] tracking-widest uppercase text-white/25 whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {seppResult.years.map((r, i) => (
                          <tr key={i} className="border-b border-white/[0.04]">
                            <td className="px-4 py-2.5 font-mono text-[11px] text-white/40">{r.year}</td>
                            <td className="px-4 py-2.5 font-mono text-[11px] text-white/60">{r.age}</td>
                            <td className="px-4 py-2.5 font-mono text-[11px] text-gold">{fmt(r.income)}</td>
                            <td className="px-4 py-2.5 font-mono text-[11px] text-red-400/70">{fmt(r.tax)}</td>
                            <td className="px-4 py-2.5 font-mono text-[11px] text-white/60">{fmt(r.netIncome)}</td>
                            <td className="px-4 py-2.5 font-mono text-[11px] text-white/40">{fmt(r.accountBalance)}</td>
                            <td className="px-4 py-2.5 font-mono text-[10px] text-white/30">{r.note}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'ladder' && (
                <div className="bg-ink border border-white/[0.07] rounded-xl overflow-hidden">
                  <div className="px-5 py-3 border-b border-white/[0.06]">
                    <span className="font-mono text-[9px] tracking-widest uppercase text-teal">Roth Ladder — Year by Year</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-white/[0.06]">
                          {['Yr', 'Age', 'Conversion', 'Tax', 'IRA Balance', 'Taxable Left', 'Note'].map(h => (
                            <th key={h} className="px-4 py-3 font-mono text-[9px] tracking-widest uppercase text-white/25 whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {ladderResult.years.map((r, i) => (
                          <tr key={i} className={`border-b border-white/[0.04] ${r.note.includes('⚠') ? 'bg-red-950/20' : ''}`}>
                            <td className="px-4 py-2.5 font-mono text-[11px] text-white/40">{r.year}</td>
                            <td className="px-4 py-2.5 font-mono text-[11px] text-white/60">{r.age}</td>
                            <td className="px-4 py-2.5 font-mono text-[11px] text-teal">{fmt(r.income)}</td>
                            <td className="px-4 py-2.5 font-mono text-[11px] text-red-400/70">{fmt(r.tax)}</td>
                            <td className="px-4 py-2.5 font-mono text-[11px] text-white/40">{fmt(r.accountBalance)}</td>
                            <td className="px-4 py-2.5 font-mono text-[11px] text-white/40">{fmt(r.taxableBalance)}</td>
                            <td className={`px-4 py-2.5 font-mono text-[10px] ${r.note.includes('⚠') ? 'text-red-400' : 'text-white/30'}`}>{r.note}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Key tradeoffs */}
          <div className="mt-6 bg-navy/30 border border-white/[0.06] rounded-xl p-5">
            <div className="font-mono text-[9px] tracking-widest uppercase text-white/25 mb-4">Key Tradeoffs</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { topic: 'Income timing', sepp: 'Starts immediately', ladder: 'Starts year 6 (gap needed)' },
                { topic: 'Flexibility', sepp: 'Locked — modification = 10% penalty retroactive', ladder: 'None — convert more or less each year' },
                { topic: 'Tax efficiency', sepp: 'Fixed income may push into higher brackets', ladder: 'Control conversion to fill lowest brackets' },
                { topic: 'ACA subsidy risk', sepp: 'Fixed income — predictable MAGI', ladder: 'Conversions count as MAGI — plan carefully' },
                { topic: 'Account depletion', sepp: 'Fixed draws regardless of market', ladder: 'Can skip conversions in down years' },
                { topic: 'Best for', sepp: 'No taxable savings, need income now', ladder: 'Have taxable bridge, want tax flexibility' },
              ].map(({ topic, sepp, ladder }) => (
                <div key={topic} className="bg-black/20 rounded-lg p-3">
                  <div className="font-mono text-[9px] tracking-widest uppercase text-white/30 mb-2">{topic}</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="font-mono text-[8px] text-gold/60 mb-0.5">72(t)</div>
                      <div className="text-white/45 text-[11px] leading-relaxed">{sepp}</div>
                    </div>
                    <div>
                      <div className="font-mono text-[8px] text-teal/60 mb-0.5">Roth Ladder</div>
                      <div className="text-white/45 text-[11px] leading-relaxed">{ladder}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
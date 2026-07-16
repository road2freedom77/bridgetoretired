'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { trackCalculatorUsed, trackProCtaClick } from '@/lib/analytics'
import {
  calcSEPPComparison,
  calcAccountSplit,
  calcMaxAllowedRate,
  SEPPInputs,
  SEPPComparison,
  LifeTable,
} from '@/lib/calc/sepp'

const DEFAULT_INPUTS: SEPPInputs = {
  accountBalance: 800000,
  currentAge: 50,
  interestRate: 0.05,
  lifeTable: 'single',
  midTermAFR: 0.045,
}

function fmt(n: number) { return '$' + Math.round(n).toLocaleString() }
function fmtPct(n: number) { return (n * 100).toFixed(2) + '%' }

const PRO_FEATURES = [
  { icon: '🛡️', label: 'Bridge Risk Score™', sub: 'Grade your plan in 60 seconds' },
  { icon: '📉', label: 'Sequence-of-Returns Stress Tester', sub: '2000, 2008, worst-case crashes' },
  { icon: '🖥️', label: 'Online Retirement Planner', sub: 'Save up to 5 scenarios' },
  { icon: '📄', label: 'PDF Report Export', sub: 'CPA-ready, shareable' },
]

function NumField({ label, value, onChange, onTrack, prefix, suffix, note, step, min, max }: {
  label: string; value: number; onChange: (v: number) => void; onTrack?: () => void
  prefix?: string; suffix?: string; note?: string; step?: number; min?: number; max?: number
}) {
  const [raw, setRaw] = useState(String(value))
  useEffect(() => setRaw(String(value)), [value])
  return (
    <div className="mb-4">
      <label className="font-mono text-[9px] tracking-widest uppercase text-white/35 block mb-1">{label}</label>
      <div className="relative flex items-center">
        {prefix && <span className="absolute left-3 font-mono text-[11px] text-white/40 pointer-events-none">{prefix}</span>}
        <input type="text" inputMode="decimal" value={raw} onFocus={e => e.target.select()}
          onChange={e => {
            const val = e.target.value
            if (/^-?\d*\.?\d*$/.test(val) || val === '') {
              setRaw(val)
              const parsed = parseFloat(val)
              if (!isNaN(parsed)) { onTrack?.(); onChange(parsed) }
            }
          }}
          onBlur={e => {
            const parsed = parseFloat(e.target.value)
            const clean = isNaN(parsed) ? 0 : parsed
            setRaw(String(clean)); onChange(clean)
          }}
          className={`w-full bg-ink border border-white/[0.08] rounded-lg py-2 font-mono text-[12px] text-blue-400 font-bold outline-none focus:border-gold/40 transition-colors ${prefix ? 'pl-7' : 'pl-3'} ${suffix ? 'pr-8' : 'pr-3'}`}
        />
        {suffix && <span className="absolute right-3 font-mono text-[11px] text-white/40 pointer-events-none">{suffix}</span>}
      </div>
      {note && <div className="font-mono text-[8px] text-white/20 mt-0.5">{note}</div>}
    </div>
  )
}

function MethodCard({ method, result, isRecommended, isPro, isLocked }: {
  method: string
  result: { annualPayment: number; monthlyPayment: number; lifeExpectancyFactor: number; lockInEndAge: number; minimumDuration: number; notes: string[] } | null
  isRecommended: boolean; isPro: boolean; isLocked: boolean
}) {
  if (!result) return (
    <div className="bg-ink border border-white/[0.06] rounded-xl p-5 opacity-40">
      <div className="font-mono text-[9px] tracking-widest uppercase text-white/30 mb-2">{method}</div>
      <div className="text-white/30 text-[12px]">Not available for this age/rate combination</div>
    </div>
  )
  if (isLocked) return (
    <div className="bg-ink border border-gold/10 rounded-xl p-5 relative overflow-hidden">
      <div className="absolute inset-0 backdrop-blur-sm bg-black/60 flex flex-col items-center justify-center z-10 rounded-xl">
        <div className="text-2xl mb-2">🔒</div>
        <div className="font-mono text-[9px] tracking-widest uppercase text-gold mb-2">Pro Only</div>
        <Link href="/pricing" onClick={() => trackProCtaClick('sepp-annuitization-lock')} className="text-[12px] text-white/60 hover:text-white transition-colors underline underline-offset-2">Upgrade to unlock</Link>
      </div>
      <div className="font-mono text-[9px] tracking-widest uppercase text-white/30 mb-2">{method}</div>
      <div className="font-syne font-bold text-[28px] text-white/20">$??</div>
    </div>
  )
  return (
    <div className={`bg-ink rounded-xl p-5 border transition-all ${isRecommended ? 'border-gold/40 bg-gold/[0.03]' : 'border-white/[0.07]'}`}>
      {isRecommended && (
        <div className="font-mono text-[8px] tracking-widest uppercase text-gold bg-gold/10 border border-gold/20 px-2 py-0.5 rounded-full inline-block mb-3">★ Highest Payment</div>
      )}
      <div className="font-mono text-[9px] tracking-widest uppercase text-white/30 mb-1">{method}</div>
      <div className="font-syne font-bold text-[32px] text-white mb-0.5">{fmt(result.annualPayment)}</div>
      <div className="font-mono text-[10px] text-white/40 mb-4">per year · {fmt(result.monthlyPayment)}/mo</div>
      <div className="space-y-1.5 mb-4">
        <div className="flex justify-between font-mono text-[10px]">
          <span className="text-white/30">Life expectancy factor</span>
          <span className="text-white/60">{result.lifeExpectancyFactor}</span>
        </div>
        <div className="flex justify-between font-mono text-[10px]">
          <span className="text-white/30">Lock-in ends at age</span>
          <span className="text-white/60">{result.lockInEndAge}</span>
        </div>
        <div className="flex justify-between font-mono text-[10px]">
          <span className="text-white/30">Minimum duration</span>
          <span className="text-white/60">{result.minimumDuration.toFixed(1)} years</span>
        </div>
      </div>
      <div className="space-y-1">
        {result.notes.map((note, i) => (
          <div key={i} className="font-mono text-[9px] text-white/30 flex gap-1.5">
            <span className="text-gold/40 shrink-0">→</span>
            <span>{note}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function LockInTimeline({ currentAge, lockInEndAge, lockInEndYear }: { currentAge: number; lockInEndAge: number; lockInEndYear: number }) {
  const totalYears = lockInEndAge - currentAge
  const fiveYearPct = (Math.min(5, totalYears) / totalYears) * 100
  const age595Pct = ((59.5 - currentAge) / totalYears) * 100
  return (
    <div className="bg-ink border border-white/[0.07] rounded-xl p-5 mb-6">
      <div className="font-mono text-[9px] tracking-widest uppercase text-white/25 mb-4">SEPP Lock-In Timeline</div>
      <div className="relative h-12 bg-white/[0.04] rounded-lg overflow-hidden mb-3">
        <div className="absolute h-full bg-gold/20 border-r border-gold/40" style={{ width: '100%' }} />
        {currentAge < 54.5 && <div className="absolute h-full border-r-2 border-dashed border-white/30" style={{ left: `${fiveYearPct}%` }} />}
        {currentAge < 59.5 && <div className="absolute h-full border-r-2 border-dashed border-green-400/50" style={{ left: `${Math.min(age595Pct, 99)}%` }} />}
        <div className="absolute inset-0 flex items-center px-3">
          <span className="font-mono text-[9px] text-gold/70">Age {currentAge} → {lockInEndAge} · SEPP active</span>
        </div>
      </div>
      <div className="flex items-center gap-6 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-gold/40" />
          <span className="font-mono text-[9px] text-white/30">SEPP active ({totalYears.toFixed(1)} yrs)</span>
        </div>
        {currentAge < 54.5 && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 border-t-2 border-dashed border-white/30" />
            <span className="font-mono text-[9px] text-white/30">5-year mark (age {currentAge + 5})</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 border-t-2 border-dashed border-green-400/50" />
          <span className="font-mono text-[9px] text-white/30">Age 59½ unlock</span>
        </div>
      </div>
      <div className="mt-4 bg-red-950/30 border border-red-500/20 rounded-lg px-4 py-3">
        <div className="font-mono text-[9px] tracking-widest uppercase text-red-400 mb-1">⚠ Modification Penalty</div>
        <div className="text-white/50 text-[12px] leading-relaxed">
          If you modify or stop the SEPP before age {lockInEndAge} ({lockInEndYear}), the IRS applies a 10% penalty retroactively to all prior distributions, plus interest. The only allowed change: a one-time irrevocable switch from amortization/annuitization to the RMD method.
        </div>
      </div>
    </div>
  )
}

export default function SEPP72tToolkit() {
  const { user, isLoaded } = useUser()
  const isPro = user?.publicMetadata?.isPro === true

  const [inputs, setInputs] = useState<SEPPInputs>(DEFAULT_INPUTS)
  const [results, setResults] = useState<SEPPComparison | null>(null)
  const [targetIncome, setTargetIncome] = useState(40000)
  const [showSplit, setShowSplit] = useState(false)

  const track = useCallback(() => trackCalculatorUsed('sepp-72t'), [])

  const calculate = useCallback(() => {
    const r = calcSEPPComparison(inputs)
    setResults(r)
  }, [inputs])

  useEffect(() => { calculate() }, [calculate])

  const set = (key: keyof SEPPInputs) => (value: any) => setInputs(prev => ({ ...prev, [key]: value }))
  const maxRate = inputs.midTermAFR ? calcMaxAllowedRate(inputs.midTermAFR) : 0.05
  const splitResult = results ? calcAccountSplit(inputs, targetIncome) : null

  return (
    <div className="max-w-5xl mx-auto px-5 py-10">
      <div className="mb-8">
        <div className="font-mono text-[9px] tracking-widest uppercase text-gold mb-2">IRS Notice 2022-6 · Three Methods</div>
        <h1 className="font-syne font-bold text-[clamp(24px,4vw,40px)] tracking-tight text-white mb-3">72t / SEPP Calculator</h1>
        <p className="text-white/50 text-[14px] leading-relaxed max-w-2xl">
          Calculate penalty-free distributions from your IRA or 401k before age 59½. Compare all three IRS-approved methods and find the highest allowed payment for your situation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* Inputs */}
        <div className="bg-ink border border-white/[0.07] rounded-xl p-5">
          <div className="font-syne font-bold text-[13px] text-white mb-4">Your Numbers</div>
          <NumField label="Account Balance" value={inputs.accountBalance} onChange={set('accountBalance')} onTrack={track} prefix="$" step={10000} note="IRA or 401k balance at valuation date" />
          <NumField label="Current Age" value={inputs.currentAge} onChange={set('currentAge')} onTrack={track} min={40} max={58} note="Must be under 59½" />
          <div className="mb-4">
            <label className="font-mono text-[9px] tracking-widest uppercase text-white/35 block mb-1">Life Expectancy Table</label>
            <select value={inputs.lifeTable} onChange={e => { track(); set('lifeTable')(e.target.value as LifeTable) }}
              className="w-full bg-ink border border-white/[0.08] rounded-lg py-2 px-3 font-mono text-[12px] text-blue-400 font-bold outline-none focus:border-gold/40">
              <option value="single">Single Life (most common)</option>
              <option value="uniform">Uniform Lifetime</option>
              <option value="joint">Joint Life</option>
            </select>
            <div className="font-mono text-[8px] text-white/20 mt-0.5">Single life typically gives highest factor</div>
          </div>
          <div className="border-t border-white/[0.06] pt-4 mb-4">
            <div className="font-mono text-[9px] tracking-widest uppercase text-white/25 mb-3">Interest Rate (Notice 2022-6)</div>
            <NumField label="Federal Mid-Term AFR" value={(inputs.midTermAFR ?? 0.045) * 100} onChange={v => set('midTermAFR')(v / 100)} onTrack={track} suffix="%" step={0.1} note="Check IRS.gov monthly — changes each month" />
            <div className="bg-gold/5 border border-gold/15 rounded-lg px-3 py-2 mb-3">
              <div className="font-mono text-[8px] text-white/30 mb-0.5">Max allowed rate</div>
              <div className="font-syne font-bold text-[16px] text-gold">{fmtPct(maxRate)}</div>
              <div className="font-mono text-[8px] text-white/20">Greater of 5% or 120% × AFR ({fmtPct((inputs.midTermAFR ?? 0.045) * 1.20)})</div>
            </div>
            <NumField label="Rate to Use" value={inputs.interestRate * 100} onChange={v => set('interestRate')(Math.min(v / 100, maxRate))} onTrack={track} suffix="%" step={0.1} note={`Max: ${fmtPct(maxRate)} — higher rate = higher payment`} />
          </div>
          <div className="bg-navy/50 rounded-lg px-3 py-2 text-center">
            <div className="font-mono text-[8px] text-white/25 mb-0.5">Illustrative only</div>
            <div className="font-mono text-[9px] text-white/35 leading-relaxed">Not financial or tax advice. Consult a qualified tax advisor before starting a 72t plan.</div>
          </div>
        </div>

        {/* Results */}
        <div>
          {results && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <MethodCard method="RMD Method" result={results.rmd} isRecommended={results.recommendedMethod === 'rmd'} isPro={isPro} isLocked={false} />
                <MethodCard method="Fixed Amortization" result={results.amortization} isRecommended={results.recommendedMethod === 'amortization'} isPro={isPro} isLocked={false} />
                <MethodCard method="Fixed Annuitization" result={results.annuitization} isRecommended={results.recommendedMethod === 'annuitization'} isPro={isPro} isLocked={!isPro} />
              </div>

              <LockInTimeline currentAge={inputs.currentAge} lockInEndAge={results.amortization.lockInEndAge} lockInEndYear={results.amortization.lockInEndYear} />

              {/* Account splitting */}
              {isPro ? (
                <div className="bg-ink border border-white/[0.07] rounded-xl p-5 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="font-mono text-[9px] tracking-widest uppercase text-gold mb-1">Pro Feature</div>
                      <div className="font-syne font-semibold text-white text-[16px]">Account Splitting Strategy</div>
                    </div>
                    <button onClick={() => setShowSplit(!showSplit)} className="font-mono text-[10px] tracking-widest uppercase text-gold/60 hover:text-gold border border-gold/20 px-3 py-1.5 rounded transition-colors">
                      {showSplit ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {showSplit && splitResult && (
                    <>
                      <p className="text-white/45 text-[13px] leading-relaxed mb-4">Instead of running a SEPP on your entire account, split it first. Run the SEPP on just the portion needed to hit your target income — keep the rest penalty-free at 59½.</p>
                      <NumField label="Target Annual Income" value={targetIncome} onChange={setTargetIncome} onTrack={track} prefix="$" step={1000} />
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="bg-gold/5 border border-gold/15 rounded-xl p-4">
                          <div className="font-mono text-[8px] tracking-widest uppercase text-gold mb-1">SEPP Account</div>
                          <div className="font-syne font-bold text-[22px] text-white">{fmt(splitResult.primaryBalance)}</div>
                          <div className="font-mono text-[10px] text-white/40 mt-1">Generates {fmt(splitResult.primaryAnnualPayment)}/yr</div>
                        </div>
                        <div className="bg-navy/50 border border-white/[0.06] rounded-xl p-4">
                          <div className="font-mono text-[8px] tracking-widest uppercase text-white/25 mb-1">Reserve Account</div>
                          <div className="font-syne font-bold text-[22px] text-white">{fmt(splitResult.reserveBalance)}</div>
                          <div className="font-mono text-[10px] text-white/40 mt-1">Accessible at 59½ or second SEPP</div>
                        </div>
                      </div>
                      <div className="mt-3 font-mono text-[11px] text-white/40 leading-relaxed bg-navy/30 rounded-lg p-3">{splitResult.rationale}</div>
                    </>
                  )}
                </div>
              ) : (
                <div className="bg-ink border border-gold/10 rounded-xl p-5 mb-6 flex items-start gap-4">
                  <div className="text-2xl shrink-0">🔒</div>
                  <div>
                    <div className="font-mono text-[9px] tracking-widest uppercase text-gold mb-1">Pro Feature</div>
                    <div className="font-syne font-semibold text-white text-[14px] mb-1">Account Splitting Strategy</div>
                    <p className="text-white/40 text-[12px] leading-relaxed mb-3">Run a SEPP on just part of your IRA — generate exactly the income you need while keeping the rest growing penalty-free until 59½ or a future SEPP.</p>
                    <Link href="/pricing" onClick={() => trackProCtaClick('sepp-account-split-gate')} className="inline-block bg-gold text-black font-syne font-semibold text-[11px] tracking-wide px-4 py-2 rounded hover:opacity-85 transition-opacity">Upgrade to Pro →</Link>
                  </div>
                </div>
              )}

              {/* Key rules */}
              <div className="bg-navy/30 border border-white/[0.06] rounded-xl p-5 mb-6">
                <div className="font-mono text-[9px] tracking-widest uppercase text-white/25 mb-4">Critical 72t Rules</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { rule: 'Lock-in period', detail: `Longer of 5 years or until 59½. Starting at ${inputs.currentAge} = ${(Math.max(inputs.currentAge + 5, 59.5) - inputs.currentAge).toFixed(1)} years locked.` },
                    { rule: 'No modifications', detail: 'Cannot change amount, stop, or roll over the account. Violation = 10% penalty retroactive on all distributions + interest.' },
                    { rule: 'One-time RMD switch', detail: 'May switch from amortization or annuitization to RMD method once, irrevocably. Use as escape valve if needed.' },
                    { rule: 'Rate selection', detail: `Notice 2022-6: use any rate up to ${fmtPct(maxRate)} (greater of 5% or 120% × mid-term AFR) for the month of or month before first distribution.` },
                    { rule: 'Valuation date', detail: 'Can use any account balance between prior December 31 and first distribution date. Choose strategically.' },
                    { rule: 'One account only', detail: 'SEPP runs on one IRA/401k account. Split your account first if you want to preserve some balance for later.' },
                  ].map(({ rule, detail }) => (
                    <div key={rule} className="bg-black/20 rounded-lg p-3">
                      <div className="font-mono text-[9px] tracking-widest uppercase text-gold mb-1">{rule}</div>
                      <div className="text-white/45 text-[12px] leading-relaxed">{detail}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next step */}
              <div className="bg-teal/[0.06] border border-teal/[0.15] rounded-xl p-5 mb-6" style={{ borderLeft: '3px solid #2DD4BF' }}>
                <div className="font-mono text-[9px] tracking-widest uppercase text-teal mb-2">🌉 NEXT STEP</div>
                <p className="text-white/45 text-[13px] leading-relaxed mb-3">
                  72(t) locks you in for years. Before committing, compare it against the Roth ladder — or check if your full bridge plan is funded.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Link href="/tools/72t-vs-roth-ladder" className="font-mono text-[10px] text-teal border border-teal/40 px-3 py-1.5 rounded hover:bg-teal/10 transition-colors font-semibold">72t vs Roth Ladder →</Link>
                  <Link href="/tools/bridge-health-check" className="font-mono text-[10px] text-white/40 border border-white/10 px-3 py-1.5 rounded hover:text-white/60 transition-colors">Bridge Health Check →</Link>
                  <Link href="/tools/taxable-brokerage-gap-calculator" className="font-mono text-[10px] text-white/40 border border-white/10 px-3 py-1.5 rounded hover:text-white/60 transition-colors">Taxable Gap Calculator →</Link>
                </div>
              </div>

              {/* Pro upsell — free users only */}
              {!isPro && (
                <div className="bg-ink border border-gold/20 rounded-xl p-5">
                  <div className="font-mono text-[9px] tracking-widest uppercase text-gold mb-4">⚡ BridgeToRetired Pro — $9/mo</div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {PRO_FEATURES.map(({ icon, label, sub }) => (
                      <div key={label} className="flex gap-2 items-start">
                        <span className="text-sm shrink-0">{icon}</span>
                        <div>
                          <div className="font-mono text-[11px] text-white/70 font-semibold">{label}</div>
                          <div className="font-mono text-[10px] text-white/30">{sub}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link href="/pricing" onClick={() => trackProCtaClick('sepp-toolkit-upsell')} className="inline-block bg-gold text-black font-syne font-semibold text-[12px] px-6 py-2.5 rounded hover:opacity-85 transition-opacity">See Pro Plans →</Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
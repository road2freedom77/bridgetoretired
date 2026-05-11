'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

const fmt = (n: number) => `$${Math.round(n).toLocaleString()}`
const fmtDecimal = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const COMMON_RATES = [15, 17, 18, 20, 22, 25, 27, 30, 35, 40, 45, 50, 60, 75, 100]

// Simplified federal tax estimate (2026 single / MFJ)
function estimateFederalTax(gross: number, filingStatus: 'single' | 'mfj'): number {
  const standardDeduction = filingStatus === 'mfj' ? 30_000 : 15_000
  const taxable = Math.max(0, gross - standardDeduction)
  const brackets = filingStatus === 'mfj'
    ? [{ rate: 0.10, upTo: 23_850 }, { rate: 0.12, upTo: 96_950 }, { rate: 0.22, upTo: 206_700 }, { rate: 0.24, upTo: 394_600 }]
    : [{ rate: 0.10, upTo: 11_925 }, { rate: 0.12, upTo: 48_475 }, { rate: 0.22, upTo: 103_350 }, { rate: 0.24, upTo: 197_300 }]
  let tax = 0
  let prev = 0
  for (const b of brackets) {
    if (taxable <= prev) break
    tax += (Math.min(taxable, b.upTo) - prev) * b.rate
    prev = b.upTo
  }
  return Math.round(tax)
}

function estimateFICA(gross: number): number {
  return Math.round(Math.min(gross, 168_600) * 0.062 + gross * 0.0145)
}

function yearsToFire(currentSavings: number, annualSurplus: number, fireTarget: number): number {
  if (annualSurplus <= 0 || fireTarget <= 0) return 999
  let balance = currentSavings
  for (let yr = 1; yr <= 60; yr++) {
    balance = (balance + annualSurplus) * 1.07
    if (balance >= fireTarget) return yr
  }
  return 60
}

function yearsToBridgeMilestone(currentSavings: number, annualSurplus: number, target: number): number {
  if (annualSurplus <= 0) return 999
  let balance = currentSavings
  for (let yr = 1; yr <= 60; yr++) {
    balance = (balance + annualSurplus) * 1.07
    if (balance >= target) return yr
  }
  return 60
}

export default function HourlyToSalaryPage() {
  const [hourly, setHourly] = useState(25)
  const [hoursPerWeek, setHoursPerWeek] = useState(40)
  const [weeksPerYear, setWeeksPerYear] = useState(52)
  const [filingStatus, setFilingStatus] = useState<'single' | 'mfj'>('single')
  const [k401Pct, setK401Pct] = useState(6)
  const [employerMatchPct, setEmployerMatchPct] = useState(3)
  const [annualExpenses, setAnnualExpenses] = useState(36_000)
  const [currentSavings, setCurrentSavings] = useState(50_000)
  const [targetRetireAge, setTargetRetireAge] = useState(55)

  const results = useMemo(() => {
    const annual       = hourly * hoursPerWeek * weeksPerYear
    const monthly      = annual / 12
    const weekly       = hourly * hoursPerWeek
    const daily        = weekly / 5
    const k401Contrib  = Math.round(annual * k401Pct / 100)
    const employerMatch = Math.round(annual * Math.min(employerMatchPct, k401Pct) / 100)
    const grossForTax  = annual - k401Contrib
    const federalTax   = estimateFederalTax(grossForTax, filingStatus)
    const fica         = estimateFICA(annual)
    const totalTax     = federalTax + fica
    const takeHome     = annual - k401Contrib - totalTax
    const effectiveRate = ((totalTax / annual) * 100).toFixed(1)
    const annualSurplus = Math.max(0, takeHome - annualExpenses)
    const totalAnnualSaved = annualSurplus + k401Contrib + employerMatch
    const savingsRate  = annual > 0 ? ((totalAnnualSaved / annual) * 100).toFixed(1) : '0'
    const fireTarget   = annualExpenses * 25
    const ytf          = yearsToFire(currentSavings, totalAnnualSaved, fireTarget)
    const fireAge      = new Date().getFullYear() === 2026 ? targetRetireAge : targetRetireAge
    const bridgeYears  = Math.max(0, 59.5 - targetRetireAge)
    const bridge1yr    = annualExpenses * 1
    const bridge3yr    = annualExpenses * 3
    const bridge5yr    = annualExpenses * 5
    const yt1yr        = yearsToBridgeMilestone(currentSavings, annualSurplus, bridge1yr)
    const yt3yr        = yearsToBridgeMilestone(currentSavings, annualSurplus, bridge3yr)
    const yt5yr        = yearsToBridgeMilestone(currentSavings, annualSurplus, bridge5yr)

    return {
      annual, monthly, weekly, daily,
      k401Contrib, employerMatch, totalAnnualSaved,
      federalTax, fica, totalTax, takeHome,
      effectiveRate, annualSurplus, savingsRate,
      fireTarget, ytf, bridgeYears,
      yt1yr, yt3yr, yt5yr,
      bridge1yr, bridge3yr, bridge5yr,
    }
  }, [hourly, hoursPerWeek, weeksPerYear, filingStatus, k401Pct, employerMatchPct, annualExpenses, currentSavings, targetRetireAge])

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-navy border-b border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-5 pt-12 pb-10">
          <Link href="/tools" className="font-mono text-[10px] tracking-widest uppercase text-white/30 hover:text-gold transition-colors flex items-center gap-2 mb-6">
            ← All Tools
          </Link>
          <div className="font-mono text-[9px] tracking-widest uppercase text-gold mb-3">Income Planning</div>
          <h1 className="font-syne font-bold text-[clamp(26px,4vw,46px)] tracking-tight text-white leading-tight mb-3">
            Hourly to Annual Salary Calculator
          </h1>
          <p className="text-white/50 text-[15px] leading-relaxed max-w-xl">
            Convert your hourly wage to an annual salary — then see your take-home pay, savings surplus, and how long until your bridge is funded for early retirement.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 py-12">

        {/* Calculator */}
        <div className="grid lg:grid-cols-[1fr_1fr] gap-6 mb-12">

          {/* Inputs */}
          <div className="bg-ink border border-white/[0.07] rounded-xl p-6 space-y-6">
            <div className="font-mono text-[9px] tracking-widest uppercase text-gold">Your Numbers</div>

            {/* Hourly rate */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-mono text-[11px] text-white/50">Hourly Pay Rate</span>
                <span className="font-mono text-[13px] text-gold font-semibold">${hourly.toFixed(2)}/hr</span>
              </div>
              <input type="range" min={7.25} max={200} step={0.25} value={hourly}
                onChange={e => setHourly(+e.target.value)}
                className="w-full accent-gold h-1 rounded-full bg-white/10 cursor-pointer mb-2" />
              <div className="flex items-center gap-2 mt-2">
                <span className="font-mono text-[10px] text-white/30">$</span>
                <input type="number" min={7.25} max={500} step={0.25} value={hourly}
                  onChange={e => setHourly(Math.max(0, +e.target.value))}
                  className="w-full bg-slate border border-white/[0.08] rounded px-3 py-2 font-mono text-[12px] text-white focus:border-gold/40 focus:outline-none transition-colors" />
                <span className="font-mono text-[10px] text-white/30">/hr</span>
              </div>
            </div>

            {/* Hours / weeks */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-mono text-[10px] text-white/50">Hrs/Week</span>
                  <span className="font-mono text-[11px] text-gold font-semibold">{hoursPerWeek}</span>
                </div>
                <input type="range" min={1} max={80} step={1} value={hoursPerWeek}
                  onChange={e => setHoursPerWeek(+e.target.value)}
                  className="w-full accent-gold h-1 rounded-full bg-white/10 cursor-pointer" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-mono text-[10px] text-white/50">Wks/Year</span>
                  <span className="font-mono text-[11px] text-gold font-semibold">{weeksPerYear}</span>
                </div>
                <input type="range" min={1} max={52} step={1} value={weeksPerYear}
                  onChange={e => setWeeksPerYear(+e.target.value)}
                  className="w-full accent-gold h-1 rounded-full bg-white/10 cursor-pointer" />
              </div>
            </div>

            {/* Filing status */}
            <div>
              <div className="font-mono text-[9px] tracking-widest uppercase text-white/30 mb-3">Filing Status</div>
              <div className="flex gap-3">
                {(['single', 'mfj'] as const).map(s => (
                  <button key={s} onClick={() => setFilingStatus(s)}
                    className={`flex-1 py-2 rounded font-mono text-[10px] tracking-widest uppercase border transition-all ${
                      filingStatus === s
                        ? 'bg-gold text-black border-gold'
                        : 'bg-transparent text-white/40 border-white/10 hover:border-gold/30'
                    }`}>
                    {s === 'single' ? 'Single' : 'Married (MFJ)'}
                  </button>
                ))}
              </div>
            </div>

            {/* 401k */}
            <div className="pt-2 border-t border-white/[0.06]">
              <div className="font-mono text-[9px] tracking-widest uppercase text-white/30 mb-4">Retirement Contributions</div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-mono text-[10px] text-white/50">401(k) Contribution</span>
                    <span className="font-mono text-[11px] text-gold font-semibold">{k401Pct}% · {fmt(results.k401Contrib)}/yr</span>
                  </div>
                  <input type="range" min={0} max={23} step={1} value={k401Pct}
                    onChange={e => setK401Pct(+e.target.value)}
                    className="w-full accent-gold h-1 rounded-full bg-white/10 cursor-pointer" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-mono text-[10px] text-white/50">Employer Match</span>
                    <span className="font-mono text-[11px] text-teal font-semibold">{employerMatchPct}% · {fmt(results.employerMatch)}/yr</span>
                  </div>
                  <input type="range" min={0} max={10} step={0.5} value={employerMatchPct}
                    onChange={e => setEmployerMatchPct(+e.target.value)}
                    className="w-full accent-gold h-1 rounded-full bg-white/10 cursor-pointer" />
                </div>
              </div>
            </div>

            {/* Expenses + savings */}
            <div className="pt-2 border-t border-white/[0.06]">
              <div className="font-mono text-[9px] tracking-widest uppercase text-white/30 mb-4">Spending & Assets</div>
              <div className="space-y-3">
                <div>
                  <div className="font-mono text-[10px] text-white/50 mb-1">Annual Living Expenses</div>
                  <input type="number" step={1000} min={0} value={annualExpenses}
                    onChange={e => setAnnualExpenses(Math.max(0, +e.target.value))}
                    className="w-full bg-slate border border-white/[0.08] rounded px-3 py-2 font-mono text-[12px] text-white focus:border-gold/40 focus:outline-none transition-colors" />
                </div>
                <div>
                  <div className="font-mono text-[10px] text-white/50 mb-1">Current Invested Assets</div>
                  <input type="number" step={5000} min={0} value={currentSavings}
                    onChange={e => setCurrentSavings(Math.max(0, +e.target.value))}
                    className="w-full bg-slate border border-white/[0.08] rounded px-3 py-2 font-mono text-[12px] text-white focus:border-gold/40 focus:outline-none transition-colors" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-mono text-[10px] text-white/50">Target Retire Age</span>
                    <span className="font-mono text-[11px] text-gold font-semibold">Age {targetRetireAge}</span>
                  </div>
                  <input type="range" min={40} max={65} step={1} value={targetRetireAge}
                    onChange={e => setTargetRetireAge(+e.target.value)}
                    className="w-full accent-gold h-1 rounded-full bg-white/10 cursor-pointer" />
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4">
            {/* Annual salary */}
            <div className="bg-ink border border-gold/20 rounded-xl p-6 text-center">
              <div className="font-mono text-[9px] tracking-widest uppercase text-gold mb-2">Annual Gross Salary</div>
              <div className="font-syne font-bold text-[48px] tracking-tight text-white leading-none mb-1">
                {fmt(results.annual)}
              </div>
              <div className="font-mono text-[11px] text-white/30">{hoursPerWeek} hrs/wk · {weeksPerYear} wks/yr · pre-tax</div>
            </div>

            {/* Pay breakdown */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Monthly', val: fmtDecimal(results.monthly) },
                { label: 'Weekly',  val: fmtDecimal(results.weekly)  },
                { label: 'Daily',   val: fmtDecimal(results.daily)   },
              ].map(({ label, val }) => (
                <div key={label} className="bg-ink border border-white/[0.07] rounded-lg p-4 text-center">
                  <div className="font-mono text-[9px] tracking-widest uppercase text-white/30 mb-2">{label}</div>
                  <div className="font-syne font-bold text-[15px] text-white">{val}</div>
                </div>
              ))}
            </div>

            {/* Take-home breakdown */}
            <div className="bg-ink border border-white/[0.07] rounded-xl p-5">
              <div className="font-mono text-[9px] tracking-widest uppercase text-gold mb-4">Take-Home Breakdown</div>
              <div className="space-y-2.5">
                {[
                  { label: 'Gross salary',         val: results.annual,      color: 'text-white/70' },
                  { label: `401(k) contribution`,  val: -results.k401Contrib, color: 'text-teal/80' },
                  { label: `Federal income tax`,   val: -results.federalTax,  color: 'text-red-400/70' },
                  { label: `FICA (SS + Medicare)`, val: -results.fica,        color: 'text-red-400/70' },
                ].map(({ label, val, color }) => (
                  <div key={label} className="flex justify-between">
                    <span className="font-mono text-[10px] text-white/40">{label}</span>
                    <span className={`font-mono text-[10px] font-semibold ${color}`}>
                      {val < 0 ? `-${fmt(Math.abs(val))}` : fmt(val)}
                    </span>
                  </div>
                ))}
                <div className="border-t border-white/[0.06] pt-2 flex justify-between">
                  <span className="font-mono text-[10px] text-white/60 font-semibold">Annual take-home</span>
                  <span className="font-mono text-[11px] text-sage font-bold">{fmt(results.takeHome)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono text-[10px] text-white/40">Effective tax rate</span>
                  <span className="font-mono text-[10px] text-white/50">{results.effectiveRate}%</span>
                </div>
              </div>
            </div>

            {/* Surplus + savings rate */}
            <div className="bg-ink border border-white/[0.07] rounded-xl p-5">
              <div className="font-mono text-[9px] tracking-widest uppercase text-gold mb-4">Annual Surplus & Savings</div>
              <div className="space-y-2.5 mb-4">
                {[
                  { label: 'Take-home pay',       val: results.takeHome,        color: 'text-white/70' },
                  { label: 'Annual expenses',      val: -annualExpenses,         color: 'text-red-400/70' },
                ].map(({ label, val, color }) => (
                  <div key={label} className="flex justify-between">
                    <span className="font-mono text-[10px] text-white/40">{label}</span>
                    <span className={`font-mono text-[10px] font-semibold ${color}`}>
                      {val < 0 ? `-${fmt(Math.abs(val))}` : fmt(val)}
                    </span>
                  </div>
                ))}
                <div className="border-t border-white/[0.06] pt-2 flex justify-between">
                  <span className="font-mono text-[10px] text-white/60 font-semibold">Investable surplus</span>
                  <span className={`font-mono text-[11px] font-bold ${results.annualSurplus > 0 ? 'text-sage' : 'text-red-400'}`}>
                    {results.annualSurplus > 0 ? fmt(results.annualSurplus) : `-${fmt(Math.abs(results.annualSurplus))}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono text-[10px] text-white/40">+ 401(k) + employer match</span>
                  <span className="font-mono text-[10px] text-teal/80">+{fmt(results.k401Contrib + results.employerMatch)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono text-[10px] text-white/60 font-semibold">Total annual savings</span>
                  <span className="font-mono text-[11px] text-gold font-bold">{fmt(results.totalAnnualSaved)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono text-[10px] text-white/40">Overall savings rate</span>
                  <span className="font-mono text-[10px] text-white/50">{results.savingsRate}% of gross</span>
                </div>
              </div>
            </div>

            {/* Bridge milestones */}
            <div className="bg-ink border border-white/[0.07] rounded-xl p-5">
              <div className="font-mono text-[9px] tracking-widest uppercase text-gold mb-1">Bridge Milestones</div>
              <div className="font-mono text-[9px] text-white/25 mb-4">
                Years to fund each bridge buffer from investable surplus (taxable only, 7% return)
              </div>
              <div className="space-y-3">
                {[
                  { label: '1-yr bridge buffer',  target: results.bridge1yr, yrs: results.yt1yr,  color: 'text-sage' },
                  { label: '3-yr bridge buffer',  target: results.bridge3yr, yrs: results.yt3yr,  color: 'text-gold' },
                  { label: '5-yr bridge buffer',  target: results.bridge5yr, yrs: results.yt5yr,  color: 'text-teal' },
                ].map(({ label, target, yrs, color }) => (
                  <div key={label} className="flex items-center justify-between">
                    <div>
                      <div className="font-mono text-[10px] text-white/50">{label}</div>
                      <div className="font-mono text-[9px] text-white/25">{fmt(target)} needed</div>
                    </div>
                    <div className={`font-syne font-bold text-[18px] ${color}`}>
                      {yrs >= 60 ? '60+ yrs' : `${yrs} yrs`}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FIRE timeline */}
            <div className="bg-ink border border-white/[0.07] rounded-xl p-5">
              <div className="font-mono text-[9px] tracking-widest uppercase text-gold mb-4">FIRE Timeline</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="font-mono text-[9px] text-white/30 mb-1">Years to FIRE</div>
                  <div className="font-syne font-bold text-[28px] text-white leading-none">
                    {results.ytf >= 60 ? '60+' : results.ytf}
                    <span className="font-mono text-[12px] text-white/30 ml-1">yrs</span>
                  </div>
                  <div className="font-mono text-[9px] text-white/25 mt-1">at {results.savingsRate}% savings rate</div>
                </div>
                <div>
                  <div className="font-mono text-[9px] text-white/30 mb-1">FIRE Target (25x)</div>
                  <div className="font-syne font-bold text-[22px] text-white leading-none">
                    {fmt(results.fireTarget)}
                  </div>
                  <div className="font-mono text-[9px] text-white/25 mt-1">25x annual expenses</div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/[0.06]">
                <p className="font-mono text-[10px] text-white/25 leading-relaxed">
                  Assumes 7% real return. Bridge milestones use taxable surplus only — 401(k) and match build your retirement account separately.
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-gold/5 border border-gold/20 rounded-xl p-5 flex items-center justify-between gap-4">
              <div>
                <div className="font-syne font-semibold text-[13px] text-white mb-1">Model your full year-by-year bridge plan</div>
                <div className="font-mono text-[10px] text-white/35">See how taxable, 401(k), and Roth work together from retirement to age 90.</div>
              </div>
              <Link href="/tools/bridge-strategy-calculator"
                className="shrink-0 bg-gold text-black font-syne font-semibold text-[11px] px-4 py-2 rounded hover:opacity-85 transition-opacity whitespace-nowrap">
                Try It →
              </Link>
            </div>
          </div>
        </div>

        {/* Common rates table */}
        <div className="mb-12">
          <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-2">Hourly Rate to Annual Salary Chart</h2>
          <p className="text-white/45 text-[13px] mb-6">Based on 40 hours per week and 52 weeks per year (pre-tax). Click any row to update the calculator above.</p>
          <div className="bg-ink border border-white/[0.07] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate">
                  <tr>
                    {['Hourly Rate', 'Annual Salary', 'Monthly Pay', 'Weekly Pay', 'Daily Pay'].map(h => (
                      <th key={h} className="font-mono text-[9px] tracking-wider uppercase text-white/30 px-5 py-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMMON_RATES.map((rate, i) => {
                    const annual  = rate * 40 * 52
                    const monthly = annual / 12
                    const weekly  = rate * 40
                    const daily   = weekly / 5
                    const isSelected = Math.abs(rate - hourly) < 2.5
                    return (
                      <tr key={rate}
                        className={`border-t border-white/[0.04] cursor-pointer transition-colors hover:bg-white/[0.03] ${
                          isSelected ? 'bg-gold/5 border-l-2 border-l-gold' : i % 2 === 0 ? '' : 'bg-white/[0.01]'
                        }`}
                        onClick={() => setHourly(rate)}>
                        <td className={`font-mono text-[12px] px-5 py-3 font-semibold ${isSelected ? 'text-gold' : 'text-white/70'}`}>${rate}/hr</td>
                        <td className="font-mono text-[12px] text-white/80 px-5 py-3 font-medium">{fmt(annual)}</td>
                        <td className="font-mono text-[11px] text-white/50 px-5 py-3">{fmtDecimal(monthly)}</td>
                        <td className="font-mono text-[11px] text-white/50 px-5 py-3">{fmtDecimal(weekly)}</td>
                        <td className="font-mono text-[11px] text-white/50 px-5 py-3">{fmtDecimal(daily)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* SEO content */}
        <div className="max-w-3xl">
          <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-4">How to Calculate Your Annual Salary</h2>
          <div className="space-y-4 text-white/55 text-[14px] leading-[1.8] mb-8">
            <p>
              To convert your hourly wage to an annual salary, multiply your hourly rate by the number of hours you work per week, then multiply by the number of weeks you work per year.
            </p>
            <p>
              <strong className="text-white/80">Formula: Annual salary = hourly rate × hours per week × weeks per year</strong>
            </p>
            <p>
              For a standard full-time worker at 40 hours per week and 52 weeks per year: a $25/hour wage equals $52,000 per year before taxes. Your actual take-home pay is lower after federal income tax, FICA (Social Security and Medicare), and your 401(k) contribution. The calculator above estimates your take-home based on your filing status and 401(k) election.
            </p>
          </div>

          <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-4">What Your Salary Means for Early Retirement</h2>
          <div className="space-y-4 text-white/55 text-[14px] leading-[1.8] mb-8">
            <p>
              Your gross salary is only the starting point. What determines your early retirement timeline is the <strong className="text-white/80">investable surplus</strong> — the amount left after taxes, 401(k) contributions, and living expenses. That surplus is what funds your taxable brokerage account, which is your most flexible asset for the bridge years before age 59½.
            </p>
            <p>
              The bridge milestones above show how long it takes to fund 1, 3, and 5 years of expenses in a taxable account. For a 55-year-old retiree, 4.5 years of bridge funding is the target. For a 50-year-old, 9.5 years. Knowing your surplus tells you how quickly you can build that bridge.
            </p>
            <p>
              Once you have your numbers, use the <Link href="/tools/bridge-strategy-calculator" className="text-gold hover:text-gold/80 transition-colors">Bridge Strategy Calculator</Link> to model your complete year-by-year withdrawal plan from retirement to age 90.
            </p>
          </div>

          <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-4">Frequently Asked Questions</h2>
          <div className="space-y-5 mb-10">
            {[
              { q: 'How do I convert hourly to salary?', a: 'Multiply your hourly rate by hours per week, then by weeks per year. Example: $25/hr × 40 hrs × 52 weeks = $52,000/year.' },
              { q: '$25 an hour is how much a year?', a: 'At 40 hours per week and 52 weeks per year, $25/hour equals $52,000 per year before taxes. Monthly that is $4,333 and weekly it is $1,000.' },
              { q: '$20 an hour is how much a year?', a: 'At 40 hours per week and 52 weeks per year, $20/hour equals $41,600 per year before taxes. Monthly that is $3,467 and weekly it is $800.' },
              { q: '$30 an hour is how much a year?', a: 'At 40 hours per week and 52 weeks per year, $30/hour equals $62,400 per year before taxes. Monthly that is $5,200 and weekly it is $1,200.' },
              { q: 'Should I use 50 or 52 weeks for the calculation?', a: 'Use 52 if you receive paid vacation. Use 50 if you take two weeks of unpaid leave. Use your actual paid weeks for the most accurate result.' },
              { q: 'How much of my salary should I save to retire early?', a: 'The FIRE community generally targets a 25-50% savings rate for early retirement. At 25% savings, most people reach financial independence in 30-35 years. At 50%, it drops to around 17 years. The calculator above shows your current effective savings rate including 401(k) contributions and employer match.' },
            ].map(({ q, a }) => (
              <div key={q} className="border-b border-white/[0.06] pb-5">
                <h3 className="font-syne font-semibold text-[15px] text-white mb-2">{q}</h3>
                <p className="text-white/50 text-[13px] leading-relaxed">{a}</p>
              </div>
            ))}
          </div>

          <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-4">Related Tools</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { href: '/tools/bridge-strategy-calculator',               label: 'Bridge Strategy Calculator' },
              { href: '/tools/fire-number-calculator',                   label: 'FIRE Number Calculator' },
              { href: '/tools/72t-sepp-calculator',                      label: '72(t) SEPP Calculator' },
              { href: '/blog/how-much-taxable-brokerage-to-retire-early', label: 'How Much Taxable Do I Need?' },
              { href: '/blog/can-i-retire-at-55-with-750k',              label: 'Can I Retire at 55 With $750K?' },
              { href: '/blog/what-is-retirement-bridge-strategy',        label: 'Bridge Strategy Guide' },
            ].map(({ href, label }) => (
              <Link key={href} href={href}
                className="flex items-center gap-3 bg-ink border border-white/[0.07] rounded-lg px-4 py-3 hover:border-gold/20 transition-colors group">
                <span className="font-mono text-[11px] text-white/50 group-hover:text-gold/80 transition-colors">{label} →</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
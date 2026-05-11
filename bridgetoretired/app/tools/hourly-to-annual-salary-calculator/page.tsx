'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

const fmt = (n: number) => `$${Math.round(n).toLocaleString()}`
const fmtDecimal = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const COMMON_RATES = [15, 17, 18, 20, 22, 25, 27, 30, 35, 40, 45, 50, 60, 75, 100]

function calcSavingsRate(annual: number): number {
  // Rough estimate: assume 30% taxes + expenses ratio
  const takeHome = annual * 0.72
  const fireTarget = annual * 25
  return Math.round((takeHome * 0.2) / (fireTarget / 100) * 10) / 10
}

function yearsToFire(annual: number, savingsRatePct: number): number {
  const takeHome = annual * 0.72
  const savings = takeHome * (savingsRatePct / 100)
  const spending = takeHome - savings
  const fireTarget = spending * 25
  if (savings <= 0) return 999
  // Simple FV calculation at 7% real return
  let balance = 0
  for (let yr = 1; yr <= 60; yr++) {
    balance = (balance + savings) * 1.07
    if (balance >= fireTarget) return yr
  }
  return 60
}

export default function HourlyToSalaryPage() {
  const [hourly, setHourly] = useState(25)
  const [hoursPerWeek, setHoursPerWeek] = useState(40)
  const [weeksPerYear, setWeeksPerYear] = useState(52)
  const [savingsRate, setSavingsRate] = useState(20)

  const results = useMemo(() => {
    const annual  = hourly * hoursPerWeek * weeksPerYear
    const monthly = annual / 12
    const weekly  = hourly * hoursPerWeek
    const daily   = weekly / 5
    const ytf     = yearsToFire(annual, savingsRate)
    return { annual, monthly, weekly, daily, ytf }
  }, [hourly, hoursPerWeek, weeksPerYear, savingsRate])

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-navy border-b border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-5 pt-12 pb-10">
          <Link href="/tools" className="font-mono text-[10px] tracking-widest uppercase text-white/30 hover:text-gold transition-colors flex items-center gap-2 mb-6">
            ← All Tools
          </Link>
          <div className="font-mono text-[9px] tracking-widest uppercase text-gold mb-3">Pay Calculator</div>
          <h1 className="font-syne font-bold text-[clamp(26px,4vw,46px)] tracking-tight text-white leading-tight mb-3">
            Hourly to Annual Salary Calculator
          </h1>
          <p className="text-white/50 text-[15px] leading-relaxed max-w-xl">
            Convert your hourly wage to an annual salary and see what it means for your early retirement timeline.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 py-12">

        {/* Calculator */}
        <div className="grid lg:grid-cols-[1fr_1fr] gap-6 mb-12">

          {/* Inputs */}
          <div className="bg-ink border border-white/[0.07] rounded-xl p-6">
            <div className="font-mono text-[9px] tracking-widest uppercase text-gold mb-6">Your Numbers</div>

            <div className="space-y-6">
              {/* Hourly rate */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-mono text-[11px] text-white/50">Hourly Pay Rate</span>
                  <span className="font-mono text-[13px] text-gold font-semibold">${hourly.toFixed(2)}/hr</span>
                </div>
                <input
                  type="range" min={7.25} max={200} step={0.25}
                  value={hourly}
                  onChange={e => setHourly(+e.target.value)}
                  className="w-full accent-gold h-1 rounded-full bg-white/10 cursor-pointer mb-2"
                />
                <div className="flex items-center gap-2 mt-3">
                  <span className="font-mono text-[10px] text-white/30">$</span>
                  <input
                    type="number" min={7.25} max={500} step={0.25}
                    value={hourly}
                    onChange={e => setHourly(Math.max(0, +e.target.value))}
                    className="w-full bg-slate border border-white/[0.08] rounded px-3 py-2 font-mono text-[12px] text-white focus:border-gold/40 focus:outline-none transition-colors"
                  />
                  <span className="font-mono text-[10px] text-white/30">/hr</span>
                </div>
              </div>

              {/* Hours per week */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-mono text-[11px] text-white/50">Hours Per Week</span>
                  <span className="font-mono text-[13px] text-gold font-semibold">{hoursPerWeek} hrs</span>
                </div>
                <input
                  type="range" min={1} max={80} step={1}
                  value={hoursPerWeek}
                  onChange={e => setHoursPerWeek(+e.target.value)}
                  className="w-full accent-gold h-1 rounded-full bg-white/10 cursor-pointer"
                />
                <div className="flex justify-between mt-1">
                  <span className="font-mono text-[9px] text-white/20">1</span>
                  <span className="font-mono text-[9px] text-white/20">40 (full-time)</span>
                  <span className="font-mono text-[9px] text-white/20">80</span>
                </div>
              </div>

              {/* Weeks per year */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-mono text-[11px] text-white/50">Weeks Per Year</span>
                  <span className="font-mono text-[13px] text-gold font-semibold">{weeksPerYear} wks</span>
                </div>
                <input
                  type="range" min={1} max={52} step={1}
                  value={weeksPerYear}
                  onChange={e => setWeeksPerYear(+e.target.value)}
                  className="w-full accent-gold h-1 rounded-full bg-white/10 cursor-pointer"
                />
                <div className="flex justify-between mt-1">
                  <span className="font-mono text-[9px] text-white/20">50 (2 wks unpaid)</span>
                  <span className="font-mono text-[9px] text-white/20">52 (no unpaid leave)</span>
                </div>
              </div>

              {/* Savings rate */}
              <div className="pt-2 border-t border-white/[0.06]">
                <div className="font-mono text-[9px] tracking-widest uppercase text-white/30 mb-4">Retirement Planning</div>
                <div className="flex justify-between mb-2">
                  <span className="font-mono text-[11px] text-white/50">Savings Rate</span>
                  <span className="font-mono text-[13px] text-gold font-semibold">{savingsRate}%</span>
                </div>
                <input
                  type="range" min={1} max={80} step={1}
                  value={savingsRate}
                  onChange={e => setSavingsRate(+e.target.value)}
                  className="w-full accent-gold h-1 rounded-full bg-white/10 cursor-pointer"
                />
                <div className="flex justify-between mt-1">
                  <span className="font-mono text-[9px] text-white/20">1%</span>
                  <span className="font-mono text-[9px] text-white/20">20% (FIRE baseline)</span>
                  <span className="font-mono text-[9px] text-white/20">80%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4">
            {/* Main result */}
            <div className="bg-ink border border-gold/20 rounded-xl p-6 text-center">
              <div className="font-mono text-[9px] tracking-widest uppercase text-gold mb-2">Annual Salary</div>
              <div className="font-syne font-bold text-[48px] tracking-tight text-white leading-none mb-1">
                {fmt(results.annual)}
              </div>
              <div className="font-mono text-[11px] text-white/30">pre-tax · {hoursPerWeek} hrs/wk · {weeksPerYear} wks/yr</div>
            </div>

            {/* Breakdown grid */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Monthly',  val: fmtDecimal(results.monthly) },
                { label: 'Weekly',   val: fmtDecimal(results.weekly)  },
                { label: 'Daily',    val: fmtDecimal(results.daily)   },
              ].map(({ label, val }) => (
                <div key={label} className="bg-ink border border-white/[0.07] rounded-lg p-4 text-center">
                  <div className="font-mono text-[9px] tracking-widest uppercase text-white/30 mb-2">{label}</div>
                  <div className="font-syne font-bold text-[16px] text-white">{val}</div>
                </div>
              ))}
            </div>

            {/* FIRE timeline */}
            <div className="bg-ink border border-white/[0.07] rounded-xl p-5">
              <div className="font-mono text-[9px] tracking-widest uppercase text-gold mb-4">Early Retirement Estimate</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="font-mono text-[9px] text-white/30 mb-1">Years to FIRE</div>
                  <div className="font-syne font-bold text-[28px] text-white leading-none">
                    {results.ytf >= 60 ? '60+' : results.ytf}
                    <span className="font-mono text-[12px] text-white/30 ml-1">yrs</span>
                  </div>
                  <div className="font-mono text-[9px] text-white/25 mt-1">at {savingsRate}% savings rate</div>
                </div>
                <div>
                  <div className="font-mono text-[9px] text-white/30 mb-1">FIRE Target Est.</div>
                  <div className="font-syne font-bold text-[28px] text-white leading-none">
                    {fmt(results.annual * 0.72 * (1 - savingsRate / 100) * 25)}
                  </div>
                  <div className="font-mono text-[9px] text-white/25 mt-1">25x annual spending</div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/[0.06]">
                <p className="font-mono text-[10px] text-white/25 leading-relaxed">
                  Estimates assume 7% real return, 28% effective tax rate, and consistent savings. Adjust your savings rate above to see the impact.
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-gold/5 border border-gold/20 rounded-xl p-5 flex items-center justify-between gap-4">
              <div>
                <div className="font-syne font-semibold text-[13px] text-white mb-1">Model your full bridge strategy</div>
                <div className="font-mono text-[10px] text-white/35">See your year-by-year withdrawal plan from retirement to age 90.</div>
              </div>
              <Link
                href="/tools/bridge-strategy-calculator"
                className="shrink-0 bg-gold text-black font-syne font-semibold text-[11px] px-4 py-2 rounded hover:opacity-85 transition-opacity whitespace-nowrap"
              >
                Try It →
              </Link>
            </div>
          </div>
        </div>

        {/* Common rates table */}
        <div className="mb-12">
          <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-2">Hourly Rate to Annual Salary Chart</h2>
          <p className="text-white/45 text-[13px] mb-6">Based on 40 hours per week and 52 weeks per year (pre-tax).</p>
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
                      <tr
                        key={rate}
                        className={`border-t border-white/[0.04] cursor-pointer transition-colors hover:bg-white/[0.03] ${
                          isSelected ? 'bg-gold/5 border-l-2 border-l-gold' : i % 2 === 0 ? '' : 'bg-white/[0.01]'
                        }`}
                        onClick={() => setHourly(rate)}
                      >
                        <td className={`font-mono text-[12px] px-5 py-3 font-semibold ${isSelected ? 'text-gold' : 'text-white/70'}`}>
                          ${rate}/hr
                        </td>
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
            <div className="px-5 py-3 border-t border-white/[0.06]">
              <span className="font-mono text-[9px] text-white/20">Click any row to update the calculator above</span>
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
              For a standard full-time worker at 40 hours per week and 52 weeks per year: a $25/hour wage equals $52,000 per year. If you take two weeks of unpaid leave, use 50 weeks instead of 52, which gives $50,000.
            </p>
            <p>
              Note that all figures above are <strong className="text-white/80">pre-tax</strong>. Your take-home pay will be lower after federal income tax, state income tax, Social Security, and Medicare deductions. For retirement planning purposes, a rough estimate is that take-home pay is around 70-75% of gross for most middle-income earners.
            </p>
          </div>

          <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-4">What Your Salary Means for Early Retirement</h2>
          <div className="space-y-4 text-white/55 text-[14px] leading-[1.8] mb-8">
            <p>
              Your salary is only part of the early retirement equation. What matters more is your <strong className="text-white/80">savings rate</strong> — the percentage of your income you save and invest each month. A person earning $60,000 and saving 40% will reach financial independence faster than someone earning $120,000 and saving 10%.
            </p>
            <p>
              The FIRE community typically uses the <strong className="text-white/80">25x rule</strong> as a retirement target: multiply your annual spending by 25 to get the portfolio size needed to retire. At a 4% withdrawal rate, this portfolio should sustain a 30-year retirement. For early retirement at 50 or 55, a more conservative 3.3-3.5% withdrawal rate (28-30x spending) is often recommended.
            </p>
            <p>
              Once you know your annual salary target, use the <Link href="/tools/bridge-strategy-calculator" className="text-gold hover:text-gold/80 transition-colors">Bridge Strategy Calculator</Link> to model how your taxable, 401(k), and Roth accounts work together across your bridge years — the gap between your retirement date and age 59½ when retirement accounts become fully accessible.
            </p>
          </div>

          <h2 className="font-syne font-bold text-[22px] tracking-tight text-white mb-4">Frequently Asked Questions</h2>
          <div className="space-y-5 mb-10">
            {[
              {
                q: 'How do I convert hourly to salary?',
                a: 'Multiply your hourly rate by hours per week, then by weeks per year. Example: $25/hr × 40 hrs × 52 weeks = $52,000/year.'
              },
              {
                q: '$25 an hour is how much a year?',
                a: 'At 40 hours per week and 52 weeks per year, $25/hour equals $52,000 per year before taxes. Monthly that is $4,333 and weekly it is $1,000.'
              },
              {
                q: '$20 an hour is how much a year?',
                a: 'At 40 hours per week and 52 weeks per year, $20/hour equals $41,600 per year before taxes. Monthly that is $3,467 and weekly it is $800.'
              },
              {
                q: '$30 an hour is how much a year?',
                a: 'At 40 hours per week and 52 weeks per year, $30/hour equals $62,400 per year before taxes. Monthly that is $5,200 and weekly it is $1,200.'
              },
              {
                q: 'Should I use 50 or 52 weeks for the calculation?',
                a: 'Use 52 if you receive paid vacation. Use 50 if you take two weeks of unpaid leave. Use your actual paid weeks for the most accurate result.'
              },
              {
                q: 'How much of my salary should I save to retire early?',
                a: 'The FIRE community generally targets a 25-50% savings rate for early retirement. At 25% savings, most people reach financial independence in 30-35 years. At 50%, it drops to around 17 years. Use the savings rate slider above to see your personalized estimate.'
              },
            ].map(({ q, a }) => (
              <div key={q} className="border-b border-white/[0.06] pb-5">
                <h3 className="font-syne font-semibold text-[15px] text-white mb-2">{q}</h3>
                <p className="text-white/50 text-[13px] leading-relaxed">{a}</p>
              </div>
            ))}
          </div>

          {/* Related tools */}
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
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 bg-ink border border-white/[0.07] rounded-lg px-4 py-3 hover:border-gold/20 transition-colors group"
              >
                <span className="font-mono text-[11px] text-white/50 group-hover:text-gold/80 transition-colors">{label} →</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}